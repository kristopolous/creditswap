"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export function NavActions() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 text-sm font-bold text-brand-300 hover:from-brand-500/30 transition-all duration-200"
        >
          {(session.user.name || session.user.email || "U")[0].toUpperCase()}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-gray-800/50 bg-gray-900/95 backdrop-blur-xl p-2 shadow-xl">
              <div className="px-3 py-2 border-b border-gray-800/50">
                <p className="text-sm font-medium text-white truncate">{session.user.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
              <a
                href="/dashboard"
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </a>
              <button
                onClick={() => signOut()}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <a href="/auth/signin" className="btn-ghost">
      Sign in
    </a>
  )
}
