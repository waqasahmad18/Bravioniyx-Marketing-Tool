import { ObjectId } from "mongodb";
import { BLOGS, getDb } from "@/lib/db";
import { coverImageForService, resolveCoverImageUrl } from "@/lib/blogs/covers";
import { generateBlogDraft } from "@/lib/blogs/generate";
import { slugify } from "@/lib/blogs/seo";
import type { BlogPost, BlogStatus, BlogStats } from "@/lib/blogs/types";

function emptyStats(doc: Record<string, unknown> = {}): BlogStats {
  return {
    views: Number(doc.views ?? 0),
    visitors: Number(doc.visitors ?? 0),
    ctaClicks: Number(doc.ctaClicks ?? 0),
    lastViewAt: doc.lastViewAt ? String(doc.lastViewAt) : undefined,
  };
}

function mapBlog(doc: Record<string, unknown>): BlogPost {
  const statusRaw = String(doc.status ?? "draft");
  const status: BlogStatus =
    statusRaw === "published" || statusRaw === "archived" ? statusRaw : "draft";
  return {
    id: String(doc._id),
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    excerpt: String(doc.excerpt ?? ""),
    body: String(doc.body ?? ""),
    coverImageUrl: resolveCoverImageUrl({
      coverImageUrl: String(doc.coverImageUrl ?? ""),
      serviceSlug: String(doc.serviceSlug ?? ""),
    }),
    coverImageAlt: String(doc.coverImageAlt ?? ""),
    serviceSlug: String(doc.serviceSlug ?? ""),
    serviceTitle: String(doc.serviceTitle ?? ""),
    keywords: Array.isArray(doc.keywords) ? doc.keywords.map(String) : [],
    metaTitle: String(doc.metaTitle ?? doc.title ?? ""),
    metaDescription: String(doc.metaDescription ?? doc.excerpt ?? ""),
    status,
    author: String(doc.author ?? "Bravioniyx Technologies"),
    createdAt: String(doc.createdAt ?? ""),
    updatedAt: String(doc.updatedAt ?? ""),
    publishedAt: doc.publishedAt ? String(doc.publishedAt) : undefined,
    createdBy:
      doc.createdBy === "assistant" || doc.createdBy === "cron" || doc.createdBy === "staff"
        ? doc.createdBy
        : "staff",
    stats: emptyStats(doc),
  };
}

async function uniqueSlug(base: string, excludeId?: string) {
  const db = await getDb();
  const slug = slugify(base) || `blog-${Date.now()}`;
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    const existing = await db.collection(BLOGS).findOne({
      slug: candidate,
      ...(excludeId && ObjectId.isValid(excludeId) ? { _id: { $ne: new ObjectId(excludeId) } } : {}),
    });
    if (!existing) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function listBlogs(filter?: { status?: BlogStatus; limit?: number }) {
  const db = await getDb();
  const q = filter?.status ? { status: filter.status } : {};
  const docs = await db
    .collection(BLOGS)
    .find(q)
    .sort({ publishedAt: -1, updatedAt: -1 })
    .limit(Math.min(100, filter?.limit ?? 50))
    .toArray();
  return docs.map((d) => mapBlog(d as Record<string, unknown>));
}

export async function getBlogById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection(BLOGS).findOne({ _id: new ObjectId(id) });
  return doc ? mapBlog(doc as Record<string, unknown>) : null;
}

export async function getBlogBySlug(slug: string) {
  const db = await getDb();
  const doc = await db.collection(BLOGS).findOne({ slug });
  return doc ? mapBlog(doc as Record<string, unknown>) : null;
}

