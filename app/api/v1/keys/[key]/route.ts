import { validateAPIKey } from "@/lib/data"
import { json, error } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET(_: Request, { params }: { params: { key: string } }) {
  const apiKey = await validateAPIKey(params.key)
  if (!apiKey) return error("invalid or expired key", 404)

  return json({
    valid: true,
    key: apiKey.key,
    userId: apiKey.userId,
    platformSlug: apiKey.platformSlug,
    platformId: apiKey.platformId,
    remainingCredits: apiKey.remainingCredits,
    totalCredits: apiKey.totalCredits,
    demandRate: apiKey.demandRate,
    status: apiKey.status,
  })
}
