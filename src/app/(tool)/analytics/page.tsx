import { websiteUrl } from "@/lib/config";
import { getDashboardStats, listConnections, listPosts } from "@/lib/store";
import Link from "next/link";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <article className="border border-neutral-300 bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs text-neutral-500">{hint}</p> : null}
    </article>
  );
}

export default async function AnalyticsPage() {
  const [stats, posts, connections] = await Promise.all([
    getDashboardStats(),
    listPosts({ status: ["posted", "scheduled"], limit: 40 }),
    listConnections(),
  ]);
  const ranked = [...posts]
    .filter((post) => post.status === "posted" || post.analytics.ctaClicks > 0)
    .sort(
      (a, b) =>
        b.analytics.ctaClicks + b.analytics.engagement - (a.analytics.ctaClicks + a.analytics.engagement),
    )
    .slice(0, 12);

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E10600]">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Analytics</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-600 sm:text-base">
          CTA clicks are counted through tracked links (<code className="bg-neutral-100 px-1">/r/postId</code>) that
          redirect to your website. Engagement, impressions, and followers sync from connected Facebook and Instagram
          accounts on the daily job. Website form leads come from the shared database for{" "}
          <a href={websiteUrl()} className="font-semibold text-[#E10600]" target="_blank" rel="noreferrer">
            {websiteUrl()}
          </a>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="CTA clicks" value={stats.ctaClicks} hint="Tracked redirects to website" />
        <Stat label="Engagement" value={stats.engagement} hint="Likes + comments + shares" />
        <Stat label="Impressions" value={stats.impressions} hint="From linked social insights" />
        <Stat label="Reach" value={stats.reach} />
        <Stat label="Likes" value={stats.likes} />
        <Stat label="Comments" value={stats.comments} />
        <Stat label="Shares" value={stats.shares} />
        <Stat label="Followers (linked pages)" value={stats.followers} hint="Synced from FB/IG page" />
        <Stat label="Website leads" value={stats.websiteLeads} hint="Forms on bravioniyx.com" />
        <Stat label="Posted publicly" value={stats.posted} />
        <Stat label="Scheduled" value={stats.scheduled} />
        <Stat label="Failed publishes" value={stats.failed} />
        <Stat label="Blogs published" value={stats.blogPublished} hint="Live on /blogs" />
        <Stat label="Blog views" value={stats.blogViews} hint="Real page loads only — never inflated" />
        <Stat label="Blog visitors" value={stats.blogVisitors} hint="Debounced unique visitors" />
        <Stat label="Blog CTA clicks" value={stats.blogCtaClicks} hint="Clicks from blog → service pages" />
      </div>
      <p className="text-xs text-neutral-500">
        All numbers are authentic: zeros mean not synced / no traffic yet — this tool never invents reach, comments, or blog
        views.
      </p>

      <section className="border border-neutral-300 bg-white p-5">
        <h2 className="text-lg font-semibold">Website ↔ Marketing Manager</h2>
        <ul className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-3">
          <li className="border border-neutral-200 p-3">
            <p className="font-semibold">Same services</p>
            <p className="mt-1 text-xs text-neutral-600">Posts only promote services listed on the website.</p>
          </li>
          <li className="border border-neutral-200 p-3">
            <p className="font-semibold">Tracked CTA → website</p>
            <p className="mt-1 text-xs text-neutral-600">Every public CTA click is counted here, then user lands on the site.</p>
          </li>
          <li className="border border-neutral-200 p-3">
            <p className="font-semibold">Shared leads DB</p>
            <p className="mt-1 text-xs text-neutral-600">Website form leads appear under Leads in this tool.</p>
          </li>
        </ul>
      </section>

      <section className="border border-neutral-300 bg-white p-5">
        <h2 className="text-lg font-semibold">Connected networks</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(["Facebook", "Instagram", "LinkedIn"] as const).map((platform) => {
            const row = connections.find((item) => item.platform === platform);
            const ok = row?.status === "connected" && Boolean(row.token);
            return (
              <div key={platform} className="border border-neutral-200 p-3 text-sm">
                <p className="font-semibold">{platform}</p>
                <p className={`mt-1 text-xs ${ok ? "text-emerald-700" : "text-[#E10600]"}`}>
                  {ok ? `Linked · ${row?.accountName || row?.accountId}` : "Not linked — auto-post off"}
                </p>
                <p className="mt-1 text-xs text-neutral-500">Followers: {row?.followers ?? 0}</p>
              </div>
            );
          })}
        </div>
        <Link href="/connections" className="mt-4 inline-block text-sm font-semibold text-[#E10600]">
          Manage Connections →
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Per-post performance</h2>
        <p className="mt-1 text-sm text-neutral-600">CTA clicks + engagement by post. Open Posts for public view.</p>
        <div className="mt-4 overflow-x-auto border border-neutral-300 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">CTA clicks</th>
                <th className="px-4 py-3">Engagement</th>
                <th className="px-4 py-3">Impressions</th>
                <th className="px-4 py-3">Likes</th>
                <th className="px-4 py-3">Comments</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-neutral-600">
                    No performance data yet. Approve a funnel, connect your accounts, and publish (or wait for the daily
                    job). CTA clicks appear as soon as someone opens a tracked link.
                  </td>
                </tr>
              ) : (
                ranked.map((post) => (
                  <tr key={post.id} className="border-b border-neutral-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">{post.headline}</p>
                      <p className="text-xs text-neutral-500">{post.service}</p>
                    </td>
                    <td className="px-4 py-3">{post.channel}</td>
                    <td className="px-4 py-3 font-semibold text-[#E10600]">{post.analytics.ctaClicks}</td>
                    <td className="px-4 py-3">{post.analytics.engagement}</td>
                    <td className="px-4 py-3">{post.analytics.impressions}</td>
                    <td className="px-4 py-3">{post.analytics.likes}</td>
                    <td className="px-4 py-3">{post.analytics.comments}</td>
                    <td className="px-4 py-3 uppercase tracking-wider text-xs">{post.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
