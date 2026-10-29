"use client";

import GoalCta from "@/components/GoalCta";
import type { FunnelGoal } from "@/lib/types";

/** @deprecated Prefer GoalCta — kept as a thin wrapper for older imports. */
export default function WhatsAppCta({
  service,
  ctaLabel,
  href,
  goal = "Leads",
}: {
  service: string;
  ctaLabel?: string;
  href?: string;
  goal?: FunnelGoal;
}) {
  return (
    <GoalCta
      goal={goal}
      service={service}
      ctaLabel={ctaLabel || "Chat on WhatsApp"}
      href={href || `https://wa.me/923297320409`}
    />
  );
}
