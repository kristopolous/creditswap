import { validateAPIKey, deductCredits } from "@/lib/data"
import { json, error, parseBody } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function POST(req: Request, { params }: { params: { key: string } }) {
  const apiKey = await validateAPIKey(params.key)
  if (!apiKey) return error("invalid or expired key", 404)

  const body = await parseBody(req)
  const endpoint = (body.endpoint as string) || "/unknown"
  const method = (body.method as string) || "GET"
  const statusCode = body.statusCode ? (body.statusCode as number) : undefined
  const costType = (body.costType as string) || "per_call"
  const rate = body.rate ? (body.rate as number) : undefined
  const unit = (body.unit as string) || undefined

  const charge = costType === "ongoing" ? (rate ?? apiKey.demandRate) : apiKey.demandRate

  const deducted = await deductCredits(params.key, charge, endpoint, method, statusCode, costType, rate, unit)
  if (!deducted) return error("key is exhausted", 402)

  return json({
    status: deducted.status,
    remainingCredits: deducted.remainingCredits,
    demandRate: deducted.demandRate,
    consumed: charge,
    costType,
    rate: rate ?? null,
    unit: unit ?? null,
  })
}
