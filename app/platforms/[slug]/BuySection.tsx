"use client"

import { useState } from "react"
import { Platform, Deal } from "@/lib/types"

type OrderType = "market" | "limit" | "stop" | "stop_limit"

const tabs: { key: OrderType; label: string }[] = [
  { key: "market", label: "Market" },
  { key: "limit", label: "Limit" },
  { key: "stop", label: "Stop" },
  { key: "stop_limit", label: "Stop Limit" },
]

export function BuySection({
  platform,
  deal,
  minPrice,
}: {
  platform: Platform
  deal: Deal
  minPrice: number
}) {
  const [orderType, setOrderType] = useState<OrderType>("market")
  const [amount, setAmount] = useState("100")
  const [limitPrice, setLimitPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [purchasing, setPurchasing] = useState(false)
  const [result, setResult] = useState<{
    proxyKey?: string
    total?: number
    fee?: number
    status: string
    type: string
    id: string
  } | null>(null)

  const numAmount = parseFloat(amount) || 0
  const effectivePrice = orderType === "market" ? minPrice : (parseFloat(limitPrice) || 0)
  const subtotal = numAmount * effectivePrice
  const fee = subtotal * 0.15
  const total = subtotal + fee

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (numAmount <= 0) return
    if ((orderType === "limit" || orderType === "stop_limit") && (effectivePrice <= 0 || effectivePrice >= 1)) return
    setPurchasing(true)

    const res = await fetch(`/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        side: "buy",
        platformId: platform.id,
        platformName: platform.name,
        amount: numAmount,
        pricePerCredit: effectivePrice,
        type: orderType === "limit" || orderType === "stop_limit" ? "limit" : "market",
      }),
    })

    const data = await res.json()
    setResult(data)
    setPurchasing(false)
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-lg">
            {result.status === "pending" ? "⏳" : "✅"}
          </span>
          <div>
            <h3 className="font-semibold text-white">
              {result.status === "pending" ? "Limit Order Placed" : "Purchase Successful"}
            </h3>
            <p className="text-sm text-gray-400">Order ID: {result.id}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {result.proxyKey && (
            <div className="rounded-xl bg-gray-900/80 border border-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Your Proxy Key</p>
              <p className="font-mono text-base font-bold text-brand-400 break-all">{result.proxyKey}</p>
            </div>
          )}
          {result.total !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="font-semibold text-white">${result.total.toFixed(2)}</span>
            </div>
          )}
          {result.fee !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Fee (15%)</span>
              <span className="font-semibold text-white">${result.fee.toFixed(2)}</span>
            </div>
          )}
          {result.status === "pending" && (
            <p className="text-xs text-amber-400 mt-2">
              Your limit order is open. We&apos;ll match it when a seller accepts your price.
            </p>
          )}
        </div>
        <button onClick={() => setResult(null)} className="btn-secondary mt-5 w-full">
          {result.status === "pending" ? "Place Another Order" : "Buy More"}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleBuy} className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl overflow-hidden">
      <div className="flex border-b border-gray-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setOrderType(tab.key)}
            className={`flex-1 px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
              orderType === tab.key
                ? "text-white bg-gray-800/50 border-b-2 border-brand-500"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Credits</label>
          <input
            type="number"
            className="input-field mt-1.5"
            placeholder="100"
            min="1"
            max={orderType === "market" ? deal.availableCredits : undefined}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <p className="text-[11px] text-gray-600 mt-1">
            Available: {deal.availableCredits.toLocaleString()} credits
          </p>
        </div>

        {(orderType === "limit" || orderType === "stop_limit") && (
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {orderType === "stop_limit" ? "Limit Price" : "Price"}
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
              <input
                type="number"
                className="input-field pl-7 text-sm"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max="0.99"
                value={limitPrice}
                onChange={(e) => {
                  const v = e.target.value
                  if (parseFloat(v) < 1 || v === "") setLimitPrice(v)
                }}
                required
              />
            </div>
            {effectivePrice >= 1 && (
              <p className="text-[11px] text-red-400 mt-1">Price must be under $1.00</p>
            )}
          </div>
        )}

        {(orderType === "stop" || orderType === "stop_limit") && (
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Stop Price</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
              <input
                type="number"
                className="input-field pl-7 text-sm"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max="0.99"
                value={stopPrice}
                onChange={(e) => {
                  const v = e.target.value
                  if (parseFloat(v) < 1 || v === "") setStopPrice(v)
                }}
                required
              />
            </div>
          </div>
        )}

        {orderType === "market" && (
          <div className="rounded-lg bg-gray-950/50 border border-gray-800/50 px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Est. price</span>
              <span className="font-medium text-gray-200">${minPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-gray-950/50 border border-gray-800/50 px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-medium text-gray-200">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Fee (15%)</span>
            <span className="font-medium text-gray-200">${fee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-800 pt-1.5 flex justify-between">
            <span className="font-semibold text-gray-200">Total</span>
            <span className="font-bold text-white">${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-order-buy w-full py-3 text-sm font-semibold"
          disabled={purchasing || numAmount <= 0 || ((orderType === "limit" || orderType === "stop_limit") && (effectivePrice <= 0 || effectivePrice >= 1))}
        >
          {purchasing ? "Processing..." : `Buy ${numAmount || ""} Credits`.trim()}
        </button>

        <p className="text-center text-[11px] text-gray-600">
          {orderType === "market" && "15% fee included. Pay with card or crypto."}
          {orderType === "limit" && "No charge until your limit is matched."}
          {orderType === "stop" && "Triggers a market buy when stop price is reached."}
          {orderType === "stop_limit" && "Triggers a limit buy when stop price is reached."}
        </p>
      </div>
    </form>
  )
}
