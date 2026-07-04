import { validateAPIKey, deductCredits } from "@/lib/data"
import { json, error, parseBody } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function POST(_: Request, { params }: { params: { key: string } }) {
  const apiKey = await validateAPIKey(params.key)
  if (!apiKey) return error("invalid or expired key", 404)

  const deducted = await deductCredits(params.key, apiKey.demandRate)
  if (!deducted) return error("key is exhausted", 402)

  return json({
    status: deducted.status,
    remainingCredits: deducted.remainingCredits,
    demandRate: deducted.demandRate,
    consumed: apiKey.demandRate,
  })
}