export async function createBlog(input: {
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  serviceSlug: string;
  serviceTitle: string;
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  status?: BlogStatus;
  createdBy?: BlogPost["createdBy"];
  slug?: string;
}) {
  const db = await getDb();
  const now = new Date().toISOString();
  const status = input.status ?? "draft";
  const slug = await uniqueSlug(input.slug || input.title);
  const doc = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    coverImageUrl: (input.coverImageUrl || "").trim() || coverImageForService(input.serviceSlug),
    coverImageAlt: (input.coverImageAlt || input.title).trim(),
    serviceSlug: input.serviceSlug,
    serviceTitle: input.serviceTitle,
    keywords: input.keywords,
    metaTitle: (input.metaTitle || input.title).trim(),
    metaDescription: (input.metaDescription || input.excerpt).trim(),
    status,
    author: "Bravioniyx Technologies",
    createdAt: now,
    updatedAt: now,
    publishedAt: status === "published" ? now : undefined,
    createdBy: input.createdBy ?? "staff",
    views: 0,
    visitors: 0,
    ctaClicks: 0,
  };
  const result = await db.collection(BLOGS).insertOne(doc);
  return getBlogById(String(result.insertedId));
}

export async function updateBlog(
  id: string,
  fields: Partial<{
    title: string;
    excerpt: string;
    body: string;
    coverImageUrl: string;
    coverImageAlt: string;
    keywords: string[];
    metaTitle: string;
    metaDescription: string;
    serviceSlug: string;
    serviceTitle: string;
    slug: string;
  }>,
) {
  if (!ObjectId.isValid(id)) return { ok: false as const, error: "Invalid blog id." };
  const $set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const key of [
    "title",
    "excerpt",
    "body",
    "coverImageUrl",
    "coverImageAlt",
    "metaTitle",
    "metaDescription",
    "serviceSlug",
    "serviceTitle",
  ] as const) {
    if (typeof fields[key] === "string") $set[key] = fields[key]!.trim();
  }
  if (Array.isArray(fields.keywords)) $set.keywords = fields.keywords.map(String);
  if (fields.slug) $set.slug = await uniqueSlug(fields.slug, id);
  const db = await getDb();
  await db.collection(BLOGS).updateOne({ _id: new ObjectId(id) }, { $set });
  return { ok: true as const, blog: await getBlogById(id) };
}

export async function publishBlog(idOrSlug: string) {
  const key = String(idOrSlug || "").trim();
  if (!key) return { ok: false as const, error: "Missing blog id or slug." };
  const db = await getDb();
  const now = new Date().toISOString();
  const filter = ObjectId.isValid(key) ? { _id: new ObjectId(key) } : { slug: key };
  const result = await db.collection(BLOGS).updateOne(filter, {
    $set: { status: "published", publishedAt: now, updatedAt: now },
  });
  if (!result.matchedCount) return { ok: false as const, error: "Blog not found." };
  const blog = ObjectId.isValid(key) ? await getBlogById(key) : await getBlogBySlug(key);
  return {
    ok: true as const,
    blog,
    liveUrl: blog?.slug ? `https://www.bravioniyx.com/blog/${blog.slug}` : undefined,
    managerUrl: blog?.slug ? `/blogs/${blog.slug}` : undefined,
  };
}

/** Publish every draft (used when operator says publish all / put blogs live on website). */
export async function publishAllDraftBlogs(limit = 20) {
  const drafts = await listBlogs({ status: "draft", limit });
  const published: Array<{ id: string; slug: string; liveUrl?: string }> = [];
  for (const draft of drafts) {
    const result = await publishBlog(draft.id);
    if (result.ok && result.blog) {
      published.push({ id: result.blog.id, slug: result.blog.slug, liveUrl: result.liveUrl });
    }
  }
  return { ok: true as const, count: published.length, published };
}

export async function unpublishBlog(idOrSlug: string) {
  const key = String(idOrSlug || "").trim();
  if (!key) return { ok: false as const, error: "Missing blog id or slug." };
  const db = await getDb();
  const filter = ObjectId.isValid(key) ? { _id: new ObjectId(key) } : { slug: key };
  const result = await db.collection(BLOGS).updateOne(filter, {
    $set: { status: "draft", updatedAt: new Date().toISOString() },
    $unset: { publishedAt: "" },
  });
  if (!result.matchedCount) return { ok: false as const, error: "Blog not found." };
  const blog = ObjectId.isValid(key) ? await getBlogById(key) : await getBlogBySlug(key);
  return { ok: true as const, blog };
}

