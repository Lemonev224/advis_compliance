"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Search, Menu, X, Check, Users, FileText, IdCard, CornerDownLeft, LogOut, User, Languages, HelpCircle } from "lucide-react";
import { cx, StatusText } from "@/compliance/components/ui";
import { SidebarNav } from "./Sidebar";
import { COMPANIES, SITES, inbox, workers, documents, permits } from "@/compliance/lib/data";
import { useShellUser } from "./UserContext";
import { NavProgress } from "./NavProgress";
import { Suspense } from "react";
import { useToast, useSoon, type Feature } from "@/compliance/components/Toast";

function useOutside<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

function Popover({ children, align = "left", className }: { children: React.ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <div className={cx("absolute top-[calc(100%+6px)] z-40 rounded-card border border-line bg-surface shadow-pop", align === "right" ? "right-0" : "left-0", className)}>
      {children}
    </div>
  );
}

function CompanySwitcher() {
  const me = useShellUser();
  const orgs = me.live ? [me.orgName] : [...COMPANIES];
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn-secondary px-3 font-normal">
        <span className="inline-flex size-[22px] items-center justify-center rounded-sm bg-nav-bg text-2xs font-semibold text-white">{me.orgInitials}</span>
        <span className="hidden sm:inline">{me.orgName}</span>
        <ChevronDown className="size-4 text-ink-muted" aria-hidden />
      </button>
      {open && (
        <Popover className="w-72 p-1.5">
          <div className="eyebrow px-2.5 pt-1.5 pb-1">Organisations</div>
          {orgs.map((c, i) => (
            <button key={c} onClick={() => setOpen(false)} className="flex w-full items-center gap-2.5 rounded-ctl px-2.5 py-2 text-left hover:bg-surface-subtle">
              <span className="inline-flex size-6 items-center justify-center rounded-sm bg-avatar-bg text-2xs font-semibold text-avatar-fg">{c.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              <span className="flex-1 min-w-0">
                <span className="block truncate">{c}</span>
                <span className="block text-xs text-ink-muted">{i === 0 ? `Your organisation · ${me.roleLabel}` : "Subcontractor"}</span>
              </span>
              {i === 0 && <Check className="size-4 text-accent" aria-hidden />}
            </button>
          ))}
        </Popover>
      )}
    </div>
  );
}

function Notifications() {
  const me = useShellUser();
  const soon = useSoon();
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label={me.live ? "Notifications" : "Notifications, 9 unread"} aria-expanded={open} className="btn-secondary relative w-10 px-0">
        <Bell className="size-[18px]" strokeWidth={1.75} aria-hidden />
        {!me.live && <span className="absolute right-[9px] top-[9px] size-2 rounded-full bg-bad-dot ring-2 ring-white" />}
      </button>
      {open && (
        <Popover align="right" className="w-[340px]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-semibold">Notifications</span>
            <button className="text-sm text-accent hover:text-accent-hover" onClick={() => soon("notifications")}>Mark all read</button>
          </div>
          {me.live ? <div className="px-4 py-6 text-center text-sm text-ink-muted">No notifications yet. Expiry and access alerts will appear here once automation is connected. Today’s to-dos are in the action inbox.</div> : <ul>
            {inbox.map((n) => (
              <li key={n.title} className="flex gap-3 border-b border-line-row px-4 py-3 last:border-0 hover:bg-surface-subtle">
                <div className="min-w-0 flex-1">
                  <div className={cx("text-sm font-medium", n.tone === "bad" && "text-bad-fg", n.tone === "warn" && "text-warn-fg")}>{n.title}</div>
                  <div className="text-xs text-ink-muted">{n.body}</div>
                </div>
                <span className="text-xs text-ink-muted whitespace-nowrap">{n.time}</span>
              </li>
            ))}
          </ul>}
          <Link href="/compliance-demo/inbox" onClick={() => setOpen(false)} className="block border-t border-line px-4 py-2.5 text-center text-sm font-medium">Open action inbox</Link>
        </Popover>
      )}
    </div>
  );
}

/** Ends the demo visit and goes back to the website. */
export async function leaveDemo() {
  await fetch("/api/compliance-demo", { method: "DELETE" }).catch(() => null);
  window.location.assign("/");
}

