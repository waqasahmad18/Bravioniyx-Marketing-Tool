"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  asPostStyle,
  channels,
  funnelGoals,
  regions,
  type Channel,
  type FunnelGoal,
  type Region,
} from "@/lib/brand";
import { MARKETING_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  approveFunnel,
  createFunnel,
  disconnectPlatform,
  getPost,
  markPosted,
  upsertConnection,
} from "@/lib/store";
import { publishPostToNetwork } from "@/lib/social";
import type { SocialPlatform } from "@/lib/types";

async function requireStaff() {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(MARKETING_COOKIE)?.value)) {
    throw new Error("Sign in required.");
  }
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/funnels");
  revalidatePath("/calendar");
  revalidatePath("/connections");
  revalidatePath("/analytics");
  revalidatePath("/leads");
  revalidatePath("/assistant");
  revalidatePath("/blog");
  revalidatePath("/blogs");
}

export async function createFunnelAction(formData: FormData) {
  await requireStaff();
  const service = String(formData.get("service") ?? "");
  const regionValue = String(formData.get("region") ?? "Pakistan");
  const region = regions.find((item) => item === regionValue) ?? "Pakistan";
  const goalValue = String(formData.get("goal") ?? "Leads");
  const goal = (funnelGoals.find((item) => item === goalValue) ?? "Leads") as FunnelGoal;
  const postStyle = asPostStyle(formData.get("postStyle"));
  const days = Number(formData.get("days") ?? 7);
  const selected = formData
    .getAll("channels")
    .map(String)
    .filter((item): item is Channel => channels.some((channel) => channel === item));
  if (!service || selected.length === 0) return;
  await createFunnel({ service, region: region as Region, days, channels: selected, goal, postStyle });
  refresh();
}

export async function approveFunnelAction(formData: FormData) {
  await requireStaff();
  await approveFunnel(String(formData.get("id") ?? ""));
  refresh();
}

export async function markPostedAction(formData: FormData) {
  await requireStaff();
  await markPosted(String(formData.get("id") ?? ""));
  refresh();
}

export async function publishPostAction(postId: string) {
  await requireStaff();
  const post = await getPost(postId);
  if (!post) return { ok: false as const, error: "Post not found." };
  if (post.channel === "WhatsApp") {
    return { ok: false as const, error: "Download the WhatsApp graphic, send it in chat, then mark posted." };
  }
  const result = await publishPostToNetwork(post);
  refresh();
  return result;
}

export async function saveConnectionAction(formData: FormData) {
  await requireStaff();
  const platform = String(formData.get("platform") ?? "") as SocialPlatform;
  if (platform !== "Facebook" && platform !== "Instagram" && platform !== "LinkedIn") return;
  await upsertConnection({
    platform,
    accountName: String(formData.get("accountName") ?? ""),
    accountId: String(formData.get("accountId") ?? ""),
    token: String(formData.get("token") ?? ""),
  });
  refresh();
}

export async function disconnectAction(formData: FormData) {
  await requireStaff();
  const platform = String(formData.get("platform") ?? "") as SocialPlatform;
  if (platform !== "Facebook" && platform !== "Instagram" && platform !== "LinkedIn") return;
  await disconnectPlatform(platform);
  refresh();
}
