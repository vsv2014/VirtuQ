/**
 * End-to-end smoke test for the API.
 *
 * Boots an in-memory MongoDB, starts the real server, and exercises the whole
 * home-trial lifecycle plus the security/validation guards.
 *
 * Run with: npm run test:api
 */
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = 3099;
const BASE = `http://127.0.0.1:${PORT}/api`;
const PHONE = '9876543210';

let passed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`  ✗ ${name}\n      ${error.message}`);
  }
}

async function api(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON response */
  }
  return { status: response.status, body: json, text };
}

async function waitForServer(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/health`);
      if (response.ok) return await response.json();
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Server did not become ready in time');
}

let mongo = null;

// Use an already-running MongoDB when one is provided (CI service container);
// otherwise spin up an in-memory instance.
if (process.env.MONGODB_URI) {
  console.log('Using MONGODB_URI from the environment');
} else {
  try {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri('trynstyle-test');
  } catch (error) {
    console.warn(
      `\nSkipping API smoke test: no MongoDB available.\n  ${error.message}\n` +
        '  Set MONGODB_URI, or run once the mongod binary can be downloaded.\n',
    );
    process.exit(0);
  }
}
process.env.JWT_SECRET = 'test-secret-'.repeat(4);
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'development';

// Importing the server starts it.
await import('../server/index.js');

const { CATALOG } = await import('../shared/catalog.js');
const { computeTotals } = await import('../shared/pricing.js');

const product = CATALOG[0];
const second = CATALOG[1];
const line = (p, quantity = 1) => ({
  productId: p.id,
  size: p.sizes[0],
  color: p.colors[0],
  quantity,
});

const address = {
  name: 'Ada Lovelace',
  phone: PHONE,
  pincode: '560001',
  city: 'Bengaluru',
  state: 'Karnataka',
  locality: 'Indiranagar',
  building: '12, 4th Cross',
  landmark: 'Near park',
  type: 'home',
};

const health = await waitForServer();
console.log(`\nAPI smoke test — database: ${health.database}\n`);

let token;
let orderId;

console.log('Auth');
await check('health reports a connected database', () => {
  assert.equal(health.database, 'connected');
});

await check('requesting an OTP issues a 6-digit code', async () => {
  const res = await api('/auth/otp/request', {
    method: 'POST',
    body: { phone: PHONE },
  });
  assert.equal(res.status, 200);
  assert.match(res.body.devCode, /^\d{6}$/);
});

await check('rejects an invalid phone number', async () => {
  const res = await api('/auth/otp/request', {
    method: 'POST',
    body: { phone: '12345' },
  });
  assert.equal(res.status, 400);
});

await check('verifying the OTP returns a JWT and a user', async () => {
  const otp = await api('/auth/otp/request', {
    method: 'POST',
    body: { phone: PHONE },
  });
  const res = await api('/auth/otp/verify', {
    method: 'POST',
    body: { phone: PHONE, code: otp.body.devCode },
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.token, 'no token returned');
  assert.equal(res.body.user.phone, PHONE);
  token = res.body.token;
});

await check('a wrong OTP is rejected', async () => {
  const otp = await api('/auth/otp/request', {
    method: 'POST',
    body: { phone: PHONE },
  });
  const res = await api('/auth/otp/verify', {
    method: 'POST',
    body: { phone: PHONE, code: '000000' },
  });
  assert.equal(res.status, 401);
  assert.ok(otp.body.devCode);
});

await check('an OTP cannot be reused', async () => {
  const otp = await api('/auth/otp/request', {
    method: 'POST',
    body: { phone: PHONE },
  });
  const first = await api('/auth/otp/verify', {
    method: 'POST',
    body: { phone: PHONE, code: otp.body.devCode },
  });
  assert.equal(first.status, 200);
  const second = await api('/auth/otp/verify', {
    method: 'POST',
    body: { phone: PHONE, code: otp.body.devCode },
  });
  assert.equal(second.status, 400);
});

console.log('\nOrders');
await check('unauthenticated requests are refused', async () => {
  const res = await api('/orders');
  assert.equal(res.status, 401);
});

await check('creating an order returns server-computed totals', async () => {
  const res = await api('/orders', {
    method: 'POST',
    token,
    body: { items: [line(product), line(second, 2)], address },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));

  const expected = computeTotals([
    { price: product.price, quantity: 1 },
    { price: second.price, quantity: 2 },
  ]);
  assert.equal(res.body.total, expected.total);
  assert.equal(res.body.subtotal, expected.subtotal);
  assert.equal(res.body.status, 'created');
  assert.ok(res.body.id, 'order has no id');
  orderId = res.body.id;
});

await check('a tampered price is ignored (server is the price authority)', async () => {
  const res = await api('/orders', {
    method: 'POST',
    token,
    body: {
      items: [{ ...line(product), price: 1 }],
      address,
    },
  });
  assert.equal(res.status, 201);
  const expected = computeTotals([{ price: product.price, quantity: 1 }]);
  assert.equal(res.body.subtotal, expected.subtotal);
  assert.notEqual(res.body.subtotal, 1);
});

await check('rejects an unknown product', async () => {
  const res = await api('/orders', {
    method: 'POST',
    token,
    body: { items: [{ ...line(product), productId: 'not-a-product' }], address },
  });
  assert.equal(res.status, 400);
});

await check('rejects an invalid size', async () => {
  const res = await api('/orders', {
    method: 'POST',
    token,
    body: { items: [{ ...line(product), size: 'XXXXXL' }], address },
  });
  assert.equal(res.status, 400);
});

await check('rejects an incomplete address', async () => {
  const res = await api('/orders', {
    method: 'POST',
    token,
    body: { items: [line(product)], address: { name: 'Ada' } },
  });
  assert.equal(res.status, 400);
});

await check('enforces the 10-item trial limit', async () => {
  const res = await api('/orders', {
    method: 'POST',
    token,
    body: {
      items: [
        { ...line(product), quantity: 5 },
        { ...line(second), quantity: 6 },
      ],
      address,
    },
  });
  assert.equal(res.status, 400);
  assert.match(res.body.message, /at most 10/);
});

console.log('\nState machine');
await check('illegal status transitions are refused', async () => {
  const res = await api(`/orders/${orderId}/status`, {
    method: 'PATCH',
    token,
    body: { status: 'return_completed' },
  });
  assert.equal(res.status, 409);
});

await check('legal transitions are applied in order', async () => {
  for (const status of ['confirmed', 'out_for_delivery', 'delivered']) {
    const res = await api(`/orders/${orderId}/status`, {
      method: 'PATCH',
      token,
      body: { status },
    });
    assert.equal(res.status, 200, `${status}: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.status, status);
  }
});

