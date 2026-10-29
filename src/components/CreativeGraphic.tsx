"use client";

import { brand } from "@/lib/brand";
import type { DesignVariant } from "@/lib/designs";

type Props = {
  channel: string;
  title: string;
  line: string;
  ctaLabel?: string;
  bullets?: string[];
  variant?: DesignVariant | string;
  day?: number;
};

const RED = "#E10600";

export default function CreativeGraphic({
  channel,
  title,
  line,
  bullets = [],
  variant = "classic",
  day = 1,
}: Props) {
  const tall = channel === "WhatsApp";
  const lines = title.split("\n");
  const shell = `relative overflow-hidden text-white ${tall ? "aspect-[9/16] max-h-[440px]" : "aspect-square max-h-[380px]"} w-full`;
  // No Follow/CTA button on the graphic — CTA sits under the post (Ads Manager style)
  const ctaFooter = (
    <p className="mt-auto text-[10px] uppercase tracking-[0.22em] text-white/45">www.bravioniyx.com</p>
  );

  const grid = (
    <div
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />
  );

  const logo = (
    <div className="flex items-center gap-3">
      <img src="/logo.png" alt="" className={`${tall ? "h-11" : "h-9"} w-auto`} />
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/50">{brand.company}</p>
        <p className="text-[9px] tracking-[0.12em] text-white/35">{brand.tagline}</p>
      </div>
    </div>
  );

  const headline = (
    <h3 className={`font-semibold leading-[1.12] tracking-tight ${tall ? "text-[1.6rem]" : "text-[1.3rem]"}`}>
      {lines.map((part) => (
        <span key={part} className="block">
          {part}
        </span>
      ))}
    </h3>
  );

  if (variant === "bold-left") {
    return (
      <div className={shell} style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#141414 100%)" }}>
        {grid}
        <div className="absolute bottom-0 left-0 top-0 w-1.5" style={{ background: RED }} />
        <div className={`relative flex h-full flex-col justify-between ${tall ? "p-7" : "p-6"}`}>
          {logo}
          <div className="max-w-[92%]">
            {headline}
            <p className="mt-4 text-sm leading-relaxed text-white/75">{line}</p>
          </div>
          {ctaFooter}
        </div>
      </div>
    );
  }

  if (variant === "red-band") {
    return (
      <div className={`${shell} flex flex-col`} style={{ background: "#0a0a0a" }}>
        <div className="px-5 py-3" style={{ background: RED }}>
          <div className="flex items-center justify-between gap-3">
            <img src="/logo.png" alt="" className="h-8 w-auto brightness-0 invert" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">Day {day}</p>
          </div>
        </div>
        <div className={`flex flex-1 flex-col justify-center ${tall ? "px-7 py-8" : "px-6 py-6"}`}>
          {headline}
          <p className="mt-4 text-sm leading-relaxed text-white/78">{line}</p>
          {bullets.length > 0 ? (
            <ul className="mt-4 space-y-1 text-sm text-white/70">
              {bullets.slice(0, 2).map((item) => (
                <li key={item}>▸ {item}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="px-6 pb-5">{ctaFooter}</div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={shell} style={{ background: "#080808" }}>
        <div className={`relative flex h-full flex-col ${tall ? "p-8" : "p-7"}`}>
          <img src="/logo.png" alt="" className="h-8 w-auto opacity-90" />
          <div className="flex flex-1 flex-col justify-end pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: RED }}>
              Bravioniyx
            </p>
            <div className="mt-3">{headline}</div>
            <p className="mt-4 max-w-[90%] text-sm leading-relaxed text-white/70">{line}</p>
            <div className="mt-5">{ctaFooter}</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "frame") {
    return (
      <div className={shell} style={{ background: "radial-gradient(circle at top,#1a1a1a,#070707 70%)" }}>
        <div className="absolute inset-5 border border-white/20" />
        <div className="absolute left-5 top-5 h-8 w-8 border-l-2 border-t-2" style={{ borderColor: RED }} />
        <div className="absolute bottom-5 right-5 h-8 w-8 border-b-2 border-r-2" style={{ borderColor: RED }} />
        <div className={`relative flex h-full flex-col items-center justify-center text-center ${tall ? "px-8" : "px-7"}`}>
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">{brand.company}</p>
          <div className="mt-5">{headline}</div>
          <p className="mt-4 text-sm leading-relaxed text-white/75">{line}</p>
          <div className="mt-6">{ctaFooter}</div>
        </div>
      </div>
    );
  }

  if (variant === "slash") {
    return (
      <div className={shell} style={{ background: "#0b0b0b" }}>
        <div
          className="pointer-events-none absolute -right-10 top-0 h-full w-24 rotate-12 opacity-90"
          style={{ background: RED }}
        />
        <div className={`relative z-10 flex h-full flex-col justify-between ${tall ? "p-7" : "p-6"}`}>
          {logo}
          <div>
            {headline}
            <p className="mt-4 max-w-[80%] text-sm leading-relaxed text-white/78">{line}</p>
          </div>
          {ctaFooter}
        </div>
      </div>
    );
  }

  if (variant === "day-mark") {
    return (
      <div className={shell} style={{ background: "linear-gradient(160deg,#111 0%,#050505 100%)" }}>
        {grid}
        <p
          className="pointer-events-none absolute -right-2 top-6 text-[7rem] font-black leading-none text-white/[0.06]"
          aria-hidden
        >
          {String(day).padStart(2, "0")}
        </p>
        <div className={`relative flex h-full flex-col justify-between ${tall ? "p-7" : "p-6"}`}>
          {logo}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: RED }}>
              Series day {day}
            </p>
            <div className="mt-3">{headline}</div>
            <p className="mt-4 text-sm leading-relaxed text-white/78">{line}</p>
          </div>
          {ctaFooter}
        </div>
      </div>
    );
  }

  if (variant === "fact-card") {
    return (
      <div className={shell} style={{ background: "#0a0a0a" }}>
        <div className={`relative flex h-full flex-col ${tall ? "p-7" : "p-6"}`}>
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="" className="h-8 w-auto" />
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white" style={{ background: RED }}>
              Fact
            </span>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Worth knowing</p>
            <p className={`mt-3 font-semibold leading-snug ${tall ? "text-xl" : "text-lg"}`}>{line}</p>
          </div>
          {ctaFooter}
        </div>
      </div>
    );
  }

  // classic
  return (
    <div
      className={shell}
      style={{
        background:
          "radial-gradient(ellipse 85% 55% at 50% 0%, rgba(225,6,0,0.28), transparent 50%), linear-gradient(168deg,#090909 0%,#121212 48%,#050505 100%)",
      }}
    >
      {grid}
      <div className="absolute inset-4 border border-white/12" />
      <div className="absolute left-4 top-4 h-1 w-14" style={{ background: RED }} />
      <div className="absolute bottom-4 right-4 h-1 w-14" style={{ background: RED }} />
      <div className={`relative flex h-full flex-col ${tall ? "px-7 py-8" : "px-6 py-6"}`}>
        {logo}
        <div className="flex flex-1 flex-col justify-center py-5">
          {headline}
          <p className={`mt-4 max-w-[95%] leading-relaxed text-white/78 ${tall ? "text-[0.95rem]" : "text-sm"}`}>{line}</p>
        </div>
        {ctaFooter}
      </div>
    </div>
  );
}
