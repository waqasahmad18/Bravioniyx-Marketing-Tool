/**
 * Campaign CTA pattern (saved):
 * - Followers goal → Follow CTA (grow the page)
 * - Leads goal → Get a Quote | Visit Website | Chat on WhatsApp
 * - Engagement goal → Comment / reply CTA
 *
 * WhatsApp is NOT a posting channel. It is only a Leads CTA destination.
 * WhatsApp numbers by service:
 * - IT infrastructure / RDP / servers / networking / support / cloud / chat → 03297320409
 * - Unity game development → 03040492918
 * - Custom software OR website development → 03224188759
 */
export const whatsappLanes = {
  itInfrastructure: {
    local: "03297320409",
    e164: "923297320409",
    label: "IT infrastructure & solutions",
  },
  gameDevelopment: {
    local: "03040492918",
    e164: "923040492918",
    label: "Unity game development",
  },
  softwareWeb: {
    local: "03224188759",
    e164: "923224188759",
    label: "Custom software & website development",
  },
} as const;

export type WhatsAppLane = keyof typeof whatsappLanes;

export const brand = {
  name: "Bravioniyx Marketing Manager",
  company: "Bravioniyx Technologies",
  tagline: "Ideas / Solutions / Growth",
  pitch: "Remote by default. On-site when you need us there.",
  site: "https://www.bravioniyx.com",
  quotePath: "/get-a-quote",
  email: "bravioniyxtecnology@gmail.com",
  whatsapp: `https://wa.me/${whatsappLanes.itInfrastructure.e164}?text=Hello%20Bravioniyx%20Technologies%2C%20I%20would%20like%20to%20talk%20about%20a%20project.`,
  whatsappDisplay: `+92 ${whatsappLanes.itInfrastructure.local.slice(1, 4)} ${whatsappLanes.itInfrastructure.local.slice(4)}`,
  location: "Lahore, Pakistan",
};

export type ServiceContent = {
  slug: string;
  title: string;
  line: string;
  page: string;
  group: "Software and websites" | "Servers, RDP, and networks" | "Unity game development";
  bullets: string[];
  hooks: string[];
  offer: string;
  cta: string;
};

