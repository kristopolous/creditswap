import { createProxyAuthSession } from "@/lib/data"
import { json, error } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function POST() {
  try {
    const session = await createProxyAuthSession()
    return json(session)
  } catch (e) {
    return error("failed to create auth session", 500)
  }
}
