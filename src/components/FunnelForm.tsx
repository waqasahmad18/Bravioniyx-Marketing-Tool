"use client";

import { useMemo, useState } from "react";
import { channels, funnelGoals, postStyles, regions, services } from "@/lib/brand";
import { createFunnelAction } from "@/lib/actions";

export default function FunnelForm() {
  const [pending, setPending] = useState(false);
  const [service, setService] = useState(services[0].title);
  const [days, setDays] = useState(4);
  const [postStyle, setPostStyle] = useState<(typeof postStyles)[number]["id"]>("cta");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([...channels]);
  const selected = services.find((item) => item.title === service) ?? services[0];
  const styleMeta = postStyles.find((item) => item.id === postStyle) ?? postStyles[2];
  const postCount = useMemo(() => Math.max(3, Math.min(14, days)) * selectedChannels.length, [days, selectedChannels]);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((current) =>
      current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel],
    );
  };

  return (
    <form
      action={async (formData) => {
        setPending(true);
        try {
          await createFunnelAction(formData);
        } finally {
          setPending(false);
        }
      }}
      className="border border-neutral-300 bg-white p-5"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E10600]">New campaign</p>
      <h2 className="mt-1 text-xl font-semibold">Build a funnel from a website service</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Choose the post style yourself: plain text, engaging fact (no CTA), or a full post with one CTA.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="block text-xs font-medium">
          Website service
          <select
            name="service"
            value={service}
            onChange={(event) => setService(event.target.value)}
            className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
          >
            {services.map((item) => (
              <option key={item.slug}>{item.title}</option>
            ))}
          </select>
        </label>

        <div className="border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E10600]">{selected.group}</p>
          <p className="mt-1 font-medium">{selected.line}</p>
        </div>

        <fieldset>
          <legend className="text-xs font-medium">Post style (you decide)</legend>
          <div className="mt-2 grid gap-2">
            {postStyles.map((style) => (
              <label
                key={style.id}
                className={`flex cursor-pointer gap-3 border px-3 py-3 text-sm ${
                  postStyle === style.id ? "border-[#E10600] bg-[#E10600]/5" : "border-neutral-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="postStyle"
                  value={style.id}
                  checked={postStyle === style.id}
                  onChange={() => setPostStyle(style.id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-semibold">{style.label}</span>
                  <span className="mt-0.5 block text-xs text-neutral-600">{style.hint}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500">Selected: {styleMeta.label}</p>
        </fieldset>

        <label className="block text-xs font-medium">
          Goal
          <select name="goal" className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" defaultValue="Leads">
            {funnelGoals.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium">
          Region
          <select name="region" className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" defaultValue="Pakistan">
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium">
          Days
          <input
            name="days"
            type="number"
            min={3}
            max={14}
            value={days}
            onChange={(event) => setDays(Number(event.target.value) || 4)}
            className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <fieldset>
          <legend className="text-xs font-medium">Channels</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {channels.map((channel) => (
              <label key={channel} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="channels"
                  value={channel}
                  checked={selectedChannels.includes(channel)}
                  onChange={() => toggleChannel(channel)}
                />
                {channel}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="border border-[#E10600]/30 bg-[#E10600]/5 px-4 py-3 text-sm">
          <p className="font-semibold text-neutral-900">
            {days} days × {selectedChannels.length || 0} channels ={" "}
            <span className="text-[#E10600]">{postCount} posts</span>
            {" · "}
            {styleMeta.label}
          </p>
        </div>

        <button
          type="submit"
          disabled={pending || selectedChannels.length === 0}
          className="bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-[#E10600] disabled:opacity-60"
        >
          {pending ? "Building…" : "Build funnel"}
        </button>
      </div>
    </form>
  );
}
