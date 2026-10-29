import { NextRequest, NextResponse } from "next/server";
import { websiteUrl } from "@/lib/config";
import { recordCtaClick } from "@/lib/store";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const post = await recordCtaClick(id);
  const fallback = websiteUrl();
  const target = post?.destination || fallback;

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    url = new URL(fallback);
  }

  url.searchParams.set("mm_post", id);
  url.searchParams.set("mm_click", "1");
  if (post?.channel) url.searchParams.set("utm_source", post.channel.toLowerCase());
  if (!url.searchParams.get("utm_medium")) url.searchParams.set("utm_medium", "social");

  return NextResponse.redirect(url.toString(), 302);
}
