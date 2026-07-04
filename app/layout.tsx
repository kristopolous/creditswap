import type { Metadata } from "next"
import "./globals.css"
import { Ticker } from "@/components/Ticker"
import { AuthProvider } from "@/components/AuthProvider"
import { NavActions } from "@/components/NavActions"

export const metadata: Metadata = {
  title: "creditswap.ai — AI Credit Marketplace",
  description: "Buy and sell AI platform credits. Get credits at a discount or sell unused credits on the open market.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950">
        <AuthProvider>
          <nav className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <a href="/" className="group flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-brand-500 to-brand-700 text-lg shadow-lg shadow-brand-500/20 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-brand-500/30">
                  <span className="drop-shadow-sm">🔄</span>
                </span>
                <span className="text-xl font-bold tracking-tight text-white">creditswap</span>
                <span className="text-xs font-medium text-brand-400">.ai</span>
              </a>
              <div className="flex items-center gap-3">
                <a href="/how-to-use" className="btn-ghost">How to Use</a>
                <a href="/platforms" className="btn-ghost">Platforms</a>
                <a href="/sell" className="btn-ghost">Sell</a>
                <a href="/buy" className="btn-primary">Buy</a>
                <NavActions />
              </div>
            </div>
          </nav>
          <Ticker />
          <main>{children}</main>
        </AuthProvider>
        <footer className="border-t border-gray-800/50 bg-gray-950 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-brand-500 to-brand-700 text-sm">
                  🔄
                </span>
                <span className="font-semibold text-gray-300">creditswap.ai</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="/docs" className="text-sm text-gray-500 transition-colors hover:text-gray-300">
                  API Docs
                </a>
                <a href="/privacy" className="text-sm text-gray-500 transition-colors hover:text-gray-300">
                  Privacy Policy
                </a>
                <p className="text-sm text-gray-500">15% transaction fee on all sales.</p>
              </div>
              <p className="text-sm text-gray-600">&copy; 2026 creditswap.ai</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
