"use client"

import { useState, useEffect } from "react"
import { Platform } from "@/lib/types"

export default function SellPage() {
  const [search, setSearch] = useState("")
  const [allPlatforms, setAllPlatforms] = useState<Platform[]>([])

  useEffect(() => {
    fetch("/api/platforms")
      .then((r) => r.json())
      .then((d) => setAllPlatforms(d.platforms || []))
      .catch(() => {})
  }, [])

  const platforms = allPlatforms.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.includes(search.toLowerCase())
  )

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="section-title">Sell Credits</h1>
          <p className="section-subtitle">Choose a platform to sell your unused credits.</p>
        </div>

        <div className="mt-8 max-w-md mx-auto">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="input-field pl-11"
              placeholder="Search platforms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <div key={p.id} className="glass-card p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-gray-800/50">
                  {p.website ? (
                    <img src={`https://${p.website}/favicon.ico`} alt="" className="h-8 w-8" />
                  ) : (
                    <span className="text-2xl">?</span>
                  )}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  <span className="text-xs font-mono text-gray-500">{p.apiEndpoint}</span>
                </div>
              </div>
              <a href={`/platforms/${p.slug}/sell`} className="btn-order-sell w-full text-center">
                Sell {p.name} Credits
              </a>
            </div>
          ))}
        </div>

        {platforms.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">No platforms matching &ldquo;{search}&rdquo;</p>
            <a href="/platforms" className="btn-secondary mt-4 inline-block">Browse All Platforms</a>
          </div>
        )}
      </div>
    </div>
  )
}
