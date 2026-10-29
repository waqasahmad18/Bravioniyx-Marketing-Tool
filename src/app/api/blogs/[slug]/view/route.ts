import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { recordBlogView } from "@/lib/blogs/store";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ua = request.headers.get("user-agent") || "";
  const visitorKey = createHash("sha256").update(`${ip}|${ua}|${slug}`).digest("hex").slice(0, 32);
  const blog = await recordBlogView(slug, visitorKey);
  if (!blog) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({
    ok: true,
    views: blog.stats.views,
    visitors: blog.stats.visitors,
  });
}
