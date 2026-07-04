"use client"

import { useState, useEffect } from "react"
import { Platform } from "@/lib/types"
import { PlatformCard } from "@/components/PlatformCard"

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])

  useEffect(() => {
    fetch("/api/platforms")
      .then((r) => r.json())
      .then((d) => setPlatforms(d.platforms || []))
      .catch(() => {})
  }, [])
  const [showForm, setShowForm] = useState(false)
  const [newPlatform, setNewPlatform] = useState({ name: "", apiEndpoint: "" })
  const [discovering, setDiscovering] = useState(false)

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlatform.name.trim()) return
    setDiscovering(true)

    const slug = newPlatform.name.toLowerCase().replace(/\s+/g, "-")
    const plat: Platform = {
      id: `p${platforms.length + 1}`,
      name: newPlatform.name,
      slug,
      description: `API credits for ${newPlatform.name}. Added via discovery.`,
      logo: "🔮",
      apiEndpoint: newPlatform.apiEndpoint || `api.${slug}.com`,
      supported: false,
      discoverable: true,
    }

    setPlatforms([...platforms, plat])
    setNewPlatform({ name: "", apiEndpoint: "" })
    setShowForm(false)
    setDiscovering(false)
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">Platforms</h1>
            <p className="section-subtitle">
              Browse supported platforms or add your own.
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showForm && (
          <div className="mt-8 rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-8">
            <h3 className="text-lg font-semibold text-white">Add a Platform</h3>
            <p className="mt-1 text-sm text-gray-400">
              We&apos;ll discover available credits and create a compatible endpoint.
            </p>
            <form onSubmit={handleAddPlatform} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Platform Name</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="e.g. Cloudify"
                  value={newPlatform.name}
                  onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">API Endpoint (optional)</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="e.g. api.cloudify.com"
                  value={newPlatform.apiEndpoint}
                  onChange={(e) => setNewPlatform({ ...newPlatform, apiEndpoint: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={discovering}>
                {discovering ? "Discovering..." : "Discover & Add"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <PlatformCard key={p.id} platform={p} />
          ))}
        </div>

        {platforms.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">No platforms found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
