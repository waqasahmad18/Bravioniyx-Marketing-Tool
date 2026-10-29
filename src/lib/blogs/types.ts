export type BlogStatus = "draft" | "published" | "archived";

export type BlogStats = {
  /** Real page views counted on /blogs/[slug] — never invented */
  views: number;
  /** Unique-ish visitors (cookie-debounced) */
  visitors: number;
  /** Clicks on in-article CTAs / service links */
  ctaClicks: number;
  lastViewAt?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** HTML or markdown-ish plain paragraphs joined with \n\n */
  body: string;
  coverImageUrl: string;
  coverImageAlt: string;
  serviceSlug: string;
  serviceTitle: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  status: BlogStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: "assistant" | "cron" | "staff";
  stats: BlogStats;
};