export const services: ServiceContent[] = [
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    line: "software shaped around how the business already works",
    page: "/services/custom-software-development",
    group: "Software and websites",
    bullets: [
      "Business web applications built around your process",
      "Custom management systems for records and approvals",
      "SaaS product development with room to grow",
    ],
    hooks: [
      "Still running the company on sheets and chats?",
      "Generic software forces your team into someone else’s workflow.",
      "One system for the daily work — not five logins.",
    ],
    offer: "Start with one costly workflow. We shape the screens, roles, and approvals around how you already work.",
    cta: "Get a software quote",
  },
  {
    slug: "website-development",
    title: "Website Development",
    line: "a business or store website that stays clear on every screen",
    page: "/services/website-development",
    group: "Software and websites",
    bullets: [
      "Business websites that explain the offer clearly",
      "E-commerce websites ready to take orders",
      "Responsive design that stays sharp on phone and desktop",
    ],
    hooks: [
      "Your site should sell the work — not confuse the visitor.",
      "A slow or unclear website costs leads every week.",
      "One clean site for the brand, the offer, and the quote form.",
    ],
    offer: "We build business and store websites that stay clear on every screen, with the quote path ready.",
    cta: "Get a website quote",
  },
  {
    slug: "rdp-setup",
    title: "RDP Setup & Configuration",
    line: "remote desktop access the team can actually sign in to",
    page: "/services/rdp-setup",
    group: "Servers, RDP, and networks",
    bullets: [
      "Remote Desktop setup for the team",
      "Windows RDP configuration that stays reliable",
      "VPS setup with remote access ready",
    ],
    hooks: [
      "“Can you log into RDP?” …silence.",
      "Stop starting the day with a failed remote login.",
      "Office tools from anywhere — when login actually works.",
    ],
    offer: "Windows RDP and VPS remote access configured so your team signs in and works — every day, not “sometimes.”",
    cta: "Set up my RDP",
  },
  {
    slug: "server-setup",
    title: "Server Setup & Management",
    line: "servers configured, deployed, and looked after after go-live",
    page: "/services/server-setup",
    group: "Servers, RDP, and networks",
    bullets: [
      "Server configuration done properly the first time",
      "Deployment and ongoing maintenance",
      "Troubleshooting when something breaks after go-live",
    ],
    hooks: [
      "A server that only works on launch day is not done.",
      "Setup, deploy, then stay on it after go-live.",
      "Stop treating production like a one-time favour.",
    ],
    offer: "We configure, deploy, and look after servers after they are live — not only on day one.",
    cta: "Talk about servers",
  },
  {
    slug: "networking",
    title: "Networking Solutions",
    line: "an office network planned so people and systems stay connected",
    page: "/services/networking",
    group: "Servers, RDP, and networks",
    bullets: [
      "Network setup and configuration for the office",
      "Troubleshooting when people and systems drop offline",
      "Business IT infrastructure planned to grow",
    ],
    hooks: [
      "If the network drops, the whole office stops.",
      "Connectivity should be planned — not patched every Monday.",
      "People and systems stay connected when the network is designed for the work.",
    ],
    offer: "We plan and set up office networks so your people and systems stay connected.",
    cta: "Fix the network",
  },
  {
    slug: "it-support",
    title: "IT Support & Technical Assistance",
    line: "a direct line when software or systems stop behaving",
    page: "/services/it-support",
    group: "Servers, RDP, and networks",
    bullets: [
      "Remote technical support when something breaks",
      "Software and system troubleshooting",
      "Ongoing IT maintenance so small issues stay small",
    ],
    hooks: [
      "When software stops behaving, you need a direct line — not a ticket void.",
      "IT support that answers, diagnoses, and fixes.",
      "Keep the stack running while the team keeps working.",
    ],
    offer: "Remote support, troubleshooting, and ongoing maintenance when systems stop behaving.",
    cta: "Get IT support",
  },
  {
    slug: "chat-room-servers",
    title: "Chat Room Servers",
    line: "chat infrastructure set up, deployed, and kept running",
    page: "/services/chat-room-servers",
    group: "Servers, RDP, and networks",
    bullets: [
      "Chat room server setup and configuration",
      "Deployment and day-to-day management",
      "Maintenance and troubleshooting for chat infrastructure",
    ],
    hooks: [
      "Chat rooms need infrastructure — not hope.",
      "Set up, deploy, and keep the chat stack running.",
      "Communities stay online when the server work is solid.",
    ],
    offer: "We set up, deploy, and look after chat room servers so the community stays online.",
    cta: "Set up chat servers",
  },
  {
    slug: "cloud-vps",
    title: "Cloud & VPS Solutions",
    line: "virtual servers deployed, moved, and tightened up",
    page: "/services/cloud-vps",
    group: "Servers, RDP, and networks",
    bullets: [
      "VPS configuration for real workloads",
      "Cloud server deployment done cleanly",
      "Migration and optimization without long downtime",
    ],
    hooks: [
      "Cloud is only useful when the VPS is configured for the job.",
      "Deploy, migrate, and tighten — not just rent a box.",
      "Move workloads without a week of downtime.",
    ],
    offer: "Virtual servers deployed, moved, and tightened up for the work you actually run.",
    cta: "Get a VPS quote",
  },
  {
    slug: "game-development",
    title: "Game Development",
    line: "games built in Unity, from the first playable scene to a build",
    page: "/services/game-development",
    group: "Unity game development",
    bullets: [
      "Unity game development from concept to build",
      "Gameplay, scenes, and interface inside Unity",
      "Playable builds and follow-up fixes",
    ],
    hooks: [
      "From the first playable scene to a build you can share.",
      "Unity games shaped around gameplay, not just assets.",
      "Scenes, interface, and a build the team can test.",
    ],
    offer: "We build games in Unity — gameplay, scenes, interface, and playable builds with follow-up fixes.",
    cta: "Start a game brief",
  },
];

export const regions = ["Pakistan", "Saudi Arabia", "United Arab Emirates", "General"] as const;
/** Social networks we schedule posts to — WhatsApp is not a post channel. */
export const channels = ["Facebook", "Instagram", "LinkedIn"] as const;
export const funnelGoals = ["Leads", "Followers", "Engagement"] as const;

