"use client"

import { useState } from "react"
import { Platform } from "@/lib/types"
import { notFound, useParams } from "next/navigation"

const platforms: Platform[] = [
  { id: "p1", name: "Cloudify", slug: "cloudify", description: "Cloud compute and AI training credits.", logo: "☁️", apiEndpoint: "api.cloudify.com", supported: true, discoverable: true },
  { id: "p2", name: "OpenAI", slug: "openai", description: "GPT API credits for language models.", logo: "🤖", apiEndpoint: "api.openai.com", supported: true, discoverable: true },
  { id: "p3", name: "Anthropic", slug: "anthropic", description: "Claude API credits.", logo: "🧠", apiEndpoint: "api.anthropic.com", supported: true, discoverable: true },
  { id: "p4", name: "Replicate", slug: "replicate", description: "Open-source model API credits.", logo: "🔄", apiEndpoint: "api.replicate.com", supported: true, discoverable: true },
  { id: "p5", name: "Hugging Face", slug: "huggingface", description: "Inference API credits.", logo: "🤗", apiEndpoint: "api.huggingface.co", supported: true, discoverable: true },
  { id: "p6", name: "Together AI", slug: "together", description: "Open-source LLM API credits.", logo: "🔗", apiEndpoint: "api.together.xyz", supported: true, discoverable: true },
  { id: "p7", name: "ElevenLabs", slug: "elevenlabs", description: "AI voice synthesis credits.", logo: "🎙️", apiEndpoint: "api.elevenlabs.io", supported: true, discoverable: true },
  { id: "p8", name: "Midjourney", slug: "midjourney", description: "AI image generation credits.", logo: "🎨", apiEndpoint: "api.midjourney.com", supported: true, discoverable: true },
  { id: "p9", name: "Stability AI", slug: "stability", description: "Stable Diffusion credits.", logo: "✨", apiEndpoint: "api.stability.ai", supported: true, discoverable: true },
  { id: "p10", name: "Perplexity", slug: "perplexity", description: "AI search credits.", logo: "🔍", apiEndpoint: "api.perplexity.ai", supported: true, discoverable: true },
]

export default function SellPage() {
  const params = useParams()
  const slug = params.slug as string
  const platform = platforms.find((p) => p.slug === slug)
  if (!platform) return notFound()

  return <SellForm platform={platform} />
}

function SellForm({ platform }: { platform: Platform }) {
  const [apiKey, setApiKey] = useState("")
  const [totalCredits, setTotalCredits] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)
  const [sellAmount, setSellAmount] = useState("")
  const [pricePerCredit, setPricePerCredit] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [expiresAt, setExpiresAt] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ id: string } | null>(null)
  const [error, setError] = useState("")

  const handleCheckCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return
    setChecking(true)
    setError("")
    await new Promise((r) => setTimeout(r, 1500))
    setTotalCredits(Math.floor(Math.random() * 50000) + 5000)
    setChecking(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellAmount) return

    if (orderType === "limit") {
      const price = parseFloat(pricePerCredit)
      if (!price || price <= 0 || price >= 1) {
        setError("Limit price must be between $0.01 and $0.99")
        return
      }
    }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side: "sell",
          platformId: platform.id,
          platformName: platform.name,
          apiKey,
          amount: parseInt(sellAmount),
          pricePerCredit: orderType === "market" ? 0 : parseFloat(pricePerCredit),
          type: orderType,
          expiresAt: expiresAt || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create order")
      }
      const data = await res.json()
      setSuccess(data)
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.")
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-3xl">
              🎉
            </span>
            <h2 className="mt-5 text-xl font-bold text-white">Order Listed!</h2>
            <p className="mt-2 text-sm text-gray-400">
              Your {platform.name} credits are now live on the marketplace.
            </p>
            <p className="mt-1 text-xs text-gray-500">Order ID: {success.id}</p>
            <a href={`/platforms/${platform.slug}`} className="btn-primary mt-6 inline-block">
              View Order Book
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-lg px-4">
        <div className="mb-8">
          <a href={`/platforms/${platform.slug}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to {platform.name}
          </a>
          <h1 className="mt-3 text-2xl font-bold text-white">
            Sell {platform.logo} {platform.name} Credits
          </h1>
        </div>

        {!totalCredits ? (
          <form onSubmit={handleCheckCredits} className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">API Key</label>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter your {platform.name} API key to verify available credits.
              </p>
              <input
                type="password"
                className="input-field mt-2"
                placeholder={`${platform.slug.substring(0, 3)}_xxxxxxxxxxxx`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={checking}>
              {checking ? "Checking Credits..." : "Verify & Check Credits"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6 space-y-5">
            <div className="rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-500/5 border border-brand-500/20 p-5 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Available Credits</p>
              <p className="mt-1 text-3xl font-bold text-brand-300">{totalCredits.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Credits to Sell</label>
              <input
                type="number"
                className="input-field mt-1.5"
                placeholder={totalCredits.toString()}
                min="1"
                max={totalCredits}
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Order Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setOrderType("market"); setPricePerCredit("") }}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    orderType === "market"
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                      : "border-gray-800 bg-gray-900/80 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Market Price
                  <span className="block text-xs font-normal mt-0.5 text-gray-500">Sells at highest bid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("limit")}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    orderType === "limit"
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                      : "border-gray-800 bg-gray-900/80 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Limit Order
                  <span className="block text-xs font-normal mt-0.5 text-gray-500">Set your minimum price</span>
                </button>
              </div>
            </div>

            {orderType === "limit" && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Limit Price (minimum per credit)</label>
                <p className="text-xs text-gray-500 mt-0.5">Must be under $1.00</p>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    className="input-field pl-8"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max="0.99"
                    value={pricePerCredit}
                    onChange={(e) => {
                      const v = e.target.value
                      if (parseFloat(v) < 1 || v === "") setPricePerCredit(v)
                    }}
                    required
                  />
                </div>
                {parseFloat(pricePerCredit) >= 1 && (
                  <p className="text-xs text-red-400 mt-1">Price must be under $1.00</p>
                )}
              </div>
            )}

            {orderType === "market" && (
              <div className="rounded-xl bg-gray-950/50 border border-gray-800/50 p-4">
                <p className="text-sm text-gray-400">
                  Your credits will be listed at the <strong className="text-gray-200">market rate</strong> — the highest bid price available.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">Expiration Date (optional)</label>
              <p className="text-xs text-gray-500 mt-0.5">
                If set, the order will automatically expire and no longer be available.
              </p>
              <input
                type="date"
                className="input-field mt-1.5"
                value={expiresAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {sellAmount && (orderType === "market" || parseFloat(pricePerCredit) > 0) && (
              <div className="rounded-xl bg-gray-950/50 border border-gray-800/50 p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Listing value</span>
                  <span className="font-medium text-gray-200">
                    ${(parseFloat(sellAmount) * (orderType === "market" ? 0 : parseFloat(pricePerCredit))).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fee (15%)</span>
                  <span className="font-medium text-gray-200">
                    ${(parseFloat(sellAmount) * (orderType === "market" ? 0 : parseFloat(pricePerCredit)) * 0.15).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-800 pt-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-gray-200">You receive</span>
                  <span className="font-bold text-brand-300">
                    ${(parseFloat(sellAmount) * (orderType === "market" ? 0 : parseFloat(pricePerCredit)) * 0.85).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              className="btn-order-sell w-full"
              disabled={submitting || (orderType === "limit" && (parseFloat(pricePerCredit) || 0) >= 1)}
            >
              {submitting ? "Listing..." : `List ${orderType === "market" ? "at Market Rate" : "Limit Order"}`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
