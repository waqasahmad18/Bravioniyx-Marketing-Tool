import { ObjectId } from "mongodb";
import { publicWebLink, trackUrl, websiteUrl } from "@/lib/config";
import { CONNECTIONS, FUNNELS, LEADS, POSTS, getDb } from "@/lib/db";
import { buildPosts, karachiSlot } from "@/lib/content";
import { asPostStyle, type Channel, type FunnelGoal, type PostStyle, type Region } from "@/lib/brand";
import type {
  Connection,
  DashboardStats,
  Funnel,
  Lead,
  Post,
  PostAnalytics,
  SocialPlatform,
} from "@/lib/types";
import { karachiDay } from "@/lib/when";

export type { Connection, Funnel, Lead, Post, SocialPlatform };

function idOf(value: unknown) {
  return String(value ?? "");
}

function asGoal(value: unknown): FunnelGoal {
  if (value === "Followers" || value === "Engagement" || value === "Leads") return value;
  return "Leads";
}

function emptyAnalytics(doc: Record<string, unknown> = {}): PostAnalytics {
  return {
    ctaClicks: Number(doc.ctaClicks ?? 0),
    impressions: Number(doc.impressions ?? 0),
    reach: Number(doc.reach ?? 0),
    likes: Number(doc.likes ?? 0),
    comments: Number(doc.comments ?? 0),
    shares: Number(doc.shares ?? 0),
    engagement: Number(doc.engagement ?? 0),
    followers: Number(doc.followers ?? 0),
    lastSyncedAt: doc.lastSyncedAt ? String(doc.lastSyncedAt) : undefined,
  };
}

function mapPost(doc: Record<string, unknown>): Post {
  const statusRaw = String(doc.status ?? "draft");
  const status =
    statusRaw === "posted" || statusRaw === "scheduled" || statusRaw === "failed" ? statusRaw : "draft";
  const id = idOf(doc._id);
  const fallbackWeb = publicWebLink();
  const rawDestination = String(doc.destination ?? doc.link ?? "");
  const rawLink = String(doc.link ?? "");
  const destination = sanitizePublicUrl(rawDestination, fallbackWeb);
  const link = sanitizePublicUrl(rawLink, destination);
  return {
    id,
    funnelId: String(doc.funnelId ?? ""),
    service: String(doc.service ?? ""),
    region: String(doc.region ?? ""),
    day: Number(doc.day ?? 0),
    channel: String(doc.channel ?? ""),
    stage: String(doc.stage ?? "CTA"),
    goal: asGoal(doc.goal),
    postStyle: asPostStyle(doc.postStyle),
    designVariant: String(doc.designVariant ?? "classic"),
    headline: String(doc.headline ?? doc.service ?? "Bravioniyx"),
    caption: stripLocalhostLinks(String(doc.caption ?? "")),
    ctaLabel: String(doc.ctaLabel ?? "Get a Quote"),
    graphicTitle: String(doc.graphicTitle ?? doc.service ?? "Bravioniyx Technologies"),
    graphicLine: String(doc.graphicLine ?? doc.caption ?? "").slice(0, 160),
    bullets: Array.isArray(doc.bullets) ? doc.bullets.map(String) : [],
    link,
    destination,
    scheduledFor: String(doc.scheduledFor ?? ""),
    status,
    publishError: doc.publishError ? String(doc.publishError) : undefined,
    externalId: doc.externalId ? String(doc.externalId) : undefined,
    postedAt: doc.postedAt ? String(doc.postedAt) : undefined,
    analytics: emptyAnalytics(doc),
  };
}

function sanitizePublicUrl(url: string, fallback: string) {
  if (!url) return fallback;
  if (/localhost|127\.0\.0\.1/i.test(url)) return fallback;
  return url;
}

function stripLocalhostLinks(caption: string) {
  const site = websiteUrl();
  return caption
    .replace(/https?:\/\/localhost(?::\d+)?\/\S+/gi, site)
    .replace(/https?:\/\/127\.0\.0\.1(?::\d+)?\/\S+/gi, site)
    .trim();
}

