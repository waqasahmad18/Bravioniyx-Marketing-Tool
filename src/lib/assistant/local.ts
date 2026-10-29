import { runTool } from "@/lib/assistant/tools";

/**
 * Free offline fallback when OpenAI/Groq credits are unavailable.
 * Handles common operator requests via tools — no paid API required.
 */
export async function runLocalAssistant(userText: string) {
  const text = userText.toLowerCase();
  const actions: Array<{ tool: string; ok: boolean; summary: string }> = [];

  const call = async (tool: string, args: Record<string, unknown> = {}) => {
    try {
      const result = await runTool(tool, args);
      const ok = !(result as { error?: string })?.error && (result as { ok?: boolean }).ok !== false;
      actions.push({
        tool,
        ok,
        summary: JSON.stringify(result).slice(0, 180),
      });
      return result;
    } catch (error) {
      actions.push({
        tool,
        ok: false,
        summary: error instanceof Error ? error.message : "Failed",
      });
      return { error: "failed" };
    }
  };

  if (/blog.*(stat|view|traffic)|view.*blog/i.test(text)) {
    const stats = await call("get_blog_stats");
    return {
      reply: `Blog traffic (authentic):\n${JSON.stringify(stats, null, 2)}\n\nNote: AI chat is on free/local mode — add a free Groq key for fuller conversation.`,
      actions,
    };
  }

  if (/list.*blog|blog.*list|draft.*blog|blogs\?/i.test(text)) {
    const blogs = await call("list_blogs", { limit: 15 });
    return {
      reply: `Here are the latest blogs:\n${JSON.stringify(blogs, null, 2)}\n\nSay “publish blog <id>” after you review a draft.`,
      actions,
    };
  }

  if (/publish\s+blog|publish.*blog/i.test(text)) {
    const idMatch = text.match(/[a-f0-9]{24}/i);
    if (!idMatch) {
      const drafts = await call("list_blogs", { status: "draft", limit: 10 });
      return {
        reply: `Tell me the blog id to publish. Drafts:\n${JSON.stringify(drafts, null, 2)}`,
        actions,
      };
    }
    const result = await call("publish_blog", { blogId: idMatch[0] });
    return {
      reply: `Publish result:\n${JSON.stringify(result, null, 2)}\nIt will appear on the website /blog page.`,
      actions,
    };
  }

  if (/daily|generate.*(post|funnel|pack|creative)|new (posts|funnel|campaign)/i.test(text)) {
    const result = await call("run_daily");
    return {
      reply: `Daily intelligent pack:\n${JSON.stringify(result, null, 2)}\n\nFresh funnel creatives are scheduled; blog draft is ready under Blogs — publish when you approve.`,
      actions,
    };
  }

  if (/write.*blog|draft.*blog|blog.*rdp|seo blog|create.*blog|generate.*blog/i.test(text)) {
    let serviceSlug = "rdp-setup";
    if (/website/i.test(text)) serviceSlug = "website-development";
    else if (/software/i.test(text)) serviceSlug = "custom-software-development";
    else if (/server/i.test(text)) serviceSlug = "server-setup";
    else if (/network/i.test(text)) serviceSlug = "networking";
    else if (/cloud|vps/i.test(text)) serviceSlug = "cloud-vps";
    else if (/game|unity/i.test(text)) serviceSlug = "game-development";
    else if (/support/i.test(text)) serviceSlug = "it-support";
    const blog = await call("draft_blog", { serviceSlug, titleHint: userText.slice(0, 120) });
    return {
      reply: `SEO blog draft created (template/free mode — no OpenAI credits used):\n${JSON.stringify(blog, null, 2)}\nReview it under Blogs, then ask me to publish.`,
      actions,
    };
  }

  if (/reach|comment|cta click|performance|stats|analytics/i.test(text)) {
    const [stats, perf] = await Promise.all([call("get_stats"), call("get_performance")]);
    return {
      reply: `Dashboard stats:\n${JSON.stringify(stats, null, 2)}\n\nTop performance:\n${JSON.stringify(perf, null, 2)}`,
      actions,
    };
  }

  if (/list.*post|show.*post|posts\?/i.test(text)) {
    const posts = await call("list_posts", { limit: 15 });
    return {
      reply: `Recent posts:\n${JSON.stringify(posts, null, 2)}`,
      actions,
    };
  }

  if (/funnel/i.test(text) && /list|show/i.test(text)) {
    const funnels = await call("list_funnels");
    return {
      reply: `Funnels:\n${JSON.stringify(funnels, null, 2)}`,
      actions,
    };
  }

  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());

  if (/about (this )?tool|what (can|do) you|help|who are you|tell me about/i.test(text)) {
    return {
      reply: `Hi, I am Lessa — Bravioniyx Marketing Manager assistant.\n\nI can:\n• List/create posts and funnels\n• Draft/publish SEO blogs (appear on bravioniyx.com/blog)\n• Report authentic reach, comments, CTA clicks, blog views\n• Publish due posts / sync insights when connected\n\n${
        hasGroq
          ? "Groq is configured. If chat fell back to command mode, restart the dev server so the key loads, then try again."
          : "Add a free Groq key at https://console.groq.com/keys → GROQ_API_KEY in .env.local → restart."
      }`,
      actions,
    };
  }

  return {
    reply: hasGroq
      ? `Command mode is active (LLM call failed). Groq key is present — restart the Next.js server if you just added it, then chat again.\n\nMeanwhile try:\n• “list blogs”\n• “draft an SEO blog on RDP”\n• “show reach and comments”\n• “publish blog <id>”`
      : `I'm in command mode (no LLM credits).\n\nTry:\n• “list blogs”\n• “draft an SEO blog on RDP”\n• “show reach and comments”\n• “publish blog <id>”\n\nFree smarter chat: https://console.groq.com/keys → set GROQ_API_KEY → restart.`,
    actions,
  };
}
