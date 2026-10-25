"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Inbox, Users, IdCard, HardHat, CalendarDays, ShieldCheck, BarChart3, Settings, ChevronsUpDown, type LucideIcon,
} from "lucide-react";
import { cx } from "@/compliance/components/ui";
import { useShellUser } from "./UserContext";
import { useT } from "@/compliance/components/I18nProvider";
import { useDemo } from "@/compliance/components/DemoState";

type Item = { href: string; label: string; icon: LucideIcon; badge?: number; match?: (p: string) => boolean };

export const NAV: { group: string; items: Item[] }[] = [
  { group: "Overview", items: [
    { href: "/compliance-demo", label: "Dashboard", icon: LayoutGrid, match: (p) => p === "/compliance-demo" },
    { href: "/compliance-demo/inbox", label: "Action inbox", icon: Inbox, badge: 9 },
  ] },
  { group: "Workforce", items: [
    { href: "/compliance-demo/workers", label: "Workers", icon: Users },
    { href: "/compliance-demo/permits", label: "Permits & immigration", icon: IdCard },
  ] },
  { group: "Sites", items: [{ href: "/compliance-demo/site-access", label: "Site access", icon: HardHat }] },
  { group: "Compliance", items: [
    { href: "/compliance-demo/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/compliance-demo/inspection-packs", label: "Inspection packs", icon: ShieldCheck },
    { href: "/compliance-demo/reports", label: "Reports", icon: BarChart3 },
  ] },
];

export function Logo() {
  const { t } = useT();
  return (
    <div className="flex items-center gap-2.5 px-2.5 pt-1 pb-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/advisorly-logo.svg" alt="" width={34} height={30} className="h-[30px] w-auto" />
      <div>
        <div className="text-white font-semibold text-[15px] tracking-[0.02em] leading-5">Advisorly</div>
        <div className="text-xs text-nav-label">{t("Workforce compliance")}</div>
      </div>
    </div>
  );
}

function NavLink({ item, pathname, onNavigate }: { item: Item; pathname: string; onNavigate?: () => void }) {
  const { t } = useT();
  const active = item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group relative flex items-center gap-2.5 min-h-ctl px-2.5 rounded-ctl no-underline transition-colors",
        active ? "bg-nav-active text-white hover:text-white" : "text-nav-text hover:bg-white/5 hover:text-white",
      )}
    >
      {active && <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-nav-brand" />}
      <Icon className="size-[18px] flex-none" strokeWidth={1.75} aria-hidden />
      <span className="truncate">{t(item.label)}</span>
      {item.badge !== undefined && (
        <span className="ml-auto rounded-full bg-bad-dot px-[7px] py-px text-xs font-semibold text-white">{item.badge}</span>
      )}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const me = useShellUser();
  const { t } = useT();
  const { data } = useDemo();
  return (
    <div className="flex h-full flex-col gap-[18px]">
      <Logo />
      <div className="flex flex-col gap-[18px] overflow-y-auto scroll-thin -mx-1 px-1">
        {NAV.map((g) => (
          <div key={g.group} className="flex flex-col gap-0.5">
            <div className="px-2.5 pb-1.5 text-xs font-medium text-nav-label">{t(g.group)}</div>
            {g.items.map((it) => <NavLink key={it.href} item={it.badge === undefined ? it : me.live ? { ...it, badge: undefined } : { ...it, badge: data.actionQueue.length }} pathname={pathname} onNavigate={onNavigate} />)}
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-nav-divider pt-3">
        <NavLink item={{ href: "/compliance-demo/settings", label: "Settings", icon: Settings }} pathname={pathname} onNavigate={onNavigate} />
        <div className="mt-2 flex items-center gap-2.5 rounded-ctl bg-white/4 px-2.5 py-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">{me.initials}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-white">{t(me.name)}</div>
            <div className="truncate text-xs text-nav-label">{t(me.roleLabel)} · {me.orgName}</div>
          </div>
          <ChevronsUpDown className="size-4 text-nav-label" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { t } = useT();
  return (
    <div className="hidden lg:block w-[232px] flex-none bg-nav-bg">
      <nav aria-label={t("Main navigation")} className="sticky top-0 h-screen px-3 py-5 text-nav-text">
        <SidebarNav />
      </nav>
    </div>
  );
}
