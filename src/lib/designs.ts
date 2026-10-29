/**
 * Visual layouts stay inside Bravioniyx brand (black / white / #E10600)
 * but each day gets a different composition so the series never looks copy-pasted.
 */
export const designVariants = [
  "classic",
  "bold-left",
  "red-band",
  "minimal",
  "frame",
  "slash",
  "day-mark",
  "fact-card",
] as const;

export type DesignVariant = (typeof designVariants)[number];

const channelOffset: Record<string, number> = {
  Facebook: 0,
  Instagram: 3,
  LinkedIn: 5,
};

/** Pick a layout for this day + channel — consecutive days never share the same one. */
export function designForDay(day: number, channel: string, serviceSlug = ""): DesignVariant {
  const salt = [...serviceSlug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const offset = channelOffset[channel] ?? 0;
  // Step by 3 so day N and day N+1 never land on the same index for a channel
  const index = (salt + offset + (day - 1) * 3) % designVariants.length;
  return designVariants[index];
}

/** Prefer a design not already used in this campaign window. */
export function nextUnusedDesign(
  preferred: DesignVariant,
  used: Set<string>,
  day: number,
  channel: string,
  serviceSlug: string,
): DesignVariant {
  if (!used.has(preferred)) return preferred;
  for (let shift = 1; shift < designVariants.length; shift += 1) {
    const candidate = designForDay(day + shift, channel, `${serviceSlug}-${shift}`);
    if (!used.has(candidate)) return candidate;
  }
  // All used — pick the one least recently needed via day salt
  return designForDay(day + used.size, channel, serviceSlug);
}

export function normalizeCopy(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
