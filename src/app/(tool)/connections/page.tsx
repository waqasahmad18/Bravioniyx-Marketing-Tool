import ConnectionForm from "@/components/ConnectionForm";
import { listConnections } from "@/lib/store";
import Link from "next/link";

export default async function ConnectionsPage() {
  const connections = await listConnections();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Connections</h1>
      <p className="mt-2 max-w-3xl text-sm text-neutral-600">
        Link Facebook, Instagram, and LinkedIn so scheduled posts can publish automatically. Without a connection,
        creatives stay in the planner for copy, download, and manual posting.
      </p>
      <p className="mt-2 max-w-3xl text-sm text-neutral-600">
        WhatsApp is not a posting channel. On Leads campaigns, “Chat on WhatsApp” is only a CTA destination (service
        number). Website CTAs still route to{" "}
        <a href="https://www.bravioniyx.com" className="font-semibold text-[#E10600]" target="_blank" rel="noreferrer">
          bravioniyx.com
        </a>
        .
      </p>
      <p className="mt-2 text-sm">
        Recommended path:{" "}
        <Link href="/funnels" className="font-semibold text-[#E10600]">
          Funnel
        </Link>{" "}
        → Approve → Connect accounts → Publish (or wait for the daily job).
      </p>
      <div className="mt-8">
        <ConnectionForm connections={connections} />
      </div>
    </div>
  );
}