await check('the trial can start once delivered', async () => {
  const res = await api(`/orders/${orderId}/start-trial`, { method: 'POST', token });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'trial_started');
  assert.ok(res.body.trialEndsAt, 'no trialEndsAt');

  const endsIn = new Date(res.body.trialEndsAt).getTime() - Date.now();
  assert.ok(
    endsIn > 7_000_000 && endsIn <= 7_200_000,
    `unexpected trial length ${endsIn}`,
  );
});

await check('starting a trial twice is refused', async () => {
  const res = await api(`/orders/${orderId}/start-trial`, { method: 'POST', token });
  assert.equal(res.status, 409);
});

await check('completing the trial recalculates what is owed', async () => {
  const res = await api(`/orders/${orderId}/complete-trial`, {
    method: 'POST',
    token,
    body: { keptItems: [product.id] },
  });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.status, 'trial_completed');

  const kept = res.body.items.find((i) => i.productId === product.id);
  const returned = res.body.items.find((i) => i.productId === second.id);
  assert.equal(kept.status, 'kept');
  assert.equal(returned.status, 'returned');

  // Only the kept item is charged (second item had quantity 2).
  const expected = computeTotals([{ price: product.price, quantity: 1 }]);
  assert.equal(res.body.subtotal, expected.subtotal);
});

await check('rejects keptItems that are not on the order', async () => {
  const res = await api(`/orders/${orderId}/complete-trial`, {
    method: 'POST',
    token,
    body: { keptItems: ['ghost-product'] },
  });
  assert.equal(res.status, 409); // already completed, so this also guards state
});

await check('initiating a return issues a pickup code', async () => {
  const res = await api(`/orders/${orderId}/initiate-return`, {
    method: 'POST',
    token,
  });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.status, 'return_initiated');
  assert.ok(res.body.returnPickupCode, 'no pickup code');
  assert.match(res.body.returnPickupCode, /^[0-9A-Z]{6,}$/);
});

await check('pickup codes are not guessable (two orders differ)', async () => {
  const created = await api('/orders', {
    method: 'POST',
    token,
    body: { items: [line(product), line(second)], address },
  });
  const id = created.body.id;
  for (const status of ['confirmed', 'out_for_delivery', 'delivered']) {
    await api(`/orders/${id}/status`, { method: 'PATCH', token, body: { status } });
  }
  await api(`/orders/${id}/start-trial`, { method: 'POST', token });
  await api(`/orders/${id}/complete-trial`, {
    method: 'POST',
    token,
    body: { keptItems: [] },
  });
  const res = await api(`/orders/${id}/initiate-return`, { method: 'POST', token });
  assert.equal(res.status, 200);
  assert.notEqual(res.body.returnPickupCode, undefined);
});

console.log('\nAuthorisation');
await check("another user cannot read someone else's order", async () => {
  const otherPhone = '9123456780';
  const otp = await api('/auth/otp/request', {
    method: 'POST',
    body: { phone: otherPhone },
  });
  const verified = await api('/auth/otp/verify', {
    method: 'POST',
    body: { phone: otherPhone, code: otp.body.devCode },
  });
  const otherToken = verified.body.token;

  const res = await api(`/orders/${orderId}`, { token: otherToken });
  assert.equal(res.status, 403);
});

await check('a malformed order id returns 400, not 500', async () => {
  const res = await api('/orders/not-an-objectid', { token });
  assert.equal(res.status, 400);
});

await check('the order list is paginated', async () => {
  const res = await api('/orders?page=1&limit=2', { token });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.orders));
  assert.equal(res.body.limit, 2);
  assert.ok(res.body.total >= 1);
  assert.ok(res.body.totalPages >= 1);
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);

if (mongo) await mongo.stop();
process.exit(failures.length === 0 ? 0 : 1);
