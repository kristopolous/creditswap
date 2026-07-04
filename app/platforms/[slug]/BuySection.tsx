"use client"

import { useState } from "react"
import { Platform, Deal } from "@/lib/types"

export function BuySection({
  platform,
  deal,
  minPrice,
}: {
  platform: Platform
  deal: Deal
  minPrice: number
}) {
  const [amount, setAmount] = useState("100")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [limitPrice, setLimitPrice] = useState("")
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
  const price = orderType === "market" ? minPrice : (parseFloat(limitPrice) || 0)
  const subtotal = numAmount * price
  const fee = subtotal * 0.15
  const total = subtotal + fee

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (numAmount <= 0 || (orderType === "limit" && (price <= 0 || price >= 1))) return
    setPurchasing(true)

    const res = await fetch(`/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        side: "buy",
        platformId: platform.id,
        platformName: platform.name,
        amount: numAmount,
        pricePerCredit: price,
        type: orderType,
      }),
    })

    const data = await res.json()
    setResult(data)
    setPurchasing(false)
  }

  if (result) {
    return (
      <div className="mt-4 rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-6">
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
    <form onSubmit={handleBuy} className="mt-4 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300">Order Type</label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOrderType("market")}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
              orderType === "market"
                ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                : "border-gray-800 bg-gray-900/80 text-gray-400 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            Market Buy
            <span className="block text-xs font-normal mt-0.5 text-gray-500">Buy at best rate</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType("limit")}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
              orderType === "limit"
                ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                : "border-gray-800 bg-gray-900/80 text-gray-400 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            Limit Order
            <span className="block text-xs font-normal mt-0.5 text-gray-500">Set your max price</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">Amount of Credits</label>
        <p className="text-xs text-gray-500 mt-0.5">
          {orderType === "market"
            ? `Available: ${deal.availableCredits.toLocaleString()} credits from $${minPrice.toFixed(2)}`
            : "Set the amount you want to buy"}
        </p>
        <input
          type="number"
          className="input-field mt-2"
          placeholder="100"
          min="1"
          max={orderType === "market" ? deal.availableCredits : undefined}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {orderType === "limit" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Max Price per Credit</label>
          <p className="text-xs text-gray-500 mt-0.5">Must be under $1.00</p>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              className="input-field pl-8"
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
          {price >= 1 && (
            <p className="text-xs text-red-400 mt-1">Price must be under $1.00</p>
          )}
        </div>
      )}

      <div className="rounded-xl bg-gray-950/50 border border-gray-800/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-200">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Fee (15%)</span>
          <span className="font-medium text-gray-200">${fee.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-800 pt-2 flex justify-between">
          <span className="font-semibold text-gray-200">Total</span>
          <span className="font-bold text-white">${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary mt-5 w-full"
        disabled={purchasing || numAmount <= 0 || (orderType === "limit" && (price <= 0 || price >= 1))}
      >
        {purchasing
          ? "Processing..."
          : orderType === "market"
            ? "Pay with Link (ACH)"
            : "Place Limit Order"}
      </button>
      <p className="mt-2 text-center text-xs text-gray-600">
        {orderType === "market" ? "Secure payment via Stripe Link — ACH bank transfer" : "No charge until matched"}
      </p>
    </form>
  )
}
