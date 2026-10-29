import { topicForService, slugify, serviceForDay } from "@/lib/blogs/seo";
import { brand } from "@/lib/brand";

function llmEndpoint() {
  const groq = process.env.GROQ_API_KEY?.trim();
  if (groq) {
    return {
      key: groq,
      url: "https://api.groq.com/openai/v1/chat/completions",
      model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b",
    };
  }
  const openai = process.env.OPENAI_API_KEY?.trim();
  if (openai) {
    return {
      key: openai,
      url: "https://api.openai.com/v1/chat/completions",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }
  return null;
}

function fallbackBody(input: {
  title: string;
  serviceTitle: string;
  servicePage: string;
  primaryKeyword: string;
  keywords: string[];
}) {
  const site = brand.site;
  return [
    `${input.primaryKeyword} is not a buzzword exercise — it is how teams stay productive when tools, access, or delivery start to fail.`,
    `At Bravioniyx Technologies we see the same pattern across ${input.serviceTitle.toLowerCase()}: unclear scope, temporary fixes, and systems that only work on a good day.`,
    `## What usually breaks first`,
    `• Login or access that is unreliable\n• A website or app that does not explain the offer\n• Servers and networks that were never finished after go-live\n• Support that disappears when something fails`,
    `## A practical way to fix it`,
    `Start with one costly workflow or failure point. Document how the work should run. Then configure, build, or repair with a clear handoff — not a one-time favour.`,
    `## Keywords operators actually search`,
    input.keywords.map((k) => `• ${k}`).join("\n"),
    `## Next step`,
    `If you need ${input.serviceTitle} done properly, request a short brief on our site: ${site}${input.servicePage.startsWith("/") ? input.servicePage : `/${input.servicePage}`}`,
    `Bravioniyx Technologies — Ideas / Solutions / Growth. Remote by default. On-site when you need us there.`,
  ].join("\n\n");
}

/** Draft an SEO blog from service + industry angle. Uses OpenAI when key exists; otherwise authentic template (never fake stats). */
export async function generateBlogDraft(opts?: { serviceSlug?: string; titleHint?: string; instructions?: string }) {
  const salt = Date.now();
  const baseService = opts?.serviceSlug
    ? topicForService(opts.serviceSlug, salt)
    : topicForService(serviceForDay(salt).slug, salt);

  const title = opts?.titleHint?.trim() || baseService.title;
  const keywords = baseService.keywords;
  const primaryKeyword = baseService.primaryKeyword;
  const service = baseService.service;

  let body = "";
  let excerpt = "";
  const llm = llmEndpoint();

  if (llm) {
    try {
      const res = await fetch(llm.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${llm.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: llm.model,
          temperature: 0.55,
          messages: [
            {
              role: "system",
              content: `You write SEO blog posts for Bravioniyx Technologies (IT, software, RDP, servers, websites, Unity).
Rules: practical, honest, no fake case studies or invented numbers/stats. Use the primary keyword naturally.
Structure with short paragraphs and ## headings. End with a soft CTA to the real service page.
Return JSON only: { "title", "excerpt", "body", "metaTitle", "metaDescription", "coverImageAlt" }.
body uses \\n\\n between paragraphs; ## for headings.`,
            },
            {
              role: "user",
              content: JSON.stringify({
                titleHint: title,
                service: service.title,
                servicePage: service.page,
                primaryKeyword,
                keywords,
                site: brand.site,
                extra: opts?.instructions || "",
              }),
            },
          ],
          response_format: { type: "json_object" },
        }),
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content;
      if (res.ok && raw) {
        const parsed = JSON.parse(raw) as {
          title?: string;
          excerpt?: string;
          body?: string;
          metaTitle?: string;
          metaDescription?: string;
          coverImageAlt?: string;
        };
        return {
          title: parsed.title || title,
          excerpt: parsed.excerpt || `${primaryKeyword} — practical notes from Bravioniyx Technologies.`,
          body: parsed.body || fallbackBody({
            title,
            serviceTitle: service.title,
            servicePage: service.page,
            primaryKeyword,
            keywords,
          }),
          metaTitle: parsed.metaTitle || `${title} | Bravioniyx`,
          metaDescription: parsed.metaDescription || baseService.metaDescription,
          coverImageAlt: parsed.coverImageAlt || `${service.title} — Bravioniyx Technologies`,
          coverImageUrl: "",
          serviceSlug: service.slug,
          serviceTitle: service.title,
          keywords,
          slugBase: slugify(parsed.title || title),
        };
      }
    } catch {
      // fall through to template
    }
  }

  body = fallbackBody({
    title,
    serviceTitle: service.title,
    servicePage: service.page,
    primaryKeyword,
    keywords,
  });
  excerpt = `${primaryKeyword} — clear guidance for teams that need reliable delivery.`;

  return {
    title,
    excerpt,
    body,
    metaTitle: `${title} | Bravioniyx`,
    metaDescription: baseService.metaDescription,
    coverImageAlt: `${service.title} — Bravioniyx Technologies`,
    coverImageUrl: "",
    serviceSlug: service.slug,
    serviceTitle: service.title,
    keywords,
    slugBase: slugify(title),
  };
}
