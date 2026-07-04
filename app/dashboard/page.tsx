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
        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Credits Bought</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalCreditsBought.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">${totalSpent.toFixed(2)} total spent</p>
        </div>
        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Credits Used</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{totalCreditsUsed.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">
            {totalCreditsBought > 0 ? `${Math.round((totalCreditsUsed / totalCreditsBought) * 100)}% consumed` : "—"}
          </p>
        </div>
        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Credits Listed</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalListed.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">{sellOrders.length} active listings</p>
        </div>
        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Platforms</p>
          <p className="mt-2 text-3xl font-bold text-white">{platforms.length}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <a href="/dashboard/bought" className="group rounded border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-900/30 p-8 hover:border-brand-500/30 transition-all duration-200">
          <span className="text-3xl">📥</span>
          <h2 className="mt-4 text-lg font-bold text-white group-hover:text-brand-400 transition-colors">Credits Bought</h2>
          <p className="mt-2 text-sm text-gray-400">
            {buyOrders.length} purchase{buyOrders.length !== 1 ? "s" : ""} &middot; {totalCreditsUsed.toLocaleString()} of {totalCreditsBought.toLocaleString()} credits used
          </p>
          <p className="mt-1 text-xs text-gray-500">View usage logs, API call breakdown, and remaining credits →</p>
        </a>
        <a href="/dashboard/sold" className="group rounded border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-900/30 p-8 hover:border-red-500/30 transition-all duration-200">
          <span className="text-3xl">📤</span>
          <h2 className="mt-4 text-lg font-bold text-white group-hover:text-red-400 transition-colors">Credits for Sale</h2>
          <p className="mt-2 text-sm text-gray-400">
            {sellOrders.length} listing{sellOrders.length !== 1 ? "s" : ""} &middot; {totalListed.toLocaleString()} credits available
          </p>
          <p className="mt-1 text-xs text-gray-500">Manage listings, adjust limit prices, and view market →</p>
        </a>
      </div>

      {buyOrders.length === 0 && sellOrders.length === 0 && (
        <div className="mt-10 rounded border border-gray-800/50 bg-gray-900/60 p-12 text-center">
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
