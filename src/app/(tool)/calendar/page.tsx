import PostCardLazy from "@/components/PostCardLazy";
import { listConnections, listPosts } from "@/lib/store";
import { karachiDay } from "@/lib/when";
import Link from "next/link";

export default async function CalendarPage() {
  const [posts, connections] = await Promise.all([listPosts({ limit: 48 }), listConnections()]);
  const linked = new Set(
    connections.filter((item) => item.status === "connected" && item.token).map((item) => item.platform),
  );
  const groups = new Map<string, typeof posts>();
  for (const post of posts) {
    const key = post.scheduledFor ? karachiDay(post.scheduledFor) : "Unscheduled";
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }

  const draft = posts.filter((post) => post.status === "draft").length;
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const posted = posts.filter((post) => post.status === "posted").length;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Posts</h1>
      <p className="mt-2 max-w-3xl text-sm text-neutral-600">
        Each card is one creative for one channel on one day. Volume grows with{" "}
        <span className="font-semibold">days × channels</span> (for example, 4 days × 4 channels = 16 posts). CTAs route
        to{" "}
        <a href="https://www.bravioniyx.com" className="font-semibold text-[#E10600]" target="_blank" rel="noreferrer">
          bravioniyx.com
        </a>{" "}
        through tracked links.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="border border-neutral-300 bg-white px-4 py-3 text-sm">
          <span className="text-neutral-500">Draft</span>
          <p className="text-2xl font-semibold">{draft}</p>
          <p className="text-xs text-neutral-500">Built, not yet approved</p>
        </div>
        <div className="border border-neutral-300 bg-white px-4 py-3 text-sm">
          <span className="text-neutral-500">Scheduled</span>
          <p className="text-2xl font-semibold">{scheduled}</p>
          <p className="text-xs text-neutral-500">Approved, awaiting publish</p>
        </div>
        <div className="border border-neutral-300 bg-white px-4 py-3 text-sm">
          <span className="text-neutral-500">Posted</span>
          <p className="text-2xl font-semibold">{posted}</p>
          <p className="text-xs text-neutral-500">Live on Facebook, Instagram, or LinkedIn</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        Use <span className="font-semibold text-neutral-900">Public view</span> on any card to preview the feed layout.{" "}
        <Link href="/funnels" className="font-semibold text-[#E10600]">
          Create a funnel
        </Link>
      </p>

      <div className="mt-8 grid gap-8">
        {posts.length === 0 ? (
          <p className="border border-neutral-300 bg-white px-5 py-8 text-sm text-neutral-600">
            No posts yet.{" "}
            <Link href="/funnels" className="font-semibold text-[#E10600]">
              Build a funnel
            </Link>{" "}
            to generate creatives.
          </p>
        ) : null}
        {[...groups.entries()].map(([day, items]) => (
          <section key={day}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {day} · {items.length} posts
            </h2>
            <div className="mt-3 grid gap-5">
              {items.map((post) => (
                <PostCardLazy
                  key={post.id}
                  post={post}
                  connected={linked.has(post.channel as "Facebook" | "Instagram" | "LinkedIn")}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
