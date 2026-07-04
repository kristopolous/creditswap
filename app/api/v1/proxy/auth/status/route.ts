import { getProxyAuthSession } from "@/lib/data"
import { json, error } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code || typeof code !== "string") {
    return error("code query parameter is required", 400)
  }

  const session = await getProxyAuthSession(code)
  if (!session) {
    return error("session not found or expired", 404)
  }

  return json(session)
}
