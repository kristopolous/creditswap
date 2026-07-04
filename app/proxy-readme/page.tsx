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

export default function ProxyReadmePage() {
  const mdPath = path.join(process.cwd(), "proxy", "README.md")
  const content = fs.readFileSync(mdPath, "utf-8")

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded border border-gray-800/50 bg-gray-900/60 p-8 sm:p-12">
        <article className="prose prose-invert prose-gray max-w-none
          prose-code:rounded-sm prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
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
  )
}
