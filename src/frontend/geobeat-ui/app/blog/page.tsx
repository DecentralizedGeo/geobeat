import Link from "next/link"
import { Header } from "@/components/header"
import { ArrowRight } from "lucide-react"

export const metadata = {
  title: "Blog - GEOBEAT",
  description: "Updates and insights on geographic decentralization",
}

const posts = [
  {
    slug: "introducing-geobeat",
    title: "GEOBEAT: A Clearer View of Network Geography",
    date: "2025-12-09",
    excerpt:
      "The crypto world spends a lot of energy talking about decentralization, but most of that discussion stays inside the protocol. What's missing is a clear view of the physical and legal footprint these networks depend on.",
    readTime: "8 min read",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="font-serif text-[44px] font-semibold tracking-tight mb-3">Blog</h1>
            <p className="text-[16px] text-foreground/80 leading-[1.6] font-medium">
              Updates and insights on geographic decentralization
            </p>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block border-2 border-foreground rounded-sm p-8 bg-white hover:bg-foreground/5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="font-serif text-2xl font-semibold group-hover:underline">{post.title}</h2>
                  <ArrowRight className="w-5 h-5 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[14px] text-foreground/70 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-[13px] text-muted-foreground/60">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t-2 border-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-muted-foreground/70">
            <span className="text-sm">Built by</span>
            <a
              href="https://astral.global"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/images/astral.svg" alt="Astral" className="h-5 w-auto" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
