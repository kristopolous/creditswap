import { getDeals, getPlatforms } from "@/lib/data"
import { DealCard } from "@/components/DealCard"
import { PlatformCard } from "@/components/PlatformCard"

export default async function Home() {
  const deals = await getDeals()
  const platforms = await getPlatforms()

  return (
    <div>
      <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
        <div className="bg-mesh pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-950/0 via-gray-950/50 to-gray-950" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/5 px-4 py-1.5 text-sm text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              Live marketplace — {deals.length} active deals
            </div>
            <h1 className="heading-display text-white">
              Trade{" "}
               <span className="gradient-text-glow">API Credits</span>
              <br />
              on the Open Market
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              A two-sided marketplace for AI platform credits. Buy at a discount or sell
              unused credits at market rate. Set limit orders on both sides.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <a href="/buy" className="btn-primary text-base px-8 py-4 shadow-lg shadow-brand-500/20 animate-slide-up-delay-1">
                Browse Deals
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href="/sell" className="btn-secondary text-base px-8 py-4 animate-slide-up-delay-2">
                Start Selling
              </a>
            </div>
          </div>
        </div>
      </section>

      {deals.length > 0 && (
        <section className="relative py-20">
          <div className="bg-mesh-subtle pointer-events-none absolute inset-0" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="section-title">Trending Markets</h2>
                <p className="section-subtitle">Best rates available right now on the marketplace.</p>
              </div>
              <a href="/buy" className="btn-ghost hidden sm:inline-flex">
                View all &rarr;
              </a>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal, i) => (
                <div key={deal.id} className={`animate-slide-up`} style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                  <DealCard deal={deal} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-gray-800/50 bg-gray-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three steps to start trading AI credits.</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { icon: "🔍", title: "Choose a Platform", desc: "Browse supported platforms or add your own. We discover available credits automatically." },
              { icon: "📊", title: "Set Your Price", desc: "Sell at market rate or place a limit order. Buyers can also set limit bids." },
              { icon: "🔑", title: "Get Proxy Key", desc: "Buyers get a proxy key. Use the creditswap proxy to transparently redirect API calls." },
            ].map((item, i) => (
              <div key={item.title} className="glass-card p-8 text-center" style={{ animationDelay: `${0.1 + i * 0.15}s` }}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded bg-gradient-to-br from-brand-500/10 to-brand-500/5 border border-brand-500/10">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="bg-mesh-subtle pointer-events-none absolute inset-0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Supported Platforms</h2>
              <p className="section-subtitle">Add any platform — we&apos;ll discover the API.</p>
            </div>
            <a href="/platforms" className="btn-ghost hidden sm:inline-flex">
              View all &rarr;
            </a>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((p, i) => (
              <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <PlatformCard platform={p} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
