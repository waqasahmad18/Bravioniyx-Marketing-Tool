import { services } from "@/lib/brand";

/** Ranking-oriented topics tied to real Bravioniyx services + current IT/software demand. */
const industryAngles = [
  "for small businesses in Pakistan",
  "cost, security, and uptime checklist",
  "mistakes that quietly kill productivity",
  "what to ask before you hire a vendor",
  "remote teams and reliable access",
  "2026 practical guide (no hype)",
  "when DIY stops being cheaper",
  "signs your setup is already failing",
];

const keywordBanks: Record<string, string[]> = {
  "custom-software-development": [
    "custom software development",
    "business web application",
    "workflow automation software",
    "SaaS product development",
    "replace spreadsheets with software",
  ],
  "website-development": [
    "business website design",
    "website development Pakistan",
    "mobile first business website",
    "website that converts leads",
    "ecommerce website development",
  ],
  "rdp-setup": [
    "RDP setup",
    "Windows remote desktop configuration",
    "secure RDP for teams",
    "remote desktop VPS",
    "fix RDP connection drops",
  ],
  "server-setup": [
    "server setup and management",
    "production server maintenance",
    "server deployment checklist",
    "Linux server management",
    "post go-live server support",
  ],
  networking: [
    "office network setup",
    "business networking solutions",
    "fix office WiFi drops",
    "IT infrastructure networking",
    "network troubleshooting business",
  ],
  "it-support": [
    "IT support for business",
    "remote technical assistance",
    "business IT troubleshooting",
    "managed IT support",
    "software support helpdesk",
  ],
  "chat-room-servers": [
    "chat room server setup",
    "community chat infrastructure",
    "chat server hosting",
    "uptime for chat communities",
    "deploy chat room servers",
  ],
  "cloud-vps": [
    "VPS setup",
    "cloud VPS configuration",
    "VPS migration",
    "cheap VPS vs configured VPS",
    "cloud server optimization",
  ],
  "game-development": [
    "Unity game development",
    "hire Unity developer",
    "playable Unity prototype",
    "indie game development services",
    "Unity gameplay systems",
  ],
};

export function serviceForDay(dayIndex = Date.now()) {
  const index = Math.abs(dayIndex) % services.length;
  return services[index];
}

export function topicForService(serviceSlug: string, salt = 0) {
  const service = services.find((s) => s.slug === serviceSlug) ?? services[0];
  const angle = industryAngles[Math.abs(salt) % industryAngles.length];
  const keywords = keywordBanks[service.slug] ?? ["IT services", "software solutions", "Bravioniyx"];
  const primary = keywords[Math.abs(salt) % keywords.length];
  const title = `${primary}: ${angle}`;
  return {
    service,
    title,
    primaryKeyword: primary,
    keywords: [...new Set([primary, ...keywords.slice(0, 4), "Bravioniyx Technologies"])],
    metaDescription: `${primary} — practical guidance for teams that need reliable ${service.line}. By Bravioniyx Technologies.`,
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
