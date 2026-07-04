import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserBuyOrders } from "@/lib/data"

export default async function BoughtPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const buyOrders = await getUserBuyOrders(session.user.id || "demo-user")
  const totalCreditsBought = buyOrders.reduce((s, o) => s + o.amount, 0)
  const totalCreditsUsed = buyOrders.reduce((s, o) => s + o.usage.creditsUsed, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📥</span> Credits Bought
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {totalCreditsUsed.toLocaleString()} of {totalCreditsBought.toLocaleString()} credits used across {buyOrders.length} purchase{buyOrders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="/buy" className="btn-primary text-sm">Buy More</a>
      </div>

      {buyOrders.length === 0 ? (
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-12 text-center">
          <span className="text-4xl">📭</span>
          <h3 className="mt-4 text-lg font-semibold text-white">No Purchases Yet</h3>
          <p className="mt-2 text-sm text-gray-400">Buy credits to see your usage logs here.</p>
          <a href="/buy" className="btn-primary mt-6 inline-block">Buy Credits</a>
        </div>
      ) : (
        <div className="space-y-4">
          {buyOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/30">
                <div className="flex items-center gap-3">
                  <a href={`/platforms/${order.platformSlug}`} className="text-sm font-semibold text-white hover:text-brand-400 transition-colors">
                    {order.platformName}
                  </a>
                  <span className={`badge text-[10px] ${order.status === "completed" ? "badge-green" : "badge-amber"}`}>
                    {order.status}
                  </span>
                </div>
                <a href={`/usage/${order.id}`} className="text-xs text-brand-400 hover:underline font-medium">
                  View full log →
                </a>
              </div>
              <div className="px-6 py-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Purchased</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{order.amount.toLocaleString()} credits</p>
                  <p className="text-xs text-gray-500">at ${order.pricePerCredit.toFixed(2)}/credit</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Usage (API Calls)</p>
                  <p className="mt-0.5 text-lg font-bold text-amber-400">{order.usage.calls.toLocaleString()} calls</p>
                  <p className="text-xs text-gray-500">{order.usage.creditsUsed.toFixed(2)} credits consumed</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Remaining</p>
                  <p className="mt-0.5 text-lg font-bold text-green-400">{Math.max(0, order.amount - order.usage.creditsUsed).toFixed(2)}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-500"
                      style={{ width: `${Math.min((order.usage.creditsUsed / order.amount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
