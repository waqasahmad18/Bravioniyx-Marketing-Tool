"use client";

import dynamic from "next/dynamic";
import type { Post } from "@/lib/types";

const PostCard = dynamic(() => import("@/components/PostCard"), {
  loading: () => <div className="h-44 animate-pulse border border-neutral-200 bg-neutral-100" />,
  ssr: false,
});

export default function PostCardLazy(props: {
  post: Post;
  connected?: boolean;
  showSchedule?: boolean;
  defaultPublicView?: boolean;
}) {
  return <PostCard {...props} />;
}
