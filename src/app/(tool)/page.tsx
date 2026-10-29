import FlowGuide from "@/components/FlowGuide";
import PostCardLazy from "@/components/PostCardLazy";
import { LEADS, tryGetDb } from "@/lib/db";
import { listConnections, listFunnels, listPosts } from "@/lib/store";
import { karachiDay } from "@/lib/when";
import Link from "next/link";

export default async function TodayPage() {
  const db = await tryGetDb();
  if (!db) {
    return (
      <div className="grid gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#E10600]">Bravioniyx Marketing Manager</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Today</h1>
        </div>
        <div className="border border-neutral-300 bg-white p-6 text-sm text-neutral-600">
          Could not reach MongoDB just now. Check Atlas IP access / network, then refresh this page.
        </div>
        <FlowGuide />
      </div>
    );
  }

  const [posts, funnels, leadsCount, connections] = await Promise.all([
    listPosts({ status: ["scheduled", "failed"], limit: 40 }),
    listFunnels(),
    db.collection(LEADS).countDocuments({}),
    listConnections(),
  ]);
  const today = karachiDay(new Date());
  const due = posts.filter((post) => post.scheduledFor && karachiDay(post.scheduledFor) <= today).slice(0, 12);
  const drafts = funnels.filter((funnel) => funnel.status === "draft").length;
  const linked = new Set(
    connections.filter((item) => item.status === "connected" && item.token).map((item) => item.platform),
  );

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#E10600]">Bravioniyx Marketing Manager</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Today</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-600 sm:text-base">
          Posts scheduled for today appear below. Review each creative, open{" "}
          <span className="font-semibold text-neutral-900">Public view</span> to see how it will look on Facebook,
          Instagram, or LinkedIn, then publish or mark as posted. CTAs follow the campaign goal (Followers vs Leads).
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm sm:gap-3">
          <Link href="/funnels" className="inline-flex min-h-11 items-center bg-[#E10600] px-4 py-2 font-semibold text-white">
            Build a funnel
          </Link>
          <Link href="/connections" className="inline-flex min-h-11 items-center border border-neutral-300 bg-white px-4 py-2 font-semibold">
            Connect accounts
          </Link>
          <Link href="/analytics" className="inline-flex min-h-11 items-center border border-neutral-300 bg-white px-4 py-2 font-semibold">
            Open analytics
          </Link>
        </div>
      </div>

      <FlowGuide />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="border border-neutral-300 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Due to publish</p>
          <p className="mt-2 text-3xl font-semibold">{due.length}</p>
        </article>
        <article className="border border-neutral-300 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Draft funnels</p>
          <p className="mt-2 text-3xl font-semibold">{drafts}</p>
        </article>
        <article className="border border-neutral-300 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Accounts linked</p>
          <p className="mt-2 text-3xl font-semibold">{linked.size}/3</p>
        </article>
        <article className="border border-neutral-300 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Website leads</p>
          <p className="mt-2 text-3xl font-semibold">{leadsCount}</p>
        </article>
      </div>

      <section>
        <h2 className="text-xl font-semibold">Due now</h2>
        <p className="mt-1 text-sm text-neutral-600">
          These creatives are scheduled, not yet public. Use Public view to preview the feed layout before you publish.
        </p>
        <div className="mt-5 grid gap-5">
          {due.length === 0 ? (
            <p className="border border-neutral-300 bg-white px-5 py-8 text-sm text-neutral-600">
              Nothing is due right now.{" "}
              <Link href="/funnels" className="font-semibold text-[#E10600]">
                Create a funnel
              </Link>
              , approve it, and today’s posts will appear here.
            </p>
          ) : (
            due.map((post) => (
              <PostCardLazy
                key={post.id}
                post={post}
                defaultPublicView
                connected={linked.has(post.channel as "Facebook" | "Instagram" | "LinkedIn")}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
