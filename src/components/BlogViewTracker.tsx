"use client";

import { useEffect } from "react";

/** Fires one authentic view ping per browser session for this slug. */
export default function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `bx_blog_hit_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch(`/api/blogs/${encodeURIComponent(slug)}/view`, { method: "POST", credentials: "same-origin" });
  }, [slug]);
  return null;
}
