"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export function NavActions() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  if (status === "loading") {
    return <div className="h-9 w-9" />
  }

  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 text-sm font-bold text-brand-300 hover:from-brand-500/30 transition-all duration-200"
        >
          {(session.user.name || session.user.email || "U")[0].toUpperCase()}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-50 mt-2 w-56 rounded border border-gray-800/50 bg-gray-900/95 p-2 shadow-xl">
              <div className="px-3 py-2 border-b border-gray-800/50">
                <p className="text-sm font-medium text-white truncate">{session.user.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
              <a href="/dashboard" className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Dashboard
              </a>
              <a href="/dashboard/bought" className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
                <span className="text-base">📥</span> Credits Bought
              </a>
              <a href="/dashboard/sold" className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
                <span className="text-base">📤</span> Credits for Sale
              </a>
              <a href="/dashboard/settings" className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </a>
              <button
                onClick={() => signOut()}
                className="mt-1 flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
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
