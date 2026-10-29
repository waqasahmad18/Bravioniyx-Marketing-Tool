import { CORE_GUIDELINES } from "@/lib/assistant/guidelines";
import { chatCompletion, isLlmUnavailable } from "@/lib/assistant/llm";
import { runLocalAssistant } from "@/lib/assistant/local";
import { getCustomGuidelines } from "@/lib/assistant/store";
import { runTool } from "@/lib/assistant/tools";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
};

export async function runAssistantChat(history: Array<{ role: "user" | "assistant"; content: string }>) {
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content || "";

  try {
    return await runLlmLoop(history);
  } catch (error) {
    if (isLlmUnavailable(error)) {
      return runLocalAssistant(lastUser);
    }
    throw error;
  }
}

async function runLlmLoop(history: Array<{ role: "user" | "assistant"; content: string }>) {
  const custom = await getCustomGuidelines();
  const system: ChatMessage = {
    role: "system",
    content: `${CORE_GUIDELINES}

Custom guidelines from the operator (must follow):
${custom || "(none yet — if they give new rules, call set_custom_guidelines)"}

You are Lessa. Control the entire Marketing Manager through tools (posts, blogs, funnels, analytics/reach/comments, leads, publish, sync, daily run).
Always use professional English in every reply.
For any question about numbers — call get_performance / get_stats / get_post / get_blog_stats first.
For any change request — apply it with tools, then confirm briefly as Lessa.`,
  };

  const messages: ChatMessage[] = [
    system,
    ...history.slice(-24).map((m) => ({ role: m.role, content: m.content })),
  ];

  const actions: Array<{ tool: string; ok: boolean; summary: string }> = [];
  let reply = "";

  for (let step = 0; step < 12; step += 1) {
    const message = await chatCompletion(messages);
    messages.push({
      role: "assistant",
      content: message.content ?? null,
      tool_calls: message.tool_calls,
    });

    if (!message.tool_calls?.length) {
      reply = message.content?.trim() || "Done.";
      break;
    }

    for (const call of message.tool_calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      let result: unknown;
      try {
        result = await runTool(call.function.name, args);
        actions.push({
          tool: call.function.name,
          ok: true,
          summary: summarizeAction(call.function.name, result),
        });
      } catch (error) {
        result = { error: error instanceof Error ? error.message : "Tool failed." };
        actions.push({
          tool: call.function.name,
          ok: false,
          summary: String((result as { error: string }).error),
        });
      }
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result).slice(0, 12000),
      });
    }
  }

  if (!reply) {
    reply = actions.length
      ? "Changes applied. Check Posts / Funnels / Blogs — refresh if needed."
      : "I could not complete that. Try again with a clearer request.";
  }

  return { reply, actions };
}

function summarizeAction(tool: string, result: unknown) {
  const r = result as Record<string, unknown>;
  if (r?.error) return String(r.error);
  if (tool === "create_funnel") return `Created funnel ${r.funnelId}`;
  if (tool === "create_post") {
    const post = r.post as { id?: string } | undefined;
    return post?.id ? `Created post ${post.id}` : "Created post";
  }
  if (tool === "update_post") return r.ok ? `Updated post` : String(r.error || "Update failed");
  if (tool === "set_custom_guidelines") return "Saved custom guidelines";
  if (tool === "approve_funnel") return "Funnel approved / posts scheduled";
  if (tool === "check_post_guidelines") {
    return r.ok ? "Post passes guidelines" : `Issues: ${JSON.stringify(r.issues)}`;
  }
  if (tool === "get_performance") return "Fetched reach / comments / engagement";
  if (tool === "publish_post") return r.ok === false ? String(r.error || "Publish failed") : "Published";
  if (tool === "delete_post" || tool === "delete_funnel") return r.ok ? "Deleted" : String(r.error || "Delete failed");
  if (tool === "sync_insights" || tool === "run_daily" || tool === "rebuild_today") return `${tool} finished`;
  if (tool === "set_post_analytics") return r.ok ? "Analytics updated" : String(r.error || "Failed");
  if (tool === "draft_blog") return "SEO blog draft created";
  if (tool === "publish_blog") return r.ok ? "Blog published live" : String(r.error || "Publish failed");
  if (tool === "update_blog") return r.ok ? "Blog updated" : String(r.error || "Update failed");
  if (tool === "get_blog_stats") return "Fetched authentic blog traffic";
  return `${tool} ok`;
}
