import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPlatforms, getDeals, getAllSellOrders } from "@/lib/data"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const platforms = await getPlatforms()
  const deals = await getDeals()
  const allOrders = await getAllSellOrders()
  const sellOrders = allOrders.filter((o) => o.status === "active")
  const totalListings = sellOrders.length
  const totalCredits = sellOrders.reduce((s, o) => s + o.availableCredits, 0)

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
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Platforms</p>
          <p className="mt-2 text-3xl font-bold text-white">{platforms.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Active Listings</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalListings}</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Credits Available</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalCredits.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Active Deals</p>
          <p className="mt-2 text-3xl font-bold text-white">{deals.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white">Recent Deals</h2>
          <div className="mt-4 space-y-3">
            {deals.slice(0, 5).map((deal) => (
              <a
                key={deal.id}
                href={`/platforms/${deal.platformSlug}`}
                className="flex items-center justify-between rounded-xl border border-gray-800/30 bg-gray-950/30 px-4 py-3 transition-colors hover:border-gray-700/50"
              >
                <div>
                  <p className="text-sm font-medium text-white">{deal.platformName}</p>
                  <p className="text-xs text-gray-500">{deal.availableCredits.toLocaleString()} credits available</p>
                </div>
                <span className="text-sm font-semibold text-brand-400">${deal.pricePerCredit.toFixed(2)}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <a href="/buy" className="btn-primary block w-full text-center">
              Buy Credits
            </a>
            <a href="/sell" className="btn-order-sell block w-full text-center">
              Sell Credits
            </a>
            <a href="/platforms" className="btn-secondary block w-full text-center">
              Browse Platforms
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
