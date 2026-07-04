"use client"

import { DepthLevel } from "@/lib/data"

function cumulativeSum(data: { price: number; volume: number }[], asc: boolean): { price: number; total: number }[] {
  const sorted = [...data].sort((a, b) => asc ? a.price - b.price : b.price - a.price)
  let running = 0
  return sorted.map((d) => {
    running += d.volume
    return { price: d.price, total: running }
  })
}

export function OrderBookGraph({ depth, spread }: { depth: DepthLevel[]; spread: { bid: number; ask: number; spread: number } | null }) {
  if (depth.length === 0) return null

  const buys = depth.map((d) => ({ price: d.price, volume: d.buyVolume })).filter((d) => d.volume > 0)
  const sells = depth.map((d) => ({ price: d.price, volume: d.sellVolume })).filter((d) => d.volume > 0)

  const cumulativeBuys = cumulativeSum(buys, false)
  const cumulativeSells = cumulativeSum(sells, true)

  const allPoints = [...cumulativeBuys, ...cumulativeSells]
  const maxTotal = Math.max(...allPoints.map((p) => p.total), 1)
  const minPrice = Math.min(...depth.map((d) => d.price))
  const maxPrice = Math.max(...depth.map((d) => d.price))
  const priceRange = maxPrice - minPrice || 1

  const w = 700
  const h = 280
  const pad = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const xScale = (price: number) => pad.left + ((price - minPrice) / priceRange) * chartW
  const yScale = (total: number) => pad.top + chartH - (total / maxTotal) * chartH

  const buyPath = cumulativeBuys.map((p, i) =>
    i === 0 ? `M ${xScale(p.price)} ${yScale(0)} L ${xScale(p.price)} ${yScale(p.total)}` : `L ${xScale(p.price)} ${yScale(p.total)}`
  ).join(" ") + ` L ${xScale(cumulativeBuys[cumulativeBuys.length - 1]?.price || minPrice)} ${yScale(0)} Z`

  const sellPath = cumulativeSells.length > 0
    ? cumulativeSells.map((p, i) =>
        i === 0
          ? `M ${xScale(p.price)} ${yScale(0)} L ${xScale(p.price)} ${yScale(p.total)}`
          : `L ${xScale(p.price)} ${yScale(p.total)}`
      ).join(" ") + ` L ${xScale(cumulativeSells[cumulativeSells.length - 1]?.price || maxPrice)} ${yScale(0)} Z`
    : ""

  const buyLine = cumulativeBuys.map((p, i) =>
    i === 0 ? `M ${xScale(p.price)} ${yScale(p.total)}` : `L ${xScale(p.price)} ${yScale(p.total)}`
  ).join(" ")

  const sellLine = cumulativeSells.map((p, i) =>
    i === 0 ? `M ${xScale(p.price)} ${yScale(p.total)}` : `L ${xScale(p.price)} ${yScale(p.total)}`
  ).join(" ")

  const priceTicks = 5
  const ticks = Array.from({ length: priceTicks }, (_, i) => {
    const price = minPrice + (priceRange * i) / (priceTicks - 1)
    return price
  })

  const volTicks = 4
  const volumeLabels = Array.from({ length: volTicks }, (_, i) => {
    const val = (maxTotal * (i + 1)) / volTicks
    return val
  })

  const crossPrice = spread ? spread.ask : (cumulativeSells[0]?.price || cumulativeBuys[0]?.price || 0)
  const crossX = xScale(crossPrice)

  return (
    <div className="glass-card-static p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white">Depth Chart</h4>
        {spread && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400 font-medium">${spread.bid.toFixed(2)}</span>
            <span className="text-gray-600 text-[10px]">Spread ${spread.spread.toFixed(2)}</span>
            <span className="text-red-400 font-medium">${spread.ask.toFixed(2)}</span>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="buyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="sellGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(239,68,68)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(239,68,68)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {volumeLabels.map((val) => (
          <g key={val}>
            <text x={pad.left - 8} y={yScale(val) + 4} textAnchor="end" className="fill-gray-600 text-[10px] font-mono">
              {(val / 1000).toFixed(0)}k
            </text>
            <line x1={pad.left} y1={yScale(val)} x2={w - pad.right} y2={yScale(val)} stroke="rgb(55,65,81)" strokeWidth="0.5" strokeDasharray="3 3" />
          </g>
        ))}

        {ticks.map((price) => (
          <text key={price} x={xScale(price)} y={h - 8} textAnchor="middle" className="fill-gray-600 text-[10px] font-mono">
            ${price.toFixed(2)}
          </text>
        ))}

        {sellPath && (
          <path d={sellPath} fill="url(#sellGrad)" />
        )}

        <path d={buyPath} fill="url(#buyGrad)" />

        {sellLine && (
          <path d={sellLine} fill="none" stroke="rgb(239,68,68)" strokeWidth="1.5" />
        )}

        <path d={buyLine} fill="none" stroke="rgb(16,185,129)" strokeWidth="1.5" />

        {spread && (
          <>
            <line x1={crossX} y1={pad.top} x2={crossX} y2={pad.top + chartH} stroke="rgb(75,85,99)" strokeWidth="1" strokeDasharray="4 4" />
            <rect x={crossX - 28} y={pad.top - 8} width={56} height={18} rx={4} className="fill-gray-800" />
            <text x={crossX} y={pad.top + 4} textAnchor="middle" className="fill-gray-300 text-[10px] font-mono font-medium">
              ${crossPrice.toFixed(2)}
            </text>
          </>
        )}

        <line x1={pad.left} y1={pad.top + chartH} x2={w - pad.right} y2={pad.top + chartH} stroke="rgb(55,65,81)" strokeWidth="1" />
        <text x={w / 2} y={h - 22} textAnchor="middle" className="fill-gray-500 text-[10px]">Price per Credit</text>
        <text x={14} y={h / 2} textAnchor="middle" transform={`rotate(-90, 14, ${h / 2})`} className="fill-gray-500 text-[10px]">Volume</text>
      </svg>

      <div className="mt-4 flex items-center justify-between border-t border-gray-800/50 pt-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Buy demand
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Sell supply
          </span>
        </div>
        {spread && (
          <div className="text-xs text-gray-500">
            Mid: <span className="font-mono text-gray-300">${((spread.bid + spread.ask) / 2).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
