# TryNStyle

A try-before-you-buy fashion storefront: pick up to 10 items, get them in ~30
minutes, try everything for 2 hours, then pay only for what you keep.

This repository (`VirtuQ`) contains two apps that share one catalog and one set
of pricing rules:

| Path        | What it is                                              |
| ----------- | ------------------------------------------------------- |
| `src/`      | React + TypeScript + Tailwind client (Vite)             |
| `server/`   | Express + Mongoose REST API with Socket.IO realtime     |
| `shared/`   | Catalog and pricing logic imported by **both** sides    |

The client and the server import the same `shared/catalog.js`, so the server is
always the price authority — a client cannot tamper with the amounts it sends.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in JWT_SECRET and MONGODB_URI
```

Run the client and the API in two terminals:

```bash
npm run dev               # client  -> http://localhost:5173
npm run dev:server        # API     -> http://localhost:3000
```

The Vite dev server proxies `/api` and `/socket.io` to the API, so the browser
only ever talks to one origin.

You need a MongoDB instance. Any of these work:

```bash
docker run -d -p 27017:27017 mongo:7
# or point MONGODB_URI at Atlas in .env
```

In development the API starts without a database (it logs a warning), but
nothing will persist.

## Scripts

| Script                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Vite dev server with API proxy                     |
| `npm run dev:server`   | API with `--watch` reload                          |
| `npm run build`        | Typecheck (`tsc -b`) **and** production build      |
| `npm run typecheck`    | TypeScript only                                    |
| `npm run lint`         | ESLint                                             |
| `npm run format`       | Prettier write                                     |
| `npm test`             | Unit tests for the shared catalog/pricing logic    |
| `npm run test:api`     | End-to-end API smoke test (needs MongoDB)          |
| `npm run server`       | API without watch mode                             |

## Environment

See `.env.example`. The important ones:

- `MONGODB_URI` — MongoDB connection string.
- `JWT_SECRET` — **required in production**; the API refuses to boot without a
  strong value. Generate one with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `CLIENT_URL` / `ALLOWED_ORIGINS` — CORS allowlist.
- `VITE_API_TARGET` — where the dev proxy forwards `/api` (default
  `http://localhost:3000`).

`.env` is git-ignored. If a secret is ever committed, rotate it — removing the
file from git does not remove it from history.

## How the trial lifecycle works

```
created → confirmed → out_for_delivery → delivered → trial_started
        → trial_completed → return_initiated → return_completed
```

`created` and `confirmed` can also go to `cancelled`. Every transition is
validated server-side (`server/models/Order.js`); illegal jumps are rejected
with `409`.

1. Shopper adds up to 10 items and checks out — no payment is taken.
2. The order is delivered; the shopper starts a 2-hour trial.
3. At the end they mark what to keep. The server recalculates
   `subtotal + GST + handling` and only the kept items are charged.
4. Anything not kept is collected by a delivery partner against a one-time,
   cryptographically random pickup code (shown as a QR code).

## Authentication

Phone + OTP. `POST /api/auth/otp/request` issues a 6-digit code (returned as
`devCode` outside production so the flow is testable without an SMS gateway);
`POST /api/auth/otp/verify` exchanges it for a JWT. Codes are stored hashed,
expire in 5 minutes, are single-use, and are rate limited.

## API

| Method | Path                                | Notes                          |
| ------ | ----------------------------------- | ------------------------------ |
| `GET`  | `/api/health`                       | Liveness + database state      |
| `POST` | `/api/auth/otp/request`             | Send a login code              |
| `POST` | `/api/auth/otp/verify`              | Exchange code for a JWT        |
| `GET`  | `/api/auth/me`                      | Current profile                |
| `PATCH`| `/api/auth/me`                      | Update name / email            |
| `GET`  | `/api/auth/addresses`               | Saved addresses                |
| `POST` | `/api/auth/addresses`               | Add an address                 |
| `PATCH`| `/api/auth/addresses/:id`           | Update an address              |
| `DELETE`| `/api/auth/addresses/:id`          | Delete an address              |
| `GET`  | `/api/orders`                       | Paginated (`?page`, `?limit`)  |
| `POST` | `/api/orders`                       | Create a trial order           |
| `GET`  | `/api/orders/:id`                   | Single order                   |
| `PATCH`| `/api/orders/:id/status`            | Guarded status transition      |
| `POST` | `/api/orders/:id/start-trial`       | Begin the 2-hour window        |
| `POST` | `/api/orders/:id/complete-trial`    | Keep / return items            |
| `POST` | `/api/orders/:id/initiate-return`   | Issue a pickup code            |
| `POST` | `/api/orders/:id/complete-return`   | Mark the pickup done           |
| `POST` | `/api/orders/:id/cancel`            | Cancel before dispatch         |

Orders are scoped to the authenticated user: reading someone else's order
returns `403`, and a malformed id returns `400` rather than `500`.

Realtime updates are pushed over Socket.IO. Connect with the JWT in
`socket.auth.token`, then emit `join-order-room` with an order id — the server
only joins you to rooms for orders you own.

## Notes

- Prices are integers (rupees) everywhere, formatted with `Intl.NumberFormat`
  and rounded exactly once, in `shared/pricing.js`.
- The catalog is generated deterministically from a fixed seed, so ids and
  prices are stable across reloads and between client and server.
