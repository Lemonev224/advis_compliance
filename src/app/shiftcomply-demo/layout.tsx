import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./shiftcomply.css";
import { StoreProvider } from "@/shiftcomply/lib/store";
import { AppShell } from "@/shiftcomply/components/shell";
import { DEMO_COOKIE } from "@/shiftcomply/lib/demo";

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
  const inDemo = (await cookies()).get(DEMO_COOKIE)?.value === "1";
  if (!inDemo) redirect("/shiftcomply/demo");

  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
