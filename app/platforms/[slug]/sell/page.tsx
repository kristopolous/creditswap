"use client"

import { useState, useEffect } from "react"
import { Platform, OrderBookData } from "@/lib/types"
import { useParams } from "next/navigation"

const tabs: { key: "market" | "limit"; label: string }[] = [
  { key: "market", label: "Market" },
  { key: "limit", label: "Limit" },
]

export default function SellPage() {
  const params = useParams()
  const slug = params.slug as string
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/v1/services/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.service) setPlatform(d.service)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="py-16 text-center text-gray-500">Loading...</div>
  if (!platform) return <div className="py-16 text-center text-gray-500">Platform not found.</div>

  return <SellForm platform={platform} slug={slug} />
}

function SellForm({ platform, slug }: { platform: Platform; slug: string }) {
  const [apiKey, setApiKey] = useState("")
  const [totalCredits, setTotalCredits] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)
  const [sellAmount, setSellAmount] = useState("")
  const [pricePerCredit, setPricePerCredit] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [expiresAt, setExpiresAt] = useState("")
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ id: string } | null>(null)
  const [error, setError] = useState("")

  const bestBid = orderBook?.bids?.[0]?.price ?? 0

  useEffect(() => {
    fetch(`/api/v1/orderbook/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setOrderBook(data)
        if (!data.bids?.length) setOrderType("limit")
      })
      .catch(() => {})
  }, [slug])

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
          <div className="rounded border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-3xl">🎉</span>
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

  const numAmount = parseFloat(sellAmount) || 0
  const price = orderType === "limit" ? (parseFloat(pricePerCredit) || 0) : 0
  const listingValue = numAmount * price
  const fee = listingValue * 0.15
  const youReceive = listingValue * 0.85

  if (!totalCredits) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-lg px-4">
          <div className="mb-8">
            <a href={`/platforms/${platform.slug}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to {platform.name}
            </a>
            <h1 className="mt-3 text-2xl font-bold text-white">
              Sell {platform.name} Credits
            </h1>
          </div>

          <form onSubmit={handleCheckCredits} className="rounded border border-gray-800/50 bg-gray-900/60 p-6 space-y-4">
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
              Sell {platform.name} Credits
            </h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded border border-gray-800/50 bg-gray-900/60 overflow-hidden">
          <div className="flex border-b border-gray-800/50">
              {tabs.map((tab) => {
                const disabled = tab.key === "market" && bestBid === 0
                return (
                <button
                  key={tab.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => { setOrderType(tab.key); setPricePerCredit("") }}
                  className={`flex-1 px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                    orderType === tab.key
                      ? "text-white bg-gray-800/50 border-b-2 border-red-500"
                      : disabled
                        ? "text-gray-700 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/20"
                  }`}
                >
                  {tab.label}
                </button>
                )
              })}
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-sm bg-gradient-to-br from-brand-500/10 to-brand-500/5 border border-brand-500/20 px-4 py-3 text-center">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Available Credits</p>
              <p className="text-2xl font-bold text-brand-300">{totalCredits.toLocaleString()}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Credits to Sell</label>
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

            {orderType === "limit" && (
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Price per Credit</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                  <input
                    type="number"
                    className="input-field pl-7 text-sm"
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
                {price >= 1 && (
                  <p className="text-[11px] text-red-400 mt-1">Price must be under $1.00</p>
                )}
              </div>
            )}

            {orderType === "market" && (
              <div className="rounded-sm bg-gray-950/50 border border-gray-800/50 px-4 py-3 space-y-2">
                <p className="text-sm text-gray-400">
                  Listed at the <strong className="text-gray-200">highest bid price</strong> — matched automatically.
                </p>
                {bestBid > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Best bid</span>
                    <span className="font-medium text-gray-200">${bestBid.toFixed(4)} / credit</span>
                  </div>
                )}
                {bestBid === 0 && numAmount > 0 && (
                  <p className="text-xs text-yellow-500">No active buy orders — market may not fill immediately.</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Expiration (optional)</label>
              <input
                type="date"
                className="input-field mt-1.5"
                value={expiresAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {(orderType === "limit" && numAmount > 0 && price > 0) && (
              <div className="rounded-sm bg-gray-950/50 border border-gray-800/50 px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Listing value</span>
                  <span className="font-medium text-gray-200">${listingValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fee (15%)</span>
                  <span className="font-medium text-gray-200">${fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-800 pt-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-gray-200">You receive</span>
                  <span className="font-bold text-brand-300">${youReceive.toFixed(2)}</span>
                </div>
              </div>
            )}

            {orderType === "market" && numAmount > 0 && bestBid > 0 && (
              <div className="rounded-sm bg-gray-950/50 border border-gray-800/50 px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated value</span>
                  <span className="font-medium text-gray-200">${(numAmount * bestBid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fee (15%)</span>
                  <span className="font-medium text-gray-200">${(numAmount * bestBid * 0.15).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-800 pt-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-gray-200">You receive</span>
                  <span className="font-bold text-brand-300">${(numAmount * bestBid * 0.85).toFixed(2)}</span>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              className="btn-order-sell w-full py-3 text-sm font-semibold"
              disabled={submitting || (orderType === "limit" && (price <= 0 || price >= 1))}
            >
              {submitting ? "Listing..." : `Sell ${numAmount || ""} Credits`.trim()}
            </button>

            <p className="text-center text-[11px] text-gray-600">
              {orderType === "market" && "15% fee deducted from sale proceeds."}
              {orderType === "limit" && "15% fee deducted only when matched."}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
