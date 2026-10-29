import { ObjectId } from "mongodb";
import { ASSISTANT, FUNNELS, POSTS, getDb } from "@/lib/db";
import { karachiSlot } from "@/lib/content";
import { asPostStyle, type Channel, type FunnelGoal, type PostStyle, type Region } from "@/lib/brand";
import {
  approveFunnel,
  createFunnel,
  getDashboardStats,
  getPost,
  listConnections,
  listDueScheduledPosts,
  listFunnels,
  listLeads,
  listPosts,
  markPosted,
  updatePostAnalytics,
} from "@/lib/store";
import { publishPostToNetwork } from "@/lib/social";
import { syncNetworkInsights } from "@/lib/insights";
import { runDailyAutomation } from "@/lib/daily";
import { rebuildTodayCampaign } from "@/lib/rebuild";
import type { Post } from "@/lib/types";

const SETTINGS_ID = "main";

export async function getCustomGuidelines(): Promise<string> {
  const db = await getDb();
  const byKey = await db.collection(ASSISTANT).findOne({ key: SETTINGS_ID });
  return String(byKey?.customGuidelines ?? "");
}

export async function setCustomGuidelines(text: string, mode: "replace" | "append" = "replace") {
  const db = await getDb();
  const existing = await getCustomGuidelines();
  const customGuidelines =
    mode === "append" && existing ? `${existing.trim()}\n\n${text.trim()}` : text.trim();
  await db.collection(ASSISTANT).updateOne(
    { key: SETTINGS_ID },
    {
      $set: {
        key: SETTINGS_ID,
        customGuidelines,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
  return customGuidelines;
}

export async function updatePostFields(
  postId: string,
  fields: Partial<{
    headline: string;
    caption: string;
    ctaLabel: string;
    graphicTitle: string;
    graphicLine: string;
    designVariant: string;
    link: string;
    destination: string;
    status: string;
    scheduledFor: string;
  }>,
) {
  if (!ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post id." };
  const allowed: Record<string, string> = {};
  for (const key of [
    "headline",
    "caption",
    "ctaLabel",
    "graphicTitle",
    "graphicLine",
    "designVariant",
    "link",
    "destination",
    "scheduledFor",
  ] as const) {
    const value = fields[key];
    if (typeof value === "string" && value.trim()) {
      if ((key === "link" || key === "destination" || key === "caption") && /localhost|127\.0\.0\.1/i.test(value)) {
        return { ok: false as const, error: "Localhost links are not allowed." };
      }
      allowed[key] = value.trim();
    }
  }
  if (fields.status === "draft" || fields.status === "scheduled" || fields.status === "posted" || fields.status === "failed") {
    allowed.status = fields.status;
  }
  if (!Object.keys(allowed).length) return { ok: false as const, error: "No fields to update." };
  const db = await getDb();
  await db.collection(POSTS).updateOne(
    { _id: new ObjectId(postId) },
    { $set: { ...allowed, assistantUpdatedAt: new Date().toISOString() } },
  );
  const post = await getPost(postId);
  return { ok: true as const, post };
}

export async function createManualPost(input: {
  funnelId?: string;
  service: string;
  region?: Region;
  channel: Channel;
  day?: number;
  goal?: FunnelGoal;
  postStyle?: PostStyle;
  headline: string;
  caption: string;
  ctaLabel?: string;
  graphicTitle: string;
  graphicLine: string;
  designVariant?: string;
  link?: string;
  status?: "draft" | "scheduled";
}) {
  const db = await getDb();
  const day = Math.max(1, input.day ?? 1);
  const destination = input.link || "https://www.bravioniyx.com/get-a-quote";
  if (/localhost|127\.0\.0\.1/i.test(destination) || /localhost|127\.0\.0\.1/i.test(input.caption)) {
    return { ok: false as const, error: "Localhost links are not allowed." };
  }
  const doc = {
    funnelId: input.funnelId || "",
    service: input.service,
    region: input.region ?? "Pakistan",
    day,
    channel: input.channel,
    stage: "CTA",
    goal: input.goal ?? "Leads",
    postStyle: asPostStyle(input.postStyle),
    designVariant: input.designVariant || "classic",
    headline: input.headline,
    caption: input.caption,
    ctaLabel: input.ctaLabel || "",
    graphicTitle: input.graphicTitle,
    graphicLine: input.graphicLine,
    bullets: [] as string[],
    destination,
    link: destination,
    scheduledFor: karachiSlot(Math.max(0, day - 1), input.channel),
    status: input.status ?? "draft",
    createdAt: new Date().toISOString(),
    createdBy: "assistant",
    ctaClicks: 0,
    impressions: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    engagement: 0,
    followers: 0,
  };
  const result = await db.collection(POSTS).insertOne(doc);
  const post = await getPost(String(result.insertedId));
  return { ok: true as const, post };
}

export async function summarizePosts(filter?: {
  funnelId?: string;
  channel?: string;
  status?: string;
  limit?: number;
}) {
  let posts = await listPosts();
  if (filter?.funnelId) posts = posts.filter((p) => p.funnelId === filter.funnelId);
  if (filter?.channel) posts = posts.filter((p) => p.channel === filter.channel);
  if (filter?.status) posts = posts.filter((p) => p.status === filter.status);
  const limit = Math.min(50, filter?.limit ?? 25);
  return posts.slice(0, limit).map((p) => ({
    id: p.id,
    day: p.day,
    channel: p.channel,
    service: p.service,
    status: p.status,
    goal: p.goal,
    postStyle: p.postStyle,
    designVariant: p.designVariant,
    headline: p.headline,
    ctaLabel: p.ctaLabel,
    captionPreview: p.caption.slice(0, 160),
    scheduledFor: p.scheduledFor,
    analytics: p.analytics,
  }));
}

export async function getPostPerformance(postId?: string) {
  if (postId) {
    const post = await getPost(postId);
    if (!post) return { error: "Post not found." };
    return {
      id: post.id,
      day: post.day,
      channel: post.channel,
      service: post.service,
      status: post.status,
      headline: post.headline,
      analytics: post.analytics,
    };
  }
  const posts = await listPosts();
  const ranked = [...posts]
    .map((p) => ({
      id: p.id,
      day: p.day,
      channel: p.channel,
      service: p.service,
      status: p.status,
      headline: p.headline,
      analytics: p.analytics,
      score: p.analytics.reach + p.analytics.engagement * 3 + p.analytics.ctaClicks * 5 + p.analytics.comments * 4,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);
  const totals = posts.reduce(
    (acc, p) => {
      acc.reach += p.analytics.reach;
      acc.comments += p.analytics.comments;
      acc.likes += p.analytics.likes;
      acc.shares += p.analytics.shares;
      acc.ctaClicks += p.analytics.ctaClicks;
      acc.impressions += p.analytics.impressions;
      acc.engagement += p.analytics.engagement;
      return acc;
    },
    { reach: 0, comments: 0, likes: 0, shares: 0, ctaClicks: 0, impressions: 0, engagement: 0 },
  );
  return { totals, topPosts: ranked };
}

export async function deletePost(postId: string) {
  if (!ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post id." };
  const db = await getDb();
  const result = await db.collection(POSTS).deleteOne({ _id: new ObjectId(postId) });
  return { ok: result.deletedCount === 1, deleted: result.deletedCount };
}

export async function deleteFunnel(funnelId: string) {
  if (!ObjectId.isValid(funnelId)) return { ok: false as const, error: "Invalid funnel id." };
  const db = await getDb();
  await db.collection(POSTS).deleteMany({ funnelId });
  const result = await db.collection(FUNNELS).deleteOne({ _id: new ObjectId(funnelId) });
  return { ok: result.deletedCount === 1, deletedPostsWithFunnel: true };
}

export async function listSafeConnections() {
  const connections = await listConnections();
  return connections.map((c) => ({
    id: c.id,
    platform: c.platform,
    accountName: c.accountName,
    accountId: c.accountId,
    status: c.status,
    followers: c.followers ?? 0,
    updatedAt: c.updatedAt,
    hasToken: Boolean(c.token),
  }));
}

export async function publishPost(postId: string) {
  const post = await getPost(postId);
  if (!post) return { ok: false as const, error: "Post not found." };
  return publishPostToNetwork(post);
}

export async function setAnalytics(
  postId: string,
  analytics: {
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    ctaClicks?: number;
    engagement?: number;
    followers?: number;
  },
) {
  if (!ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post id." };
  const db = await getDb();
  if (analytics.ctaClicks !== undefined) {
    await db.collection(POSTS).updateOne({ _id: new ObjectId(postId) }, { $set: { ctaClicks: Number(analytics.ctaClicks) } });
  }
  await updatePostAnalytics(postId, {
    reach: analytics.reach,
    impressions: analytics.impressions,
    likes: analytics.likes,
    comments: analytics.comments,
    shares: analytics.shares,
    engagement: analytics.engagement,
    followers: analytics.followers,
  });
  return { ok: true as const, post: await getPost(postId) };
}

export {
  createFunnel,
  listFunnels,
  listPosts,
  getPost,
  approveFunnel,
  getDashboardStats,
  listLeads,
  listDueScheduledPosts,
  markPosted,
  syncNetworkInsights,
  runDailyAutomation,
  rebuildTodayCampaign,
};
export type { Post };
