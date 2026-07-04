import { getUsageStatsForBuyOrder, getUsageLog } from "@/lib/data"
import { json, error } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const stats = await getUsageStatsForBuyOrder(params.id)
  if (!stats) return error("buy order not found", 404)

  return json(stats)
}
