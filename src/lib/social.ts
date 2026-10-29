import { getConnection, markPosted, markPublishFailed } from "@/lib/store";
import type { Connection, Post, SocialPlatform } from "@/lib/types";

function platformOf(channel: string): SocialPlatform | null {
  if (channel === "Facebook" || channel === "Instagram" || channel === "LinkedIn") return channel;
  return null;
}

async function publishFacebook(post: Post, connection: Connection) {
  const url = new URL(`https://graph.facebook.com/v21.0/${connection.accountId}/feed`);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: post.caption,
      link: post.link,
      access_token: connection.token,
    }),
  });
  const data = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || !data.id) throw new Error(data.error?.message || "Facebook publish failed.");
  return data.id;
}

async function publishInstagram(post: Post, connection: Connection) {
  const createUrl = new URL(`https://graph.facebook.com/v21.0/${connection.accountId}/media`);
  createUrl.searchParams.set("image_url", "https://www.bravioniyx.com/logo.png");
  createUrl.searchParams.set("caption", post.caption);
  createUrl.searchParams.set("access_token", connection.token);
  const create = await fetch(createUrl, { method: "POST" });
  const created = (await create.json()) as { id?: string; error?: { message?: string } };
  if (!create.ok || !created.id) throw new Error(created.error?.message || "Instagram media create failed.");

  const publishUrl = new URL(`https://graph.facebook.com/v21.0/${connection.accountId}/media_publish`);
  publishUrl.searchParams.set("creation_id", created.id);
  publishUrl.searchParams.set("access_token", connection.token);
  const publish = await fetch(publishUrl, { method: "POST" });
  const published = (await publish.json()) as { id?: string; error?: { message?: string } };
  if (!publish.ok || !published.id) throw new Error(published.error?.message || "Instagram publish failed.");
  return published.id;
}

async function publishLinkedIn(post: Post, connection: Connection) {
  const author = connection.accountId.startsWith("urn:")
    ? connection.accountId
    : `urn:li:organization:${connection.accountId}`;
  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: post.caption },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok) throw new Error(data.message || "LinkedIn publish failed.");
  return data.id || "linkedin";
}

export async function publishPostToNetwork(post: Post) {
  const platform = platformOf(post.channel);
  if (!platform) {
    return { ok: false as const, error: "WhatsApp posts are copied and sent manually from the graphic." };
  }

  const connection = await getConnection(platform);
  if (!connection || connection.status !== "connected" || !connection.token || !connection.accountId) {
    return {
      ok: false as const,
      error: `${platform} is not linked. Open Connections, paste the page/account ID and access token, then publish again.`,
    };
  }

  try {
    let externalId = "";
    if (platform === "Facebook") externalId = await publishFacebook(post, connection);
    else if (platform === "Instagram") externalId = await publishInstagram(post, connection);
    else externalId = await publishLinkedIn(post, connection);
    await markPosted(post.id, externalId);
    return { ok: true as const, externalId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed.";
    await markPublishFailed(post.id, message);
    return { ok: false as const, error: message };
  }
}
