import { createBuyOrder, createSellOrder, getAllSellOrders, getBuyOrders } from "@/lib/data"
import type { BuyOrder } from "@/lib/types"
import { json, error, parseBody } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const platformId = url.searchParams.get("platformId")
  const side = url.searchParams.get("side")

  let sells = await getAllSellOrders()
  let buys: BuyOrder[] = []

  if (platformId) {
    sells = sells.filter((o) => o.platformId === platformId)
    buys = await getBuyOrders(platformId)
  }

  if (side === "buy") return json({ orders: buys })
  if (side === "sell") return json({ orders: sells })

  return json({ orders: { sells, buys } })
}

export async function POST(req: Request) {
  const body = await parseBody(req)
  const { side, platformId, platformName, amount, pricePerCredit, type } = body as Record<string, unknown>

  if (!platformId || !amount || !pricePerCredit) {
    return error("platformId, amount, and pricePerCredit are required", 400)
  }

  if (side === "sell" && type === "market") {
    // market sell — price is determined by market
  } else if (typeof pricePerCredit === "number" && pricePerCredit >= 1) {
    return error("pricePerCredit must be under $1.00", 400)
  }

  if (!["buy", "sell"].includes(side as string)) {
    return error("side must be 'buy' or 'sell'", 400)
  }

  if (!["market", "limit"].includes(type as string)) {
    return error("type must be 'market' or 'limit'", 400)
  }

  if (side === "sell") {
    const order = await createSellOrder({
      platformId: platformId as string,
      platformName: (platformName as string) || (platformId as string),
      sellerKey: (body.apiKey as string) || "anonymous",
      totalCredits: amount as number,
      availableCredits: amount as number,
      pricePerCredit: type === "market" ? 0 : (pricePerCredit as number),
      type: type as "market" | "limit",
      expiresAt: (body.expiresAt as string) || null,
    })

    return json({
      id: order.id,
      platformId: order.platformId,
      platformName: order.platformName,
      amount: order.availableCredits,
      pricePerCredit: order.pricePerCredit,
      type: order.type,
      status: order.status,
      side: "sell",
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
    }, 201)
  }

  const order = await createBuyOrder(
    platformId as string,
    (platformName as string) || (platformId as string),
    amount as number,
    pricePerCredit as number,
    type as "market" | "limit"
  )

  return json({
    id: order.id,
    platformId: order.platformId,
    platformName: order.platformName,
    amount: order.amount,
    pricePerCredit: order.pricePerCredit,
    type: order.type,
    status: order.status,
    side: "buy",
    proxyKey: order.proxyKey || undefined,
    fee: order.fee,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
  }, 201)
}
