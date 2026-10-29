import type { Channel } from "@/lib/brand";

/**
 * Organic reach engine — design posts so the feed algorithm does the work.
 * Goal: strong reach without boosts / ad budget burn.
 *
 * Rules we encode:
 * 1. Hook first — never open with a link or hard sell
 * 2. Invite a reply (comments = distribution fuel)
 * 3. Save/share worthiness on tip/fact days
 * 4. Soft CTA at the end only; Instagram links stay late
 * 5. Lean niche hashtags (not spam walls)
 * 6. Peak local posting windows (Asia/Karachi)
 */

export type ReachMode = "conversation" | "save" | "soft-offer" | "proof";

/** Rotate modes so a series never feels like endless ads. */
export function reachModeFor(day: number, stage: string): ReachMode {
  if (stage === "Engage" || stage === "Hook") return "conversation";
  if (stage === "Value" || stage === "Proof") return day % 2 === 0 ? "save" : "proof";
  return "soft-offer";
}

const commentPrompts: Record<string, string[]> = {
  Facebook: [
    "What’s breaking first for you — speed, login, or clarity? Reply in one word.",
    "Drop a ✅ if this is your week. We’ll reply with the next step.",
    "Honest take: is this a setup problem or a tools problem? Comment below.",
    "Tag someone who needs this sorted this month.",
  ],
  Instagram: [
    "Save this for later — or reply with the one word that matches your situation.",
    "Which one hits harder for you? Reply 1 / 2 / 3.",
    "Double-tap if you’ve lived this. Comment if you want the fix path.",
    "Send this to the person who handles IT / the website in your team.",
  ],
  LinkedIn: [
    "Operators: what’s the bottleneck you keep postponing? Comment one line.",
    "Curious — is this a process issue or a tooling issue in your shop?",
    "If you’ve fixed this before, what worked? Share one tip for others.",
    "Would love a practitioner view: where does this usually fail first?",
  ],
};

const saveLines = [
  "Worth saving if this is on your plate this quarter.",
  "Bookmark this — you’ll want it the next time something breaks.",
  "Quiet tip. Loud results when you apply it.",
];

export function engagementCloser(channel: Channel, day: number, mode: ReachMode) {
  if (mode === "conversation") {
    const list = commentPrompts[channel] ?? commentPrompts.Facebook;
    return list[(day - 1) % list.length];
  }
  if (mode === "save") {
    return saveLines[(day - 1) % saveLines.length];
  }
  if (mode === "proof") {
    return channel === "LinkedIn"
      ? "Clear scope beats heroics. Agree?"
      : "Seen this play out? Tell us what happened on your side.";
  }
  return channel === "LinkedIn"
    ? "If the brief is ready, the next step is a short scope — no pressure pitch."
    : "When you’re ready, the next step is simple — no boost needed, just a clear brief.";
}

/** Niche tags only — walls of hashtags look spammy and hurt reach. */
export function leanHashtags(slug: string, channel: Channel) {
  if (channel === "LinkedIn") return "";
  const bySlug: Record<string, string> = {
    "rdp-setup": "#RemoteDesktop #RDP #RemoteWork",
    "website-development": "#WebDesign #BusinessWebsite #SmallBusiness",
    "game-development": "#Unity #GameDev #IndieDev",
    "custom-software-development": "#CustomSoftware #BusinessApps #Operations",
    "server-setup": "#Servers #DevOps #ITInfrastructure",
    networking: "#Networking #OfficeIT #Infrastructure",
    "it-support": "#ITSupport #BusinessIT #TechSupport",
    "chat-room-servers": "#Servers #Uptime #Infrastructure",
    "cloud-vps": "#Cloud #VPS #Hosting",
  };
  const tags = bySlug[slug] ?? "#Bravioniyx #ITServices #DigitalSolutions";
  // Instagram tolerates a few more; Facebook stays leaner
  const brand = channel === "Instagram" ? " #Bravioniyx" : "";
  return `\n\n${tags}${brand}`.trimEnd();
}

/**
 * Build caption for organic reach.
 * - Body first (no link in opening)
 * - Engagement closer (comments/saves)
 * - Soft CTA + URL only at the end (Instagram especially)
 */
export function formatOrganicCaption(input: {
  channel: Channel;
  body: string;
  day: number;
  stage: string;
  slug: string;
  ctaLabel?: string;
  href?: string;
  kind?: string;
  withCta: boolean;
}) {
  const mode = reachModeFor(input.day, input.stage);
  const closer = engagementCloser(input.channel, input.day, mode);
  const body = input.body.trim();
  const tags = leanHashtags(input.slug, input.channel);

  if (!input.withCta || !input.ctaLabel) {
    const core = `${body}\n\n${closer}`;
    if (input.channel === "LinkedIn") return core;
    return `${core}${tags}`;
  }

  // Caption body stays clean. CTA button sits under the post (Ads Manager style).
  // URL still appended once at the end so manual paste stays clickable.
  const href = (input.href || "").trim();
  const ctaBlock = href ? `${input.ctaLabel}\n${href}` : input.ctaLabel;

  if (input.channel === "Instagram") {
    return `${body}\n\n${closer}\n\n${ctaBlock}${tags}`;
  }

  if (input.channel === "LinkedIn") {
    return `${body}\n\n${closer}\n\n——\n${ctaBlock}`;
  }

  return `${body}\n\n${closer}\n\n——\n${ctaBlock}${tags}`;
}

/** Caption + Ads-style CTA block under the post for manual paste. */
export function captionForManualPost(input: {
  caption: string;
  ctaLabel?: string;
  href?: string;
}) {
  let caption = input.caption.trim();
  const href = (input.href || "").trim();
  const label = (input.ctaLabel || "").trim();
  if (!href && !label) return caption;

  // Strip old on-caption emoji CTA noise if present
  caption = caption
    .replace(/\n*——\n*/g, "\n\n")
    .replace(/\n*👉[^\n]*/g, "")
    .trim();

  const hasUrl = href ? caption.includes(href) : true;
  if (hasUrl && label && caption.includes(label)) return caption;

  const block = [label || null, href || null].filter(Boolean).join("\n");
  return `${caption}\n\n——\n${block}`;
}

/**
 * Peak posting windows in Asia/Karachi (hour, minute).
 * Varied by day so the series doesn’t stampede one slot.
 */
const peakWindows: Record<string, Array<[number, number]>> = {
  Instagram: [
    [12, 0],
    [19, 15],
    [20, 45],
  ],
  Facebook: [
    [9, 30],
    [13, 0],
    [20, 0],
  ],
  LinkedIn: [
    [8, 30],
    [12, 15],
    [17, 45],
  ],
};

/** Schedule for organic reach windows (Karachi local → ISO UTC). */
export function karachiOrganicSlot(daysAhead: number, channel: string = "Facebook") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [year, month, day] = parts.split("-").map(Number);
  const windows = peakWindows[channel] ?? peakWindows.Facebook;
  const [hour, minute] = windows[Math.abs(daysAhead) % windows.length];
  // Asia/Karachi is UTC+5 (no DST)
  return new Date(Date.UTC(year, month - 1, day + daysAhead, hour - 5, minute, 0)).toISOString();
}
