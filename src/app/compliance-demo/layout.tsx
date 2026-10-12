import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./compliance.css";
import { Shell } from "@/compliance/components/shell/Shell";
import { ShellUserProvider } from "@/compliance/components/shell/UserContext";
import { DEMO_COOKIE } from "@/compliance/lib/demo";

export const metadata: Metadata = {
  title: { default: "Advisorly demo · Workforce compliance", template: "%s · Advisorly demo" },
  description: "Try Advisorly with a sample construction group: contracts, permits, documents and site access.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.png" },
};

// The Advisorly compliance demo runs on sample data only. Nothing is read from or written to a database.
// Visitors get here from /demo after entering the access code.
export default async function ComplianceDemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  if (jar.get(DEMO_COOKIE)?.value !== "1") {
    const locale = jar.get("NEXT_LOCALE")?.value;
    redirect(locale === "ca" || locale === "es" ? `/${locale}/demo` : "/demo");
  }
  return (
    <html lang="en">
      <body>
        <ShellUserProvider>
          <Shell>{children}</Shell>
        </ShellUserProvider>
      </body>
    </html>
  );
}
