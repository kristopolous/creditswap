import { getPlatforms, createPlatform } from "@/lib/data"
import { json, error, parseBody } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET() {
  const platforms = await getPlatforms()
  return json({ services: platforms })
}

export async function POST(req: Request) {
  const body = await parseBody(req)
  const name = body.name as string | undefined
  if (!name || typeof name !== "string" || !name.trim()) {
    return error("name is required", 400)
  }

  const apiEndpoint = (body.apiEndpoint as string) || `api.${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.com`

  const service = await createPlatform(name.trim(), apiEndpoint, body.description as string | undefined)

  return json({ service }, 201)
}
