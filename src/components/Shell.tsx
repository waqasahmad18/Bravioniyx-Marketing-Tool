"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShellNav from "@/components/ShellNav";

const AssistantChat = dynamic(() => import("@/components/AssistantChat"), {
  ssr: false,
  loading: () => null,
});

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const signOut = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-40 border-b border-white/10 bg-black text-white md:min-h-dvh md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 md:block md:px-5 md:py-5">
          <Link href="/" prefetch className="inline-block min-h-0 shrink">
            <img
              src="/logo.png"
              alt="Bravioniyx Technologies"
              className="h-9 w-auto max-w-[140px] object-contain sm:h-11 sm:max-w-[180px] md:h-12"
            />
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 px-2 text-[11px] uppercase tracking-[0.14em] text-white/70 md:mt-8 md:block md:px-0"
          >
            Sign out
          </button>
        </div>
        <ShellNav />
        <p className="hidden px-5 pb-6 text-[10px] uppercase tracking-[0.18em] text-white/40 md:block">
          Website services · Creative ads · Auto-post
        </p>
      </aside>
      <main className="px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-7 md:px-8 md:pb-28 lg:px-10">
        {children}
      </main>
      <AssistantChat />
    </div>
  );
}
