import { brand } from "@/lib/brand";

export type ExportGraphicInput = {
  channel: string;
  title: string;
  line: string;
  bullets?: string[];
  variant?: string;
  day?: number;
  ctaLabel?: string;
  href?: string;
};

const RED = "#E10600";
const BG = "#0a0a0a";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `${window.location.origin}/logo.png?v=export3`;
  });
}

/**
 * Creative PNG for organic posts.
 * No Follow/CTA button on the image — CTA sits under the post (Ads Manager style).
 */
export async function exportCreativePng(input: ExportGraphicInput): Promise<string> {
  const tall = input.channel === "WhatsApp";
  const w = 1080;
  const h = tall ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const colW = Math.round(w * 0.78);
  const left = Math.round((w - colW) / 2);
  const topPad = tall ? 160 : 120;
  const bottomPad = tall ? 140 : 100;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w / 2, h * 0.15, 40, w / 2, h * 0.15, w * 0.65);
  glow.addColorStop(0, "rgba(225,6,0,0.32)");
  glow.addColorStop(1, "rgba(225,6,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, w - 96, h - 96);
  ctx.fillStyle = RED;
  ctx.fillRect(48, 48, 100, 9);
  ctx.fillRect(w - 148, h - 57, 100, 9);

  const logo = await loadLogo();
  let y = topPad;

  if (logo) {
    const logoH = tall ? 78 : 70;
    const logoW = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, left, y, logoW, logoH);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "700 26px Arial, Helvetica, sans-serif";
    ctx.fillText(brand.company.toUpperCase(), left + logoW + 20, y + 30);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "20px Arial, Helvetica, sans-serif";
    ctx.fillText(brand.tagline, left + logoW + 20, y + 58);
    y += logoH + 64;
  } else {
    ctx.fillStyle = RED;
    ctx.font = "700 40px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("BRAVIONYX", left, y + 36);
    y += 80;
  }

  const titleFont = tall ? 58 : 52;
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${titleFont}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = "left";
  for (const part of (input.title || "").split("\n").map((p) => p.trim()).filter(Boolean)) {
    for (const row of wrapText(ctx, part, colW).slice(0, 4)) {
      ctx.fillText(row, left, y + titleFont);
      y += titleFont + 14;
    }
  }

  y += 28;
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.font = `${tall ? 30 : 28}px Arial, Helvetica, sans-serif`;
  for (const row of wrapText(ctx, input.line || "", colW).slice(0, 4)) {
    ctx.fillText(row, left, y + 28);
    y += 38;
  }

  const bullets = (input.bullets ?? []).slice(0, 2);
  if (bullets.length) {
    y += 22;
    ctx.fillStyle = "rgba(255,255,255,0.74)";
    ctx.font = "26px Arial, Helvetica, sans-serif";
    for (const item of bullets) {
      for (const row of wrapText(ctx, `▸ ${item}`, colW).slice(0, 2)) {
        ctx.fillText(row, left, y + 26);
        y += 36;
      }
      y += 6;
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "600 22px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("www.bravioniyx.com", w / 2, h - bottomPad + 24);

  return canvas.toDataURL("image/png");
}