function withPublicCaption(caption: string, channel: string, publicUrl: string) {
  const clean = stripLocalhostLinks(caption);
  // Instagram may include the company website (never localhost). FB/LI stay clean.
  if (channel === "Instagram" && publicUrl && !clean.includes(publicUrl) && !clean.includes("bravioniyx.com")) {
    return `${clean}\n\n${publicUrl}`;
  }
  return clean;
}

export async function listLeads(): Promise<Lead[]> {
  const db = await getDb();
  const docs = await db.collection(LEADS).find({}).sort({ savedAt: -1 }).limit(500).toArray();
  return docs.map((doc) => ({
    email: String(doc.email ?? ""),
    name: String(doc.name ?? ""),
    service: String(doc.service ?? ""),
    page: String(doc.page ?? ""),
    source: String(doc.source ?? ""),
    savedAt: String(doc.savedAt ?? ""),
  }));
}

export async function listFunnels(): Promise<Funnel[]> {
  try {
    const db = await getDb();
    const docs = await db.collection(FUNNELS).find({}).sort({ createdAt: -1 }).limit(100).toArray();
    return docs.map((doc) => ({
      id: idOf(doc._id),
      name: String(doc.name ?? ""),
      service: String(doc.service ?? ""),
      region: String(doc.region ?? ""),
      days: Number(doc.days ?? 0),
      channels: Array.isArray(doc.channels) ? doc.channels.map(String) : [],
      goal: asGoal(doc.goal),
      postStyle: asPostStyle(doc.postStyle),
      status: doc.status === "approved" ? "approved" : "draft",
      createdAt: String(doc.createdAt ?? ""),
    }));
  } catch (error) {
    console.error("[listFunnels]", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function listPosts(opts?: {
  status?: string | string[];
  funnelId?: string;
  limit?: number;
}): Promise<Post[]> {
  try {
    const db = await getDb();
    const filter: Record<string, unknown> = {};
    if (opts?.funnelId) filter.funnelId = opts.funnelId;
    if (opts?.status) {
      filter.status = Array.isArray(opts.status) ? { $in: opts.status } : opts.status;
    }
    const docs = await db
      .collection(POSTS)
      .find(filter)
      .sort({ scheduledFor: 1, day: 1 })
      .limit(Math.min(300, opts?.limit ?? 120))
      .toArray();
    return docs.map((doc) => mapPost(doc as Record<string, unknown>));
  } catch (error) {
    console.error("[listPosts]", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  if (!ObjectId.isValid(postId)) return null;
  const db = await getDb();
  const doc = await db.collection(POSTS).findOne({ _id: new ObjectId(postId) });
  return doc ? mapPost(doc as Record<string, unknown>) : null;
}

export async function createFunnel(input: {
  service: string;
  region: Region;
  days: number;
  channels: Channel[];
  goal: FunnelGoal;
  postStyle: PostStyle;
}) {
  const built = buildPosts(input);
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const styleLabel = input.postStyle === "cta" ? "CTA" : input.postStyle === "fact" ? "Fact" : "Text";
  const funnel = await db.collection(FUNNELS).insertOne({
    name: `${built.service} · ${input.goal} · ${styleLabel} · ${input.region}`,
    service: built.service,
    region: input.region,
    days: built.days,
    channels: input.channels,
    goal: input.goal,
    postStyle: input.postStyle,
    status: "draft",
    createdAt,
  });
  const funnelId = String(funnel.insertedId);
  if (!built.posts.length) return funnelId;

  const inserted = await db.collection(POSTS).insertMany(
    built.posts.map((post) => ({
      funnelId,
      service: built.service,
      region: input.region,
      day: post.day,
      channel: post.channel,
      stage: post.stage,
      goal: post.goal,
      postStyle: post.postStyle,
      designVariant: post.designVariant,
      headline: post.headline,
      caption: post.caption,
      ctaLabel: post.ctaLabel,
      graphicTitle: post.graphicTitle,
      graphicLine: post.graphicLine,
      bullets: post.bullets,
      destination: post.link,
      link: post.link,
        scheduledFor: karachiSlot(Math.max(0, post.day - 1), post.channel),
      status: "draft",
      createdAt,
      ctaClicks: 0,
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagement: 0,
      followers: 0,
    })),
  );

  const ops = Object.values(inserted.insertedIds).map((objectId) => {
    return db.collection(POSTS).findOne({ _id: objectId }).then(async (doc) => {
      if (!doc) return;
      const destination = String(doc.destination ?? doc.link ?? "") || publicWebLink();
      const channel = String(doc.channel ?? "");
      const publicUrl = destination.includes("wa.me") ? websiteUrl() : destination;
      const caption = withPublicCaption(String(doc.caption ?? ""), channel, publicUrl);
      // Keep public link = website or WhatsApp. Optional internal tracker only if APP_URL is public.
      const tracked = trackUrl(String(objectId));
      await db.collection(POSTS).updateOne(
        { _id: objectId },
        {
          $set: {
            link: destination,
            destination,
            caption,
            ...(tracked ? { trackPath: tracked } : {}),
          },
        },
      );
    });
  });
  await Promise.all(ops);
  return funnelId;
}

export async function approveFunnel(funnelId: string) {
  if (!ObjectId.isValid(funnelId)) return;
  const db = await getDb();
  await db.collection(FUNNELS).updateOne({ _id: new ObjectId(funnelId) }, { $set: { status: "approved" } });
  await db.collection(POSTS).updateMany({ funnelId, status: "draft" }, { $set: { status: "scheduled" } });
}

export async function markPosted(postId: string, externalId?: string) {
  if (!ObjectId.isValid(postId)) return;
  const db = await getDb();
  await db.collection(POSTS).updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        status: "posted",
        postedAt: new Date().toISOString(),
        ...(externalId ? { externalId } : {}),
      },
      $unset: { publishError: "" },
    },
  );
}

export async function markPublishFailed(postId: string, error: string) {
  if (!ObjectId.isValid(postId)) return;
  const db = await getDb();
  await db.collection(POSTS).updateOne(
    { _id: new ObjectId(postId) },
    { $set: { status: "failed", publishError: error, failedAt: new Date().toISOString() } },
  );
}

export async function recordCtaClick(postId: string) {
  if (!ObjectId.isValid(postId)) return null;
  const db = await getDb();
  await db.collection(POSTS).updateOne(
    { _id: new ObjectId(postId) },
    {
      $inc: { ctaClicks: 1 },
      $set: { lastClickAt: new Date().toISOString() },
    },
  );
  return getPost(postId);
}

export async function updatePostAnalytics(
  postId: string,
  analytics: Partial<PostAnalytics> & { followers?: number },
) {
  if (!ObjectId.isValid(postId)) return;
  const db = await getDb();
  const engagement =
    Number(analytics.likes ?? 0) + Number(analytics.comments ?? 0) + Number(analytics.shares ?? 0);
  await db.collection(POSTS).updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        ...(analytics.impressions !== undefined ? { impressions: analytics.impressions } : {}),
        ...(analytics.reach !== undefined ? { reach: analytics.reach } : {}),
        ...(analytics.likes !== undefined ? { likes: analytics.likes } : {}),
        ...(analytics.comments !== undefined ? { comments: analytics.comments } : {}),
        ...(analytics.shares !== undefined ? { shares: analytics.shares } : {}),
        engagement: analytics.engagement ?? engagement,
        ...(analytics.followers !== undefined ? { followers: analytics.followers } : {}),
        lastSyncedAt: new Date().toISOString(),
      },
    },
  );
}

