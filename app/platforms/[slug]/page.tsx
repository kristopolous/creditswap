import { getPlatform, getSellOrders, getBuyOrders, getDeals, getDepth, getSpread } from "@/lib/data"
import { notFound } from "next/navigation"
import { BuySection } from "./BuySection"
import { OrderBookGraph } from "@/components/OrderBookGraph"

export default async function PlatformPage({ params: { slug } }: { params: { slug: string } }) {
  const platform = await getPlatform(slug)
  if (!platform) notFound()

  const [sellOrders, buyOrders, deals, depth, spread] = await Promise.all([
    getSellOrders(platform.id),
    getBuyOrders(platform.id),
    getDeals(),
    getDepth(platform.id),
    getSpread(platform.id),
  ])

  const deal = deals.find((d) => d.platformId === platform.id)
  const minPrice = sellOrders.length > 0 ? Math.min(...sellOrders.map((o) => o.pricePerCredit)) : 0
  const totalAvailable = sellOrders.reduce((s, o) => s + o.availableCredits, 0)
  const totalDemand = buyOrders.reduce((s, o) => s + o.amount, 0)

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-lg overflow-hidden">
            <img src={`https://www.google.com/s2/favicons?domain=${platform.apiEndpoint}&sz=64`} alt="" className="h-10 w-10 object-contain" />
          </span>
          <div>
            <h1 className="text-3xl font-bold text-white">
              <a href="/docs" className="hover:text-brand-400 transition-colors">{platform.name}</a>
            </h1>
            <p className="mt-1 text-gray-400 max-w-2xl">{platform.description}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="glass-card-static p-5 text-center">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Available</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalAvailable.toLocaleString()}</p>
          </div>
          <div className="glass-card-static p-5 text-center">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Best Ask</p>
            <p className="mt-1 text-2xl font-bold text-brand-400">
              {minPrice > 0 ? `$${minPrice.toFixed(2)}` : "\u2014"}
            </p>
          </div>
          <div className="glass-card-static p-5 text-center">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Demand</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalDemand.toLocaleString()}</p>
          </div>
          <div className="glass-card-static p-5 text-center">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Orders</p>
            <p className="mt-1 text-2xl font-bold text-white">{sellOrders.length + buyOrders.length}</p>
          </div>
        </div>

        <div className="mt-8 rounded border border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-brand-500/[0.02] p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-brand-500/10 text-xs">{"\uD83D\uDD17"}</span>
            <h3 className="font-semibold text-white">Proxy Endpoint</h3>
          </div>
          <p className="text-sm text-gray-400">
            Use this endpoint to access {platform.name} credits through creditswap:
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-sm bg-gray-950 border border-gray-800 px-4 py-3">
            <code className="flex-1 text-sm font-mono text-brand-300">
              creditswap.ai/{platform.slug}
            </code>
            <span className="badge-green text-[10px]">API Compatible</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Fully compatible with {platform.apiEndpoint}. Use the creditswap proxy CLI for transparent URL rewriting.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-white">Buy Credits</h2>
            <p className="text-sm text-gray-400 mt-1">Market buy or set a limit order.</p>
            {deal ? (
              <BuySection platform={platform} deal={deal} minPrice={minPrice} />
            ) : (
              <div className="mt-4 rounded border border-gray-800/50 bg-gray-900/60 p-8 text-center">
                <p className="text-gray-500">No sell orders available right now.</p>
                <p className="text-xs text-gray-600 mt-1">Check back later or browse other platforms.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <OrderBookGraph depth={depth} spread={spread} />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Order Book</h2>
                <p className="text-sm text-gray-400 mt-1">Active bids and asks.</p>
              </div>
              <a href={`/platforms/${platform.slug}/sell`} className="btn-order-sell text-xs px-4 py-2">
                Sell
              </a>
            </div>

            <div className="rounded border border-gray-800/50 bg-gray-900/60 overflow-hidden">
              <div className="grid grid-cols-3 gap-4 border-b border-gray-800/50 px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span>Price</span>
                <span className="text-right">Volume</span>
                <span className="text-right">Type</span>
              </div>

              {sellOrders.length > 0 && (
                <div className="px-5 py-2 border-b border-gray-800/30">
                  <p className="text-[11px] font-medium text-red-400/80 uppercase tracking-wider mb-1">Asks</p>
                  {sellOrders.map((o) => (
                    <div key={o.id} className="order-book-sell grid grid-cols-3 gap-4 py-2 text-sm">
                      <span className="text-red-400 font-mono font-medium">${o.pricePerCredit.toFixed(2)}</span>
                      <span className="text-right text-gray-300">{o.availableCredits.toLocaleString()}</span>
                      <span className="text-right">
                        <span className={`badge text-[10px] ${o.type === "limit" ? "badge-amber" : "badge-blue"}`}>
                          {o.type}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {buyOrders.length > 0 && (
                <div className="px-5 py-2">
                  <p className="text-[11px] font-medium text-green-400/80 uppercase tracking-wider mb-1">Bids</p>
                  {buyOrders.map((o) => (
                    <div key={o.id} className="order-book-buy grid grid-cols-3 gap-4 py-2 text-sm">
                      <span className="text-green-400 font-mono font-medium">${o.pricePerCredit.toFixed(2)}</span>
                      <span className="text-right text-gray-300">{o.amount.toLocaleString()}</span>
                      <span className="text-right">
                        <span className="badge-amber text-[10px]">limit</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {sellOrders.length === 0 && buyOrders.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-gray-500">
                  No active orders for this platform.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-900/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Sell {platform.name} Credits</h2>
              <p className="text-sm text-gray-400 mt-1">
                Have unused credits? List them at market rate or set a limit order.
              </p>
            </div>
            <a href={`/platforms/${platform.slug}/sell`} className="btn-order-sell px-5 py-2.5">
              Sell Credits
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
