"use client"

import { DepthLevel } from "@/lib/data"

export function OrderBookGraph({ depth, spread }: { depth: DepthLevel[]; spread: { bid: number; ask: number; spread: number } | null }) {
  if (depth.length === 0) return null

  const maxVolume = Math.max(...depth.map((d) => Math.max(d.buyVolume, d.sellVolume)), 1)
  const barMaxHeight = 120

  return (
    <div className="glass-card-static p-5">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-sm font-semibold text-white">Order Book Depth</h4>
        {spread && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-400">
              Bid: <span className="font-semibold">${spread.bid.toFixed(2)}</span>
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-red-400">
              Ask: <span className="font-semibold">${spread.ask.toFixed(2)}</span>
            </span>
            <span className="text-gray-500">
              Spread: <span className="font-mono text-gray-300">${spread.spread.toFixed(2)}</span>
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex items-end gap-[2px] h-[130px]">
          {depth.map((level) => {
            const buyH = (level.buyVolume / maxVolume) * barMaxHeight
            const sellH = (level.sellVolume / maxVolume) * barMaxHeight
            return (
              <div
                key={level.price}
                className="group relative flex flex-1 flex-col items-center justify-end h-full"
              >
                <div className="w-full flex flex-col items-center justify-end h-full gap-px">
                  <div
                    className="w-full rounded-t-sm transition-all duration-200 group-hover:opacity-80"
                    style={{
                      height: `${Math.max(sellH, 1)}px`,
                      background: `linear-gradient(to top, rgba(239,68,68,0.6), rgba(239,68,68,0.2))`,
                    }}
                  />
                  <div
                    className="w-full rounded-b-sm transition-all duration-200 group-hover:opacity-80"
                    style={{
                      height: `${Math.max(buyH, 1)}px`,
                      background: `linear-gradient(to top, rgba(16,185,129,0.6), rgba(16,185,129,0.2))`,
                    }}
                  />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <div className="glass px-2 py-1 rounded-lg text-[10px] whitespace-nowrap shadow-lg">
                    <span className="text-green-400">B ${level.buyVolume.toLocaleString()}</span>
                    <span className="text-gray-600 mx-1">|</span>
                    <span className="text-red-400">S ${level.sellVolume.toLocaleString()}</span>
                    <br />
                    <span className="text-gray-400">@ ${level.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-between text-[11px] text-gray-600">
          <span>{depth.length > 0 ? `$${depth[0].price.toFixed(2)}` : ""}</span>
          <span className="text-gray-500">Price per credit</span>
          <span>{depth.length > 0 ? `$${depth[depth.length - 1].price.toFixed(2)}` : ""}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-800/50 pt-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-500/60" />
            Buy demand
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500/60" />
            Sell supply
          </span>
        </div>
      </div>
    </div>
  )
}
