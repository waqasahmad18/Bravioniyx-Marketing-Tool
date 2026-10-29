import type { ReactNode } from "react";

/** Simple body renderer: ## headings + paragraphs. No raw HTML injection. */
export function renderBlogBody(body: string): ReactNode[] {
  const blocks = body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-10 text-2xl font-semibold tracking-tight text-neutral-950">
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }
    if (block.includes("\n• ") || block.startsWith("• ")) {
      const items = block.split("\n").filter((l) => l.trim().startsWith("•"));
      return (
        <ul key={index} className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-neutral-800">
          {items.map((item) => (
            <li key={item}>{item.replace(/^•\s*/, "")}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={index} className="mt-4 text-[15px] leading-relaxed text-neutral-800 whitespace-pre-wrap">
        {block}
      </p>
    );
  });
}
