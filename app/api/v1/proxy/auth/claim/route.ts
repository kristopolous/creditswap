import { claimProxyAuthSession } from "@/lib/data"
import { json, error, parseBody } from "@/lib/api-helpers"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return error("authentication required", 401)
  }

  const body = await parseBody(req)
  const { code } = body

  if (!code || typeof code !== "string") {
    return error("code is required", 400)
  }

  const claimed = await claimProxyAuthSession(code, session.user.id)
  if (!claimed) {
    return error("session not found, already claimed, or expired", 400)
  }

  return json({ success: true })
}