export async function listDueScheduledPosts(): Promise<Post[]> {
  const posts = await listPosts({ status: "scheduled", limit: 80 });
  const today = karachiDay(new Date());
  return posts.filter(
    (post) =>
      post.channel !== "WhatsApp" &&
      post.scheduledFor &&
      karachiDay(post.scheduledFor) <= today,
  );
}

export async function listPostedForInsights(limit = 40): Promise<Post[]> {
  const db = await getDb();
  const docs = await db
    .collection(POSTS)
    .find({ status: "posted", externalId: { $exists: true, $ne: "" } })
    .sort({ postedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((doc) => mapPost(doc as Record<string, unknown>));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  const [statusCounts, metricAgg, leadsCount, connections, blogs] = await Promise.all([
    db
      .collection(POSTS)
      .aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }])
      .toArray(),
    db
      .collection(POSTS)
      .aggregate<{
        ctaClicks: number;
        impressions: number;
        reach: number;
        likes: number;
        comments: number;
        shares: number;
        engagement: number;
      }>([
        {
          $group: {
            _id: null,
            ctaClicks: { $sum: { $ifNull: ["$ctaClicks", 0] } },
            impressions: { $sum: { $ifNull: ["$impressions", 0] } },
            reach: { $sum: { $ifNull: ["$reach", 0] } },
            likes: { $sum: { $ifNull: ["$likes", 0] } },
            comments: { $sum: { $ifNull: ["$comments", 0] } },
            shares: { $sum: { $ifNull: ["$shares", 0] } },
            engagement: { $sum: { $ifNull: ["$engagement", 0] } },
          },
        },
      ])
      .toArray(),
    db.collection(LEADS).countDocuments({}),
    listConnections(),
    import("@/lib/blogs/store").then((m) => m.getBlogTotals()),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map((row) => [row._id || "draft", row.n]));
  const metrics = metricAgg[0] || {
    ctaClicks: 0,
    impressions: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    engagement: 0,
  };
  const followers = connections.reduce((sum, item) => sum + Number(item.followers ?? 0), 0);
  const totalPosts = Object.values(byStatus).reduce((sum, n) => sum + Number(n), 0);

  return {
    totalPosts,
    scheduled: Number(byStatus.scheduled || 0),
    posted: Number(byStatus.posted || 0),
    failed: Number(byStatus.failed || 0),
    ctaClicks: metrics.ctaClicks,
    impressions: metrics.impressions,
    reach: metrics.reach,
    likes: metrics.likes,
    comments: metrics.comments,
    shares: metrics.shares,
    engagement: metrics.engagement,
    followers,
    websiteLeads: leadsCount,
    blogPublished: blogs.published,
    blogViews: blogs.views,
    blogVisitors: blogs.visitors,
    blogCtaClicks: blogs.ctaClicks,
  };
}

