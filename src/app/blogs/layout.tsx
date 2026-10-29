import Link from "next/link";
import { brand } from "@/lib/brand";
import { websiteUrl } from "@/lib/config";

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/blogs" className="flex items-center gap-3">
            <img src="/logo.png" alt={brand.company} className="h-10 w-auto" />
            <div>
              <p className="text-sm font-semibold">{brand.company}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Blog</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-white/70">
            <a href={websiteUrl()} className="hover:text-white">
              Website
            </a>
            <a href={`${websiteUrl()}/get-a-quote`} className="bg-[#E10600] px-3 py-2 text-white hover:bg-white hover:text-black">
              Get a quote
            </a>
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-16 border-t border-white/10 py-8 text-center text-xs text-white/40">
        {brand.company} · {brand.tagline} · Authentic views only — no inflated stats
      </footer>
    </div>
  );
}
