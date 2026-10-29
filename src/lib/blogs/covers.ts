import { appUrl } from "@/lib/config";

/**
 * Stable cover photos per service (Unsplash direct images).
 * Used when assistant drafts leave coverImageUrl empty.
 */
const SERVICE_COVERS: Record<string, string> = {
  "custom-software-development":
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&h=630&q=80",
  "website-development":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80",
  "rdp-setup":
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=630&q=80",
  "server-setup":
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=630&q=80",
  networking:
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a2?auto=format&fit=crop&w=1200&h=630&q=80",
  "it-support":
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&h=630&q=80",
  "chat-room-servers":
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&h=630&q=80",
  "cloud-vps":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=630&q=80",
  "game-development":
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&h=630&q=80",
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=630&q=80";

export function coverImageForService(serviceSlug?: string) {
  const key = String(serviceSlug || "").trim();
  return SERVICE_COVERS[key] || DEFAULT_COVER;
}

/** Prefer stored URL; otherwise service stock cover (absolute). */
export function resolveCoverImageUrl(input: { coverImageUrl?: string; serviceSlug?: string }) {
  const stored = String(input.coverImageUrl || "").trim();
  if (stored) return stored;
  return coverImageForService(input.serviceSlug);
}

/** Branded SVG cover hosted on this app (fallback if stock blocked). */
export function brandedCoverPath(serviceSlug?: string) {
  const base = appUrl() || "https://bravioniyx-marketing-tool.vercel.app";
  const slug = encodeURIComponent(serviceSlug || "bravioniyx");
  return `${base.replace(/\/$/, "")}/api/public/blog-cover?service=${slug}`;
}
