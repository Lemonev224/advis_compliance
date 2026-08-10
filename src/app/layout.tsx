import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  metadataBase: new URL("https://advisorly.tech"), // replace with your real domain once you have it
  title: {
    default: "Advisorly — Compliance Infrastructure",
    template: "%s | Advisorly",
  },
  description:
    "We turn complex regulatory requirements into scalable software infrastructure for regulated industries.",
  keywords: [
    "compliance software",
    "regtech",
    "regulatory infrastructure",
    "compliance automation",
    "andorra",
    "andorra tech",
    "andorra startup"
  ],
  authors: [{ name: "Advisorly" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png", // see step below
  },
  openGraph: {
    title: "Advisorly — Compliance Infrastructure",
    description:
      "We turn complex regulatory requirements into scalable software infrastructure for regulated industries.",
    url: "https://advisorly.tech",
    siteName: "Advisorly",
    images: [
      {
        url: "/og-image.png", // see step below
        width: 1200,
        height: 630,
        alt: "Advisorly — Compliance Infrastructure",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advisorly — Compliance Infrastructure",
    description:
      "We turn complex regulatory requirements into scalable software infrastructure for regulated industries.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}