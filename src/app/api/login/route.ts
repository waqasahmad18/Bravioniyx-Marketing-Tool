import { NextResponse } from "next/server";
import { MARKETING_COOKIE, createSessionToken, credentialsMatch, sessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The form could not be read." }, { status: 400 });
  }
  if (!credentialsMatch(String(body.email ?? ""), String(body.password ?? ""))) {
    return NextResponse.json({ error: "Those details do not match." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MARKETING_COOKIE, createSessionToken(), sessionCookie);
  return response;
}
