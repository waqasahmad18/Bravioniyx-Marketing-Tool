"use client";

import { useEffect, useState } from "react";
import CopyCaption from "@/components/CopyCaption";
import { exportCreativePng } from "@/lib/export-graphic";
import {
  copyGraphicImage,
  deliverGraphic,
  hasNativeGallerySave,
  saveGraphicToGallery,
  shareGraphicFile,
} from "@/lib/graphic-actions";
import type { Post } from "@/lib/types";

export default function GraphicActions({
  post,
  onMessage,
  openRequestId = 0,
  showCopyCaption = true,
}: {
  post: Post;
  onMessage?: (msg: string) => void;
  /** Increment to open the fullscreen image viewer (e.g. when user taps the post graphic). */
  openRequestId?: number;
  showCopyCaption?: boolean;
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
      say("Tap Download to save in Gallery, then open LinkedIn / FB / IG.");
    } catch {
      say("Could not prepare graphic. Try again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!openRequestId) return;
    void openPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open when parent bumps the request id
  }, [openRequestId]);

  const onShare = async () => {
    setBusy(true);
    try {
      const dataUrl = previewUrl || (await build());
      if (!previewUrl) setPreviewUrl(dataUrl);
      const ok = await shareGraphicFile({ channel: post.channel, day: post.day, dataUrl });
      if (ok) {
        say("Share sheet opened — send to LinkedIn / Facebook / Instagram / Files.");
        return;
      }
      say("Share not available here. Use Download to save in Gallery.");
    } catch {
      say("Share failed. Use Download.");
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => {
    setBusy(true);
    try {
      const dataUrl = previewUrl || (await build());
      if (!previewUrl) setPreviewUrl(dataUrl);
      const ok = await copyGraphicImage(dataUrl);
      if (ok) {
        say("Graphic copied. Open LinkedIn/FB/IG and paste.");
        return;
      }
      const mode = await deliverGraphic({ channel: post.channel, day: post.day, dataUrl });
      if (mode === "gallery") say("Saved to Gallery.");
      else if (mode === "shared") say("Shared — pick LinkedIn / Facebook / Gallery.");
      else if (mode === "downloaded") say("Download started.");
      else say("Clipboard blocked. Use Download.");
    } catch {
      say("Copy failed. Use Download or Share.");
    } finally {
      setBusy(false);
    }
  };

  const onDownload = async () => {
    setBusy(true);
    try {
      const dataUrl = previewUrl || (await build());
      if (!previewUrl) setPreviewUrl(dataUrl);

      if (saveGraphicToGallery({ channel: post.channel, day: post.day, dataUrl })) {
        say("Saved to Gallery — open Photos / Gallery to find it.");
        return;
      }

      const mode = await deliverGraphic({ channel: post.channel, day: post.day, dataUrl });
      if (mode === "gallery") say("Saved to Gallery.");
      else if (mode === "shared") say("Share sheet opened — choose Save / Gallery / Files.");
      else if (mode === "copied") say("Graphic copied — paste into your post.");
      else if (mode === "downloaded") say("Download started.");
      else say("Long-press the image → Save image.");
    } catch {
      say("Download failed. Try Share graphic.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {showCopyCaption ? (
          <CopyCaption
            text={post.caption}
            ctaLabel={post.ctaLabel}
            href={post.destination || post.link}
          />
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={openPreview}
          className="min-h-10 border border-neutral-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
        >
          {busy ? "…" : "Open graphic"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDownload}
          className="min-h-10 border border-neutral-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
        >
          Download
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onShare}
          className="min-h-10 border border-neutral-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
        >
          Share
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCopy}
          className="min-h-10 border border-neutral-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
        >
          Copy graphic
        </button>
      </div>

      {previewUrl ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
            <button
              type="button"
              className="min-h-11 min-w-11 px-2 text-sm font-semibold"
              onClick={() => setPreviewUrl(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
              Day {post.day} · {post.channel}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={onDownload}
              className="min-h-11 rounded-sm bg-[#E10600] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
            >
              {busy ? "…" : hasNativeGallerySave() ? "Save gallery" : "Download"}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Post graphic"
              className="max-h-full max-w-full object-contain shadow-2xl"
            />
          </div>

          <div className="flex flex-wrap gap-2 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            <CopyCaption
              text={post.caption}
              ctaLabel={post.ctaLabel}
              href={post.destination || post.link}
              variant="dark"
            />
            <button
              type="button"
              disabled={busy}
              className="min-h-11 flex-1 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-black disabled:opacity-50"
              onClick={onDownload}
            >
              Download
            </button>
            <button
              type="button"
              disabled={busy}
              className="min-h-11 flex-1 border border-white/40 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
              onClick={onShare}
            >
              Share
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
