import { getConnection, listPostedForInsights, setConnectionFollowers, updatePostAnalytics } from "@/lib/store";
import type { Connection, Post, SocialPlatform } from "@/lib/types";

async function facebookInsights(post: Post, connection: Connection) {
  if (!post.externalId) return;
  const postId = post.externalId.includes("_") ? post.externalId : `${connection.accountId}_${post.externalId}`;
  const url = new URL(`https://graph.facebook.com/v21.0/${postId}/insights`);
  url.searchParams.set("metric", "post_impressions,post_engaged_users,post_clicks,post_reactions_by_type_total");
  url.searchParams.set("access_token", connection.token);
  const response = await fetch(url);
  const data = (await response.json()) as {
    data?: Array<{ name?: string; values?: Array<{ value?: number | Record<string, number> }> }>;
    error?: { message?: string };
  };
  if (!response.ok) return;

  let impressions = 0;
  let engagement = 0;
  let likes = 0;
  for (const row of data.data ?? []) {
    const value = row.values?.[0]?.value;
    if (row.name === "post_impressions" && typeof value === "number") impressions = value;
    if (row.name === "post_engaged_users" && typeof value === "number") engagement = value;
    if (row.name === "post_reactions_by_type_total" && value && typeof value === "object") {
      likes = Object.values(value).reduce((sum, n) => sum + Number(n || 0), 0);
    }
  }

  await updatePostAnalytics(post.id, {
    impressions,
    reach: impressions,
    likes,
    engagement: engagement || likes,
    followers: connection.followers ?? 0,
  });
}

async function syncPageFollowers(platform: SocialPlatform, connection: Connection) {
  if (platform === "LinkedIn") return;
  const url = new URL(`https://graph.facebook.com/v21.0/${connection.accountId}`);
  url.searchParams.set("fields", platform === "Instagram" ? "followers_count" : "followers_count,fan_count");
  url.searchParams.set("access_token", connection.token);
  const response = await fetch(url);
  const data = (await response.json()) as { followers_count?: number; fan_count?: number };
  if (!response.ok) return;
  const followers = Number(data.followers_count ?? data.fan_count ?? 0);
  if (followers > 0) await setConnectionFollowers(platform, followers);
}

export async function syncNetworkInsights() {
  const platforms: SocialPlatform[] = ["Facebook", "Instagram", "LinkedIn"];
  const connections = new Map<SocialPlatform, Connection>();
  for (const platform of platforms) {
    const connection = await getConnection(platform);
    if (connection?.status === "connected" && connection.token) {
      connections.set(platform, connection);
      try {
        await syncPageFollowers(platform, connection);
      } catch {
        // best effort
      }
    }
  }

  const posts = await listPostedForInsights(30);
  let synced = 0;
  for (const post of posts) {
    const platform = post.channel as SocialPlatform;
    const connection = connections.get(platform);
    if (!connection) continue;
    try {
      if (platform === "Facebook" || platform === "Instagram") {
        await facebookInsights(post, connection);
        synced += 1;
      }
    } catch {
      // best effort per post
    }
  }
  return { synced, scanned: posts.length };
}
