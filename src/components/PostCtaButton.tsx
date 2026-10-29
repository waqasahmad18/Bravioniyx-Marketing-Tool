"use client";

import { brand } from "@/lib/brand";
import type { Post } from "@/lib/types";

/** Always-visible Ads Manager style CTA under the post (not on the graphic). */
export default function PostCtaButton({
  post,
  className = "",
}: {
  post: Post;
  className?: string;
}) {
  const label = (post.ctaLabel || (post.goal === "Followers" ? "Follow Bravioniyx" : "Visit Website")).trim();
  const href = (post.destination || post.link || brand.site).trim() || brand.site;
  const whatsapp = /whatsapp/i.test(label) || href.includes("wa.me");
  const follow = /follow/i.test(label);

  const btn =
    whatsapp
      ? "bg-[#25D366] text-black hover:brightness-95"
      : follow
        ? "bg-black text-white hover:bg-[#E10600]"
        : "bg-[#E10600] text-white hover:bg-black";

  return (
    <div className={`border-t border-neutral-200 bg-neutral-50 px-4 py-3 ${className}`}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
        CTA under post · Ads Manager style
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`flex w-full items-center justify-center px-4 py-3 text-sm font-semibold ${btn}`}
      >
        {label}
      </a>
      <p className="mt-2 break-all text-center text-[11px] text-neutral-500">{href}</p>
    </div>
  );
}
