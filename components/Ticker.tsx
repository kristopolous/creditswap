"use client"

const tickerItems = [
  { symbol: "CLOUDY", name: "Cloudify", price: 0.21, change: 5.0 },
  { symbol: "GPT", name: "OpenAI", price: 0.85, change: -2.3 },
  { symbol: "CLAUDE", name: "Anthropic", price: 0.78, change: 1.2 },
  { symbol: "REPL", name: "Replicate", price: 0.45, change: 3.8 },
  { symbol: "HUG", name: "Hugging Face", price: 0.50, change: -0.5 },
  { symbol: "TOG", name: "Together AI", price: 0.38, change: 7.2 },
  { symbol: "ELEVEN", name: "ElevenLabs", price: 0.40, change: 4.5 },
  { symbol: "MID", name: "Midjourney", price: 0.65, change: -1.1 },
  { symbol: "STAB", name: "Stability AI", price: 0.32, change: 2.8 },
  { symbol: "PERP", name: "Perplexity", price: 0.55, change: 6.3 },
]

export function Ticker() {
  const items = [...tickerItems, ...tickerItems, ...tickerItems]

  return (
    <div className="relative overflow-hidden border-b border-gray-800/50 bg-gray-950/90">
      <div className="flex animate-scroll">
        {items.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="flex shrink-0 items-center gap-3 px-5 py-2 border-r border-gray-800/30"
          >
            <span className="text-xs font-medium text-gray-400">{item.symbol}</span>
            <span className="text-sm font-semibold text-white">
              ${item.price.toFixed(2)}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                item.change >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.change >= 0 ? (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {Math.abs(item.change).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          width: fit-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
