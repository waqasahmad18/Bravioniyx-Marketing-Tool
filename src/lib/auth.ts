import { createHmac, timingSafeEqual } from "crypto";

export const MARKETING_COOKIE = "bravioniyx_mm";
const SESSION_MS = 1000 * 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function credentialsMatch(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword || !secret()) return false;
  return safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) && safeEqual(password, expectedPassword);
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_MS })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !secret()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export const sessionCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MS / 1000,
};
