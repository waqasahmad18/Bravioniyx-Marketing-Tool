"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const links = [
  { href: "/", label: "Today" },
  { href: "/blog", label: "Blogs" },
  { href: "/analytics", label: "Analytics" },
  { href: "/funnels", label: "Funnels" },
  { href: "/calendar", label: "Posts" },
  { href: "/connections", label: "Connections" },
  { href: "/leads", label: "Leads" },
];

export default function ShellNav() {
  const path = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <>
      <nav
        className={`-mx-0 flex gap-1.5 overflow-x-auto overscroll-x-contain px-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:px-4 md:grid md:gap-1 md:px-3 md:pb-4 [&::-webkit-scrollbar]:hidden ${
          pending ? "opacity-70" : ""
        }`}
      >
        {links.map((link) => {
          const active = path === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                startTransition(() => router.push(link.href));
              }}
              className={`inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] transition-colors sm:px-4 sm:text-sm ${
                active ? "bg-[#E10600] text-white" : "text-white/75 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      {pending ? (
        <div className="fixed left-0 right-0 top-0 z-[90] h-0.5 overflow-hidden bg-transparent">
          <div className="h-full w-1/3 animate-[lessaIn_0.8s_ease-in-out_infinite] bg-[#E10600]" />
        </div>
      ) : null}
    </>
  );
}
