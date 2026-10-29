"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };
type Action = { tool: string; ok: boolean; summary: string };

const starters = [
  "Show reach, comments, and CTA clicks",
  "Draft an SEO blog on RDP",
  "List draft blogs ready to publish",
  "Show authentic blog traffic stats",
];

export default function AssistantChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showHello, setShowHello] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, I am Lessa — your Bravioniyx Marketing Manager assistant.\nI can help with posts, blogs, reach, funnels, publishing, and updates. How can I assist you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setShowHello(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, pending, open]);

  useEffect(() => {
    if (open) return;
    setShowHello(true);
    const t = window.setTimeout(() => setShowHello(false), 8000);
    return () => window.clearTimeout(t);
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || pending) return;
    setActions([]);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: next.filter((m) => m.role === "user" || m.role === "assistant"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong." },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Done." }]);
        setActions(Array.isArray(data.actions) ? data.actions : []);
        if (Array.isArray(data.actions) && data.actions.some((a: Action) => a.ok)) {
          router.refresh();
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error — try again." }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="animate-lessa-in pointer-events-auto fixed inset-0 z-[85] flex h-[100dvh] w-full flex-col overflow-hidden border-0 bg-white shadow-none sm:absolute sm:inset-auto sm:bottom-0 sm:right-0 sm:h-[min(560px,72vh)] sm:w-[min(100vw-2rem,380px)] sm:border sm:border-neutral-200 sm:shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-3 bg-neutral-950 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
            <div className="flex items-center gap-3">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-[#E10600]">
                <img src="/lessa-avatar.jpg" alt="Lessa" className="h-full w-full object-cover" />
                <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-neutral-950" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Lessa</p>
                <p className="text-[11px] text-white/55">Bravioniyx AI assistant · online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-10 px-2 text-xs uppercase tracking-[0.14em] text-white/70 hover:text-white"
              aria-label="Close chat"
            >
              Close
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto border-b border-neutral-200 bg-neutral-50 px-2 py-2">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => send(s)}
                className="shrink-0 border border-neutral-300 bg-white px-2 py-1 text-[10px] text-neutral-700 hover:border-black disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" ? (
                  <img src="/lessa-avatar.jpg" alt="" className="mb-0.5 h-7 w-7 rounded-full object-cover" />
                ) : null}
                <div
                  className={`max-w-[85%] whitespace-pre-wrap px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-2xl rounded-br-md bg-black text-white"
                      : "rounded-2xl rounded-bl-md border border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending ? (
              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <img src="/lessa-avatar.jpg" alt="" className="h-6 w-6 rounded-full object-cover opacity-80" />
                Lessa typing…
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {actions.length ? (
            <div className="max-h-16 overflow-y-auto border-t border-neutral-200 bg-neutral-50 px-3 py-2">
              <ul className="space-y-0.5 text-[10px] text-neutral-600">
                {actions.map((a, i) => (
                  <li key={i}>
                    {a.ok ? "✓" : "✕"} {a.tool}: {a.summary}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <form
            className="flex gap-2 border-t border-neutral-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Lessa…"
              className="min-w-0 flex-1 rounded-full border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-black sm:text-sm"
              disabled={pending}
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="min-h-11 rounded-full bg-[#E10600] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      {/* Closed state: greeting + Lessa button */}
      {!open ? (
        <div className="pointer-events-auto flex items-end gap-2">
          {showHello ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="animate-lessa-in mb-1 max-w-[200px] rounded-2xl rounded-br-md border border-neutral-200 bg-white px-3 py-2 text-left shadow-lg"
            >
              <p className="text-[11px] font-semibold text-neutral-900">Hi, I am Lessa</p>
              <p className="mt-0.5 text-[10px] leading-snug text-neutral-500">Chat with your AI assistant →</p>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative flex h-[4.25rem] w-[4.25rem] items-center justify-center"
            aria-label="Open Lessa assistant"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-[#E10600]/25 [animation-duration:2.4s]" />
            <span className="relative h-16 w-16 overflow-hidden rounded-full border-[3px] border-white shadow-[0_10px_28px_rgba(0,0,0,0.28)] ring-2 ring-[#E10600] transition group-hover:scale-105">
              <img src="/lessa-avatar.jpg" alt="Lessa" className="h-full w-full object-cover" />
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-950 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
              Lessa
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-xl text-white shadow-lg"
          aria-label="Close Lessa"
        >
          ×
        </button>
      )}

    </div>
  );
}
