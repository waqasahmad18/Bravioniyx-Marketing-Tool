import { FUNNELS, POSTS, getDb } from "@/lib/db";
import { approveFunnel, createFunnel, listPosts } from "@/lib/store";
import type { Channel } from "@/lib/brand";

const channels: Channel[] = ["Facebook", "Instagram", "LinkedIn"];

/** Clears unfinished posts/funnels and seeds Leads + Followers campaigns (no WhatsApp posts). */
export async function rebuildTodayCampaign() {
  const db = await getDb();
  await db.collection(POSTS).deleteMany({ status: { $in: ["draft", "scheduled", "failed"] } });
  await db.collection(FUNNELS).deleteMany({});

  const leadsId = await createFunnel({
    service: "RDP Setup & Configuration",
    region: "Pakistan",
    days: 4,
    channels,
    goal: "Leads",
    postStyle: "cta",
  });
  await approveFunnel(leadsId);

  const followersId = await createFunnel({
    service: "Website Development",
    region: "Pakistan",
    days: 4,
    channels,
    goal: "Followers",
    postStyle: "fact",
  });
  await approveFunnel(followersId);

  const posts = await listPosts();
  const todayCount = posts.filter((post) => post.status === "scheduled").length;

  return {
    funnels: [leadsId, followersId],
    scheduledPosts: todayCount,
    note: "WhatsApp excluded as a channel. Leads CTAs rotate Get a Quote / Visit Website / Chat on WhatsApp. Followers CTAs use Follow Bravioniyx.",
  };
}
