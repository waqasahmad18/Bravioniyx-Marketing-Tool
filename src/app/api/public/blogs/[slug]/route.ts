import { NextResponse } from "next/server";
import { getBlogBySlug } from "@/lib/blogs/store";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const blog = await getBlogBySlug(slug);
  if (!blog || blog.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    authentic: true,
    blog: {
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt,
      body: blog.body,
      coverImageUrl: blog.coverImageUrl,
      coverImageAlt: blog.coverImageAlt,
      serviceSlug: blog.serviceSlug,
      serviceTitle: blog.serviceTitle,
      keywords: blog.keywords,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      publishedAt: blog.publishedAt,
      author: blog.author,
      stats: blog.stats,
    },
  });
}
