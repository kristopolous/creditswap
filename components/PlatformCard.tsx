"use client"

import { Platform } from "@/lib/types"

export function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <a href={`/platforms/${platform.slug}`} className="glass-card group block">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-gray-800/50 overflow-hidden">
          {platform.website ? (
            <img src={`https://${platform.website}/favicon.ico`} alt="" className="h-6 w-6 object-contain" />
          ) : (
            <span className="text-2xl text-gray-600">?</span>
          )}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white group-hover:text-brand-300 transition-colors duration-200 truncate">
            {platform.name}
          </h3>
          <span className="text-xs font-mono text-gray-500 truncate block">{platform.apiEndpoint}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{platform.description}</p>
      <div className="mt-5 flex items-center gap-2">
        {platform.supported ? (
          <span className="badge-green">Supported</span>
        ) : (
          <span className="badge-gray">Coming Soon</span>
        )}
        {platform.discoverable && (
          <span className="badge-blue">Discoverable</span>
        )}
      </div>
    </a>
  )
}
