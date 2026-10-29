import { ensureDailyBlogDraft } from "@/lib/blogs/store";
import { ensureDailyCreativeCampaign } from "@/lib/daily-creatives";
import { syncNetworkInsights } from "@/lib/insights";
import { publishPostToNetwork } from "@/lib/social";
import { listDueScheduledPosts } from "@/lib/store";

/**
 * Intelligent daily loop:
 * 1) Create a fresh creative funnel (new service/angle/style — brand colors, no duplicate feel)
 * 2) Publish due scheduled social posts (when Connections are linked)
 * 3) Sync authentic insights
 * 4) Draft today’s SEO blog for review/publish
 */
export async function runDailyAutomation() {
  const campaign = await ensureDailyCreativeCampaign();

  const due = await listDueScheduledPosts();
  const published: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  for (const post of due) {
    const result = await publishPostToNetwork(post);
    if (result.ok) published.push(post.id);
    else failed.push({ id: post.id, error: result.error });
  }

  const insights = await syncNetworkInsights();
  const blogDraft = await ensureDailyBlogDraft();

  return {
    ranAt: new Date().toISOString(),
    campaign,
    due: due.length,
    published: published.length,
    failed,
    insights,
    blogDraft: {
      created: blogDraft.created,
      id: blogDraft.blog?.id,
      title: blogDraft.blog?.title,
      status: blogDraft.blog?.status,
    },
    note:
      "Daily: new creative funnel (varied service/goal/style) + publish due posts + SEO blog draft. Blogs stay draft until you/Lessa publish. Stats stay authentic.",
  };
}
