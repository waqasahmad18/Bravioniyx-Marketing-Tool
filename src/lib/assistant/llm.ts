import { openAiTools } from "@/lib/assistant/tools";

export type LlmMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
};

function openaiKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

function groqKey() {
  return process.env.GROQ_API_KEY?.trim() || "";
}

function openaiModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

function groqModel() {
  return process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b";
}

async function callChatApi(input: {
  url: string;
  key: string;
  model: string;
  messages: LlmMessage[];
  withTools: boolean;
}) {
  const res = await fetch(input.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.4,
      messages: input.messages,
      ...(input.withTools ? { tools: openAiTools, tool_choice: "auto" } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = String(data?.error?.message || `API error (${res.status})`);
    const err = new Error(msg) as Error & { code?: string; provider?: string };
    if (/credit|quota|billing|insufficient/i.test(msg)) err.code = "NO_CREDITS";
    throw err;
  }
  return data.choices?.[0]?.message as LlmMessage;
}

/**
 * Prefer Groq when GROQ_API_KEY is set (do NOT fall through to a dead OpenAI account).
 * OpenAI only used when Groq is not configured.
 */
export async function chatCompletion(messages: LlmMessage[]) {
  const groq = groqKey();
  const openai = openaiKey();

  if (groq) {
    try {
      return await callChatApi({
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: groq,
        model: groqModel(),
        messages,
        withTools: true,
      });
    } catch (first) {
      // Retry once without tools if Groq rejects tool schema — then local mode can still help
      const msg = first instanceof Error ? first.message : String(first);
      if (/tool|function|schema|tools/i.test(msg)) {
        return callChatApi({
          url: "https://api.groq.com/openai/v1/chat/completions",
          key: groq,
          model: groqModel(),
          messages,
          withTools: false,
        });
      }
      const err = first as Error & { code?: string; provider?: string };
      err.provider = "groq";
      throw err;
    }
  }

  if (!openai) {
    throw Object.assign(new Error("NO_LLM"), { code: "NO_LLM" });
  }

  return callChatApi({
    url: "https://api.openai.com/v1/chat/completions",
    key: openai,
    model: openaiModel(),
    messages,
    withTools: true,
  });
}

export function isLlmUnavailable(error: unknown) {
  const err = error as { code?: string; message?: string };
  if (err?.code === "NO_LLM" || err?.code === "NO_CREDITS") return true;
  return /credit|quota|billing|insufficient|NO_LLM|invalid api key|401|403/i.test(
    String(err?.message || error),
  );
}

export function llmProviderHint() {
  if (groqKey()) return "groq";
  if (openaiKey()) return "openai";
  return "none";
}
