import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserSellOrders } from "@/lib/data"

export default async function SoldPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const sellOrders = await getUserSellOrders(session.user.id || "demo-user")
  const totalListed = sellOrders.reduce((s, o) => s + o.availableCredits, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📤</span> Credits for Sale
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {sellOrders.length} listing{sellOrders.length !== 1 ? "s" : ""} &middot; {totalListed.toLocaleString()} credits available
          </p>
        </div>
        <a href="/sell" className="btn-order-sell text-sm">Sell Credits</a>
      </div>

      {sellOrders.length === 0 ? (
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-12 text-center">
          <span className="text-4xl">📭</span>
          <h3 className="mt-4 text-lg font-semibold text-white">No Listings Yet</h3>
          <p className="mt-2 text-sm text-gray-400">List your credits for sale on the marketplace.</p>
          <a href="/sell" className="btn-order-sell mt-6 inline-block">Sell Credits</a>
        </div>
      ) : (
        <div className="space-y-4">
          {sellOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/30">
                <div className="flex items-center gap-3">
                  <a href={`/platforms/${order.platformSlug}`} className="text-sm font-semibold text-white hover:text-brand-400 transition-colors">
                    {order.platformName}
                  </a>
                  <span className={`badge text-[10px] ${order.type === "limit" ? "badge-amber" : "badge-blue"}`}>
                    {order.type}
                  </span>
                  {order.status === "active" && <span className="badge-green text-[10px]">active</span>}
                  {order.status !== "active" && <span className="badge-gray text-[10px]">{order.status}</span>}
                </div>
                <div className="flex items-center gap-3">
                  {order.type === "limit" && order.status === "active" && (
                    <a href={`/platforms/${order.platformSlug}/sell`} className="text-xs text-brand-400 hover:underline font-medium">
                      Change price →
                    </a>
                  )}
                  <a href={`/platforms/${order.platformSlug}`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                    View market
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
              <div className="px-6 py-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Listed</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{order.availableCredits.toLocaleString()} / {order.totalCredits.toLocaleString()} credits</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {order.type === "limit" ? "Limit Price" : "Market Rate"}
                  </p>
                  {order.type === "limit" ? (
                    <p className="mt-0.5 text-lg font-bold text-amber-400">${order.pricePerCredit.toFixed(2)}</p>
                  ) : (
                    <p className="mt-0.5 text-lg font-bold text-blue-400">Market</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-300 capitalize">{order.status}</p>
                  {order.expiresAt && (
                    <p className="text-xs text-gray-500">Expires {new Date(order.expiresAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
