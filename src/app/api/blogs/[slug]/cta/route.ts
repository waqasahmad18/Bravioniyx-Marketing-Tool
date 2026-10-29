import { NextRequest, NextResponse } from "next/server";
import { recordBlogCtaClick } from "@/lib/blogs/store";
import { websiteUrl } from "@/lib/config";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  await recordBlogCtaClick(slug);
  const to = request.nextUrl.searchParams.get("to") || websiteUrl();
  let dest = websiteUrl();
  try {
    const url = new URL(to);
    if (url.protocol === "http:" || url.protocol === "https:") dest = url.toString();
  } catch {
    /* keep website */
  }
  return NextResponse.redirect(dest);
}
