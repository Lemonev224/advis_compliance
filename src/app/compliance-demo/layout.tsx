import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./compliance.css";
import { Shell } from "@/compliance/components/shell/Shell";
import { ShellUserProvider } from "@/compliance/components/shell/UserContext";
import { LangProvider } from "@/compliance/components/I18nProvider";
import { DemoStateProvider } from "@/compliance/components/DemoState";
import { RENEWALS_COOKIE, parseRenewals } from "@/compliance/lib/demo-state";
import { DEMO_COOKIE } from "@/compliance/lib/demo";
import { getLang } from "@/compliance/lib/i18n-server";
import { makeT } from "@/compliance/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return {
    title: { default: t("Advisorly demo · Workforce compliance"), template: `%s · ${t("Advisorly demo")}` },
    description: t("Try Advisorly with a sample construction group: contracts, permits, documents and site access."),
    robots: { index: false, follow: false },
    // Same tab icons as the website (see src/app/[locale]/layout.tsx): cropped tight to the logo mark so it fills the tab.
    icons: {
      icon: [
        { url: "/icon.svg?v=2", type: "image/svg+xml" },
        { url: "/favicon.ico?v=2", sizes: "48x48" },
        { url: "/icon-512.png?v=2", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon.ico?v=2",
      apple: [{ url: "/apple-icon.png?v=2", type: "image/png", sizes: "180x180" }],
    },
  };
}

// The Advisorly compliance demo runs on sample data only. Nothing is read from or written to a database.
// Visitors get here from /demo after entering the access code.
export default async function ComplianceDemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  if (jar.get(DEMO_COOKIE)?.value !== "1") {
    const locale = jar.get("NEXT_LOCALE")?.value;
    redirect(locale === "ca" || locale === "es" ? `/${locale}/demo` : "/demo");
  }
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>
        <LangProvider lang={lang}>
          <DemoStateProvider renewals={parseRenewals(jar.get(RENEWALS_COOKIE)?.value)}>
            <ShellUserProvider>
              <Shell>{children}</Shell>
            </ShellUserProvider>
          </DemoStateProvider>
        </LangProvider>
      </body>
    </html>
  );
}
