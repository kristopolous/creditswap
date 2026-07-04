import { getDeals } from "@/lib/data"
import { DealCard } from "@/components/DealCard"

export default async function BuyPage() {
  const deals = await getDeals()

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="section-title">Buy Credits</h1>
          <p className="section-subtitle">
            Purchase AI platform credits at discounted rates. Set market or limit orders.
          </p>
        </div>

        {deals.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-12 text-center">
            <span className="text-4xl">📭</span>
            <h3 className="mt-4 text-lg font-semibold text-white">No Active Deals</h3>
            <p className="mt-2 text-sm text-gray-400">
              There are no active sell orders right now. Check back later or browse platforms to place a limit order.
            </p>
            <a href="/platforms" className="btn-secondary mt-6 inline-block">
              Browse Platforms
            </a>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-lg">📊</span>
                <div>
                  <h3 className="font-semibold text-white">Limit Orders</h3>
                  <p className="text-sm text-gray-400">
                    Don&apos;t see the rate you want? Place a limit order and we&apos;ll match you when the market hits your price.
                  </p>
                </div>
              </div>
              <a href="/platforms" className="btn-secondary mt-4 inline-block">
                Place Limit Order
              </a>
            </div>
          </>
        )}

        <div className="mt-16">
          <h2 className="text-lg font-semibold text-white">How Buying Works</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              { num: "1", title: "Choose a Deal", desc: "Browse available deals across platforms. Compare rates." },
              { num: "2", title: "Pick Market or Limit", desc: "Buy instantly at market rate or set a limit price." },
              { num: "3", title: "Use Proxy Key", desc: "Get a proxy key and redirect API calls through creditswap." },
            ].map((step) => (
              <div key={step.num} className="flex gap-4 glass-card-static p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 text-sm font-bold text-brand-300">
                  {step.num}
                </span>
                <div>
                  <h4 className="font-medium text-white">{step.title}</h4>
                  <p className="mt-1 text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
