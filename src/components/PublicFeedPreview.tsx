"use client";

import CreativeGraphic from "@/components/CreativeGraphic";
import PostCtaButton from "@/components/PostCtaButton";
import { captionForManualPost } from "@/lib/organic";
import type { Post } from "@/lib/types";

function CaptionWithLinks({ text }: { text: string }) {
  // Caption body only — CTA button is separate under the post
  const full = captionForManualPost({ caption: text });
  const parts = full.split(/(https?:\/\/[^\s]+)/g);
  return (
    <span className="whitespace-pre-wrap text-neutral-800">
      {parts.map((part, index) =>
        part.startsWith("http") ? (
          <a key={index} href={part} target="_blank" rel="noreferrer" className="break-all font-medium text-[#E10600] underline">
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
}

export default function PublicFeedPreview({ post }: { post: Post }) {
  const channel = post.channel;

  if (channel === "Instagram") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#DD2A7B]">
          Public Instagram · {post.goal || "Leads"} · CTA under post
        </p>
        <div className="mx-auto max-w-[340px] overflow-hidden rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 px-3 py-2">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold">bravioniyx</p>
              <p className="text-[10px] text-neutral-500">Sponsored · Bravioniyx Technologies</p>
            </div>
          </div>
          <CreativeGraphic
            channel="Instagram"
            title={post.graphicTitle}
            line={post.graphicLine}
            bullets={post.bullets}
            variant={post.designVariant || "classic"}
            day={post.day}
          />
          <div className="px-3 py-3">
            <p className="text-sm">
              <span className="font-semibold">bravioniyx </span>
              <CaptionWithLinks text={post.caption} />
            </p>
          </div>
          <PostCtaButton post={post} />
        </div>
      </div>
    );
  }

  if (channel === "LinkedIn") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A66C2]">
          Public LinkedIn · {post.goal || "Leads"} · CTA under post
        </p>
        <div className="mx-auto max-w-[420px] overflow-hidden rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded object-cover" />
            <div>
              <p className="text-sm font-semibold">Bravioniyx Technologies</p>
              <p className="text-[11px] text-neutral-500">IT Services · Lahore · Just now</p>
            </div>
          </div>
          <CreativeGraphic
            channel="LinkedIn"
            title={post.graphicTitle}
            line={post.graphicLine}
            bullets={post.bullets}
            variant={post.designVariant || "classic"}
            day={post.day}
          />
          <div className="border-t border-neutral-200 px-4 py-3">
            <p className="text-sm leading-relaxed">
              <CaptionWithLinks text={post.caption} />
            </p>
          </div>
          <PostCtaButton post={post} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-[#f0f2f5] p-4 shadow-sm">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1877F2]">
        Public Facebook · {post.goal || "Leads"} · CTA under post
      </p>
      <div className="mx-auto max-w-[420px] overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center gap-3 px-4 py-3">
          <img src="/logo.png" alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold">Bravioniyx Technologies</p>
            <p className="text-[11px] text-neutral-500">Just now · 🌐</p>
          </div>
        </div>
        <CreativeGraphic
          channel="Facebook"
          title={post.graphicTitle}
          line={post.graphicLine}
          bullets={post.bullets}
          variant={post.designVariant || "classic"}
          day={post.day}
        />
        <div className="border-t border-neutral-200 px-4 py-3">
          <p className="text-sm leading-relaxed">
            <CaptionWithLinks text={post.caption} />
          </p>
        </div>
        <PostCtaButton post={post} />
      </div>
    </div>
  );
}
