import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { MARKETING_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function LoginPage() {
  const jar = await cookies();
  if (verifySessionToken(jar.get(MARKETING_COOKIE)?.value)) redirect("/");

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2">
        <div>
          <img src="/logo.png" alt="Bravioniyx Technologies" className="h-11 w-auto sm:h-14" />
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#E10600] sm:mt-8 sm:text-xs sm:tracking-[0.32em]">
            Bravioniyx Marketing Manager
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
            Creative funnels and the daily posts.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/70 sm:mt-5 sm:text-base">
            Plan a service campaign, approve it, then work through each day’s post. Leads from the website sit in the same place.
          </p>
        </div>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
