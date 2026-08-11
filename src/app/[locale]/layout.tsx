import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

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
    "andorra startup",
  ],
  authors: [{ name: "Advisorly" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Advisorly — Compliance Infrastructure",
    description:
      "We turn complex regulatory requirements into scalable software infrastructure for regulated industries.",
    url: "https://advisorly.tech",
    siteName: "Advisorly",
    images: [
      {
        url: "/og-image.png",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Advisorly",
  url: "https://advisorly.tech",
  logo: "https://advisorly.tech/logo.png",
  description:
    "Advisorly builds compliance infrastructure that turns complex regulatory requirements into scalable software for regulated industries.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@advisorly.uk",
    contactType: "customer service",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
