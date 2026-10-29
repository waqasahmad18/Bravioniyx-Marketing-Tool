import { ObjectId } from "mongodb";
import { services, type Channel, type FunnelGoal, type PostStyle, type Region } from "@/lib/brand";
import { FUNNELS, getDb } from "@/lib/db";
import { approveFunnel, createFunnel } from "@/lib/store";

const channelSets: Channel[][] = [
  ["Instagram", "Facebook"],
  ["Instagram", "LinkedIn"],
  ["Facebook", "Instagram", "LinkedIn"],
  ["Instagram"],
];

const goals: FunnelGoal[] = ["Leads", "Followers", "Engagement", "Leads"];
const styles: PostStyle[] = ["cta", "fact", "text", "cta"];
const regions: Region[] = ["Pakistan", "Pakistan", "General", "Saudi Arabia"];

function karachiDayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Once per Karachi day: create a fresh short funnel with a rotated service,
 * goal, post style, and channel mix — unique designs/copy via buildPosts.
 * Auto-approved so cron can publish when accounts are linked.
 */
export async function ensureDailyCreativeCampaign() {
  const day = karachiDayKey();
  const db = await getDb();
  const existing = await db.collection(FUNNELS).findOne({ dailyKey: day });
  if (existing) {
    return {
      created: false,
      funnelId: String(existing._id),
      name: String(existing.name ?? ""),
      day,
    };
  }

  // Rotate by day-of-year so successive days feel different
  const dayNum = Math.floor(Date.now() / 86_400_000);
  const service = services[dayNum % services.length];
  const goal = goals[dayNum % goals.length];
  const postStyle = styles[dayNum % styles.length];
  const channels = channelSets[dayNum % channelSets.length];
  const region = regions[dayNum % regions.length];
  const days = 3 + (dayNum % 2); // 3 or 4 day series

  const funnelId = await createFunnel({
    service: service.title,
    region,
    days,
    channels,
    goal,
    postStyle,
  });

  await approveFunnel(funnelId);
  await db.collection(FUNNELS).updateOne(
    { _id: new ObjectId(funnelId) },
    {
      $set: {
        dailyKey: day,
        createdBy: "cron",
        intelligent: true,
        name: `Daily · ${service.title} · ${goal} · ${postStyle}`,
      },
    },
  );

  return {
    created: true,
    funnelId,
    service: service.title,
    goal,
    postStyle,
    channels,
    days,
    day,
  };
}
