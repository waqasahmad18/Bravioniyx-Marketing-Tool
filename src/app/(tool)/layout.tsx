import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { MARKETING_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function ToolLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(MARKETING_COOKIE)?.value)) redirect("/login");
  return <Shell>{children}</Shell>;
}
