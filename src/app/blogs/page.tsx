import Link from "next/link";
import type { Metadata } from "next";
import { listBlogs } from "@/lib/blogs/store";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Blog | ${brand.company}`,
  description: `Practical IT, software, RDP, servers, and web notes from ${brand.company}.`,
};

export const dynamic = "force-dynamic";

export default async function BlogsIndexPage() {
  const blogs = await listBlogs({ status: "published", limit: 50 });

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E10600]">Insights</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Blog</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/65">
        SEO-focused articles on the services we deliver — software, websites, RDP, servers, networking, cloud, and Unity —
        written for operators, not for empty traffic games.
      </p>

      {blogs.length === 0 ? (
        <p className="mt-12 border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          No published posts yet. Drafts appear in the Marketing Manager — read, edit, then publish.
        </p>
      ) : (
        <div className="mt-10 grid gap-6">
          {blogs.map((blog) => (
            <article key={blog.id} className="grid gap-0 border border-white/10 bg-white/[0.03] md:grid-cols-[220px_1fr]">
              <Link href={`/blogs/${blog.slug}`} className="block min-h-[140px] bg-neutral-900">
                {blog.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={blog.coverImageUrl} alt={blog.coverImageAlt} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full min-h-[140px] items-end p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#E10600]">{blog.serviceTitle}</p>
                  </div>
                )}
              </Link>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })
                    : ""}{" "}
                  · {blog.stats.views} views
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  <Link href={`/blogs/${blog.slug}`} className="hover:text-[#E10600]">
                    {blog.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{blog.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {blog.keywords.slice(0, 4).map((k) => (
                    <span key={k} className="border border-white/15 px-2 py-0.5 text-[10px] text-white/55">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
