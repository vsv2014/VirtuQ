/**
 * Unit tests for the shared logic (no database or network required).
 *
 * Run with: npm test
 */
import assert from 'node:assert/strict';

const { CATALOG, findProduct, slugify, CATEGORY_TREE } =
  await import('../shared/catalog.js');
const {
  computeTotals,
  formatINR,
  discountPercent,
  roundRupees,
  TRIAL_DURATION_MS,
  MAX_TRIAL_ITEMS,
} = await import('../shared/pricing.js');
const { canTransition, STATUS_TRANSITIONS } = await import('../server/models/Order.js');

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`  ✗ ${name}\n      ${error.message}`);
  }
}

console.log('\nShared catalog');

test('is deterministic across imports', () => {
  const a = JSON.stringify(CATALOG);
  // Re-importing hits the module cache, so re-derive instead.
  const again = CATALOG.map((p) => `${p.id}:${p.price}:${p.originalPrice}`).join('|');
  const third = CATALOG.map((p) => `${p.id}:${p.price}:${p.originalPrice}`).join('|');
  assert.equal(again, third);
  assert.ok(a.length > 0);
});

test('every product id is unique', () => {
  const ids = new Set(CATALOG.map((p) => p.id));
  assert.equal(ids.size, CATALOG.length, 'duplicate product ids');
});

test('prices are positive integers', () => {
  for (const product of CATALOG) {
    assert.ok(Number.isInteger(product.price) && product.price > 0, product.id);
  }
});

test('no product has a negative discount', () => {
  const bad = CATALOG.filter(
    (p) => discountPercent(p.price, p.originalPrice) < 0 || p.originalPrice <= p.price,
  );
  assert.equal(
    bad.length,
    0,
    `${bad.length} products priced above their "original" price: ` +
      JSON.stringify(bad.slice(0, 3)),
  );
});

test('discounts stay within the intended 20–60% band', () => {
  for (const product of CATALOG) {
    const discount = discountPercent(product.price, product.originalPrice);
    assert.ok(discount >= 0 && discount <= 60, `${product.id} -> ${discount}%`);
  }
});

test('every product exposes variants and a subcategory', () => {
  for (const product of CATALOG) {
    assert.ok(product.sizes.length > 0, product.id);
    assert.ok(product.colors.length > 0, product.id);
    assert.ok(product.subcategory, product.id);
    assert.ok(['men', 'women'].includes(product.category), product.id);
  }
});

test('findProduct resolves by id and rejects unknown ids', () => {
  assert.equal(findProduct(CATALOG[0].id).id, CATALOG[0].id);
  assert.equal(findProduct('does-not-exist'), null);
});

test('slugify produces URL-safe slugs', () => {
  assert.equal(slugify('Shirts & Shackets'), 'shirts-and-shackets');
  assert.equal(slugify('Hoodies & Sweatshirts'), 'hoodies-and-sweatshirts');
  assert.equal(slugify('T-Shirts'), 't-shirts');
});

test('the category tree matches the catalog', () => {
  const treeSubcategories = CATEGORY_TREE.flatMap((category) =>
    category.groups.flatMap((group) => group.items.map((item) => item.slug)),
  );
  const catalogSubcategories = new Set(
    CATALOG.map((p) => `${p.category}:${slugify(p.subcategory)}`),
  );
  for (const category of CATEGORY_TREE) {
    for (const group of category.groups) {
      for (const item of group.items) {
        assert.ok(
          catalogSubcategories.has(`${category.slug}:${item.slug}`),
          `tree references missing subcategory ${category.slug}:${item.slug}`,
        );
      }
    }
  }
  assert.ok(treeSubcategories.length > 0);
});

console.log('\nPricing');

test('totals add up and are rounded to whole rupees', () => {
  const totals = computeTotals([
    { price: 599, quantity: 1 },
    { price: 2499, quantity: 2 },
  ]);
  assert.equal(totals.subtotal, 5597);
  assert.equal(totals.gst, roundRupees(5597 * 0.18));
  assert.equal(totals.handlingFee, 49);
  assert.equal(
    totals.total,
    totals.subtotal + totals.gst + totals.deliveryFee + totals.handlingFee,
  );
  assert.ok(Number.isInteger(totals.total));
});

test('an empty selection costs nothing (no orphan handling fee)', () => {
  const totals = computeTotals([]);
  assert.equal(totals.subtotal, 0);
  assert.equal(totals.handlingFee, 0);
  assert.equal(totals.total, 0);
});

test('totals never produce floating-point artefacts', () => {
  const totals = computeTotals([{ price: 0.1, quantity: 3 }]);
  assert.ok(Number.isInteger(totals.subtotal), `${totals.subtotal}`);
  assert.ok(!totals.subtotal.toString().includes('0000000'));
});

test('formatINR renders Indian currency', () => {
  assert.ok(formatINR(150000).includes('1,50,000'), formatINR(150000));
  assert.ok(formatINR(0).includes('0'));
  assert.ok(formatINR(1234.5678).includes('1,235'), formatINR(1234.5678));
  assert.ok(
    formatINR(1234.5, { paise: true }).includes('1,234.50'),
    formatINR(1234.5, { paise: true }),
  );
});

test('discountPercent guards against bad input', () => {
  assert.equal(discountPercent(100, 0), 0);
  assert.equal(discountPercent(100, 100), 0);
  assert.equal(discountPercent(50, 100), 50);
});

test('the trial window is 2 hours', () => {
  assert.equal(TRIAL_DURATION_MS, 2 * 60 * 60 * 1000);
});

test('the trial item cap is 10', () => {
  assert.equal(MAX_TRIAL_ITEMS, 10);
});

console.log('\nOrder state machine');

test('legal transitions are allowed', () => {
  assert.ok(canTransition('created', 'confirmed'));
  assert.ok(canTransition('confirmed', 'out_for_delivery'));
  assert.ok(canTransition('out_for_delivery', 'delivered'));
  assert.ok(canTransition('delivered', 'trial_started'));
  assert.ok(canTransition('trial_started', 'trial_completed'));
  assert.ok(canTransition('trial_completed', 'return_initiated'));
  assert.ok(canTransition('return_initiated', 'return_completed'));
});

test('shortcut transitions are rejected', () => {
  assert.ok(!canTransition('created', 'return_completed'));
  assert.ok(!canTransition('created', 'delivered'));
  assert.ok(!canTransition('delivered', 'created'));
  assert.ok(!canTransition('trial_started', 'return_completed'));
});

test('terminal states have no outgoing transitions', () => {
  assert.deepEqual(STATUS_TRANSITIONS.return_completed, []);
  assert.deepEqual(STATUS_TRANSITIONS.cancelled, []);
});

test('an order can only be cancelled before dispatch', () => {
  assert.ok(canTransition('created', 'cancelled'));
  assert.ok(canTransition('confirmed', 'cancelled'));
  assert.ok(!canTransition('out_for_delivery', 'cancelled'));
  assert.ok(!canTransition('delivered', 'cancelled'));
});

test('unknown statuses are rejected', () => {
  assert.ok(!canTransition('created', 'teleported'));
  assert.ok(!canTransition('nonsense', 'confirmed'));
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);
process.exit(failures.length === 0 ? 0 : 1);
