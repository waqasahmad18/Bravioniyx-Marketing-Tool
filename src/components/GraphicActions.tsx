"use client";

import { useState } from "react";
import { exportCreativePng } from "@/lib/export-graphic";
import { copyGraphicImage, deliverGraphic, shareGraphicFile } from "@/lib/graphic-actions";
import type { Post } from "@/lib/types";

export default function GraphicActions({
  post,
  onMessage,
}: {
  post: Post;
  onMessage?: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const build = async () => {
    return exportCreativePng({
      channel: post.channel,
      title: post.graphicTitle,
      line: post.graphicLine,
      bullets: post.bullets,
      variant: post.designVariant || "classic",
      day: post.day,
      ctaLabel: post.ctaLabel || "Follow Bravioniyx",
      href: post.destination || post.link || "https://www.bravioniyx.com",
    });
  };

  const say = (msg: string) => onMessage?.(msg);

  const openPreview = async () => {
    setBusy(true);
    try {
      const dataUrl = await build();
      setPreviewUrl(dataUrl);
      say("Long-press the image → Save / Share, then paste into LinkedIn / FB / IG.");
    } catch {
      say("Could not prepare graphic. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    setBusy(true);
    try {
      const dataUrl = await build();
      const ok = await shareGraphicFile({ channel: post.channel, day: post.day, dataUrl });
      if (ok) {
        say("Share sheet opened — send to LinkedIn / Facebook / Instagram / Files.");
        return;
      }
      setPreviewUrl(dataUrl);
      say("Share not available here. Long-press image → Save, then upload on the platform.");
    } catch {
      say("Share failed. Use Copy graphic or long-press preview.");
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => {
    setBusy(true);
    try {
      const dataUrl = await build();
      const ok = await copyGraphicImage(dataUrl);
      if (ok) {
        say("Graphic copied. Open LinkedIn/FB/IG and paste (Ctrl+V / long-press Paste).");
        return;
      }
      // Fallback: smart deliver or preview
      const mode = await deliverGraphic({ channel: post.channel, day: post.day, dataUrl });
      if (mode === "shared") say("Shared — pick LinkedIn / Facebook / Gallery.");
      else if (mode === "downloaded") say("Download started. If nothing saved, use Share or long-press preview.");
      else {
        setPreviewUrl(dataUrl);
        say("Clipboard blocked in app. Long-press image → Save / Share.");
      }
    } catch {
      say("Copy failed. Tap Share graphic or Open preview.");
    } finally {
      setBusy(false);
    }
  };

  const onDownload = async () => {
    setBusy(true);
    try {
      const dataUrl = await build();
      const mode = await deliverGraphic({ channel: post.channel, day: post.day, dataUrl });
      if (mode === "shared") say("Share sheet opened (best for mobile app).");
      else if (mode === "copied") say("Graphic copied to clipboard — paste into your post.");
      else if (mode === "downloaded") say("Download started.");
      else {
        setPreviewUrl(dataUrl);
        say("Download blocked in mobile app. Long-press image → Save image.");
      }
    } catch {
      say("Graphic failed. Refresh and try Share / Copy.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onCopy}
          className="min-h-10 border border-neutral-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
        >
          {busy ? "…" : "Copy graphic"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onShare}
          className="min-h-10 bg-[#E10600] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
        >
          Share graphic
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDownload}
          className="min-h-10 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-800 disabled:opacity-50"
        >
          Download
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={openPreview}
          className="min-h-10 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E10600] disabled:opacity-50"
        >
          Open preview
        </button>
      </div>

      {previewUrl ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="max-h-[92dvh] w-full max-w-lg overflow-auto bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Graphic ready</p>
                <p className="mt-1 text-xs text-neutral-600">
                  Mobile: long-press image → Save / Share → open LinkedIn/FB/IG and attach.
                </p>
              </div>
              <button
                type="button"
                className="min-h-10 px-2 text-xs font-semibold uppercase tracking-[0.14em]"
                onClick={() => setPreviewUrl(null)}
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Post graphic" className="mx-auto w-full max-w-sm border border-neutral-200" />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 flex-1 bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                onClick={onShare}
              >
                Share to apps
              </button>
              <button
                type="button"
                className="min-h-11 flex-1 border border-neutral-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                onClick={onCopy}
              >
                Copy graphic
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