function AccountMenu() {
  const me = useShellUser();
  const soon = useSoon();
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Account menu" aria-expanded={open} className="size-10 rounded-full bg-accent font-semibold text-white hover:bg-accent-hover">{me.initials}</button>
      {open && (
        <Popover align="right" className="w-60 p-1.5">
          <div className="px-2.5 py-2 border-b border-line-row mb-1">
            <div className="truncate font-medium">{me.name}</div>
            <div className="truncate text-xs text-ink-muted">{me.email} · {me.roleLabel}</div>
          </div>
          {([{ i: User, l: "Profile", f: "account" }, { i: Languages, l: "Language · English", f: "language" }, { i: HelpCircle, l: "Help & support", f: "help" }] as { i: typeof User; l: string; f: Feature }[]).map(({ i: I, l, f }) => (
            <button key={l} onClick={() => { setOpen(false); soon(f, l); }} className="flex w-full items-center gap-2.5 rounded-ctl px-2.5 py-2 text-left hover:bg-surface-subtle"><I className="size-4 text-ink-muted" aria-hidden />{l}</button>
          ))}
          <div className="my-1 border-t border-line-row" />
          <button onClick={leaveDemo} className="flex w-full items-center gap-2.5 rounded-ctl px-2.5 py-2 text-left hover:bg-surface-subtle"><LogOut className="size-4 text-ink-muted" aria-hidden />Leave demo</button>
        </Popover>
      )}
    </div>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 0); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  const m = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const groups = [
    { label: "Workers", icon: Users, items: workers.filter((w) => m(w.name) || m(w.role)).slice(0, 5).map((w) => ({ t: w.name, s: `${w.role} · ${w.company}`, href: `/compliance-demo/workers/${w.id}`, status: w.status })) },
    { label: "Documents", icon: FileText, items: documents.filter((d) => m(d.name) || m(d.worker)).slice(0, 3).map((d) => ({ t: d.name, s: d.worker, href: "/compliance-demo/workers/documents", status: d.status })) },
    { label: "Permits", icon: IdCard, items: permits.filter((p) => m(p.name) || m(p.type)).slice(0, 3).map((p) => ({ t: `${p.name} · ${p.stage}`, s: p.type, href: "/compliance-demo/permits", status: undefined })) },
  ].filter((g) => g.items.length);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-nav-bg/40 px-4 pt-[12vh] backdrop-blur-[2px]" onMouseDown={onClose}>
      <div role="dialog" aria-label="Search" className="w-full max-w-[600px] overflow-hidden rounded-card border border-line bg-surface shadow-pop" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-[18px] text-ink-muted" aria-hidden />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workers, documents, permits…" className="h-14 flex-1 bg-transparent outline-hidden text-[15px]" />
          <span className="kbd">Esc</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-1.5 scroll-thin">
          {groups.length === 0 && <div className="px-3 py-10 text-center text-sm text-ink-muted">No results for “{q}”</div>}
          {groups.map((g) => (
            <div key={g.label} className="mb-1">
              <div className="eyebrow px-2.5 pt-2 pb-1">{g.label}</div>
              {g.items.map((it, i) => (
                <Link key={it.t + i} href={it.href} onClick={onClose} className="group flex items-center gap-3 rounded-ctl px-2.5 py-2 text-ink no-underline hover:bg-accent-tint hover:text-ink">
                  <g.icon className="size-4 text-ink-muted" aria-hidden />
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{it.t}</span><span className="block truncate text-xs text-ink-muted">{it.s}</span></span>
                  {it.status && it.status !== "ok" && <StatusText status={it.status}>{{ warn: "Expiring", bad: "Blocked", pending: "Pending" }[it.status]}</StatusText>}
                  <CornerDownLeft className="size-3.5 text-ink-muted opacity-0 group-hover:opacity-100" aria-hidden />
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-line bg-surface-subtle px-4 py-2 text-xs text-ink-muted">
          <span><span className="kbd">↑</span> <span className="kbd">↓</span> to navigate</span>
          <span><span className="kbd">↵</span> to open</span>
        </div>
      </div>
    </div>
  );
}

export function Topbar({ siteFilter = true }: { siteFilter?: boolean }) {
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const pathname = usePathname();
  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); } };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);
  const settings = pathname.startsWith("/compliance-demo/settings");

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-sm sm:px-7">
        <Suspense fallback={null}><NavProgress /></Suspense>
        <button onClick={() => setDrawer(true)} aria-label="Open navigation" className="btn-secondary w-10 px-0 lg:hidden"><Menu className="size-[18px]" aria-hidden /></button>
        <CompanySwitcher />
        {siteFilter && !settings && (
          <>
            <label htmlFor="site-filter" className="sr-only">Site</label>
            <select id="site-filter" className="input hidden md:block pr-8">
              <option>All sites</option>
              {SITES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </>
        )}
        <button onClick={() => setPalette(true)} aria-label="Search" className="btn-secondary w-10 px-0 sm:hidden"><Search className="size-[18px]" aria-hidden /></button>
        <button onClick={() => setPalette(true)} className="hidden sm:flex h-ctl max-w-[520px] flex-1 basis-[200px] items-center gap-2 rounded-ctl border border-line-input bg-surface-subtle px-3 text-left text-ink-muted hover:border-line-strong">
          <Search className="size-4" aria-hidden />
          <span className="flex-1 truncate">{settings ? "Search settings…" : "Search workers, documents, permits…"}</span>
          <span className="kbd hidden sm:inline">⌘K</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Notifications />
          <AccountMenu />
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-nav-bg/50" onClick={() => setDrawer(false)} />
          <nav aria-label="Main navigation" className="absolute inset-y-0 left-0 w-[272px] bg-nav-bg px-3 py-5 text-nav-text shadow-pop">
            <button onClick={() => setDrawer(false)} aria-label="Close navigation" className="absolute right-3 top-5 inline-flex size-8 items-center justify-center rounded-ctl text-nav-text hover:bg-white/10"><X className="size-4" aria-hidden /></button>
            <SidebarNav onNavigate={() => setDrawer(false)} />
          </nav>
        </div>
      )}
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}
