import { query, queryOne } from "./db"
import { Platform, SellOrder, BuyOrder, Deal, APIKey } from "./types"

// ── Platforms ──────────────────────────────────────────────

export async function getPlatform(slug: string): Promise<Platform | null> {
  return queryOne<Platform>(
    `SELECT id, name, slug, description, logo, api_endpoint AS "apiEndpoint",
            supported, discoverable, created_at
     FROM platforms WHERE slug = $1`,
    [slug]
  )
}

export async function getPlatforms(): Promise<Platform[]> {
  return query<Platform>(
    `SELECT id, name, slug, description, logo, api_endpoint AS "apiEndpoint",
            supported, discoverable, created_at
     FROM platforms ORDER BY name`
  )
}

export async function createPlatform(name: string, apiEndpoint: string, description?: string): Promise<Platform> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  return queryOne<Platform>(
    `INSERT INTO platforms (name, slug, description, api_endpoint)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, slug, description, logo, api_endpoint AS "apiEndpoint", supported, discoverable, created_at`,
    [name, slug, description || `API credits for ${name}.`, apiEndpoint]
  ) as Promise<Platform>
}

// ── Sell Orders ────────────────────────────────────────────

export async function expireSellOrders(): Promise<void> {
  await query(
    `UPDATE sell_orders
     SET status = 'expired'
     WHERE status = 'active'
       AND expires_at IS NOT NULL
       AND expires_at < NOW()`
  )
}

export async function getSellOrders(platformId: string): Promise<SellOrder[]> {
  await expireSellOrders()
  return query<SellOrder>(
    `SELECT so.id, so.platform_id AS "platformId", p.name AS "platformName",
            so.seller_key AS "sellerKey", so.total_credits AS "totalCredits",
            so.available_credits AS "availableCredits", so.price_per_credit AS "pricePerCredit",
            so.type, so.status,
            so.expires_at AS "expiresAt",
            so.created_at AS "createdAt"
     FROM sell_orders so
     JOIN platforms p ON p.id = so.platform_id
     WHERE so.platform_id = $1 AND so.status = 'active'
     ORDER BY so.price_per_credit ASC`,
    [platformId]
  )
}

export async function getAllSellOrders(): Promise<SellOrder[]> {
  await expireSellOrders()
  return query<SellOrder>(
    `SELECT so.id, so.platform_id AS "platformId", p.name AS "platformName",
            so.seller_key AS "sellerKey", so.total_credits AS "totalCredits",
            so.available_credits AS "availableCredits", so.price_per_credit AS "pricePerCredit",
            so.type, so.status,
            so.expires_at AS "expiresAt",
            so.created_at AS "createdAt"
     FROM sell_orders so
     JOIN platforms p ON p.id = so.platform_id
     ORDER BY so.created_at DESC`
  )
}

export async function createSellOrder(order: {
  platformId: string
  platformName: string
  sellerKey: string
  totalCredits: number
  availableCredits: number
  pricePerCredit: number
  type: "market" | "limit"
  expiresAt?: string | null
}): Promise<SellOrder> {
  return queryOne<SellOrder>(
    `INSERT INTO sell_orders (platform_id, seller_key, total_credits, available_credits, price_per_credit, type, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, platform_id AS "platformId", $8 AS "platformName",
              seller_key AS "sellerKey", total_credits AS "totalCredits",
              available_credits AS "availableCredits", price_per_credit AS "pricePerCredit",
              type, status, expires_at AS "expiresAt", created_at AS "createdAt"`,
    [order.platformId, order.sellerKey, order.totalCredits, order.availableCredits, order.pricePerCredit, order.type, order.expiresAt || null, order.platformName]
  ) as Promise<SellOrder>
}

export async function consumeFromSellOrders(platformId: string, amount: number): Promise<void> {
  const sells = await query<SellOrder & { id: string }>(
    `SELECT id, available_credits AS "availableCredits"
     FROM sell_orders
     WHERE platform_id = $1 AND status = 'active'
     ORDER BY price_per_credit ASC`,
    [platformId]
  )

  let remaining = amount
  for (const order of sells) {
    if (remaining <= 0) break
    const consume = Math.min(remaining, order.availableCredits)
    await query(
      `UPDATE sell_orders
       SET available_credits = available_credits - $1,
           status = CASE WHEN available_credits - $1 <= 0 THEN 'filled' ELSE status END
       WHERE id = $2`,
      [consume, order.id]
    )
    remaining -= consume
  }
}

