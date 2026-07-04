"use client"

import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"

export default function ProxyAuthPage() {
  const { data: session, status } = useSession()
  const [code, setCode] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get("code")
    if (c) setCode(c)
  }, [])

  const handleAuthorize = async () => {
    if (!code) return
    setError("")
    try {
      const res = await fetch("/api/v1/proxy/auth/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "claim failed")
      }
      setClaimed(true)
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-white mb-2">Proxy Authorization</h1>
          <p className="text-gray-400 mb-6">
            Sign in to authorize your creditswap proxy.
          </p>
          {code && (
            <p className="text-xs text-gray-500 mb-4 font-mono">
              Session code: {code}
            </p>
          )}
          <button
            onClick={() => signIn()}
            className="btn-order-buy w-full"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (claimed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="text-4xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-brand-300 mb-2">Authorized!</h1>
          <p className="text-gray-400 mb-6">
            Your proxy has been connected to <span className="text-white">{session.user.email}</span>.
            You can return to your terminal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-white mb-2">Authorize Proxy</h1>
        <p className="text-gray-400 mb-6">
          Signed in as <span className="text-white">{session.user.email}</span>.
          Click below to connect your creditswap proxy to this account.
        </p>
        {code && (
          <p className="text-xs text-gray-500 mb-4 font-mono">
            Session: {code}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}
        <button
          onClick={handleAuthorize}
          className="btn-order-buy w-full"
        >
          Authorize Proxy
        </button>
      </div>
    </div>
  )
}
