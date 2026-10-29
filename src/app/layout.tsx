import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bravioniyx Marketing Manager",
  description: "Plan creative funnels and the daily social posts for Bravioniyx Technologies.",
  robots: { index: false, follow: false },
  applicationName: "Bravioniyx Marketing",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bravioniyx",
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/logo.png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
