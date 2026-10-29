import type { FunnelGoal, Region, Stage } from "@/lib/brand";

export type CreativeCopy = {
  headline: string;
  graphicTitle: string;
  graphicLine: string;
  body: string;
  ctaLabel: string;
};

const who: Record<Region, string> = {
  Pakistan: "Pakistan",
  "Saudi Arabia": "Saudi Arabia",
  "United Arab Emirates": "the UAE",
  General: "your market",
};

function goalAsk(goal: FunnelGoal, topic: string) {
  // Soft closes only — hard sells + early links kill organic reach
  if (goal === "Followers") {
    return `Follow Bravioniyx for clear ${topic} notes you can actually use — no fluff, no daily spam.`;
  }
  if (goal === "Engagement") {
    return `Quick question for the feed: what’s breaking first — login, speed, or clarity? One-word replies welcome.`;
  }
  return `If you want it done properly, a short brief is enough — we’ll reply with the next step. No pressure pitch.`;
}

/** Website-aligned creatives: short, scroll-stopping, service-real. */
export const serviceCreatives: Record<
  string,
  (ctx: { region: Region; goal: FunnelGoal; day: number; total: number; stage: Stage }) => CreativeCopy
> = {
  "custom-software-development": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "software");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "Still running the business on sheets?",
        graphicTitle: "Your process.\nNot someone else’s software.",
        graphicLine: "Custom systems shaped around how your team already works.",
        body: `Spreadsheets. Chats. Three logins for one workflow.\n\nIf that sounds like your week in ${who[region]}, you don’t need “more tools” — you need software that follows your process.\n\nBravioniyx builds custom business apps, management systems, and SaaS products around the work you already do.\n\n${ask}`,
        ctaLabel: "Get a software quote",
      },
      Value: {
        headline: "One system. Your rules.",
        graphicTitle: "Custom software\nthat fits the work",
        graphicLine: "Web apps · Management systems · SaaS",
        body: `What we actually build:\n\n• Business web applications for teams that outgrew sheets\n• Custom management systems (records, approvals, day-to-day ops)\n• SaaS products your customers can sign into later\n\nStart with one costly workflow. Expand when it’s in daily use.\n\n${ask}`,
        ctaLabel: "Start with one workflow",
      },
      Proof: {
        headline: "Remote by default. On-site when needed.",
        graphicTitle: "Built. Delivered.\nSupported.",
        graphicLine: "Scope first → build → stay after go-live.",
        body: `Delivery is virtual by default. If the job needs someone at your office, we come on-site too.\n\nSame standard for ${who[region]}: clear scope, real screens, support after launch — not a handoff and silence.\n\n${ask}`,
        ctaLabel: "Talk about your build",
      },
      Offer: {
        headline: "From internal tool to product",
        graphicTitle: "Run the company.\nOr sell the software.",
        graphicLine: "Same base. Room to grow.",
        body: `A custom build can stay internal — or open later as a product customers pay for, without rewriting from zero.\n\nTell us the workflow that costs the most time. We’ll shape the rest around it.\n\n${ask}`,
        ctaLabel: "Request a quote",
      },
      Engage: {
        headline: "Which workflow burns the most hours?",
        graphicTitle: "Name the bottleneck.",
        graphicLine: "Approvals · Records · Reports · Client portal",
        body: `Be honest — what’s eating your team’s day?\n\nApprovals stuck in chat?\nRecords split across files?\nReports that take half a Monday?\n\nComment the one word. We’ll tell you if custom software is the right move.\n\n${ask}`,
        ctaLabel: "Message us the brief",
      },
      CTA: {
        headline: "Ready for software that fits?",
        graphicTitle: "Let’s scope\nyour build",
        graphicLine: "Ideas → Solutions → Growth",
        body: `Custom software only works when the process comes first.\n\nShare the service, what the work must do, and how the business should run after launch.\n\n${ask}`,
        ctaLabel: "Get a quote",
      },
    };
    return map[stage];
  },

  "website-development": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "website");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "Is your website losing leads quietly?",
        graphicTitle: "Clear site.\nClear offer.\nMore enquiries.",
        graphicLine: "Business & store websites that stay sharp on every screen.",
        body: `A slow or confusing site doesn’t “look bad” — it costs enquiries every week.\n\nFor businesses in ${who[region]}, Bravioniyx builds websites that explain the offer, look sharp on mobile, and lead to a quote.\n\n${ask}`,
        ctaLabel: "Get a website quote",
      },
      Value: {
        headline: "Sites that sell the work",
        graphicTitle: "Business sites.\nStores.\nMobile-first.",
        graphicLine: "Designed to convert — not just to exist.",
        body: `What you get:\n\n• Business websites that make the offer obvious\n• E-commerce ready to take orders\n• Responsive design that stays clear on phone and desktop\n\n${ask}`,
        ctaLabel: "Build my website",
      },
      Proof: {
        headline: "One site. Brand, offer, quote.",
        graphicTitle: "Your brand,\nworking online",
        graphicLine: "Remote delivery. On-site when you need us.",
        body: `We don’t ship a pretty homepage and disappear.\n\nScope → design → build → quote form that actually gets used.\n\n${ask}`,
        ctaLabel: "See how we build",
      },
      Offer: {
        headline: "Launch a site that works harder",
        graphicTitle: "Website that\nearns its keep",
        graphicLine: "From first visit to quote request.",
        body: `If your current site can’t explain what you do in 5 seconds, it’s time.\n\n${ask}`,
        ctaLabel: "Request a quote",
      },
      Engage: {
        headline: "What’s wrong with your site right now?",
        graphicTitle: "Slow? Unclear?\nNot converting?",
        graphicLine: "Tell us in one word.",
        body: `Drop a comment: Slow / Unclear / Outdated / No enquiries.\n\nWe’ll point you to the fix.\n\n${ask}`,
        ctaLabel: "Chat about the site",
      },
      CTA: {
        headline: "Let’s build your next website",
        graphicTitle: "Get the site\nyou meant to have",
        graphicLine: "bravioniyx.com",
        body: `Pick Website Development, describe the business, and send the brief.\n\n${ask}`,
        ctaLabel: "Get a website quote",
      },
    };
    return map[stage];
  },

  "rdp-setup": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "RDP");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "Your team is online. Your desktop is not.",
        graphicTitle: "RDP that\nopens on the first try",
        graphicLine: "Windows Remote Desktop configured for daily work — not a lucky login.",
        body: `9:00 a.m. Coffee ready. Laptop open.\nThen: connection failed. Again.\n\nThat is not “remote work.” That is a broken door to the office.\n\nIf your team in ${who[region]} is losing mornings to failed RDP logins, random drops, or a temporary setup that never got finished, Bravioniyx will rebuild it properly — Windows RDP, VPS access, and a sign-in path people can trust.\n\n${ask}`,
        ctaLabel: "Fix my RDP",
      },
      Value: {
        headline: "One login. Full office. Anywhere.",
        graphicTitle: "Sign in once.\nWork from anywhere.",
        graphicLine: "Team RDP · Windows hardening · VPS remote access",
        body: `What a proper RDP setup includes:\n\n• Remote Desktop access for every person who needs it\n• Windows configuration built for daily use — not a one-time demo\n• VPS remote access when you need a clean, dedicated machine\n\nYour files, your software, your workflows — available without the chaos.\n\n${ask}`,
        ctaLabel: "Set up RDP",
      },
      Proof: {
        headline: "The best RDP feels invisible",
        graphicTitle: "Stable access\nbeats lucky access",
        graphicLine: "Tested sign-in. Reliable sessions. Support after go-live.",
        body: `A fragile remote desktop costs more time than it saves.\n\nWe configure, test, and harden the path so your team in ${who[region]} signs in and works — whether they are across the city or across the country.\n\nDelivery is remote by default. On-site when the machine needs hands-on work.\n\n${ask}`,
        ctaLabel: "Get RDP sorted",
      },
      Offer: {
        headline: "Need reliable RDP this week?",
        graphicTitle: "Remote access.\nDone properly.",
        graphicLine: "Users · apps · machine — we configure the rest.",
        body: `Send three details and we take it from there:\n\n1. How many people need access\n2. Windows PC, VPS, or existing server\n3. Which apps must open after login\n\nWe set up Remote Desktop so the team works — without the morning drama.\n\n${ask}`,
        ctaLabel: "Request RDP setup",
      },
      Engage: {
        headline: "Which RDP problem is yours?",
        graphicTitle: "Login · Drops\n· Speed · Setup",
        graphicLine: "Reply with one word — we will point to the fix.",
        body: `Tell us what is breaking first:\n\n• Login\n• Disconnects\n• Speed\n• Never configured properly\n\nComment below. We help teams in ${who[region]} replace “temporary” RDP with access that lasts.\n\n${ask}`,
        ctaLabel: "Message the issue",
      },
      CTA: {
        headline: "Stop starting the day with a failed login",
        graphicTitle: "Get RDP\nworking today",
        graphicLine: "Bravioniyx Technologies · Remote Desktop done right",
        body: `Your team should open the desktop and get to work — not fight the connection.\n\nAsk for RDP Setup & Configuration: Windows Remote Desktop, VPS access, and a login path that holds.\n\n${ask}`,
        ctaLabel: "Set up my RDP",
      },
    };
    return map[stage];
  },

  "server-setup": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "servers");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "Live on day one. Broken on day three?",
        graphicTitle: "Servers that\nstay after go-live",
        graphicLine: "Configure. Deploy. Maintain.",
        body: `A server that only works on launch day isn’t finished.\n\nBravioniyx configures, deploys, and looks after servers for teams in ${who[region]} — including after go-live.\n\n${ask}`,
        ctaLabel: "Talk about servers",
      },
      Value: {
        headline: "Setup is half the job",
        graphicTitle: "Config → Deploy\n→ Look after it",
        graphicLine: "Troubleshooting included when production misbehaves.",
        body: `• Server configuration done properly the first time\n• Deployment you can trust\n• Maintenance + troubleshooting after launch\n\n${ask}`,
        ctaLabel: "Get server help",
      },
      Proof: {
        headline: "We don’t vanish after deploy",
        graphicTitle: "Production needs\na caretaker",
        graphicLine: "Remote delivery. On-site when required.",
        body: `Launch is the start. We stay available when something breaks in real use.\n\n${ask}`,
        ctaLabel: "Book a server review",
      },
      Offer: {
        headline: "Need a server handled end-to-end?",
        graphicTitle: "From blank box\nto steady production",
        graphicLine: "Tell us the workload. We’ll set the stack.",
        body: `${ask}`,
        ctaLabel: "Request server setup",
      },
      Engage: {
        headline: "What’s failing on your server?",
        graphicTitle: "Deploy? Speed?\nDowntime?",
        graphicLine: "Comment the symptom.",
        body: `One word in the comments — we’ll tell you the usual fix path.\n\n${ask}`,
        ctaLabel: "Message the issue",
      },
      CTA: {
        headline: "Let’s get the server stable",
        graphicTitle: "Server setup\n& management",
        graphicLine: "bravioniyx.com",
        body: `${ask}`,
        ctaLabel: "Talk about servers",
      },
    };
    return map[stage];
  },

  networking: ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "networking");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "When the network drops, the office stops",
        graphicTitle: "Office networks\nthat stay connected",
        graphicLine: "Planned infrastructure — not Monday patches.",
        body: `People and systems in ${who[region]} stay productive only when the network was designed for the work.\n\n${ask}`,
        ctaLabel: "Fix the network",
      },
      Value: {
        headline: "Connectivity with a plan",
        graphicTitle: "Setup. Troubleshoot.\nGrow.",
        graphicLine: "Business IT infrastructure built to scale.",
        body: `• Network setup & configuration\n• Troubleshooting when devices drop\n• Infrastructure planned for growth\n\n${ask}`,
        ctaLabel: "Plan my network",
      },
      Proof: {
        headline: "Stop patching. Start planning.",
        graphicTitle: "Designed networks\nbeat daily firefighting",
        graphicLine: "Bravioniyx Technologies",
        body: `${ask}`,
        ctaLabel: "Get a network review",
      },
      Offer: {
        headline: "Need the office online — properly?",
        graphicTitle: "Networking\nsolutions",
        graphicLine: "From first switch to stable floor.",
        body: `${ask}`,
        ctaLabel: "Request networking help",
      },
      Engage: {
        headline: "Wi-Fi, LAN, or total chaos?",
        graphicTitle: "What’s dropping\nin your office?",
        graphicLine: "Comment: Wi-Fi / LAN / Printers / Everything",
        body: `${ask}`,
        ctaLabel: "WhatsApp the floor plan",
      },
      CTA: {
        headline: "Let’s connect the office right",
        graphicTitle: "Networking\ndone properly",
        graphicLine: "bravioniyx.com",
        body: `${ask}`,
        ctaLabel: "Fix the network",
      },
    };
    return map[stage];
  },

  "it-support": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "IT support");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "Systems down. Ticket void. Day wasted.",
        graphicTitle: "IT support that\nactually answers",
        graphicLine: "Remote help when software or systems stop behaving.",
        body: `Teams in ${who[region]} need a direct line — diagnose, fix, move on.\n\n${ask}`,
        ctaLabel: "Get IT support",
      },
      Value: {
        headline: "A real line when things break",
        graphicTitle: "Remote support.\nClear fixes.",
        graphicLine: "Troubleshooting + ongoing maintenance.",
        body: `• Remote technical support\n• Software & system troubleshooting\n• Maintenance so small issues stay small\n\n${ask}`,
        ctaLabel: "Open a support chat",
      },
      Proof: {
        headline: "Keep the team working",
        graphicTitle: "Fix fast.\nStay productive.",
        graphicLine: "Remote by default. On-site when needed.",
        body: `${ask}`,
        ctaLabel: "Talk to support",
      },
      Offer: {
        headline: "Need ongoing IT backup?",
        graphicTitle: "Technical assistance\non call",
        graphicLine: "When the stack misbehaves, you message us.",
        body: `${ask}`,
        ctaLabel: "Get IT support",
      },
      Engage: {
        headline: "What’s broken today?",
        graphicTitle: "Email? PC?\nServer? Software?",
        graphicLine: "Comment the one that’s stuck.",
        body: `${ask}`,
        ctaLabel: "WhatsApp the error",
      },
      CTA: {
        headline: "Get a direct IT line",
        graphicTitle: "IT Support &\nTechnical Assistance",
        graphicLine: "bravioniyx.com",
        body: `${ask}`,
        ctaLabel: "Get IT support",
      },
    };
    return map[stage];
  },

  "chat-room-servers": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "chat servers");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "Communities stay online when the server does",
        graphicTitle: "Chat servers\nset up to last",
        graphicLine: "Setup · Deploy · Keep running",
        body: `Chat infrastructure for operators in ${who[region]} — configured, deployed, maintained.\n\n${ask}`,
        ctaLabel: "Set up chat servers",
      },
      Value: {
        headline: "Chat rooms need real infra",
        graphicTitle: "Not hope.\nInfrastructure.",
        graphicLine: "Configuration, deployment, troubleshooting.",
        body: `• Chat room server setup\n• Deployment & management\n• Maintenance when rooms go quiet for the wrong reason\n\n${ask}`,
        ctaLabel: "Configure my chat stack",
      },
      Proof: {
        headline: "Uptime is the product",
        graphicTitle: "Rooms online.\nUsers happy.",
        graphicLine: "Bravioniyx keeps the stack running.",
        body: `${ask}`,
        ctaLabel: "Talk chat infrastructure",
      },
      Offer: {
        headline: "Launch or rescue a chat server",
        graphicTitle: "Chat Room\nServers",
        graphicLine: "From first install to steady rooms.",
        body: `${ask}`,
        ctaLabel: "Request setup",
      },
      Engage: {
        headline: "New rooms or fixing downtime?",
        graphicTitle: "Setup or rescue?",
        graphicLine: "Comment: New / Down / Slow / Hacked",
        body: `${ask}`,
        ctaLabel: "Message the stack details",
      },
      CTA: {
        headline: "Get chat infrastructure handled",
        graphicTitle: "Chat servers\ndone properly",
        graphicLine: "bravioniyx.com",
        body: `${ask}`,
        ctaLabel: "Set up chat servers",
      },
    };
    return map[stage];
  },

  "cloud-vps": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "cloud & VPS");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "A VPS is useless until it’s configured for the job",
        graphicTitle: "Cloud & VPS\ndone properly",
        graphicLine: "Deploy. Migrate. Tighten.",
        body: `For teams in ${who[region]}: virtual servers set up for real workloads — not empty boxes.\n\n${ask}`,
        ctaLabel: "Get a VPS quote",
      },
      Value: {
        headline: "Renting a box ≠ running a server",
        graphicTitle: "VPS that\nearns its rent",
        graphicLine: "Configuration · Cloud deploy · Migration",
        body: `• VPS configuration for real work\n• Cloud deployment done cleanly\n• Migration & optimization without a week of downtime\n\n${ask}`,
        ctaLabel: "Configure my VPS",
      },
      Proof: {
        headline: "Move workloads without the panic",
        graphicTitle: "Migrations\nwithout drama",
        graphicLine: "Tightened, tested, handed over.",
        body: `${ask}`,
        ctaLabel: "Plan a migration",
      },
      Offer: {
        headline: "Need cloud/VPS handled?",
        graphicTitle: "Cloud & VPS\nSolutions",
        graphicLine: "Tell us the workload — we set the machine.",
        body: `${ask}`,
        ctaLabel: "Get a VPS quote",
      },
      Engage: {
        headline: "New VPS or moving an old one?",
        graphicTitle: "New · Move · Speed · Secure",
        graphicLine: "Comment your situation.",
        body: `${ask}`,
        ctaLabel: "WhatsApp the specs",
      },
      CTA: {
        headline: "Let’s get your VPS working",
        graphicTitle: "Cloud & VPS\nready for work",
        graphicLine: "bravioniyx.com",
        body: `${ask}`,
        ctaLabel: "Get a VPS quote",
      },
    };
    return map[stage];
  },

  "game-development": ({ region, goal, stage }) => {
    const ask = goalAsk(goal, "Unity games");
    const map: Record<Stage, CreativeCopy> = {
      Hook: {
        headline: "From first playable scene to a real build",
        graphicTitle: "Unity games\nbuilt to play",
        graphicLine: "Gameplay · Scenes · UI · Playable builds",
        body: `Bravioniyx builds Unity games for creators and teams in ${who[region]} — not just asset dumps.\n\n${ask}`,
        ctaLabel: "Start a game brief",
      },
      Value: {
        headline: "Gameplay first. Then the build.",
        graphicTitle: "Scenes. Systems.\nA build you can test.",
        graphicLine: "Unity development with follow-up fixes.",
        body: `• Unity game development\n• Gameplay, scenes, and interface\n• Playable builds + fixes after\n\n${ask}`,
        ctaLabel: "Talk Unity",
      },
      Proof: {
        headline: "A build beats a moodboard",
        graphicTitle: "Playable > pretty slides",
        graphicLine: "We ship something you can run.",
        body: `${ask}`,
        ctaLabel: "Share the game idea",
      },
      Offer: {
        headline: "Got a game concept?",
        graphicTitle: "Let’s build\nthe first scene",
        graphicLine: "Scope → playable → iterate",
        body: `${ask}`,
        ctaLabel: "Start a game brief",
      },
      Engage: {
        headline: "Mobile, PC, or prototype?",
        graphicTitle: "What are you building?",
        graphicLine: "Comment: Mobile / PC / Prototype / Multiplayer",
        body: `${ask}`,
        ctaLabel: "Message the concept",
      },
      CTA: {
        headline: "Build your next Unity game with us",
        graphicTitle: "Game Development\nUnity",
        graphicLine: "bravioniyx.com",
        body: `${ask}`,
        ctaLabel: "Start a game brief",
      },
    };
    return map[stage];
  },
};

export function creativeFor(slug: string, ctx: { region: Region; goal: FunnelGoal; day: number; total: number; stage: Stage }) {
  const builder = serviceCreatives[slug] ?? serviceCreatives["custom-software-development"];
  return builder(ctx);
}
