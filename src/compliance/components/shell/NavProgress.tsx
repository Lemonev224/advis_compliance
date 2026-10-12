"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin progress bar for page navigations. Starts the moment an internal link is clicked
 * (or a form posts), trickles forward while the server renders, completes when the new route is shown.
 */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (timer.current) return;
    if (done.current) clearTimeout(done.current);
    setVisible(true);
    setWidth(12);
    timer.current = setInterval(() => setWidth((w) => (w < 90 ? w + (90 - w) * 0.12 : w)), 180);
  };
  const finish = () => {
    if (!timer.current && !visible) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setWidth(100);
    done.current = setTimeout(() => { setVisible(false); setWidth(0); }, 260);
  };

  // Route changed → finish.
  useEffect(() => { finish(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      start();
    };
    const onSubmit = () => { start(); setTimeout(() => finish(), 15000); };
    const onFinish = () => finish();
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("advisorly:done", onFinish);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("advisorly:done", onFinish);
      window.removeEventListener("popstate", start);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
      <div
        className="h-full bg-accent shadow-[0_0_8px_rgba(14,111,120,0.6)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}

/** Call after a server action finishes so the bar completes even when the URL doesn't change. */
export const navDone = () => window.dispatchEvent(new Event("advisorly:done"));
