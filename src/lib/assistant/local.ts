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

  // Publish BEFORE list — “publish blogs / website pe daal do” must go live, not only list drafts
  if (
    /publish\s+all\s+blog|publish\s+all\s+draft|publish.*drafts|all\s+drafts?\s+live|website.*(publish|blog)|publish.*(website|live)|blogs?\s+(ko\s+)?(publish|live)|publish\s+blog/i.test(
      text,
    )
  ) {
    const idMatch = userText.match(/[a-f0-9]{24}/i);
    const slugMatch = userText.match(/\b([a-z0-9][a-z0-9-]{8,})\b/i);
    if (/all|drafts|saari|sari|sab/i.test(text) && !idMatch) {
      const result = await call("publish_all_draft_blogs", { limit: 20 });
      return {
        reply: `Published draft blogs live on bravioniyx.com/blog:\n${JSON.stringify(result, null, 2)}`,
        actions,
      };
    }
    if (idMatch) {
      const result = await call("publish_blog", { blogId: idMatch[0] });
      return {
        reply: `Publish result:\n${JSON.stringify(result, null, 2)}\nLive on https://www.bravioniyx.com/blog/…`,
        actions,
      };
    }
    if (slugMatch && !/publish|blog|draft|website|live|all/i.test(slugMatch[1])) {
      // unlikely — fall through
    }
    // No id: publish all current drafts (operator asked to put blogs on website)
    const result = await call("publish_all_draft_blogs", { limit: 20 });
    return {
      reply: `No specific id given — published all drafts live:\n${JSON.stringify(result, null, 2)}`,
      actions,
    };
  }

  if (/list.*blog|blog.*list|show.*draft.*blog|blogs\?/i.test(text)) {
    const blogs = await call("list_blogs", { limit: 15 });
    return {
      reply: `Here are the latest blogs:\n${JSON.stringify(blogs, null, 2)}\n\nSay “publish all drafts” or “publish blog <id>” to go live on bravioniyx.com/blog.`,
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
