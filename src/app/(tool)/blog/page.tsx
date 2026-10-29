import Link from "next/link";
import BlogEditorCard from "@/components/BlogEditorCard";
import { createDraftAction } from "@/lib/blogs/actions";
import { getBlogTotals, listBlogs } from "@/lib/blogs/store";
import { services } from "@/lib/brand";
import { appUrl, websiteUrl } from "@/lib/config";

export default async function BlogManagePage() {
  const [blogs, totals] = await Promise.all([listBlogs({ limit: 50 }), getBlogTotals()]);
  const publicBase = appUrl() || "http://localhost:3001";

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E10600]">Content</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Blogs</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-600">
          Daily SEO drafts generate automatically (cron). Read → edit → publish. Live at{" "}
          <Link href="/blogs" className="font-semibold text-[#E10600]">
            {publicBase}/blogs
          </Link>
          . Website can also pull JSON from{" "}
          <code className="bg-neutral-100 px-1">/api/public/blogs</code>. Stats are real views only — never fake.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Published", totals.published],
          ["Drafts", totals.drafts],
          ["Views", totals.views],
          ["Visitors", totals.visitors],
          ["Blog CTAs", totals.ctaClicks],
        ].map(([label, value]) => (
          <div key={label} className="border border-neutral-300 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <form action={createDraftAction} className="grid gap-3 border border-neutral-300 bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E10600]">Generate SEO draft</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Service
            <select name="serviceSlug" className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal">
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Title hint (optional)
            <input name="titleHint" placeholder="e.g. Secure RDP for remote teams" className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
          </label>
        </div>
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Extra instructions (optional)
          <input name="instructions" placeholder="Urdu/English mix, focus on SMEs in Lahore…" className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
        </label>
        <button type="submit" className="w-fit bg-[#E10600] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Write draft with AI
        </button>
        <p className="text-xs text-neutral-500">
          After publish, add a Blog link on{" "}
          <a href={websiteUrl()} className="text-[#E10600]" target="_blank" rel="noreferrer">
            {websiteUrl()}
          </a>{" "}
          pointing to <code className="bg-neutral-100 px-1">{publicBase}/blogs</code> (or consume the public API).
        </p>
      </form>

      <div className="grid gap-4">
        {blogs.length === 0 ? (
          <p className="border border-neutral-300 bg-white p-6 text-sm text-neutral-600">No blogs yet — generate a draft above or ask the assistant.</p>
        ) : (
          blogs.map((blog) => <BlogEditorCard key={blog.id} blog={blog} />)
        )}
      </div>
    </div>
  );
}
