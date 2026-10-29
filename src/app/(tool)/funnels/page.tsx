import FunnelForm from "@/components/FunnelForm";
import PostCardLazy from "@/components/PostCardLazy";
import { approveFunnelAction } from "@/lib/actions";
import { listFunnels, listPosts } from "@/lib/store";
import { karachiLabel } from "@/lib/when";

export default async function FunnelsPage() {
  const [funnels, posts] = await Promise.all([listFunnels(), listPosts({ limit: 100 })]);
  const previewByFunnel = new Map<string, typeof posts>();
  const countByFunnel = new Map<string, number>();
  for (const post of posts) {
    countByFunnel.set(post.funnelId, (countByFunnel.get(post.funnelId) ?? 0) + 1);
    const list = previewByFunnel.get(post.funnelId) ?? [];
    if (list.length < 2) list.push(post);
    previewByFunnel.set(post.funnelId, list);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
      <FunnelForm />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Funnels</h1>
        <p className="mt-2 text-sm text-neutral-600">
          <span className="font-semibold">Build</span> creates draft creatives.{" "}
          <span className="font-semibold">Approve</span> schedules them for publishing. They become public only after
          you publish (or the daily cron runs on linked accounts). Open{" "}
          <span className="font-semibold">Public view</span> on a sample card to preview the feed.
        </p>
        <div className="mt-6 grid gap-5">
          {funnels.length === 0 ? (
            <p className="border border-neutral-300 bg-white px-5 py-8 text-sm text-neutral-600">
              No funnels yet. Use the form to create your first campaign.
            </p>
          ) : null}
          {funnels.map((funnel) => {
            const preview = previewByFunnel.get(funnel.id) ?? [];
            const total = countByFunnel.get(funnel.id) ?? 0;
            return (
              <article key={funnel.id} className="border border-neutral-300 bg-white">
                <div className="border-b border-neutral-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E10600]">
                        {funnel.goal} · {funnel.postStyle || "cta"} · website service
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">{funnel.name}</h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        {funnel.days} days · {funnel.channels.join(" · ")} ·{" "}
                        <span className="font-semibold text-neutral-900">{total} posts</span>
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {funnel.createdAt ? karachiLabel(funnel.createdAt) : ""}
                      </p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E10600]">{funnel.status}</p>
                  </div>
                  {funnel.status === "draft" ? (
                    <form action={approveFunnelAction} className="mt-4">
                      <input type="hidden" name="id" value={funnel.id} />
                      <button
                        type="submit"
                        className="bg-[#E10600] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                      >
                        Approve and schedule
                      </button>
                    </form>
                  ) : (
                    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-neutral-500">
                      Scheduled · publish from Today or Posts when ready
                    </p>
                  )}
                </div>
                {preview.length > 0 ? (
                  <div className="grid gap-4 bg-neutral-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      Sample creatives
                    </p>
                    {preview.map((post) => (
                      <PostCardLazy key={post.id} post={post} showSchedule={false} defaultPublicView />
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
