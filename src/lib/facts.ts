/** Short engaging facts / tips by service — used when post style = fact (no CTA). */
export const serviceFacts: Record<string, string[]> = {
  "custom-software-development": [
    "Most teams don’t need more apps — they need one system that matches how work already moves.",
    "A custom workflow can cut the same task from 40 minutes to under 10 when approvals live in one place.",
    "Spreadsheets break quietly. Software fails loudly — which is why clear scope before build saves months.",
    "The best internal tools start with one painful process, not a full rewrite of the company.",
  ],
  "website-development": [
    "Visitors decide in seconds whether a site feels clear. Confusion is a silent lead killer.",
    "A fast mobile page often outperforms a pretty desktop-only design for real enquiries.",
    "If your offer isn’t obvious above the fold, the quote form rarely gets a fair chance.",
    "A website isn’t a brochure — it’s a path from interest to conversation.",
  ],
  "rdp-setup": [
    "Remote work fails the moment login fails. Stable RDP is an operations issue, not a nice-to-have.",
    "A “temporary” remote desktop that lasts six months usually costs more than a proper setup.",
    "Session drops aren’t random — weak config, bandwidth, and access rules stack up.",
    "The best RDP feels boring: sign in, work, sign out. No drama.",
  ],
  "server-setup": [
    "Go-live is day one. Maintenance is every day after — that’s where most server pain starts.",
    "A server that only works on launch day was never finished.",
    "Clear monitoring beats heroics at 2 a.m.",
    "Documented deploy steps turn emergency fixes into routine work.",
  ],
  networking: [
    "When the network drops, every other tool becomes irrelevant.",
    "Most “Wi-Fi problems” are design problems: coverage, load, and interference.",
    "A planned office network costs less than months of Monday firefighting.",
    "People and systems stay productive only when connectivity was designed for the work.",
  ],
  "it-support": [
    "Downtime isn’t just technical — it’s lost focus across the whole team.",
    "Fast diagnosis beats long ticket threads with no owner.",
    "Small IT issues become big ones when nobody has a direct line.",
    "Good support is quiet: problems get named, fixed, and closed.",
  ],
  "chat-room-servers": [
    "Communities don’t leave when content is weak — they leave when the server is unreliable.",
    "Chat infrastructure is a product: setup, uptime, and recovery matter as much as features.",
    "A clean deploy today prevents a panic restore tomorrow.",
    "Uptime is the feature users notice first.",
  ],
  "cloud-vps": [
    "Renting a VPS is easy. Configuring it for the real workload is the actual job.",
    "Migrations fail from missing checklists, not missing servers.",
    "A tightened VPS often feels faster than throwing money at a bigger plan.",
    "Cloud only helps when the machine matches the traffic and the team’s habits.",
  ],
  "game-development": [
    "A playable build teaches more than a perfect slide deck.",
    "Unity projects move faster when gameplay scope is cut early and clearly.",
    "Players feel polish in seconds — controls and feedback come before extra levels.",
    "The first fun scene is worth more than ten unfinished systems.",
  ],
};

export function factFor(slug: string, day: number) {
  const list = serviceFacts[slug] ?? serviceFacts["custom-software-development"];
  return list[(day - 1) % list.length];
}
