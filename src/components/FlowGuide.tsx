import { brand } from "@/lib/brand";

const steps = [
  {
    n: "1",
    title: "Website aligned",
    text: `Creatives follow the services on ${brand.site}. Every CTA routes to your site, and form leads sync into this workspace.`,
  },
  {
    n: "2",
    title: "Plan & schedule",
    text: "Build a funnel. Posts auto-vary design + copy, and are written for organic reach (hooks, replies, soft CTAs) — not boost-dependent.",
  },
  {
    n: "3",
    title: "Connect networks",
    text: "Link Facebook, Instagram, and LinkedIn under Connections. Auto-publish requires a live connection.",
  },
  {
    n: "4",
    title: "Daily AI creatives",
    text: "Each day the manager builds a fresh funnel angle (service/goal/style) + SEO blog draft — brand colors, no duplicate feel. Cron publishes due social posts when accounts are linked.",
  },
  {
    n: "5",
    title: "Measure results",
    text: "Analytics shows organic CTA clicks, engagement, impressions, followers, blog views, and website leads — authentic numbers only.",
  },
];

export default function FlowGuide() {
  return (
    <section className="border border-neutral-300 bg-white">
      <div className="border-b border-neutral-200 bg-neutral-950 px-5 py-4 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E10600]">Workflow</p>
        <h2 className="mt-1 text-xl font-semibold">Website → Creatives → Publish → Analytics → Leads</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          A clear path from service pages on your website to scheduled social posts, tracked CTAs, and inbound leads.
        </p>
      </div>
      <ol className="grid gap-0 md:grid-cols-5">
        {steps.map((step, index) => (
          <li
            key={step.n}
            className={`px-4 py-5 ${index < steps.length - 1 ? "border-b border-neutral-200 md:border-b-0 md:border-r" : ""}`}
          >
            <p className="text-2xl font-semibold text-[#E10600]">{step.n}</p>
            <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
