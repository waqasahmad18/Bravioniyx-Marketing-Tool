import { listLeads } from "@/lib/store";
import { karachiLabel } from "@/lib/when";

export default async function LeadsPage() {
  const leads = await listLeads();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Website leads</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        Website form enquiries from bravioniyx.com (name, email, service, page). This is not a WhatsApp inbox — WhatsApp
        only appears as a Leads-campaign CTA on social posts.
      </p>
      {leads.length === 0 ? (
        <p className="mt-8 border border-neutral-300 bg-white px-5 py-8 text-sm text-neutral-600">No leads saved yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-200 border border-neutral-300 bg-white">
          {leads.map((lead) => (
            <li key={`${lead.email}-${lead.savedAt}`} className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1.2fr_0.8fr_1fr]">
              <div>
                <p className="font-semibold">{lead.email}</p>
                <p className="text-neutral-600">{lead.name || "No name"}</p>
              </div>
              <p className="text-neutral-700">{lead.service || "No service"}</p>
              <div>
                <p className="break-all text-neutral-600">{lead.page || lead.source || "No page link"}</p>
                <p className="mt-1 text-xs text-neutral-500">{lead.savedAt ? karachiLabel(lead.savedAt) : ""}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
