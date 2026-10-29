"use client";

import { whatsappContactForService } from "@/lib/brand";
import type { FunnelGoal } from "@/lib/types";

/** Single post CTA (Facebook Ads style) — only one action per post. */
export default function GoalCta({
  goal,
  service,
  ctaLabel,
  href,
}: {
  goal: FunnelGoal;
  service: string;
  ctaLabel: string;
  href: string;
}) {
  const isWhatsApp = /whatsapp/i.test(ctaLabel) || href.includes("wa.me");
  const contact = isWhatsApp ? whatsappContactForService(service) : null;
  const className = isWhatsApp
    ? "inline-flex min-w-[180px] items-center justify-center bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-black hover:brightness-95"
    : goal === "Followers"
      ? "inline-flex min-w-[180px] items-center justify-center bg-black px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#E10600]"
      : "inline-flex min-w-[180px] items-center justify-center bg-[#E10600] px-6 py-3.5 text-sm font-semibold text-white hover:bg-black";

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        CTA under post · Ads Manager style
      </p>
      <a href={href} target="_blank" rel="noreferrer" className={`${className} w-full max-w-md`}>
        {ctaLabel}
      </a>
      <p className="mt-2 break-all text-xs text-neutral-500">
        {href}
        {contact ? ` · ${contact.local}` : null}
      </p>
    </div>
  );
}
