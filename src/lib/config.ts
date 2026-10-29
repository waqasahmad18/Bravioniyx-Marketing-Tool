import { brand } from "@/lib/brand";

export function appUrl() {
  const raw = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  return raw.replace(/\/$/, "");
}

export function websiteUrl() {
  return (process.env.WEBSITE_URL || brand.site).replace(/\/$/, "");
}

export function cronSecret() {
  return process.env.CRON_SECRET || "";
}

/** Never expose localhost in public captions/posts. */
export function isPublicAppUrl(url: string) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".local");
  } catch {
    return false;
  }
}

/**
 * Internal click tracker — only used when APP_URL is a real public host (Vercel).
 * Captions and public CTAs always use website / WhatsApp links, never localhost.
 */
export function trackUrl(postId: string) {
  const base = appUrl();
  if (!base || !isPublicAppUrl(base)) return "";
  return `${base}/r/${postId}`;
}

export function publicWebLink(path = "/get-a-quote") {
  return new URL(path, `${websiteUrl()}/`).toString();
}
