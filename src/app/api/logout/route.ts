import { NextResponse } from "next/server";
import { MARKETING_COOKIE, sessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MARKETING_COOKIE, "", { ...sessionCookie, maxAge: 0 });
  return response;
}
