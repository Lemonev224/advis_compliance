import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import "./shiftcomply.css";
import { StoreProvider } from "@/shiftcomply/lib/store";
import { AppShell } from "@/shiftcomply/components/shell";
import { DEMO_COOKIE } from "@/shiftcomply/lib/demo";
import { LangProvider } from "@/shiftcomply/lib/i18n";
import { LANG_COOKIE, langFromHeader, sitePath, toLang } from "@/shiftcomply/lib/lang";

const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "ShiftComply demo",
  description: "Try ShiftComply with a sample seasonal hotel.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.png" },
};

// The ShiftComply demo runs on sample data in the visitor's browser.
// Visitors get here from /shiftcomply/demo after entering the access code.
export default async function ShiftComplyDemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  // The demo's own language choice, else the language the visitor used on the website, else the browser's.
  const lang =
    toLang(jar.get(LANG_COOKIE)?.value) ??
    toLang(jar.get("NEXT_LOCALE")?.value) ??
    langFromHeader((await headers()).get("accept-language")) ??
    "en";
  const inDemo = jar.get(DEMO_COOKIE)?.value === "1";
  if (!inDemo) redirect(sitePath(lang, "/shiftcomply/demo"));

  return (
    <html lang={lang} className={dmSans.variable}>
      <body className="font-sans">
        <LangProvider lang={lang}>
          <StoreProvider>
            <AppShell>{children}</AppShell>
          </StoreProvider>
        </LangProvider>
      </body>
    </html>
  );
}
