"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  if (status === "loading") return <div className="flex items-center justify-center py-24"><p className="text-sm text-gray-500">Loading...</p></div>
  if (status === "unauthenticated") redirect("/auth/signin")

  const [email, setEmail] = useState(session.user.email || "")
  const [saved, setSaved] = useState(false)
  const [stripeLinked, setStripeLinked] = useState(false)
  const [coinbaseLinked, setCoinbaseLinked] = useState(false)

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </a>

      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-gray-400">Manage your account, security, and linked financial accounts.</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email
          </h2>
          <form onSubmit={handleSaveEmail} className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <button type="submit" className="btn-primary text-sm px-5 py-3">
              {saved ? "Saved" : "Save"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-400">Add an extra layer of security to your account.</p>
          <button className="btn-secondary mt-4 text-sm">
            Enable 2FA (Coming Soon)
          </button>
        </div>

        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Linked Payment Accounts
          </h2>
          <p className="mt-2 text-sm text-gray-400">Connect accounts for payouts and purchases.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-gray-800/30 bg-gray-950/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-sm">💳</div>
                <div>
                  <p className="text-sm font-medium text-white">Stripe</p>
                  <p className="text-xs text-gray-500">{stripeLinked ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <button
                onClick={() => setStripeLinked(!stripeLinked)}
                className={`text-xs font-medium px-4 py-1.5 rounded-lg border transition-colors ${
                  stripeLinked
                    ? "border-green-500/30 text-green-400 bg-green-500/10"
                    : "border-gray-700 text-gray-400 bg-gray-800/50 hover:bg-gray-700/50"
                }`}
              >
                {stripeLinked ? "Disconnect" : "Connect"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-800/30 bg-gray-950/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-sm">₿</div>
                <div>
                  <p className="text-sm font-medium text-white">Coinbase Commerce</p>
                  <p className="text-xs text-gray-500">{coinbaseLinked ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <button
                onClick={() => setCoinbaseLinked(!coinbaseLinked)}
                className={`text-xs font-medium px-4 py-1.5 rounded-lg border transition-colors ${
                  coinbaseLinked
                    ? "border-green-500/30 text-green-400 bg-green-500/10"
                    : "border-gray-700 text-gray-400 bg-gray-800/50 hover:bg-gray-700/50"
                }`}
              >
                {coinbaseLinked ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profile
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 text-lg font-bold text-brand-300">
              {(session.user.name || session.user.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{session.user.name || "User"}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