/** You choose how each funnel’s posts are written. */
export const postStyles = [
  {
    id: "text",
    label: "Text only",
    hint: "Typed caption only — no CTA button or sales link.",
  },
  {
    id: "fact",
    label: "Engaging fact",
    hint: "Interesting fact / tip post — no CTA. Built for saves and comments.",
  },
  {
    id: "cta",
    label: "With CTA",
    hint: "Full creative with one primary CTA (quote, website, WhatsApp, or follow).",
  },
] as const;

export type Region = (typeof regions)[number];
export type Channel = (typeof channels)[number];
export type FunnelGoal = (typeof funnelGoals)[number];
export type PostStyle = (typeof postStyles)[number]["id"];

export function asPostStyle(value: unknown): PostStyle {
  if (value === "text" || value === "fact" || value === "cta") return value;
  return "cta";
}

export const stages = ["Hook", "Value", "Proof", "Offer", "Engage", "CTA"] as const;
export type Stage = (typeof stages)[number];

export function serviceByTitle(title: string) {
  return services.find((item) => item.title === title) ?? services[0];
}

export function serviceBySlug(slug: string) {
  return services.find((item) => item.slug === slug) ?? services[0];
}

export function quoteUrl(channel: Channel, slug: string, day: number) {
  const url = new URL(brand.quotePath, brand.site);
  url.searchParams.set("utm_source", channel.toLowerCase());
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", slug);
  url.searchParams.set("utm_content", `day-${day}`);
  return url.toString();
}

export function serviceUrl(slug: string) {
  const service = serviceBySlug(slug);
  return new URL(service.page, brand.site).toString();
}

export function whatsappLaneForService(serviceTitleOrSlug: string): WhatsAppLane {
  const key = serviceTitleOrSlug.toLowerCase();
  if (key.includes("game")) return "gameDevelopment";
  if (
    key.includes("website") ||
    key.includes("custom-software") ||
    key.includes("custom software") ||
    key.includes("software development")
  ) {
    return "softwareWeb";
  }
  // RDP, servers, networking, IT support, chat rooms, cloud/VPS, and any other IT work
  return "itInfrastructure";
}

export function whatsappContactForService(serviceTitleOrSlug: string) {
  const lane = whatsappLaneForService(serviceTitleOrSlug);
  return { lane, ...whatsappLanes[lane] };
}

export function whatsappUrlForService(serviceTitleOrSlug: string, prefill?: string) {
  const contact = whatsappContactForService(serviceTitleOrSlug);
  const text = encodeURIComponent(
    prefill || `Hello Bravioniyx Technologies, I would like to talk about ${serviceTitleOrSlug}.`,
  );
  return `https://wa.me/${contact.e164}?text=${text}`;
}

export function isQuoteCta(label: string) {
  return /quote/i.test(label);
}

export type GoalCta = {
  label: string;
  href: string;
  kind: "follow" | "quote" | "website" | "whatsapp" | "engage";
};

/** CTA by campaign goal — used on graphics, captions, and the bottom button. */
export function goalCtaFor(input: {
  goal: FunnelGoal;
  serviceTitle: string;
  serviceSlug: string;
  channel: Channel;
  day: number;
}): GoalCta {
  if (input.goal === "Followers") {
    return {
      label: "Follow Bravioniyx",
      href: brand.site,
      kind: "follow",
    };
  }
  if (input.goal === "Engagement") {
    return {
      label: "Comment your answer",
      href: serviceUrl(input.serviceSlug),
      kind: "engage",
    };
  }
  // Leads: rotate Get a Quote → Visit Website → Chat on WhatsApp
  const lane = (input.day - 1) % 3;
  if (lane === 0) {
    return {
      label: "Get a Quote",
      href: quoteUrl(input.channel, input.serviceSlug, input.day),
      kind: "quote",
    };
  }
  if (lane === 1) {
    return {
      label: "Visit Website",
      href: serviceUrl(input.serviceSlug),
      kind: "website",
    };
  }
  return {
    label: "Chat on WhatsApp",
    href: whatsappUrlForService(input.serviceTitle),
    kind: "whatsapp",
  };
}

export function connectionHint(platform: "Facebook" | "Instagram" | "LinkedIn") {
  if (platform === "Facebook") {
    return "Meta Business Suite → Page → Page ID + Page access token with pages_manage_posts.";
  }
  if (platform === "Instagram") {
    return "Instagram Business account linked to a Facebook Page. Use IG user ID + Page token with instagram_content_publish.";
  }
  return "LinkedIn Company Page org ID + access token with w_organization_social.";
}
