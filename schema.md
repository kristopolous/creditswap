# PostgreSQL Schema — creditswap.ai

## Overview

The creditswap marketplace uses PostgreSQL for durable storage of users, platforms, orders, API keys, and transactions. This schema replaces the in-memory store in `lib/data.ts` for production.

---

## Table: `users`

Stores authenticated users from Auth.js OAuth (GitHub, Google) and email-based auth.

| Column       | Type                        | Constraints          | Notes                                |
|-------------|-----------------------------|----------------------|--------------------------------------|
| `id`        | `UUID`                      | `PK DEFAULT gen_random_uuid()` | Primary identifier          |
| `email`     | `VARCHAR(320)`              | `UNIQUE NOT NULL`    | Lowercase, trimmed                   |
| `name`      | `VARCHAR(255)`              |                      | Display name from OAuth provider     |
| `image`     | `TEXT`                      |                      | Avatar URL from OAuth provider       |
| `role`      | `VARCHAR(50)`               | `DEFAULT 'user'`     | `user` or `admin`                    |
| `created_at`| `TIMESTAMPTZ`               | `DEFAULT now()`      |                                      |
| `updated_at`| `TIMESTAMPTZ`               | `DEFAULT now()`      |                                      |

**Indexes:**
- `idx_users_email` on `email`

---

## Table: `platforms`

The AI platforms whose credits are traded on the marketplace.

| Column          | Type                        | Constraints          | Notes                                |
|-----------------|-----------------------------|----------------------|--------------------------------------|
| `id`            | `UUID`                      | `PK DEFAULT gen_random_uuid()` | Primary identifier          |
| `name`          | `VARCHAR(255)`              | `NOT NULL`           | Display name (e.g. "Cloudify")      |
| `slug`          | `VARCHAR(255)`              | `UNIQUE NOT NULL`    | URL-safe identifier                  |
| `description`   | `TEXT`                      |                      |                                      |
| `logo`          | `VARCHAR(50)`               | `DEFAULT '🔮'`       | Emoji or URL                         |
| `api_endpoint`  | `VARCHAR(512)`              | `NOT NULL`           | Original API hostname                |
| `supported`     | `BOOLEAN`                   | `DEFAULT true`       |                                      |
| `discoverable`  | `BOOLEAN`                   | `DEFAULT true`       | Whether community-discovered         |
| `created_at`    | `TIMESTAMPTZ`               | `DEFAULT now()`      |                                      |

**Indexes:**
- `idx_platforms_slug` on `slug`

---

## Table: `sell_orders`

Sell listings posted by credit holders.

| Column              | Type                        | Constraints          | Notes                                |
|---------------------|-----------------------------|----------------------|--------------------------------------|
| `id`                | `UUID`                      | `PK DEFAULT gen_random_uuid()` |                              |
| `platform_id`       | `UUID`                      | `FK → platforms(id) NOT NULL` |                              |
| `seller_id`         | `UUID`                      | `FK → users(id)`    | `NULL` for anonymous sellers         |
| `seller_key`        | `VARCHAR(255)`              | `NOT NULL`           | Seller's original API key (masked)   |
| `total_credits`     | `NUMERIC(20,2)`             | `NOT NULL`           | Total credits listed                 |
| `available_credits` | `NUMERIC(20,2)`             | `NOT NULL`           | Remaining unsold credits             |
| `price_per_credit`  | `NUMERIC(10,4)`             | `NOT NULL CHECK (price_per_credit > 0 AND price_per_credit < 1.00)` | USD per credit |
| `type`              | `VARCHAR(10)`               | `NOT NULL DEFAULT 'limit'` | `limit` or `market`             |
| `status`            | `VARCHAR(20)`               | `NOT NULL DEFAULT 'active'` | `active`, `filled`, `cancelled` |
| `created_at`        | `TIMESTAMPTZ`               | `DEFAULT now()`      |                                      |
| `updated_at`        | `TIMESTAMPTZ`               | `DEFAULT now()`      |                                      |

**Indexes:**
- `idx_sell_orders_platform` on `platform_id`
- `idx_sell_orders_status` on `status`
- `idx_sell_orders_price` on `price_per_credit`

**Check:**
- `ck_sell_available` — `available_credits <= total_credits AND available_credits >= 0`

**Notes:**
- Market sell orders have `price_per_credit = 0` (price determined by market at match time).
- When `expires_at` is set and the timestamp passes, the order status is automatically updated to `expired` via `expireSellOrders()` before any query.

---

## Table: `buy_orders`

Buy orders — both market buys (immediately matched) and limit orders (pending).

| Column              | Type                        | Constraints          | Notes                                |
|---------------------|-----------------------------|----------------------|--------------------------------------|
| `id`                | `UUID`                      | `PK DEFAULT gen_random_uuid()` |                              |
| `platform_id`       | `UUID`                      | `FK → platforms(id) NOT NULL` |                              |
| `buyer_id`          | `UUID`                      | `FK → users(id)`    | `NULL` for anonymous buyers          |
| `amount`            | `NUMERIC(20,2)`             | `NOT NULL`           | Credits requested                    |
| `price_per_credit`  | `NUMERIC(10,4)`             | `NOT NULL CHECK (price_per_credit > 0 AND price_per_credit < 1.00)` | USD per credit |
| `total_price`       | `NUMERIC(20,2)`             | `NOT NULL`           | `amount * price_per_credit`          |
| `fee`               | `NUMERIC(20,2)`             | `NOT NULL`           | 15% of `total_price`                 |
| `fee_percentage`    | `NUMERIC(5,4)`              | `NOT NULL DEFAULT 0.15` | Always 0.15 for now               |
| `type`              | `VARCHAR(10)`               | `NOT NULL`           | `market` or `limit`                  |
| `status`            | `VARCHAR(20)`               | `NOT NULL DEFAULT 'pending'` | `pending`, `completed`, `cancelled`, `filled` |
| `proxy_key_id`      | `UUID`                      | `FK → api_keys(id)` | Set on completion                    |
| `created_at`        | `TIMESTAMPTZ`               | `DEFAULT now()`      |                                      |

