export type Lead = {
  email: string;
  name: string;
  service: string;
  page: string;
  source: string;
  savedAt: string;
};

export type FunnelGoal = "Leads" | "Followers" | "Engagement";
export type PostStyle = "text" | "fact" | "cta";

export type Funnel = {
  id: string;
  name: string;
  service: string;
  region: string;
  days: number;
  channels: string[];
  goal: FunnelGoal;
  postStyle: PostStyle;
  status: "draft" | "approved";
  createdAt: string;
};

export type PostAnalytics = {
  ctaClicks: number;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  followers: number;
  lastSyncedAt?: string;
};

export type Post = {
  id: string;
  funnelId: string;
  service: string;
  region: string;
  day: number;
  channel: string;
  stage: string;
  goal: FunnelGoal;
  postStyle: PostStyle;
  /** Daily layout variant — keeps series visually distinct inside brand colors */
  designVariant: string;
  headline: string;
  caption: string;
  ctaLabel: string;
  graphicTitle: string;
  graphicLine: string;
  bullets: string[];
  /** Tracking link used in captions (/r/:id) — counts CTA clicks */
  link: string;
  /** Final website / WhatsApp destination after click */
  destination: string;
  scheduledFor: string;
  status: "draft" | "scheduled" | "posted" | "failed";
  publishError?: string;
  externalId?: string;
  postedAt?: string;
  analytics: PostAnalytics;
};

export type SocialPlatform = "Facebook" | "Instagram" | "LinkedIn";

export type Connection = {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  accountId: string;
  token: string;
  status: "connected" | "disconnected";
  updatedAt: string;
  followers?: number;
};

export type DashboardStats = {
  totalPosts: number;
  scheduled: number;
  posted: number;
  failed: number;
  ctaClicks: number;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  followers: number;
  websiteLeads: number;
  /** Authentic blog metrics (zeros = no traffic yet, never invented) */
  blogPublished: number;
  blogViews: number;
  blogVisitors: number;
  blogCtaClicks: number;
};
