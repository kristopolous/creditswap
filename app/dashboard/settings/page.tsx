"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
  }, [status, router])

  const [email, setEmail] = useState("")
  const [saved, setSaved] = useState(false)
  const [stripeLinked, setStripeLinked] = useState(false)
  const [coinbaseLinked, setCoinbaseLinked] = useState(false)

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email)
  }, [session])

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center py-24"><p className="text-sm text-gray-500">Loading...</p></div>
  }
  if (!session?.user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </a>

      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-gray-400">Manage your account, security, and linked financial accounts.</p>

      <div className="mt-8 space-y-6">
        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
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

        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-400">Add an extra layer of security to your account.</p>
          <button className="btn-secondary mt-4 text-sm">
            Enable 2FA (Coming Soon)
          </button>
        </div>

        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Linked Payment Accounts
          </h2>
        <p className="mt-2 text-sm text-gray-400">Connect accounts for payouts and purchases.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-sm border border-gray-800/30 bg-gray-950/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-purple-500/10 text-sm">💳</div>
                <div>
                  <p className="text-sm font-medium text-white">Stripe</p>
                  <p className="text-xs text-gray-500">{stripeLinked ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <button
                onClick={() => setStripeLinked(!stripeLinked)}
                className={`text-xs font-medium px-4 py-1.5 rounded-sm border transition-colors ${
                  stripeLinked
                    ? "border-green-500/30 text-green-400 bg-green-500/10"
                    : "border-gray-700 text-gray-400 bg-gray-800/50 hover:bg-gray-700/50"
                }`}
              >
                {stripeLinked ? "Disconnect" : "Connect"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-sm border border-gray-800/30 bg-gray-950/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-blue-500/10 text-sm">₿</div>
                <div>
                  <p className="text-sm font-medium text-white">Coinbase Commerce</p>
                  <p className="text-xs text-gray-500">{coinbaseLinked ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <button
                onClick={() => setCoinbaseLinked(!coinbaseLinked)}
                className={`text-xs font-medium px-4 py-1.5 rounded-sm border transition-colors ${
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

        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            Linked OAuth Accounts
          </h2>
          <p className="mt-2 text-sm text-gray-400">Link your GitHub or Google account for quick sign-in.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-sm border border-gray-800/30 bg-gray-950/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                <div>
                  <p className="text-sm font-medium text-white">GitHub</p>
                  <p className="text-xs text-gray-500">Not linked</p>
                </div>
              </div>
              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard/settings" })}
                className="text-xs font-medium px-4 py-1.5 rounded-sm border border-gray-700 text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                Link
              </button>
            </div>

            <div className="flex items-center justify-between rounded-sm border border-gray-800/30 bg-gray-950/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                <div>
                  <p className="text-sm font-medium text-white">Google</p>
                  <p className="text-xs text-gray-500">Not linked</p>
                </div>
              </div>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard/settings" })}
                className="text-xs font-medium px-4 py-1.5 rounded-sm border border-gray-700 text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                Link
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Requires OAuth client IDs configured in <code className="text-gray-500">AUTH_GITHUB_ID</code> / <code className="text-gray-500">AUTH_GOOGLE_ID</code>.
          </p>
        </div>

        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profile
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 text-lg font-bold text-brand-300">
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
