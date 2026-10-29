import { services, channels, regions, funnelGoals, designVariantsHint } from "@/lib/assistant/catalog";
import { CORE_GUIDELINES } from "@/lib/assistant/guidelines";
import {
  approveFunnel,
  createFunnel,
  createManualPost,
  deleteFunnel,
  deletePost,
  getCustomGuidelines,
  getDashboardStats,
  getPost,
  getPostPerformance,
  listDueScheduledPosts,
  listFunnels,
  listLeads,
  listSafeConnections,
  markPosted,
  publishPost,
  rebuildTodayCampaign,
  runDailyAutomation,
  setAnalytics,
  setCustomGuidelines,
  summarizePosts,
  syncNetworkInsights,
  updatePostFields,
} from "@/lib/assistant/store";
import {
  deleteBlog,
  draftBlogFromAssistant,
  getBlogById,
  getBlogTotals,
  listBlogs,
  publishBlog,
  publishAllDraftBlogs,
  unpublishBlog,
  updateBlog,
} from "@/lib/blogs/store";
import { designVariants } from "@/lib/designs";
import type { Channel, FunnelGoal, PostStyle, Region } from "@/lib/brand";

export const openAiTools = [
  {
    type: "function" as const,
    function: {
      name: "get_guidelines",
      description: "Load core + custom guidelines.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_custom_guidelines",
      description: "Save operator rules the assistant must always follow.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string" },
          mode: { type: "string", enum: ["replace", "append"] },
        },
        required: ["text"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_services",
      description: "Bravioniyx website services catalog.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_funnels",
      description: "List campaigns/funnels.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_posts",
      description: "List posts with analytics preview. Filter by funnel, channel, status.",
      parameters: {
        type: "object",
        properties: {
          funnelId: { type: "string" },
          channel: { type: "string", enum: [...channels] },
          status: { type: "string", enum: ["draft", "scheduled", "posted", "failed"] },
          limit: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_post",
      description: "Full post details including caption and analytics.",
      parameters: {
        type: "object",
        properties: { postId: { type: "string" } },
        required: ["postId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_performance",
      description:
        "Reach, comments, likes, CTA clicks, engagement. Pass postId for one post, or omit for totals + top posts.",
      parameters: {
        type: "object",
        properties: { postId: { type: "string" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_stats",
      description: "Dashboard totals: posts, clicks, engagement, leads, followers.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_leads",
      description: "Website form leads synced into the manager.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_connections",
      description: "Connected social accounts (tokens hidden).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_due_posts",
      description: "Scheduled posts due for publish today (Karachi).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "check_post_guidelines",
      description: "Audit one post vs brand/organic guidelines.",
      parameters: {
        type: "object",
        properties: { postId: { type: "string" } },
        required: ["postId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_post",
      description: "Update post copy, design, links, status, or schedule (ISO datetime).",
      parameters: {
        type: "object",
        properties: {
          postId: { type: "string" },
          headline: { type: "string" },
          caption: { type: "string" },
          ctaLabel: { type: "string" },
          graphicTitle: { type: "string" },
          graphicLine: { type: "string" },
          designVariant: { type: "string", enum: [...designVariants] },
          link: { type: "string" },
          destination: { type: "string" },
          status: { type: "string", enum: ["draft", "scheduled", "posted", "failed"] },
          scheduledFor: { type: "string" },
        },
        required: ["postId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_post_analytics",
      description: "Manually set reach/comments/likes/etc when networks are not synced, or correct numbers.",
      parameters: {
        type: "object",
        properties: {
          postId: { type: "string" },
          reach: { type: "number" },
          impressions: { type: "number" },
          likes: { type: "number" },
          comments: { type: "number" },
          shares: { type: "number" },
          ctaClicks: { type: "number" },
          engagement: { type: "number" },
          followers: { type: "number" },
        },
        required: ["postId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_funnel",
      description: "Create multi-day campaign with unique daily designs + organic captions.",
      parameters: {
        type: "object",
        properties: {
          service: { type: "string" },
          region: { type: "string", enum: [...regions] },
          days: { type: "number" },
          channels: { type: "array", items: { type: "string", enum: [...channels] } },
          goal: { type: "string", enum: [...funnelGoals] },
          postStyle: { type: "string", enum: ["text", "fact", "cta"] },
        },
        required: ["service", "channels"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "approve_funnel",
      description: "Approve funnel — draft posts become scheduled.",
      parameters: {
        type: "object",
        properties: { funnelId: { type: "string" } },
        required: ["funnelId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_post",
      description: "Create one custom post.",
      parameters: {
        type: "object",
        properties: {
          funnelId: { type: "string" },
          service: { type: "string" },
          region: { type: "string", enum: [...regions] },
          channel: { type: "string", enum: [...channels] },
          day: { type: "number" },
          goal: { type: "string", enum: [...funnelGoals] },
          postStyle: { type: "string", enum: ["text", "fact", "cta"] },
          headline: { type: "string" },
          caption: { type: "string" },
          ctaLabel: { type: "string" },
          graphicTitle: { type: "string" },
          graphicLine: { type: "string" },
          designVariant: { type: "string", enum: [...designVariants] },
          link: { type: "string" },
          status: { type: "string", enum: ["draft", "scheduled"] },
        },
        required: ["service", "channel", "headline", "caption", "graphicTitle", "graphicLine"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_post",
      description: "Delete a post by id.",
      parameters: {
        type: "object",
        properties: { postId: { type: "string" } },
        required: ["postId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_funnel",
      description: "Delete a funnel and all its posts.",
      parameters: {
        type: "object",
        properties: { funnelId: { type: "string" } },
        required: ["funnelId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "publish_post",
      description: "Publish a scheduled post to the connected network now.",
      parameters: {
        type: "object",
        properties: { postId: { type: "string" } },
        required: ["postId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "mark_posted",
      description: "Mark a post as posted (manual publish).",
      parameters: {
        type: "object",
        properties: {
          postId: { type: "string" },
          externalId: { type: "string" },
        },
        required: ["postId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "sync_insights",
      description: "Pull reach/engagement from connected Facebook/Instagram where possible.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "run_daily",
      description:
        "Run intelligent daily automation: create today’s fresh creative funnel (new angle), publish due posts, sync insights, draft SEO blog.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generate_daily_pack",
      description:
        "Alias of run_daily — generate today’s new social creatives + blog draft now (same as cron).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "rebuild_today",
      description: "Rebuild today’s showcase campaign posts in the database.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_blogs",
      description: "List blog drafts/published posts with real view stats.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["draft", "published", "archived"] },
          limit: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_blog",
      description: "Get one blog by id (full body for review).",
      parameters: {
        type: "object",
        properties: { blogId: { type: "string" } },
        required: ["blogId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_blog_stats",
      description: "Authentic blog traffic totals (views/visitors/CTA) — never fake.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "draft_blog",
      description: "Write an SEO blog draft about a Bravioniyx service (user reviews before publish).",
      parameters: {
        type: "object",
        properties: {
          serviceSlug: { type: "string" },
          titleHint: { type: "string" },
          instructions: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_blog",
      description: "Edit blog title, body, SEO, cover image URL, keywords.",
      parameters: {
        type: "object",
        properties: {
          blogId: { type: "string" },
          title: { type: "string" },
          excerpt: { type: "string" },
          body: { type: "string" },
          coverImageUrl: { type: "string" },
          coverImageAlt: { type: "string" },
          metaTitle: { type: "string" },
          metaDescription: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
        },
        required: ["blogId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "publish_blog",
      description:
        "Publish one blog draft live on bravioniyx.com/blog/[slug]. Pass blogId (24-char) OR slug. Call this when the user asks to publish / go live / put on website.",
      parameters: {
        type: "object",
        properties: {
          blogId: { type: "string", description: "Mongo blog id or slug" },
          slug: { type: "string", description: "Blog slug if id unknown" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "publish_all_draft_blogs",
      description:
        "Publish ALL draft blogs live to the website. Use when user says publish all drafts / put blogs on website / make drafts live.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "unpublish_blog",
      description: "Take a live blog back to draft.",
      parameters: {
        type: "object",
        properties: { blogId: { type: "string" } },
        required: ["blogId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_blog",
      description: "Delete a blog permanently.",
      parameters: {
        type: "object",
        properties: { blogId: { type: "string" } },
        required: ["blogId"],
        additionalProperties: false,
      },
    },
  },
];

function auditPost(post: NonNullable<Awaited<ReturnType<typeof getPost>>>, custom: string) {
  const issues: string[] = [];
  const notes: string[] = [];
  if (/localhost|127\.0\.0\.1/i.test(post.caption + post.link + post.destination)) {
    issues.push("Contains localhost link — not allowed in public posts.");
  }
  if (post.channel === "WhatsApp") {
    issues.push("WhatsApp must not be a posting channel.");
  }
  if (post.caption.length < 80) {
    notes.push("Caption is quite short — stronger hook + reply prompt helps organic reach.");
  }
  const firstLine = post.caption.split("\n")[0] || "";
  if (/^https?:\/\//i.test(firstLine.trim()) || /^👉/.test(firstLine.trim())) {
    issues.push("Opens with link/hard CTA — hurts organic reach.");
  }
  if ((post.caption.match(/#/g) || []).length > 8) {
    issues.push("Too many hashtags — keep lean (about 3–5).");
  }
  if (!post.designVariant) notes.push("No designVariant (falls back to classic).");
  if (custom && /urdu|roman/i.test(custom) && !/[آ-ی]/.test(post.caption) && !/\b(hai|kya|ap)\b/i.test(post.caption)) {
    notes.push("Custom guidelines mention Urdu — caption appears English-only.");
  }
  return {
    postId: post.id,
    headline: post.headline,
    channel: post.channel,
    day: post.day,
    analytics: post.analytics,
    ok: issues.length === 0,
    issues,
    notes,
    designVariantsHint,
  };
}

export async function runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "get_guidelines": {
      const custom = await getCustomGuidelines();
      return { core: CORE_GUIDELINES, custom: custom || "(none yet)", designVariants: [...designVariants] };
    }
    case "set_custom_guidelines": {
      const saved = await setCustomGuidelines(String(args.text ?? ""), args.mode === "append" ? "append" : "replace");
      return { ok: true, customGuidelines: saved };
    }
    case "list_services":
      return services.map((s) => ({ title: s.title, slug: s.slug, group: s.group, page: s.page }));
    case "list_funnels":
      return listFunnels();
    case "list_posts":
      return summarizePosts({
        funnelId: args.funnelId ? String(args.funnelId) : undefined,
        channel: args.channel ? String(args.channel) : undefined,
        status: args.status ? String(args.status) : undefined,
        limit: args.limit ? Number(args.limit) : 25,
      });
    case "get_post":
      return (await getPost(String(args.postId ?? ""))) || { error: "Post not found." };
    case "get_performance":
      return getPostPerformance(args.postId ? String(args.postId) : undefined);
    case "get_stats":
      return getDashboardStats();
    case "list_leads":
      return listLeads();
    case "list_connections":
      return listSafeConnections();
    case "list_due_posts":
      return listDueScheduledPosts();
    case "check_post_guidelines": {
      const post = await getPost(String(args.postId ?? ""));
      if (!post) return { error: "Post not found." };
      return auditPost(post, await getCustomGuidelines());
    }
    case "update_post": {
      const { postId, ...fields } = args;
      return updatePostFields(String(postId), fields as Parameters<typeof updatePostFields>[1]);
    }
    case "set_post_analytics": {
      const { postId, ...analytics } = args;
      return setAnalytics(String(postId), analytics as Parameters<typeof setAnalytics>[1]);
    }
    case "create_funnel": {
      const selected = (Array.isArray(args.channels) ? args.channels.map(String) : []).filter((c): c is Channel =>
        (channels as readonly string[]).includes(c),
      );
      if (!selected.length) return { error: "Pick at least one channel." };
      const region = (regions as readonly string[]).includes(String(args.region))
        ? (String(args.region) as Region)
        : "Pakistan";
      const goal = (funnelGoals as readonly string[]).includes(String(args.goal))
        ? (String(args.goal) as FunnelGoal)
        : "Leads";
      const postStyle = (["text", "fact", "cta"] as PostStyle[]).includes(args.postStyle as PostStyle)
        ? (args.postStyle as PostStyle)
        : "cta";
      const funnelId = await createFunnel({
        service: String(args.service ?? ""),
        region,
        days: Number(args.days ?? 7),
        channels: selected,
        goal,
        postStyle,
      });
      return { ok: true, funnelId };
    }
    case "approve_funnel":
      await approveFunnel(String(args.funnelId ?? ""));
      return { ok: true };
    case "create_post": {
      const channel = String(args.channel) as Channel;
      if (!(channels as readonly string[]).includes(channel)) return { error: "Invalid channel." };
      return createManualPost({
        funnelId: args.funnelId ? String(args.funnelId) : undefined,
        service: String(args.service),
        region: args.region as Region | undefined,
        channel,
        day: args.day ? Number(args.day) : 1,
        goal: args.goal as FunnelGoal | undefined,
        postStyle: args.postStyle as PostStyle | undefined,
        headline: String(args.headline),
        caption: String(args.caption),
        ctaLabel: args.ctaLabel ? String(args.ctaLabel) : "",
        graphicTitle: String(args.graphicTitle),
        graphicLine: String(args.graphicLine),
        designVariant: args.designVariant ? String(args.designVariant) : "classic",
        link: args.link ? String(args.link) : undefined,
        status: args.status === "scheduled" ? "scheduled" : "draft",
      });
    }
    case "delete_post":
      return deletePost(String(args.postId ?? ""));
    case "delete_funnel":
      return deleteFunnel(String(args.funnelId ?? ""));
    case "publish_post":
      return publishPost(String(args.postId ?? ""));
    case "mark_posted":
      await markPosted(String(args.postId ?? ""), args.externalId ? String(args.externalId) : undefined);
      return { ok: true };
    case "sync_insights":
      return syncNetworkInsights();
    case "run_daily":
    case "generate_daily_pack":
      return runDailyAutomation();
    case "rebuild_today":
      return rebuildTodayCampaign();
    case "list_blogs":
      return listBlogs({
        status: args.status as "draft" | "published" | "archived" | undefined,
        limit: args.limit ? Number(args.limit) : 30,
      });
    case "get_blog":
      return (await getBlogById(String(args.blogId ?? ""))) || { error: "Blog not found." };
    case "get_blog_stats":
      return getBlogTotals();
    case "draft_blog":
      return {
        ok: true,
        blog: await draftBlogFromAssistant({
          serviceSlug: args.serviceSlug ? String(args.serviceSlug) : undefined,
          titleHint: args.titleHint ? String(args.titleHint) : undefined,
          instructions: args.instructions ? String(args.instructions) : undefined,
        }),
      };
    case "update_blog": {
      const { blogId, keywords, ...rest } = args;
      return updateBlog(String(blogId), {
        ...(rest as Parameters<typeof updateBlog>[1]),
        keywords: Array.isArray(keywords) ? keywords.map(String) : undefined,
      });
    }
    case "publish_blog":
      return publishBlog(String(args.blogId ?? args.id ?? args.slug ?? ""));
    case "publish_all_draft_blogs":
      return publishAllDraftBlogs(Number(args.limit ?? 20));
    case "unpublish_blog":
      return unpublishBlog(String(args.blogId ?? args.id ?? args.slug ?? ""));
    case "delete_blog":
      return deleteBlog(String(args.blogId ?? ""));
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
