import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserBuyOrders, getUserSellOrders, getPlatforms } from "@/lib/data"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const userId = session.user.id || "demo-user"
  const [buyOrders, sellOrders, platforms] = await Promise.all([
    getUserBuyOrders(userId),
    getUserSellOrders(userId),
    getPlatforms(),
  ])

  const totalSpent = buyOrders.reduce((s, o) => s + o.totalPrice, 0)
  const totalCreditsBought = buyOrders.reduce((s, o) => s + o.amount, 0)
  const totalCreditsUsed = buyOrders.reduce((s, o) => s + o.usage.creditsUsed, 0)
  const totalListed = sellOrders.reduce((s, o) => s + o.availableCredits, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Credits Bought</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalCreditsBought.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">${totalSpent.toFixed(2)} total spent</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Credits Used</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{totalCreditsUsed.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">
            {totalCreditsBought > 0 ? `${Math.round((totalCreditsUsed / totalCreditsBought) * 100)}% consumed` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Credits Listed</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalListed.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">{sellOrders.length} active listings</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Platforms</p>
          <p className="mt-2 text-3xl font-bold text-white">{platforms.length}</p>
        </div>
      </div>

      {buyOrders.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-brand-400">📥</span> Credits Bought
          </h2>
          <div className="mt-4 space-y-4">
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
        </section>
      )}

      {sellOrders.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-red-400">📤</span> Credits for Sale
          </h2>
          <div className="mt-4 space-y-4">
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
                  <div className="flex items-center gap-2">
                    {order.type === "limit" && order.status === "active" && (
                      <a
                        href={`/platforms/${order.platformSlug}/sell`}
                        className="text-xs text-brand-400 hover:underline font-medium"
                      >
                        Change price →
                      </a>
                    )}
                    <a
                      href={`/platforms/${order.platformSlug}`}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      View market
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
        </section>
      )}

      {buyOrders.length === 0 && sellOrders.length === 0 && (
        <div className="mt-10 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-12 text-center">
          <span className="text-4xl">📭</span>
          <h3 className="mt-4 text-lg font-semibold text-white">No Activity Yet</h3>
          <p className="mt-2 text-sm text-gray-400">
            Start by buying or selling credits on the marketplace.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <a href="/buy" className="btn-primary">Buy Credits</a>
            <a href="/sell" className="btn-order-sell">Sell Credits</a>
          </div>
        </div>
      )}
    </div>
  )
}
