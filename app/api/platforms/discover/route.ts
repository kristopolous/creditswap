import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { name, apiEndpoint } = await req.json()

  const slug = name.toLowerCase().replace(/\s+/g, "-")
  const endpoint = apiEndpoint || `api.${slug}.com`

  const platform = {
    id: `p${Date.now()}`,
    name,
    slug,
    description: `API credits for ${name}. Added via discovery.`,
    apiEndpoint: endpoint,
    website: null,
    supported: true,
    discoverable: true,
    creditsPerCall: null,
    costModel: "per_call" as const,
    creditsPerHour: null,
  }

  return NextResponse.json({
    platform,
    message: `Discovered ${name} API. Endpoint compatible with ${endpoint}.`,
  })
}
