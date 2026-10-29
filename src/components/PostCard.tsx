"use client";

import { useState, useTransition } from "react";
import CreativeGraphic from "@/components/CreativeGraphic";
import CopyCaption from "@/components/CopyCaption";
import GraphicActions from "@/components/GraphicActions";
import PublicFeedPreview from "@/components/PublicFeedPreview";
import PostCtaButton from "@/components/PostCtaButton";
import { markPostedAction, publishPostAction } from "@/lib/actions";
import type { Post } from "@/lib/types";

const chrome: Record<string, { bar: string; label: string }> = {
  Facebook: { bar: "bg-[#1877F2]", label: "Facebook" },
  Instagram: { bar: "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]", label: "Instagram" },
  LinkedIn: { bar: "bg-[#0A66C2]", label: "LinkedIn" },
};

export default function PostCard({
  post,
  connected,
  showSchedule = true,
  defaultPublicView = false,
}: {
  post: Post;
  connected?: boolean;
  showSchedule?: boolean;
  defaultPublicView?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [showPublic, setShowPublic] = useState(defaultPublicView);
  const [pending, startTransition] = useTransition();
  const look = chrome[post.channel] ?? { bar: "bg-neutral-800", label: post.channel };
  const canAuto = post.status === "scheduled";

  return (
    <article className="overflow-hidden border border-neutral-300 bg-white shadow-sm">
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-white ${look.bar}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">{look.label}</p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[10px] uppercase tracking-[0.14em] opacity-90">
            Day {post.day} · {post.postStyle || "cta"} · {post.designVariant || "classic"} · {post.status}
          </p>
          <button
            type="button"
            onClick={() => setShowPublic((value) => !value)}
            className="bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] hover:bg-white/25"
          >
            {showPublic ? "Staff view" : "Public view"}
          </button>
        </div>
      </div>

      {showPublic ? (
        <div className="bg-neutral-100 p-4 sm:p-6">
          <p className="mb-4 text-center text-xs text-neutral-600">
            Public feed preview for {post.channel} — this is how the post will appear to followers.
          </p>
          <PublicFeedPreview post={post} />
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-3">
              <CopyCaption text={post.caption} ctaLabel={post.ctaLabel} href={post.destination || post.link} />
            </div>
            <GraphicActions post={post} onMessage={setMessage} />
            {(post.status === "scheduled" || post.status === "failed") ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setMessage("");
                  startTransition(async () => {
                    const result = await publishPostAction(post.id);
                    setMessage(
                      result.ok
                        ? connected
                          ? "Published publicly on the network."
                          : result.error || "Done."
                        : result.error || "Publish failed.",
                    );
                  });
                }}
                className="bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                {pending ? "Publishing…" : "Publish publicly"}
              </button>
            ) : null}
          </div>
          {message ? <p className="mt-3 text-center text-sm text-neutral-600">{message}</p> : null}
        </div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-[minmax(260px,0.9fr)_1.1fr]">
          <div className="bg-neutral-950 p-3 sm:p-4">
            <CreativeGraphic
              channel={post.channel}
              title={post.graphicTitle}
              line={post.graphicLine}
              bullets={post.bullets}
              variant={post.designVariant || "classic"}
              day={post.day}
              ctaLabel={post.ctaLabel}
            />
          </div>

        <div className="flex flex-col p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E10600]">{post.service}</p>
            <h3 className="mt-1 text-xl font-semibold leading-snug tracking-tight">{post.headline}</h3>
            {showSchedule ? (
              <p className="mt-1 text-xs text-neutral-500">
                Schedule:{" "}
                {post.scheduledFor
                  ? new Date(post.scheduledFor).toLocaleString("en-GB", { timeZone: "Asia/Karachi" })
                  : "—"}
              </p>
            ) : null}

            <p className="mt-4 flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800">{post.caption}</p>

            <div className="mt-4 overflow-hidden border border-neutral-300">
              <PostCtaButton post={post} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">CTA clicks</p>
                <p className="text-lg font-semibold text-[#E10600]">{post.analytics.ctaClicks}</p>
              </div>
              <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Engagement</p>
                <p className="text-lg font-semibold">{post.analytics.engagement}</p>
              </div>
              <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Impressions</p>
                <p className="text-lg font-semibold">{post.analytics.impressions}</p>
              </div>
              <div className="border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Followers</p>
                <p className="text-lg font-semibold">{post.analytics.followers}</p>
              </div>
            </div>

            {post.publishError ? <p className="mt-3 text-sm text-[#E10600]">{post.publishError}</p> : null}
            {message ? <p className="mt-3 text-sm text-neutral-600">{message}</p> : null}

            <div className="mt-5 flex flex-col gap-3 border-t border-neutral-200 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <CopyCaption text={post.caption} ctaLabel={post.ctaLabel} href={post.destination || post.link} />
                <button
                  type="button"
                  onClick={() => setShowPublic(true)}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E10600]"
                >
                  See public view
                </button>
              </div>
              <GraphicActions post={post} onMessage={setMessage} />
              <div className="flex flex-wrap items-center gap-3">
              {canAuto ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setMessage("");
                    startTransition(async () => {
                      const result = await publishPostAction(post.id);
                      setMessage(
                        result.ok
                          ? connected
                            ? "Published publicly on the network."
                            : result.error || "Done."
                          : result.error || "Publish failed.",
                      );
                    });
                  }}
                  className="bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#E10600] disabled:opacity-60"
                >
                  {pending ? "Publishing…" : connected ? "Publish publicly" : "Publish (link account first)"}
                </button>
              ) : null}

              {post.status === "scheduled" || post.status === "failed" ? (
                <form action={markPostedAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    className="border border-neutral-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:border-black"
                  >
                    Mark posted
                  </button>
                </form>
              ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
