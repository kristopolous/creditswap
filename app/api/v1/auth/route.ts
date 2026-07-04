import { json, error, parseBody } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await parseBody(req)
  const { email } = body

  if (!email || typeof email !== "string") {
    return error("email is required", 400)
  }

  const token = `csw_${Buffer.from(email).toString("base64url")}_${Date.now().toString(36)}`

  return json({
    user: {
      id: `user_${Date.now()}`,
      email,
      name: email.split("@")[0],
    },
    token,
  })
}
