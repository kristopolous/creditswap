"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Registration failed")
      setLoading(false)
      return
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (signInRes?.error) {
      setError("Account created but sign-in failed. Please sign in manually.")
      setSuccess(true)
    } else if (signInRes?.ok) {
      window.location.href = "/"
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-16">
        <div className="w-full max-w-sm text-center">
          <div className="rounded border border-gray-800/50 bg-gray-900/60 p-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-3xl">✅</span>
            <h1 className="mt-5 text-xl font-bold text-white">Account Created</h1>
            <p className="mt-2 text-sm text-gray-400">
              Your account has been created. Please sign in.
            </p>
            <a href="/auth/signin" className="btn-primary mt-6 inline-block">
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="rounded border border-gray-800/50 bg-gray-900/60 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/20">
            <span className="text-2xl">🔄</span>
          </div>
          <h1 className="mt-5 text-xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-gray-400">Join creditswap to trade AI credits.</p>

          {error && (
            <div className="mt-4 rounded-sm bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="mt-6 space-y-3">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              required
              minLength={6}
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-800" />
            <span className="text-xs text-gray-600">or</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-3 rounded-sm border border-gray-700 bg-gray-800/50 px-6 py-3 text-sm font-semibold text-gray-200 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600 hover:text-white"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-3 rounded-sm border border-gray-700 bg-gray-800/50 px-6 py-3 text-sm font-semibold text-gray-200 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600 hover:text-white"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-600">
            Already have an account?{" "}
            <a href="/auth/signin" className="text-brand-400 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
