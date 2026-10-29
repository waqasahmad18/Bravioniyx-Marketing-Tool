export type GraphicPayload = {
  channel: string;
  day: number;
  dataUrl: string;
};

type NativeBridge = {
  saveImage?: (dataUrl: string, filename: string) => void;
};

declare global {
  interface Window {
    BravioniyxNative?: NativeBridge;
  }
}

function filenameFor(channel: string, day: number) {
  return `bravioniyx-${channel.toLowerCase()}-day-${day}.png`;
}

export async function dataUrlToBlob(dataUrl: string) {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Save PNG into the phone Gallery via Android WebView bridge (best path in the app). */
export function saveGraphicToGallery(payload: GraphicPayload): boolean {
  try {
    const bridge = typeof window !== "undefined" ? window.BravioniyxNative : undefined;
    if (!bridge?.saveImage) return false;
    bridge.saveImage(payload.dataUrl, filenameFor(payload.channel, payload.day));
    return true;
  } catch {
    return false;
  }
}

export function hasNativeGallerySave() {
  return typeof window !== "undefined" && typeof window.BravioniyxNative?.saveImage === "function";
}

/** Mobile-first: native gallery → Share sheet → clipboard → blob download. */
export async function deliverGraphic(
  payload: GraphicPayload,
): Promise<"gallery" | "shared" | "copied" | "downloaded" | "preview"> {
  if (saveGraphicToGallery(payload)) return "gallery";

  const name = filenameFor(payload.channel, payload.day);
  const blob = await dataUrlToBlob(payload.dataUrl);
  const file = new File([blob], name, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };

  try {
    if (typeof navigator.share === "function" && nav.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Bravioniyx graphic",
        text: "Bravioniyx post graphic",
      });
      return "shared";
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "shared";
  }

  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      return "copied";
    }
  } catch {
    // fall through
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    return "downloaded";
  } catch {
    return "preview";
  }
}

export async function copyGraphicImage(dataUrl: string): Promise<boolean> {
  try {
    const blob = await dataUrlToBlob(dataUrl);
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export async function shareGraphicFile(payload: GraphicPayload): Promise<boolean> {
  try {
    const blob = await dataUrlToBlob(payload.dataUrl);
    const file = new File([blob], filenameFor(payload.channel, payload.day), { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
    if (typeof navigator.share !== "function") return false;
    if (nav.canShare && !nav.canShare({ files: [file] })) return false;
    await navigator.share({ files: [file], title: "Bravioniyx graphic" });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    return false;
  }
}
