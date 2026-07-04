export default function HowToBuyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded border border-gray-800/50 bg-gray-900/60 p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-white">How to Buy &amp; Use Credits</h1>
        <p className="mt-2 text-sm text-gray-400">
          Buy credits at a discount and use them through our transparent proxy.
        </p>

        <div className="mt-10 space-y-10">
          <section>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-500/10 text-lg font-bold text-brand-400">1</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Find a deal</h2>
                <p className="text-sm text-gray-400">
                  Browse the <a href="/buy" className="text-brand-400 hover:underline">buy page</a> or <a href="/platforms" className="text-brand-400 hover:underline">platforms page</a> to find credits at a discount.
                  Each deal shows the price per credit and how many credits are available.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-500/10 text-lg font-bold text-brand-400">2</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Buy credits</h2>
                <p className="text-sm text-gray-400">
                  Choose a <strong className="text-gray-200">market buy</strong> to purchase immediately at the best available rate,
                  or place a <strong className="text-gray-200">limit order</strong> to set your own price.
                  Market buys are processed instantly and you get a proxy key right away.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-500/10 text-lg font-bold text-brand-400">3</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Download &amp; run the proxy</h2>
                <p className="text-sm text-gray-400">
                  After purchase you&apos;ll receive a <strong className="text-gray-200">proxy key</strong>.
                  Download the creditswap proxy binary and run it on your machine:
                </p>
                <div className="mt-3 rounded-sm bg-gray-950 border border-gray-800 p-4">
                  <code className="text-sm text-gray-300">
                    ./creditswap-proxy \<br />
                    &nbsp;&nbsp;--target api.openai.com \<br />
                    &nbsp;&nbsp;--proxy-key YOUR_PROXY_KEY \<br />
                    &nbsp;&nbsp;--platform openai
                  </code>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  See the <a href="/proxy-readme" className="text-brand-400 hover:underline">full proxy docs</a> for build instructions and all options.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-500/10 text-lg font-bold text-brand-400">4</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Point your SDK to the proxy</h2>
                <p className="text-sm text-gray-400">
                  Configure your AI SDK to use <code className="text-brand-400">http://127.0.0.1:8080</code> as the base URL:
                </p>
                <div className="mt-3 space-y-3">
                  <div className="rounded-sm bg-gray-950 border border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-1">Python (OpenAI SDK)</p>
                    <code className="text-sm text-gray-300">
                      import openai<br />
                      openai.base_url = &quot;http://127.0.0.1:8080/v1/&quot;
                    </code>
                  </div>
                  <div className="rounded-sm bg-gray-950 border border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-1">Node.js (OpenAI SDK)</p>
                    <code className="text-sm text-gray-300">
                      const openai = new OpenAI({"{"}
                      baseURL: &quot;http://127.0.0.1:8080/v1/&quot;
                      {"}"})
                    </code>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Alternatively, add <code className="text-gray-400">127.0.0.1 api.openai.com</code> to your <code className="text-gray-400">/etc/hosts</code> file
                  to redirect all traffic without changing code.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-500/10 text-lg font-bold text-brand-400">5</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Use your API normally</h2>
                <p className="text-sm text-gray-400">
                  Your existing code works without changes. The proxy handles authentication and credit
                  deduction transparently. Each API call consumes credits at the rate specified when you purchased.
                  You can check your remaining credits by validating your key at any time.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 rounded-sm bg-gradient-to-br from-brand-500/10 to-brand-500/5 border border-brand-500/20 p-5">
          <h3 className="font-semibold text-white">Need help?</h3>
          <p className="mt-1 text-sm text-gray-400">
            Check the <a href="/docs" className="text-brand-400 hover:underline">API docs</a> for programmatic access or
            read the <a href="/proxy-readme" className="text-brand-400 hover:underline">proxy documentation</a> for advanced setup options.
          </p>
        </div>
      </div>
    </div>
  )
}
