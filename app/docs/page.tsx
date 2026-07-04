import fs from "fs"
import path from "path"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import type { ReactNode } from "react"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-/]/g, "")
    .replace(/\/+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as any).props.children)
  }
  return ""
}

interface Heading {
  level: number
  code: string
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
      const code = raw.replace(/`/g, "").trim()
      const text = code.replace(/(GET|POST|PUT|DELETE|PATCH)\s+\//, "$1 /")
      const id = slugify(code)
      return { level, code, text, id }
    })
}

const components: Components = {
  h1: ({ children, ...props }) => {
    const text = extractText(children)
    return <h1 id={slugify(text)} className="scroll-mt-24" {...props}>{children}</h1>
  },
  h2: ({ children, ...props }) => {
    const text = extractText(children)
    return <h2 id={slugify(text)} className="scroll-mt-24 group" {...props}>{children}</h2>
  },
  h3: ({ children, ...props }) => {
    const text = extractText(children)
    return <h3 id={slugify(text)} className="scroll-mt-24 group" {...props}>{children}</h3>
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
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            API Reference
          </p>
          <div className="space-y-0.5 border-l border-gray-800">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block border-l-2 transition-all duration-150 ${
                  h.level === 1
                    ? "-ml-px border-brand-500 text-sm font-semibold text-white"
                    : h.level === 2
                      ? "ml-px border-transparent text-sm text-gray-400 hover:border-gray-600 hover:text-white"
                      : "ml-4 border-transparent text-xs text-gray-500 hover:border-gray-600 hover:text-gray-300"
                } px-3 py-1.5`}
              >
                {h.level === 3 ? <code className="text-[11px]">{h.code}</code> : h.text}
              </a>
            ))}
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-12">
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-8 sm:p-12">
          <article className="prose prose-invert prose-gray max-w-none
            prose-code:rounded-lg prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-pre:shadow-inner
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:text-brand-300 prose-h1:mb-8 prose-h1:font-bold
            prose-h2:text-xl prose-h2:mt-14 prose-h2:mb-5 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-700/50
            prose-h2:text-white prose-h2:font-bold
            prose-h3:text-base prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-brand-200 prose-h3:font-mono prose-h3:tracking-normal
            prose-h3:bg-brand-500/5 prose-h3:-mx-2 prose-h3:px-2 prose-h3:py-1 prose-h3:rounded-lg prose-h3:border prose-h3:border-brand-500/10
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-200
            prose-table:text-sm prose-td:pr-4 prose-th:pr-4 prose-th:text-left prose-th:font-semibold prose-th:text-gray-300
            prose-hr:border-gray-800 prose-hr:my-10
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-4
            prose-li:text-gray-300 prose-li:my-1"
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
