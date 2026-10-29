import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cronSecret } from "@/lib/config";
import { MARKETING_COOKIE, verifySessionToken } from "@/lib/auth";
import { rebuildTodayCampaign } from "@/lib/rebuild";

async function allowed(request: NextRequest) {
  const jar = await cookies();
  if (verifySessionToken(jar.get(MARKETING_COOKIE)?.value)) return true;
  const secret = cronSecret();
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = request.nextUrl.searchParams.get("secret") || "";
  return Boolean(secret && (bearer === secret || query === secret));
}

export async function POST(request: NextRequest) {
  if (!(await allowed(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const result = await rebuildTodayCampaign();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