export async function listConnections(): Promise<Connection[]> {
  try {
    const db = await getDb();
    const docs = await db.collection(CONNECTIONS).find({}).sort({ platform: 1 }).toArray();
    return docs.map((doc) => ({
      id: idOf(doc._id),
      platform: doc.platform as SocialPlatform,
      accountName: String(doc.accountName ?? ""),
      accountId: String(doc.accountId ?? ""),
      token: String(doc.token ?? ""),
      status: doc.status === "connected" ? "connected" : "disconnected",
      updatedAt: String(doc.updatedAt ?? ""),
      followers: Number(doc.followers ?? 0),
    }));
  } catch (error) {
    console.error("[listConnections]", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getConnection(platform: SocialPlatform): Promise<Connection | null> {
  const connections = await listConnections();
  return connections.find((item) => item.platform === platform) ?? null;
}

export async function upsertConnection(input: {
  platform: SocialPlatform;
  accountName: string;
  accountId: string;
  token: string;
}) {
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  await db.collection(CONNECTIONS).updateOne(
    { platform: input.platform },
    {
      $set: {
        platform: input.platform,
        accountName: input.accountName.trim(),
        accountId: input.accountId.trim(),
        token: input.token.trim(),
        status: "connected",
        updatedAt,
      },
    },
    { upsert: true },
  );
}

export async function setConnectionFollowers(platform: SocialPlatform, followers: number) {
  const db = await getDb();
  await db.collection(CONNECTIONS).updateOne(
    { platform },
    { $set: { followers, followersSyncedAt: new Date().toISOString() } },
  );
}

export async function disconnectPlatform(platform: SocialPlatform) {
  const db = await getDb();
  await db.collection(CONNECTIONS).updateOne(
    { platform },
    { $set: { status: "disconnected", token: "", updatedAt: new Date().toISOString() } },
  );
}
