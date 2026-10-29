"use client";

import { useState } from "react";
import { captionForManualPost } from "@/lib/organic";

export default function CopyCaption({
  text,
  ctaLabel,
  href,
}: {
  text: string;
  ctaLabel?: string;
  href?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const payload = captionForManualPost({ caption: text, ctaLabel, href });
        await navigator.clipboard.writeText(payload);
        setDone(true);
      }}
      className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E10600]"
    >
      {done ? "Copied" : "Copy caption"}
    </button>
  );
}
