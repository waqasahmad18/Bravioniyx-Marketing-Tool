import { NextRequest, NextResponse } from "next/server";
import { cronSecret } from "@/lib/config";
import { runDailyAutomation } from "@/lib/daily";

function authorized(request: NextRequest) {
  const secret = cronSecret();
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = request.nextUrl.searchParams.get("secret") || "";
  const vercelCron = request.headers.get("x-vercel-cron") === "1";
  if (secret && (bearer === secret || query === secret)) return true;
  // Vercel invokes crons with this header; still prefer CRON_SECRET in production.
  if (vercelCron && process.env.VERCEL === "1") return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized cron call." }, { status: 401 });
  }
  const result = await runDailyAutomation();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
