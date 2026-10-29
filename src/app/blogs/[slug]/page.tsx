import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/blogs/store";
import { renderBlogBody } from "@/lib/blogs/render";
import { brand } from "@/lib/brand";
import { appUrl, websiteUrl } from "@/lib/config";
import BlogViewTracker from "@/components/BlogViewTracker";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog || blog.status !== "published") return { title: "Blog" };
  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      images: blog.coverImageUrl ? [blog.coverImageUrl] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog || blog.status !== "published") notFound();

  const serviceHref = `${websiteUrl()}${blog.serviceSlug ? `/services/${blog.serviceSlug}` : ""}`;
  const publicUrl = `${appUrl() || ""}/blogs/${blog.slug}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <BlogViewTracker slug={blog.slug} />
      <Link href="/blogs" className="text-xs uppercase tracking-[0.16em] text-white/50 hover:text-white">
        ← All posts
      </Link>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E10600]">{blog.serviceTitle}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{blog.title}</h1>
      <p className="mt-3 text-sm text-white/50">
        {blog.author}
        {blog.publishedAt
          ? ` · ${new Date(blog.publishedAt).toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}`
          : ""}
        {` · ${blog.stats.views} views`}
      </p>

      {blog.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blog.coverImageUrl}
          alt={blog.coverImageAlt}
          className="mt-8 w-full border border-white/10 object-cover"
        />
      ) : null}

      <article className="mt-8 border-t border-white/10 pt-2 text-white">{renderBlogBody(blog.body)}</article>

      <div className="mt-12 border border-white/10 bg-white/[0.04] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E10600]">Need this done?</p>
        <p className="mt-2 text-sm text-white/75">
          Talk to {brand.company} about {blog.serviceTitle}.
        </p>
        <a
          href={`/api/blogs/${blog.slug}/cta?to=${encodeURIComponent(serviceHref)}`}
          className="mt-4 inline-block bg-[#E10600] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white"
        >
          Visit service page
        </a>
      </div>

      {publicUrl.startsWith("http") ? (
        <p className="mt-8 text-[10px] text-white/30">Canonical on this manager: {publicUrl}</p>
      ) : null}
    </main>
  );
}
