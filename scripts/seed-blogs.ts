import { createBlog, publishBlog } from "../src/lib/blogs/store";

async function main() {
  const one = await createBlog({
    title: "RDP that opens on the first try — what usually goes wrong",
    excerpt:
      "Failed logins and random drops are not “remote work.” They are unfinished setup. Here is a clear checklist for stable Windows RDP and VPS access.",
    body: [
      "Remote access only works when login is boring. If the first connection of the day fails, the team is already behind — coffee in hand, work still locked out.",
      "## What usually breaks",
      "• Temporary RDP that was never hardened\n• Weak or unclear access rules\n• Session drops blamed on “the internet” when config is the real issue\n• No owner after the first successful login",
      "## A practical setup path",
      "Start with who needs access and from where. Configure Windows RDP or VPS access properly, test sign-in on a normal morning, then document the path so the next person is not guessing.",
      "## When to call for help",
      "If logins fail, sessions drop, or a “temporary” remote desktop has lasted months, it is cheaper to finish the setup than to keep losing mornings.",
      "## Next step",
      "Bravioniyx Technologies configures RDP and remote access so your team signs in and works — every day, not sometimes.\n\nhttps://www.bravioniyx.com/services/rdp-setup",
    ].join("\n\n"),
    coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop",
    coverImageAlt: "Remote work laptop and connection — Bravioniyx RDP",
    serviceSlug: "rdp-setup",
    serviceTitle: "RDP Setup & Configuration",
    keywords: ["RDP setup", "Windows remote desktop", "secure RDP", "VPS remote access", "Bravioniyx"],
    metaTitle: "Stable RDP Setup for Teams | Bravioniyx",
    metaDescription:
      "Fix failed RDP logins and session drops with a proper Windows remote desktop and VPS access setup from Bravioniyx Technologies.",
    status: "draft",
    createdBy: "staff",
  });

  const two = await createBlog({
    title: "Is your business website quietly losing enquiries?",
    excerpt:
      "A slow or unclear site does not just “look bad” — it costs leads every week. What a converting business website actually needs.",
    body: [
      "Visitors decide in seconds. If the offer is unclear, the page is slow on mobile, or the quote path is buried, enquiries never get a fair chance.",
      "## What a working site must do",
      "• Explain the offer above the fold\n• Stay sharp on phone and desktop\n• Lead to a quote or conversation without friction\n• Reflect the brand without noise",
      "## Common quiet failures",
      "Pretty homepage with no next step. Desktop-only layout. Forms that nobody trusts. Content written for the company — not for the buyer.",
      "## A clearer build",
      "Scope the service pages, keep the message simple, make the quote path obvious, then ship a site that earns its keep instead of sitting as a brochure.",
      "## Next step",
      "Bravioniyx builds business and store websites that stay clear on every screen — with the enquiry path ready.\n\nhttps://www.bravioniyx.com/services/website-development",
    ].join("\n\n"),
    coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    coverImageAlt: "Business website analytics on laptop — Bravioniyx",
    serviceSlug: "website-development",
    serviceTitle: "Website Development",
    keywords: [
      "business website design",
      "website development Pakistan",
      "website that converts leads",
      "mobile first website",
      "Bravioniyx",
    ],
    metaTitle: "Business Websites That Convert | Bravioniyx",
    metaDescription:
      "Build a clear, mobile-first business website that turns interest into enquiries — practical guidance from Bravioniyx Technologies.",
    status: "draft",
    createdBy: "staff",
  });

  if (one?.id) await publishBlog(one.id);
  if (two?.id) await publishBlog(two.id);

  console.log(
    JSON.stringify(
      {
        ok: true,
        blogs: [
          { id: one?.id, slug: one?.slug, title: one?.title },
          { id: two?.id, slug: two?.slug, title: two?.title },
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
