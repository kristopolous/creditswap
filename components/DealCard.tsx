"use client"

import { Deal } from "@/lib/types"

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <a
      href={`/platforms/${deal.platformSlug}`}
      className="glass-card group block relative overflow-hidden"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/10 to-brand-500/5 blur-2xl" />
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-brand-400">
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          Best rate
        </span>
        <h3 className="mt-2 text-xl font-bold text-white group-hover:text-brand-300 transition-colors duration-200">
          {deal.ratio}
        </h3>
        <p className="mt-2 text-sm text-gray-400">
          {deal.availableCredits.toLocaleString()} credits available from {deal.sellerCount}{" "}
          seller{deal.sellerCount > 1 ? "s" : ""}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-gray-800/50 pt-4">
          <span className="text-sm text-gray-500">
            from{" "}
            <span className="font-semibold text-gray-200">${deal.pricePerCredit.toFixed(2)}</span>
            /credit
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 group-hover:text-brand-300 transition-all duration-200 group-hover:translate-x-1">
            Trade
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  )
}
