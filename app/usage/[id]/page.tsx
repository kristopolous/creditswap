"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { UsageStats, UsageLog } from "@/lib/types"

export default function UsagePage() {
  const { id } = useParams<{ id: string }>()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch(`/api/v1/buy-orders/${id}/usage`),
          fetch(`/api/v1/usage/${id}`),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (logsRes.ok) setLogs(await logsRes.json())
        else if (!statsRes.ok) setError("Usage data not found")
      } catch {
        setError("Failed to load usage data")
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-gray-500">Loading usage data...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <span className="text-4xl">📭</span>
        <h2 className="mt-4 text-lg font-semibold text-white">No Usage Data</h2>
        <p className="mt-2 text-sm text-gray-400">{error || "This buy order has no recorded usage yet."}</p>
      </div>
    )
  }

  const usagePercent = stats.totalCreditsPurchased > 0
    ? Math.round((stats.totalCreditsUsed / stats.totalCreditsPurchased) * 100)
    : 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Usage Summary</h1>
        <p className="mt-1 text-sm text-gray-400">Transparent accounting for your purchased credits.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Purchased</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.totalCreditsPurchased.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Used</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{stats.totalCreditsUsed.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Remaining</p>
          <p className="mt-2 text-3xl font-bold text-green-400">{stats.totalCreditsRemaining.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Calls</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.totalCalls.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Consumption</h2>
          <span className="text-xs text-gray-500">{usagePercent}% used</span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {stats.usageByEndpoint.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800/50">
            <h2 className="text-sm font-semibold text-white">Usage by Endpoint</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800/30">
            <span>Endpoint</span>
            <span className="text-right">Calls</span>
            <span className="text-right">Credits</span>
          </div>
          {stats.usageByEndpoint.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 px-6 py-3 text-sm border-b border-gray-800/20 last:border-0">
              <span className="text-gray-300 font-mono text-xs truncate">{row.endpoint}</span>
              <span className="text-right text-gray-400">{row.calls}</span>
              <span className="text-right text-amber-400 font-mono">{row.credits.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {stats.usageByDay.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800/50">
            <h2 className="text-sm font-semibold text-white">Usage by Day</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800/30">
            <span>Date</span>
            <span className="text-right">Calls</span>
            <span className="text-right">Credits</span>
          </div>
          {stats.usageByDay.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 px-6 py-3 text-sm border-b border-gray-800/20 last:border-0">
              <span className="text-gray-300">{row.date}</span>
              <span className="text-right text-gray-400">{row.calls}</span>
              <span className="text-right text-amber-400 font-mono">{row.credits.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-6">
          <details className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl overflow-hidden">
            <summary className="px-6 py-4 text-sm font-semibold text-white cursor-pointer hover:bg-gray-800/30 transition-colors">
              Raw Usage Log ({logs.length} entries)
            </summary>
            <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-t border-gray-800/30">
              <span>Time</span>
              <span>Method</span>
              <span className="col-span-2">Endpoint</span>
              <span className="text-right">Credits</span>
            </div>
            {logs.map((entry) => (
              <div key={entry.id} className="grid grid-cols-5 gap-4 px-6 py-2 text-xs border-t border-gray-800/20 last:border-0">
                <span className="text-gray-500">{new Date(entry.createdAt).toLocaleString()}</span>
                <span className="text-gray-400 font-mono">{entry.method}</span>
                <span className="col-span-2 text-gray-300 font-mono truncate">{entry.endpoint}</span>
                <span className="text-right text-amber-400 font-mono">{entry.creditsCharged.toFixed(2)}</span>
              </div>
            ))}
          </details>
        </div>
      )}

      <div className="mt-8 rounded-xl bg-amber-500/5 border border-amber-500/20 p-5 text-center">
        <p className="text-sm text-gray-300">
          If you believe the accounting is incorrect or fraud has occurred,{" "}
          <a href="mailto:disputes@creditswap.ai" className="text-brand-400 hover:underline font-medium">
            file a dispute
          </a>
          . We investigate all reports within 48 hours.
        </p>
      </div>
    </div>
  )
}
