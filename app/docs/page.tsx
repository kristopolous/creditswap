import fs from "fs"
import path from "path"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-/]/g, "")
    .replace(/\/+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
}

interface Heading {
  level: number
  text: string
  id: string
}

function parseHeadings(md: string): Heading[] {
  return md
    .split("\n")
    .map((line) => line.match(/^(#{1,3})\s+(.+)/))
    .filter(Boolean)
    .map((m) => {
      const level = m![1].length
      const raw = m![2]
      const text = raw.replace(/`/g, "").trim()
      const id = slugify(text)
      return { level, text, id }
    })
}

const components: Components = {
  h2: ({ children, ...props }) => {
    const text = String(children).replace(/`/g, "")
    return <h2 id={slugify(text)} {...props}>{children}</h2>
  },
  h3: ({ children, ...props }) => {
    const text = String(children).replace(/`/g, "")
    return <h3 id={slugify(text)} {...props}>{children}</h3>
  },
}

export default function DocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "api.md")
  const content = fs.readFileSync(mdPath, "utf-8")
  const headings = parseHeadings(content)

  return (
    <div className="mx-auto flex max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <aside className="hidden w-64 shrink-0 lg:block">
        <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            API Reference
          </p>
          <div className="space-y-0.5">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  h.level === 1
                    ? "font-semibold text-white"
                    : h.level === 2
                      ? "text-gray-400 hover:text-white hover:bg-gray-800/30"
                      : "pl-7 text-gray-500 hover:text-gray-300 hover:bg-gray-800/20"
                }`}
              >
                {h.text}
              </a>
            ))}
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-12">
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-8 sm:p-12">
          <article className="prose prose-invert prose-gray max-w-none
            prose-code:rounded-lg prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
            prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700/50
            prose-headings:text-white
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-200
            prose-table:text-sm prose-td:pr-4 prose-th:pr-4 prose-th:text-left
            prose-h2:scroll-mt-24 prose-h3:scroll-mt-24"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  )
}