**Indexes:**
- `idx_buy_orders_platform` on `platform_id`
- `idx_buy_orders_status` on `status`
- `idx_buy_orders_price_desc` on `price_per_credit DESC`

---

## Table: `api_keys`

Proxy keys generated when a market buy is completed. Each key is tied to `user + platform + demand_rate`.

| Column               | Type                        | Constraints          | Notes                                |
|----------------------|-----------------------------|----------------------|--------------------------------------|
| `id`                 | `UUID`                      | `PK DEFAULT gen_random_uuid()` |                              |
| `key`                | `VARCHAR(255)`              | `UNIQUE NOT NULL`    | e.g. `csw_cloudify_m1x2a3_b4c5d6e`  |
| `user_id`            | `UUID`                      | `FK → users(id)`    | `NULL` for anonymous                 |
| `platform_id`        | `UUID`                      | `FK → platforms(id) NOT NULL` |                              |
| `demand_rate`        | `NUMERIC(10,6)`             | `NOT NULL`           | Credits consumed per API call        |
| `remaining_credits`  | `NUMERIC(20,2)`             | `NOT NULL`           | Credits left                         |
| `total_credits`      | `NUMERIC(20,2)`             | `NOT NULL`           | Initial credit balance               |
| `status`             | `VARCHAR(20)`               | `NOT NULL DEFAULT 'active'` | `active`, `exhausted`, `revoked` |
| `created_at`         | `TIMESTAMPTZ`               | `DEFAULT now()`      |                                      |

**Indexes:**
- `idx_api_keys_key` on `key` (for fast validation lookups)
- `idx_api_keys_user` on `user_id`
- `idx_api_keys_status` on `status`

**Check:**
- `ck_api_remaining` — `remaining_credits >= 0`

---

## Table: `transactions`

Records every completed trade matching a buy order to one or more sell orders.

| Column            | Type                        | Constraints          | Notes                                |
|-------------------|-----------------------------|----------------------|--------------------------------------|
| `id`              | `UUID`                      | `PK DEFAULT gen_random_uuid()` |                              |
| `buy_order_id`    | `UUID`                      | `FK → buy_orders(id) NOT NULL` |                              |
| `sell_order_id`   | `UUID`                      | `FK → sell_orders(id) NOT NULL` |                              |
| `platform_id`     | `UUID`                      | `FK → platforms(id) NOT NULL` |                              |
| `credits`         | `NUMERIC(20,2)`             | `NOT NULL`           | Credits transferred                 |
| `price`           | `NUMERIC(10,4)`             | `NOT NULL`           | Price per credit at match           |
| `total`           | `NUMERIC(20,2)`             | `NOT NULL`           | `credits * price`                   |
| `fee`             | `NUMERIC(20,2)`             | `NOT NULL`           | Platform fee collected              |
| `created_at`      | `TIMESTAMPTZ`               | `DEFAULT now()`      |                                     |

**Indexes:**
- `idx_transactions_buy` on `buy_order_id`
- `idx_transactions_sell` on `sell_order_id`
- `idx_transactions_platform` on `platform_id`
- `idx_transactions_created` on `created_at`

---

## Key Queries

### Order book for a platform (bids, sorted descending)
```sql
SELECT price_per_credit, SUM(amount) AS volume
FROM buy_orders
WHERE platform_id = $1 AND status = 'pending'
GROUP BY price_per_credit
ORDER BY price_per_credit DESC;
```

### Order book for a platform (asks, sorted ascending)
```sql
SELECT price_per_credit, SUM(available_credits) AS volume
FROM sell_orders
WHERE platform_id = $1 AND status = 'active'
GROUP BY price_per_credit
ORDER BY price_per_credit ASC;
```

### Market buy — match against cheapest sell orders
```sql
WITH cheapest_sells AS (
  SELECT id, available_credits, price_per_credit
  FROM sell_orders
  WHERE platform_id = $1 AND status = 'active'
  ORDER BY price_per_credit ASC
  FOR UPDATE
)
-- Application logic iterates and deducts, creating transaction rows
```

### Key validation
```sql
SELECT * FROM api_keys WHERE key = $1 AND status = 'active';
```

### Deduct credits on API call
```sql
UPDATE api_keys
SET remaining_credits = GREATEST(0, remaining_credits - $2),
    status = CASE WHEN remaining_credits - $2 <= 0 THEN 'exhausted' ELSE status END
WHERE key = $1 AND status = 'active'
RETURNING *;
```

---

## Migration Strategy

1. Run `db/init.sql` against a fresh PostgreSQL instance (Docker)
2. Update `lib/data.ts` functions to use `pg` or `@vercel/postgres` queries instead of in-memory arrays
3. Add connection pooling with PgBouncer for serverless (Vercel Edge) compatibility
4. Run migrations with a tool like `node-pg-migrate` or Prisma Migrate for future changes