// ── Buy Orders ─────────────────────────────────────────────

export async function getBuyOrders(platformId: string): Promise<BuyOrder[]> {
  return query<BuyOrder>(
    `SELECT bo.id, bo.platform_id AS "platformId", p.name AS "platformName",
            bo.amount, bo.price_per_credit AS "pricePerCredit",
            bo.total_price AS "totalPrice", bo.fee, bo.fee_percentage AS "feePercentage",
            bo.type, bo.status, COALESCE(ak.key, '') AS "proxyKey",
            bo.created_at AS "createdAt"
     FROM buy_orders bo
     JOIN platforms p ON p.id = bo.platform_id
     LEFT JOIN api_keys ak ON ak.id = bo.proxy_key_id
     WHERE bo.platform_id = $1 AND bo.status = 'pending'
     ORDER BY bo.price_per_credit DESC`,
    [platformId]
  )
}

export async function createBuyOrder(
  platformId: string,
  platformName: string,
  amount: number,
  pricePerCredit: number,
  type: "market" | "limit"
): Promise<BuyOrder> {
  const totalPrice = amount * pricePerCredit
  const feePercentage = 0.15
  const fee = totalPrice * feePercentage
  const demandRate = Math.max(0.01, pricePerCredit * 0.1)

  const platform = await getPlatformByUUID(platformId)
  const slug = platform?.slug || platformId

  let proxyKey = ""

  if (type === "market") {
    await consumeFromSellOrders(platformId, amount)

    const keyStr = `csw_${slug}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`

    const key = await queryOne<{ id: string }>(
      `INSERT INTO api_keys (key, user_id, platform_id, demand_rate, remaining_credits, total_credits)
       VALUES ($1, NULL, $2, $3, $4, $5)
       RETURNING id`,
      [keyStr, platformId, demandRate, amount * demandRate, amount * demandRate]
    )

    const order = await queryOne<BuyOrder>(
      `INSERT INTO buy_orders (platform_id, amount, price_per_credit, total_price, fee, type, status, proxy_key_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7)
       RETURNING id, platform_id AS "platformId", $8 AS "platformName",
                amount, price_per_credit AS "pricePerCredit",
                total_price AS "totalPrice", fee, $9 AS "feePercentage",
                type, status, created_at AS "createdAt"`,
      [platformId, amount, pricePerCredit, totalPrice, fee, type, key?.id, platformName, feePercentage]
    )

    return { ...order!, proxyKey: keyStr }
  }

  const order = await queryOne<BuyOrder>(
    `INSERT INTO buy_orders (platform_id, amount, price_per_credit, total_price, fee, type, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING id, platform_id AS "platformId", $7 AS "platformName",
              amount, price_per_credit AS "pricePerCredit",
              total_price AS "totalPrice", fee, $8 AS "feePercentage",
              type, status, created_at AS "createdAt"`,
    [platformId, amount, pricePerCredit, totalPrice, fee, type, platformName, feePercentage]
  )

  return { ...order!, proxyKey: "" }
}

async function getPlatformByUUID(id: string): Promise<Platform | null> {
  return queryOne<Platform>(
    `SELECT id, name, slug FROM platforms WHERE id = $1`,
    [id]
  )
}

// ── Deals ──────────────────────────────────────────────────

