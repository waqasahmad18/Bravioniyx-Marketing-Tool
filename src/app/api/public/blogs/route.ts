import { NextResponse } from "next/server";
import { listBlogs } from "@/lib/blogs/store";
import { appUrl } from "@/lib/config";

/** Public JSON for bravioniyx.com (or any site) to render blogs dynamically. */
export async function GET() {
  const blogs = await listBlogs({ status: "published", limit: 50 });
  const base = appUrl();
  return NextResponse.json({
    source: "bravioniyx-marketing-manager",
    authentic: true,
    note: "views/visitors are real counts only — never inflated",
    blogs: blogs.map((b) => ({
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      coverImageUrl: b.coverImageUrl,
      coverImageAlt: b.coverImageAlt,
      serviceSlug: b.serviceSlug,
      serviceTitle: b.serviceTitle,
      keywords: b.keywords,
      metaTitle: b.metaTitle,
      metaDescription: b.metaDescription,
      publishedAt: b.publishedAt,
      stats: b.stats,
      url: base ? `${base}/blogs/${b.slug}` : `/blogs/${b.slug}`,
      api: base ? `${base}/api/public/blogs/${b.slug}` : `/api/public/blogs/${b.slug}`,
    })),
  });
}
