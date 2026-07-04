export default function HowToUsePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">How to Use creditswap</h1>
      <p className="mt-2 text-gray-400">Everything you need to know about buying and selling AI platform credits.</p>

      <div className="mt-12 space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-500/10 text-lg">📥</span>
            <h2 className="text-xl font-bold text-white">For Buyers</h2>
          </div>
          <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6 sm:p-8 space-y-6">
            <Step num="1" title="Browse Deals">
              Visit the <a href="/buy" className="text-brand-400 hover:underline">Buy page</a> to see all active sell orders across platforms. Deals are sorted by best price.
              You can also browse individual <a href="/platforms" className="text-brand-400 hover:underline">platform pages</a> to see the full order book.
            </Step>
            <Step num="2" title="Choose Market or Limit">
              <strong className="text-gray-200">Market buy:</strong> Purchase instantly at the current best available price.
              <br />
              <strong className="text-gray-200">Limit buy:</strong> Set the max price you&apos;re willing to pay. Your order sits in the order book until a seller matches your price.
            </Step>
            <Step num="3" title="Pay &amp; Get Proxy Key">
              Complete the purchase. You immediately receive a <strong className="text-gray-200">proxy key</strong> — this is your API credential
              for routing calls through creditswap. The proxy key has a built-in credit balance.
            </Step>
            <Step num="4" title="Set Up the Proxy">
              Download and run the <a href="/proxy-readme" className="text-brand-400 hover:underline">creditswap proxy</a> on your machine.
              Point your SDK or DNS to the proxy, and it transparently rewrites API calls from the original host
              (e.g. <code className="text-gray-300">api.openai.com</code>) to creditswap.ai.
            </Step>
            <Step num="5" title="Monitor Usage">
              Visit your <a href="/dashboard/bought" className="text-brand-400 hover:underline">dashboard</a> to see detailed usage logs —
              every API call, how many credits it consumed, and how many credits remain.
              If you believe the accounting is wrong, you can <a href="mailto:disputes@creditswap.ai" className="text-brand-400 hover:underline">file a dispute</a>.
            </Step>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-500/10 text-lg">📤</span>
            <h2 className="text-xl font-bold text-white">For Sellers</h2>
          </div>
          <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6 sm:p-8 space-y-6">
            <Step num="1" title="Choose a Platform">
              Go to any <a href="/platforms" className="text-brand-400 hover:underline">platform page</a> and click "Sell Credits".
              You can also use the <a href="/sell" className="text-brand-400 hover:underline">Sell overview</a> to search for a platform.
            </Step>
            <Step num="2" title="Verify Your API Key">
              Enter your existing API key from the platform (e.g. your OpenAI key). The system checks the key to verify your available credit balance.
            </Step>
            <Step num="3" title="Set Your Terms">
              Choose how many credits to sell and set a price.
              <br />
              <strong className="text-gray-200">Market sell:</strong> Sells immediately at the highest bid price.
              <br />
              <strong className="text-gray-200">Limit sell:</strong> Set a minimum price per credit. Your order appears in the order book until a buyer matches it.
              <br />
              You can also set an <strong className="text-gray-200">expiration date</strong> — the order auto-cancels after that date.
            </Step>
            <Step num="4" title="Get Paid">
              When a buyer purchases your credits, the funds go into escrow. As the buyer uses the credits through the proxy,
              funds are released to you proportionally. Check your <a href="/dashboard/sold" className="text-brand-400 hover:underline">Credits for Sale</a> page to see your earnings.
            </Step>
            <Step num="5" title="Adjust Your Listings">
              Monitor the market from your dashboard. If a limit order isn&apos;t filling,
              you can adjust the price by visiting the platform&apos;s sell page again.
              The <a href="/dashboard/sold" className="text-brand-400 hover:underline">dashboard</a> has direct links to change your limit price.
            </Step>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-500/10 text-lg">⚖️</span>
            <h2 className="text-xl font-bold text-white">Fees &amp; Accounting</h2>
          </div>
          <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6 sm:p-8 space-y-4 text-sm text-gray-300 leading-relaxed">
            <p>
               <strong className="text-gray-200">Transaction fee:</strong> A 4.95% fee is split 50/50 between maker and taker on every trade.
              This covers payment processing, proxy infrastructure, and dispute resolution.
            </p>
            <p>
              <strong className="text-gray-200">Escrow:</strong> When a buyer purchases credits, the funds are held in escrow.
              As the buyer uses credits through the proxy, the corresponding funds are released to the seller.
              This ensures fair accounting for both parties.
            </p>
            <p>
              <strong className="text-gray-200">Disputes:</strong> If you believe the usage accounting is incorrect,
              <a href="mailto:disputes@creditswap.ai" className="text-brand-400 hover:underline"> file a dispute</a>.
              Our team investigates all reports within 48 hours.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <a href="/buy" className="btn-primary mr-4">Start Buying</a>
        <a href="/sell" className="btn-order-sell">Start Selling</a>
      </div>
    </div>
  )
}

function Step({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 text-xs font-bold text-brand-300">
        {num}
      </span>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