export async function getDeals(): Promise<Deal[]> {
  const rows = await query<any>(
    `SELECT p.id AS "platformId", p.slug AS "platformSlug", p.name AS "platformName",
            COUNT(so.id)::int AS "sellerCount",
            SUM(so.available_credits) AS "availableCredits",
            MIN(so.price_per_credit) AS "pricePerCredit"
     FROM platforms p
     JOIN sell_orders so ON so.platform_id = p.id
     WHERE so.status = 'active'
     GROUP BY p.id, p.slug, p.name
     ORDER BY "pricePerCredit" ASC`
  )

  return rows.map((r: any) => ({
    id: `deal-${r.platformId}`,
    platformId: r.platformId,
    platformSlug: r.platformSlug,
    platformName: r.platformName,
    ratio: `$${Number(r.pricePerCredit).toFixed(2)} for $1 on ${r.platformName}`,
    availableCredits: Number(r.availableCredits),
    pricePerCredit: Number(r.pricePerCredit),
    sellerCount: r.sellerCount,
  }))
}

// ── API Keys ───────────────────────────────────────────────

export async function validateAPIKey(key: string): Promise<APIKey | null> {
  return queryOne<APIKey>(
    `SELECT id, key, user_id AS "userId", platform_id AS "platformId",
            p.slug AS "platformSlug", demand_rate AS "demandRate",
            remaining_credits AS "remainingCredits", total_credits AS "totalCredits",
            ak.status, ak.created_at AS "createdAt"
     FROM api_keys ak
     JOIN platforms p ON p.id = ak.platform_id
     WHERE ak.key = $1 AND ak.status = 'active'`,
    [key]
  )
}

export async function deductCredits(key: string, amount: number): Promise<APIKey | null> {
  const apiKey = await queryOne<APIKey>(
    `UPDATE api_keys
     SET remaining_credits = GREATEST(0, remaining_credits - $1),
         status = CASE WHEN remaining_credits - $1 <= 0 THEN 'exhausted' ELSE status END
     WHERE key = $2 AND status = 'active'
     RETURNING id, key, user_id AS "userId", platform_id AS "platformId",
               demand_rate AS "demandRate", remaining_credits AS "remainingCredits",
               total_credits AS "totalCredits", status, created_at AS "createdAt"`,
    [amount, key]
  )

  if (apiKey) {
    const p = await queryOne<{ slug: string }>("SELECT slug FROM platforms WHERE id = $1", [apiKey.platformId])
    return { ...apiKey, platformSlug: p?.slug || "" }
  }
  return null
}

// ── Order Book ─────────────────────────────────────────────

export interface DepthLevel {
  price: number
  buyVolume: number
  sellVolume: number
}

export interface Spread {
  bid: number
  ask: number
  spread: number
}

export async function getDepth(platformId: string): Promise<DepthLevel[]> {
  const buys = await query<{ price: number; volume: number }>(
    `SELECT price_per_credit AS price, SUM(amount) AS volume
     FROM buy_orders
     WHERE platform_id = $1 AND status = 'pending'
     GROUP BY price_per_credit`,
    [platformId]
  )

  const sells = await query<{ price: number; volume: number }>(
    `SELECT price_per_credit AS price, SUM(available_credits) AS volume
     FROM sell_orders
     WHERE platform_id = $1 AND status = 'active'
     GROUP BY price_per_credit`,
    [platformId]
  )

  const buyMap = new Map(buys.map((b) => [b.price, Number(b.volume)]))
  const sellMap = new Map(sells.map((s) => [s.price, Number(s.volume)]))
  const allPrices = new Set(Array.from(buyMap.keys()).concat(Array.from(sellMap.keys())))

  return Array.from(allPrices)
    .sort((a, b) => a - b)
    .map((price) => ({
      price,
      buyVolume: buyMap.get(price) || 0,
      sellVolume: sellMap.get(price) || 0,
    }))
}

export async function getSpread(platformId: string): Promise<Spread | null> {
  const ask = await queryOne<{ price: number }>(
    `SELECT price_per_credit AS price
     FROM sell_orders
     WHERE platform_id = $1 AND status = 'active'
     ORDER BY price_per_credit ASC LIMIT 1`,
    [platformId]
  )

  const bid = await queryOne<{ price: number }>(
    `SELECT price_per_credit AS price
     FROM buy_orders
     WHERE platform_id = $1 AND status = 'pending'
     ORDER BY price_per_credit DESC LIMIT 1`,
    [platformId]
  )

  if (!ask || !bid) return null

  return { bid: Number(bid.price), ask: Number(ask.price), spread: Number(ask.price) - Number(bid.price) }
}
