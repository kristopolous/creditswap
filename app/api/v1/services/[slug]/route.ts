import { getPlatform, getSellOrders, getBuyOrders, getDepth } from "@/lib/data"
import { json, error } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const platform = await getPlatform(params.slug)
  if (!platform) return error("service not found", 404)

  const [sellOrders, buyOrders, depth] = await Promise.all([
    getSellOrders(platform.id),
    getBuyOrders(platform.id),
    getDepth(platform.id),
  ])

  return json({
    service: platform,
    stats: {
      asks: sellOrders.length,
      bids: buyOrders.length,
      availableCredits: sellOrders.reduce((s, o) => s + o.availableCredits, 0),
      totalDemand: buyOrders.reduce((s, o) => s + o.amount, 0),
    },
    depth,
  })
}
