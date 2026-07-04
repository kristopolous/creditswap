export interface DiscoveryResult {
  creditsPerCall: number | null
  pricingUrl: string | null
  pricingDescription: string | null
}

const KNOWN_PLATFORMS: Record<string, { creditsPerCall: number; description: string; pricingUrl: string }> = {
  openai: {
    creditsPerCall: 3.0,
    description: "~$0.03 per GPT-4 call (varies by model and tokens)",
    pricingUrl: "https://openai.com/pricing",
  },
  anthropic: {
    creditsPerCall: 1.5,
    description: "~$0.015 per Claude 3 call (varies by model and tokens)",
    pricingUrl: "https://www.anthropic.com/pricing",
  },
  replicate: {
    creditsPerCall: 1.0,
    description: "~$0.01 per inference (varies by model and runtime)",
    pricingUrl: "https://replicate.com/pricing",
  },
  "huggingface": {
    creditsPerCall: 0.5,
    description: "~$0.005 per inference (varies by model)",
    pricingUrl: "https://huggingface.co/pricing",
  },
  together: {
    creditsPerCall: 1.0,
    description: "~$0.01 per call (varies by model)",
    pricingUrl: "https://www.together.ai/pricing",
  },
  elevenlabs: {
    creditsPerCall: 2.0,
    description: "~$0.02 per character of TTS",
    pricingUrl: "https://elevenlabs.io/pricing",
  },
  midjourney: {
    creditsPerCall: 10.0,
    description: "~$0.10 per image generation (varies by resolution)",
    pricingUrl: "https://midjourney.com/pricing",
  },
  stability: {
    creditsPerCall: 4.0,
    description: "~$0.04 per image generation (varies by model)",
    pricingUrl: "https://stability.ai/pricing",
  },
  perplexity: {
    creditsPerCall: 0.5,
    description: "~$0.005 per search query",
    pricingUrl: "https://www.perplexity.ai/pricing",
  },
  cloudify: {
    creditsPerCall: 0.1,
    description: "~$0.001 per compute second",
    pricingUrl: "https://cloudify.com/pricing",
  },
}

function normalizeSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").trim()
}

function matchKnownPlatform(name: string, apiEndpoint: string): { key: string; info: typeof KNOWN_PLATFORMS[string] } | null {
  const nameKey = normalizeSlug(name)

  for (const [key, info] of Object.entries(KNOWN_PLATFORMS)) {
    if (nameKey.includes(normalizeSlug(key)) || normalizeSlug(key).includes(nameKey)) return { key, info }
  }

  const endpointLower = apiEndpoint.toLowerCase()
  for (const [key, info] of Object.entries(KNOWN_PLATFORMS)) {
    if (endpointLower.includes(key)) return { key, info }
  }

  return null
}

async function fetchPricingPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "creditswap.ai/1.0 (discovery agent)" },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

const PRICING_PATTERNS = [
  /\$(\d+\.?\d*)\s*\/\s*(?:call|request|api|inference|generation)/i,
  /(\d+\.?\d*)\s*credits?\s*per\s*(?:call|request|api|inference|generation)/i,
  /price\s*per\s*(?:call|request):\s*\$?(\d+\.?\d*)/i,
  /\$(\d+\.?\d*)\/(?:1k|1000)\s*tokens/i,
]

function extractPricingFromHtml(html: string): { creditsPerCall: number | null; description: string | null } {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")

  for (const pattern of PRICING_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1])
      if (!isNaN(value) && value > 0 && value < 100) {
        return {
          creditsPerCall: Math.round(value * 100) / 100,
          description: `Inferred from pricing page: ~$${value.toFixed(4)} per call`,
        }
      }
    }
  }

  const dollarMatches = text.match(/\$(\d+\.\d+)/g)
  if (dollarMatches) {
    const values = dollarMatches.map((s) => parseFloat(s.replace("$", ""))).filter((v) => v > 0 && v < 10)
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      return {
        creditsPerCall: Math.round(avg * 100) / 100,
        description: `Estimated from pricing data on page (~$${avg.toFixed(4)} avg)`,
      }
    }
  }

  return { creditsPerCall: null, description: null }
}

export async function discoverCreditsPerCall(name: string, apiEndpoint: string): Promise<DiscoveryResult> {
  const known = matchKnownPlatform(name, apiEndpoint)
  if (known) {
    return {
      creditsPerCall: known.info.creditsPerCall,
      pricingUrl: known.info.pricingUrl,
      pricingDescription: known.info.description,
    }
  }

  const domain = apiEndpoint.replace(/^api\./, "").replace(/\/$/, "")
  const urls = [
    `https://${domain}/pricing`,
    `https://www.${domain}/pricing`,
    `https://${domain}/pricing/`,
    `https://www.${domain}/pricing/`,
  ]

  for (const url of urls) {
    const html = await fetchPricingPage(url)
    if (html) {
      const { creditsPerCall, description } = extractPricingFromHtml(html)
      if (creditsPerCall) {
        return { creditsPerCall, pricingUrl: url, pricingDescription: description }
      }
      return { creditsPerCall: null, pricingUrl: url, pricingDescription: "Pricing page found but could not extract per-call cost" }
    }
  }

  return { creditsPerCall: null, pricingUrl: null, pricingDescription: null }
}
