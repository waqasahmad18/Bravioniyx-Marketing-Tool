"use client";

import { useState } from "react";
import { captionForManualPost } from "@/lib/organic";

export default function CopyCaption({
  text,
  ctaLabel,
  href,
  variant = "button",
}: {
  text: string;
  ctaLabel?: string;
  href?: string;
  /** `button` = solid mobile-friendly control; `link` = compact text style */
  variant?: "button" | "link" | "dark";
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const onCopy = async () => {
    setError(false);
    const payload = captionForManualPost({ caption: text, ctaLabel, href });
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const ta = document.createElement("textarea");
        ta.value = payload;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      setError(true);
      window.setTimeout(() => setError(false), 2500);
    }
  };

  const label = error ? "Copy failed" : done ? "Copied ✓" : "Copy caption";

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={onCopy}
        className="min-h-10 text-xs font-semibold uppercase tracking-[0.14em] text-[#E10600]"
      >
        {label}
      </button>
    );
  }

  if (variant === "dark") {
    return (
      <button
        type="button"
        onClick={onCopy}
        className="min-h-11 rounded-sm border border-white/40 bg-white/10 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="min-h-10 border border-[#E10600] bg-[#E10600] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
    >
      {label}
    </button>
  );
}
