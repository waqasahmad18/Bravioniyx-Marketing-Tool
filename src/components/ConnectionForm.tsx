"use client";

import { useState } from "react";
import { disconnectAction, saveConnectionAction } from "@/lib/actions";
import { connectionHint } from "@/lib/brand";
import type { Connection, SocialPlatform } from "@/lib/types";

const platforms: SocialPlatform[] = ["Facebook", "Instagram", "LinkedIn"];

export default function ConnectionForm({ connections }: { connections: Connection[] }) {
  const [pending, setPending] = useState<string | null>(null);
  const byPlatform = Object.fromEntries(connections.map((item) => [item.platform, item])) as Partial<
    Record<SocialPlatform, Connection>
  >;

  return (
    <div className="grid gap-4">
      {platforms.map((platform) => {
        const current = byPlatform[platform];
        const connected = current?.status === "connected" && Boolean(current.token);
        return (
          <article key={platform} className="border border-neutral-300 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{platform}</h2>
                <p className="mt-1 max-w-xl text-sm text-neutral-600">{connectionHint(platform)}</p>
              </div>
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${connected ? "text-emerald-700" : "text-[#E10600]"}`}>
                {connected ? `Connected · ${current?.accountName || current?.accountId}` : "Not linked"}
              </p>
            </div>

            <form
              className="mt-4 grid gap-3"
              action={async (formData) => {
                setPending(platform);
                try {
                  await saveConnectionAction(formData);
                } finally {
                  setPending(null);
                }
              }}
            >
              <input type="hidden" name="platform" value={platform} />
              <label className="block text-xs font-medium">
                Account / page name
                <input
                  name="accountName"
                  defaultValue={current?.accountName ?? ""}
                  placeholder={platform === "LinkedIn" ? "Bravioniyx Technologies" : "Bravioniyx Page"}
                  className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block text-xs font-medium">
                {platform === "LinkedIn" ? "Organization ID or URN" : "Page / IG user ID"}
                <input
                  name="accountId"
                  defaultValue={current?.accountId ?? ""}
                  className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block text-xs font-medium">
                Access token
                <input
                  name="token"
                  type="password"
                  defaultValue={current?.token ?? ""}
                  className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={pending === platform}
                  className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#E10600] disabled:opacity-60"
                >
                  {pending === platform ? "Saving…" : connected ? "Update connection" : "Link account"}
                </button>
                {connected ? (
                  <button
                    type="submit"
                    formAction={async (formData) => {
                      setPending(platform);
                      try {
                        await disconnectAction(formData);
                      } finally {
                        setPending(null);
                      }
                    }}
                    className="border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
                  >
                    Disconnect
                  </button>
                ) : null}
              </div>
            </form>
          </article>
        );
      })}
    </div>
  );
}
