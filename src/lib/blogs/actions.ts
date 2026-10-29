"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { MARKETING_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  createBlog,
  deleteBlog,
  draftBlogFromAssistant,
  publishBlog,
  unpublishBlog,
  updateBlog,
} from "@/lib/blogs/store";
import { serviceBySlug, services } from "@/lib/brand";

async function requireStaff() {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(MARKETING_COOKIE)?.value)) {
    throw new Error("Sign in required.");
  }
}

function refresh() {
  revalidatePath("/blog");
  revalidatePath("/blogs");
  revalidatePath("/analytics");
  revalidatePath("/");
}

export async function createDraftAction(formData: FormData) {
  await requireStaff();
  const serviceSlug = String(formData.get("serviceSlug") || services[0].slug);
  const service = serviceBySlug(serviceSlug);
  const instructions = String(formData.get("instructions") || "");
  const titleHint = String(formData.get("titleHint") || "");
  await draftBlogFromAssistant({
    serviceSlug: service.slug,
    titleHint: titleHint || undefined,
    instructions: instructions || undefined,
  });
  refresh();
}

export async function saveBlogAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") || "");
  await updateBlog(id, {
    title: String(formData.get("title") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    coverImageUrl: String(formData.get("coverImageUrl") || ""),
    coverImageAlt: String(formData.get("coverImageAlt") || ""),
    metaTitle: String(formData.get("metaTitle") || ""),
    metaDescription: String(formData.get("metaDescription") || ""),
    keywords: String(formData.get("keywords") || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  });
  refresh();
}

export async function publishBlogAction(formData: FormData) {
  await requireStaff();
  await publishBlog(String(formData.get("id") || ""));
  refresh();
}

export async function unpublishBlogAction(formData: FormData) {
  await requireStaff();
  await unpublishBlog(String(formData.get("id") || ""));
  refresh();
}

export async function deleteBlogAction(formData: FormData) {
  await requireStaff();
  await deleteBlog(String(formData.get("id") || ""));
  refresh();
}

export async function quickCreateBlankAction(formData: FormData) {
  await requireStaff();
  const service = serviceBySlug(String(formData.get("serviceSlug") || services[0].slug));
  await createBlog({
    title: String(formData.get("title") || "Untitled draft"),
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    coverImageUrl: String(formData.get("coverImageUrl") || ""),
    coverImageAlt: String(formData.get("coverImageAlt") || ""),
    serviceSlug: service.slug,
    serviceTitle: service.title,
    keywords: [],
    status: "draft",
    createdBy: "staff",
  });
  refresh();
}
