import { validateAPIKey, deductCredits, logUsage } from "@/lib/data"
import { json, error, parseBody } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const auth = req.headers.get("Authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return error("missing Authorization header", 401)
  }
  const proxyKey = auth.slice(7)

  const body = await parseBody(req)
  const endpoint = (body.endpoint as string) || "/unknown"
  const method = (body.method as string) || "GET"
  const statusCode = body.statusCode ? (body.statusCode as number) : undefined
  const buyOrderId = body.buyOrderId as string | undefined

  const apiKey = await validateAPIKey(proxyKey)
  if (!apiKey) return error("invalid or expired key", 404)

  const deducted = await deductCredits(proxyKey, apiKey.demandRate, endpoint, method, statusCode)
  if (!deducted) return error("key is exhausted", 402)

  return json({
    consumed: apiKey.demandRate,
    remainingCredits: deducted.remainingCredits,
    endpoint,
    method,
  })
}
