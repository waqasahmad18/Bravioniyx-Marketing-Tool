import {
  goalCtaFor,
  serviceByTitle,
  stages,
  type Channel,
  type FunnelGoal,
  type PostStyle,
  type Region,
} from "@/lib/brand";
import { creativeFor } from "@/lib/creatives";
import { designForDay, nextUnusedDesign, normalizeCopy, type DesignVariant } from "@/lib/designs";
import { factFor } from "@/lib/facts";
import { formatOrganicCaption, karachiOrganicSlot } from "@/lib/organic";

export type BuiltPost = {
  day: number;
  channel: Channel;
  stage: (typeof stages)[number];
  goal: FunnelGoal;
  postStyle: PostStyle;
  designVariant: DesignVariant;
  headline: string;
  caption: string;
  ctaLabel: string;
  graphicTitle: string;
  graphicLine: string;
  bullets: string[];
  link: string;
};

function stageFor(day: number) {
  return stages[(day - 1) % stages.length];
}

function uniqueOrSkip(seen: Set<string>, value: string, fallback: string) {
  const key = normalizeCopy(value);
  if (!seen.has(key)) {
    seen.add(key);
    return value;
  }
  const alt = `${fallback}\n\n${value.slice(0, 120)}`;
  const altKey = normalizeCopy(alt);
  if (!seen.has(altKey)) {
    seen.add(altKey);
    return alt;
  }
  seen.add(key + String(seen.size));
  return `${value}\n\nFresh angle for today — same problem, clearer path.`;
}

/**
 * Intelligent series builder:
 * - Unique design + copy per day
 * - Organic reach structure (hook → value → reply prompt → soft CTA)
 * - No boost / ad-budget dependence baked into the caption pattern
 */
export function buildPosts(input: {
  service: string;
  region: Region;
  days: number;
  channels: Channel[];
  goal?: FunnelGoal;
  postStyle?: PostStyle;
}) {
  const service = serviceByTitle(input.service);
  const days = Math.min(14, Math.max(3, input.days));
  const goal = input.goal ?? "Leads";
  const postStyle = input.postStyle ?? "cta";
  const channels = input.channels.filter(
    (channel) => channel === "Facebook" || channel === "Instagram" || channel === "LinkedIn",
  );
  const posts: BuiltPost[] = [];
  const seenCaptions = new Set<string>();
  const seenHeadlines = new Set<string>();
  const usedByChannel = new Map<string, Set<string>>();

  for (let day = 1; day <= days; day += 1) {
    const stage = stageFor(day);
    const creative = creativeFor(service.slug, {
      region: input.region,
      goal,
      day,
      total: days,
      stage,
    });

    for (const channel of channels) {
      const usedDesigns = usedByChannel.get(channel) ?? new Set<string>();
      const preferred = designForDay(day, channel, service.slug);
      const designVariant = nextUnusedDesign(preferred, usedDesigns, day, channel, service.slug);
      usedDesigns.add(designVariant);
      usedByChannel.set(channel, usedDesigns);

      if (postStyle === "fact") {
        const fact = factFor(service.slug, day);
        const body = `${fact}\n\n— ${service.title} · Bravioniyx Technologies`;
        const headline = uniqueOrSkip(seenHeadlines, `Fact ${day}`, `Insight ${day}`);
        const caption = uniqueOrSkip(
          seenCaptions,
          formatOrganicCaption({
            channel,
            body,
            day,
            stage: "Value",
            slug: service.slug,
            withCta: false,
          }),
          fact,
        );
        posts.push({
          day,
          channel,
          stage,
          goal,
          postStyle,
          designVariant: designVariant === "classic" ? "fact-card" : designVariant,
          headline,
          caption,
          ctaLabel: "",
          graphicTitle: "Interesting\nfact",
          graphicLine: fact,
          bullets: [],
          link: "",
        });
        continue;
      }

      if (postStyle === "text") {
        const headline = uniqueOrSkip(seenHeadlines, creative.headline, `${service.title} note ${day}`);
        const caption = uniqueOrSkip(
          seenCaptions,
          formatOrganicCaption({
            channel,
            body: creative.body,
            day,
            stage,
            slug: service.slug,
            withCta: false,
          }),
          creative.headline,
        );
        posts.push({
          day,
          channel,
          stage,
          goal,
          postStyle,
          designVariant,
          headline,
          caption,
          ctaLabel: "",
          graphicTitle: creative.graphicTitle,
          graphicLine: creative.graphicLine,
          bullets: [...service.bullets],
          link: "",
        });
        continue;
      }

      // CTA style: still organic-first. Soft ask + comment fuel, link at the end.
      // Engagement / Followers goals lean even harder on replies (algorithm distribution).
      const cta = goalCtaFor({
        goal,
        serviceTitle: service.title,
        serviceSlug: service.slug,
        channel,
        day,
      });
      const headline = uniqueOrSkip(seenHeadlines, creative.headline, `${stage} · ${service.title}`);
      const caption = uniqueOrSkip(
        seenCaptions,
        formatOrganicCaption({
          channel,
          body: creative.body,
          day,
          stage,
          slug: service.slug,
          withCta: true,
          ctaLabel: cta.label,
          href: cta.href,
          kind: cta.kind,
        }),
        creative.body,
      );

      posts.push({
        day,
        channel,
        stage,
        goal,
        postStyle,
        designVariant,
        headline,
        caption,
        ctaLabel: cta.label,
        graphicTitle: creative.graphicTitle,
        graphicLine: creative.graphicLine,
        bullets: [...service.bullets],
        link: cta.href,
      });
    }
  }

  return {
    service: service.title,
    slug: service.slug,
    days,
    goal,
    postStyle,
    page: service.page,
    posts,
  };
}

/** @deprecated prefer channel-aware slot — kept for callers that only pass daysAhead */
export function karachiSlot(daysAhead: number, channel?: string) {
  return karachiOrganicSlot(daysAhead, channel ?? "Facebook");
}
