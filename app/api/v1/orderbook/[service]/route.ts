import { getPlatform, getSellOrders, getBuyOrders, getDepth, getSpread } from "@/lib/data"
import { json, error } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET(_: Request, { params }: { params: { service: string } }) {
  const platform = await getPlatform(params.service)
  if (!platform) return error("service not found", 404)

  const [sellOrders, buyOrders, depth, spread] = await Promise.all([
    getSellOrders(platform.id),
    getBuyOrders(platform.id),
    getDepth(platform.id),
    getSpread(platform.id),
  ])

  const sells = sellOrders.map((o) => ({
    price: o.pricePerCredit,
    volume: o.availableCredits,
    type: o.type,
    orderId: o.id,
  }))

  const buys = buyOrders.map((o) => ({
    price: o.pricePerCredit,
    volume: o.amount,
    type: o.type,
    orderId: o.id,
  }))

  return json({
    service: params.service,
    spread,
    asks: sells.sort((a, b) => a.price - b.price),
    bids: buys.sort((a, b) => b.price - a.price),
    depth,
  })
}
