import PublicFeedPreview from "@/components/PublicFeedPreview";
import { buildPosts } from "@/lib/content";
import type { Post } from "@/lib/types";

function asPost(service: string, goal: Post["goal"], post: ReturnType<typeof buildPosts>["posts"][number], index: number): Post {
  return {
    id: `demo-${index}`,
    funnelId: "demo",
    service,
    region: "Pakistan",
    day: post.day,
    channel: post.channel,
    stage: post.stage,
    goal,
    postStyle: post.postStyle,
    designVariant: post.designVariant,
    headline: post.headline,
    caption: post.caption,
    ctaLabel: post.ctaLabel,
    graphicTitle: post.graphicTitle,
    graphicLine: post.graphicLine,
    bullets: post.bullets,
    link: post.link,
    destination: post.link,
    scheduledFor: new Date().toISOString(),
    status: "scheduled",
    analytics: {
      ctaClicks: 0,
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagement: 0,
      followers: 0,
    },
  };
}

export default function DemoPreviewPage() {
  const leads = buildPosts({
    service: "RDP Setup & Configuration",
    region: "Pakistan",
    days: 4,
    channels: ["Instagram", "Facebook", "LinkedIn"],
    goal: "Leads",
  });
  const followers = buildPosts({
    service: "Website Development",
    region: "Pakistan",
    days: 4,
    channels: ["Instagram"],
    goal: "Followers",
  });

  const leadSamples = leads.posts.filter((post) => post.day <= 3 && post.channel === "Instagram").map((post, i) => asPost(leads.service, "Leads", post, i));
  const followSample = asPost(followers.service, "Followers", followers.posts[0], 50);

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E10600]">Organic-first series</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reach without boosts · unique daily posts</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Captions are built for organic distribution: hook first, reply/save prompts, soft CTA at the end, lean
          hashtags, peak Karachi schedule. Designs rotate daily inside brand colors — no duplicate copy, no paid-boost
          dependency.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
          <div className="border border-neutral-300 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#E10600]">Leads campaign CTAs</p>
            <p className="mt-2">Get a Quote · Visit Website · Chat on WhatsApp</p>
          </div>
          <div className="border border-neutral-300 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#E10600]">Followers campaign CTA</p>
            <p className="mt-2">Follow Bravioniyx</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {[...leadSamples, followSample].map((post) => (
            <div key={post.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#E10600]">
                {post.goal} · Day {post.day} · {post.designVariant}
                {post.ctaLabel ? ` · CTA: ${post.ctaLabel}` : ""}
              </p>
              <PublicFeedPreview post={post} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
