"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/blogs/types";
import { deleteBlogAction, publishBlogAction, saveBlogAction, unpublishBlogAction } from "@/lib/blogs/actions";

export default function BlogEditorCard({ blog }: { blog: BlogPost }) {
  const [open, setOpen] = useState(blog.status === "draft");

  return (
    <article className="border border-neutral-300 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E10600]">
            {blog.status} · {blog.serviceTitle} · {blog.createdBy}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{blog.title}</h3>
          <p className="text-xs text-neutral-500">
            /blogs/{blog.slug} · views {blog.stats.views} · visitors {blog.stats.visitors} · CTA {blog.stats.ctaClicks}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-semibold uppercase tracking-[0.14em]">
            {open ? "Hide" : "Edit"}
          </button>
          {blog.status === "published" ? (
            <a href={`/blogs/${blog.slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E10600]">
              View live
            </a>
          ) : null}
        </div>
      </div>

      {open ? (
        <form action={saveBlogAction} className="grid gap-3 p-4">
          <input type="hidden" name="id" value={blog.id} />
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Title
            <input name="title" defaultValue={blog.title} className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Excerpt
            <textarea name="excerpt" rows={2} defaultValue={blog.excerpt} className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Body (## headings, blank line between paragraphs)
            <textarea name="body" rows={14} defaultValue={blog.body} className="border border-neutral-300 px-3 py-2 font-mono text-sm font-normal normal-case tracking-normal" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Cover image URL
              <input name="coverImageUrl" defaultValue={blog.coverImageUrl} placeholder="https://…" className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Cover alt
              <input name="coverImageAlt" defaultValue={blog.coverImageAlt} className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
            </label>
          </div>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Keywords (comma separated)
            <input name="keywords" defaultValue={blog.keywords.join(", ")} className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Meta title
              <input name="metaTitle" defaultValue={blog.metaTitle} className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Meta description
              <input name="metaDescription" defaultValue={blog.metaDescription} className="border border-neutral-300 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
            <button type="submit" className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Save
            </button>
            {blog.status !== "published" ? (
              <button formAction={publishBlogAction} className="bg-[#E10600] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                Publish live
              </button>
            ) : (
              <button formAction={unpublishBlogAction} className="border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
                Unpublish
              </button>
            )}
            <button formAction={deleteBlogAction} className="ml-auto text-xs font-semibold uppercase tracking-[0.14em] text-[#E10600]">
              Delete
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
