import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MARKETING_COOKIE, verifySessionToken } from "@/lib/auth";
import { runAssistantChat } from "@/lib/assistant/run";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(MARKETING_COOKIE)?.value)) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const history = (body.messages || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 8000) }));

  if (!history.length || history[history.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "Send a user message." }, { status: 400 });
  }

  try {
    const result = await runAssistantChat(history);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assistant failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