export async function deleteBlog(id: string) {
  if (!ObjectId.isValid(id)) return { ok: false as const, error: "Invalid blog id." };
  const db = await getDb();
  const result = await db.collection(BLOGS).deleteOne({ _id: new ObjectId(id) });
  return { ok: result.deletedCount === 1 };
}

/** Authentic view: +1 views always; +1 visitors only if visitorKey not seen in last 12h for this blog. */
export async function recordBlogView(slug: string, visitorKey: string) {
  const db = await getDb();
  const blog = await db.collection(BLOGS).findOne({ slug, status: "published" });
  if (!blog) return null;
  const now = new Date().toISOString();
  const visitorsCol = db.collection("bx_blog_visitors");
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const seen = await visitorsCol.findOne({
    blogId: String(blog._id),
    visitorKey,
    at: { $gte: since },
  });
  const inc: Record<string, number> = { views: 1 };
  if (!seen) {
    inc.visitors = 1;
    await visitorsCol.insertOne({ blogId: String(blog._id), visitorKey, at: now });
  }
  await db.collection(BLOGS).updateOne({ _id: blog._id }, { $inc: inc, $set: { lastViewAt: now } });
  return getBlogBySlug(slug);
}

export async function recordBlogCtaClick(slug: string) {
  const db = await getDb();
  await db.collection(BLOGS).updateOne({ slug, status: "published" }, { $inc: { ctaClicks: 1 } });
}

export async function getBlogTotals() {
  const db = await getDb();
  const [counts, metrics, topDocs] = await Promise.all([
    db
      .collection(BLOGS)
      .aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }])
      .toArray(),
    db
      .collection(BLOGS)
      .aggregate<{ views: number; visitors: number; ctaClicks: number }>([
        { $match: { status: "published" } },
        {
          $group: {
            _id: null,
            views: { $sum: { $ifNull: ["$views", 0] } },
            visitors: { $sum: { $ifNull: ["$visitors", 0] } },
            ctaClicks: { $sum: { $ifNull: ["$ctaClicks", 0] } },
          },
        },
      ])
      .toArray(),
    db
      .collection(BLOGS)
      .find({ status: "published" })
      .project({ title: 1, slug: 1, views: 1, visitors: 1, ctaClicks: 1 })
      .sort({ views: -1 })
      .limit(10)
      .toArray(),
  ]);
  const byStatus = Object.fromEntries(counts.map((row) => [row._id || "draft", row.n]));
  const m = metrics[0] || { views: 0, visitors: 0, ctaClicks: 0 };
  return {
    published: Number(byStatus.published || 0),
    drafts: Number(byStatus.draft || 0),
    views: m.views,
    visitors: m.visitors,
    ctaClicks: m.ctaClicks,
    top: topDocs.map((b) => ({
      id: String(b._id),
      slug: String(b.slug ?? ""),
      title: String(b.title ?? ""),
      views: Number(b.views ?? 0),
      visitors: Number(b.visitors ?? 0),
      ctaClicks: Number(b.ctaClicks ?? 0),
    })),
  };
}

/** Create today's SEO draft if one was not already created by cron today (Karachi day). */
export async function ensureDailyBlogDraft() {
  const db = await getDb();
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const existing = await db.collection(BLOGS).findOne({ dailyKey: day });
  if (existing) return { created: false, blog: mapBlog(existing as Record<string, unknown>) };

  const draft = await generateBlogDraft();
  const blog = await createBlog({
    ...draft,
    coverImageUrl: draft.coverImageUrl,
    coverImageAlt: draft.coverImageAlt,
    status: "draft",
    createdBy: "cron",
    slug: draft.slugBase,
  });
  if (blog) {
    await db.collection(BLOGS).updateOne({ _id: new ObjectId(blog.id) }, { $set: { dailyKey: day } });
  }
  return { created: true, blog };
}

export async function draftBlogFromAssistant(input: {
  serviceSlug?: string;
  titleHint?: string;
  instructions?: string;
}) {
  const draft = await generateBlogDraft(input);
  return createBlog({
    ...draft,
    status: "draft",
    createdBy: "assistant",
    slug: draft.slugBase,
  });
}
