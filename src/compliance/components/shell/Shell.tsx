"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { FlaskConical, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar, leaveDemo } from "./Topbar";
import { ToastProvider } from "@/compliance/components/Toast";
import { useT } from "@/compliance/components/I18nProvider";

const BANNER_KEY = "adv_demo_banner_closed";
const BANNER_EVENT = "advisorly:banner";

// The "sample data" banner can be closed, e.g. before presenting. It stays closed in this browser.
function subscribe(cb: () => void) {
  window.addEventListener(BANNER_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(BANNER_EVENT, cb); window.removeEventListener("storage", cb); };
}
function bannerClosed() {
  try { return localStorage.getItem(BANNER_KEY) === "1"; } catch { return false; }
}
function closeBanner() {
  try { localStorage.setItem(BANNER_KEY, "1"); } catch { /* storage blocked */ }
  window.dispatchEvent(new Event(BANNER_EVENT));
}

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useT();
  const banner = !useSyncExternalStore(subscribe, bannerClosed, () => false);

  return (
    <ToastProvider>
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {banner && (
          <div className="print:hidden flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-info-line bg-info-bg px-4 py-2 text-sm text-info-fg sm:px-7">
            <FlaskConical className="size-4 flex-none" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="sm:hidden">{t("Demo with sample data. Nothing is saved.")}</span>
              <span className="hidden sm:inline">{t("You’re trying Advisorly with a sample construction group. Explore freely: nothing you do here is saved.")}</span>
            </span>
            <span className="flex items-center gap-3">
              <a href="/#contact" className="font-medium text-info-fg underline">{t("Book a walkthrough")}</a>
              <button onClick={leaveDemo} className="font-medium text-info-fg underline">{t("Leave demo")}</button>
              <button onClick={closeBanner} aria-label={t("Hide this message")} title={t("Hide this message")} className="inline-flex size-6 items-center justify-center rounded-sm hover:bg-info-line/60"><X className="size-3.5" aria-hidden /></button>
            </span>
          </div>
        )}
        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 pt-6 pb-10 sm:px-7">{children}</main>
      </div>
    </div>
    </ToastProvider>
  );
}
