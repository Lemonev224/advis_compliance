"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BedDouble,
  BellRing,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  CircleHelp,
  LogOut,
  ChartGantt,
  FileUp,
  KeyRound,
  LayoutGrid,
  Menu,
  Plus,
  Search,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Avatar, Button, cx } from "./ui";
import { useStore } from "@/shiftcomply/lib/store";
import { buildAlerts, initials } from "@/shiftcomply/lib/derive";

/** "marta.vidal@hotel.com" -> "Marta Vidal" */
function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter((p) => p && !/^\d+$/.test(p))
    .map((p) => p.replace(/\d+/g, ""))
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}
import { AddEmployeeModal, AssignRoomModal, UploadDocumentModal } from "./actions";
import { OnboardingWizard } from "./onboarding";
import { BrandLogo } from "./brand";

const NAV = [
  { href: "/shiftcomply-demo", label: "Dashboard", icon: LayoutGrid },
  { href: "/shiftcomply-demo/staff", label: "Staff", icon: Users },
  { href: "/shiftcomply-demo/housing", label: "Housing", icon: BedDouble },
  { href: "/shiftcomply-demo/schedule", label: "Timeline", icon: ChartGantt },
  { href: "/shiftcomply-demo/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/shiftcomply-demo/reminders", label: "Reminders", icon: BellRing },
];

const NAV_BOTTOM = [{ href: "/shiftcomply-demo/settings", label: "Settings", icon: Settings }];

function isActive(pathname: string, href: string) {
  return href === "/shiftcomply-demo" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

/* ---------- Sidebar ---------- */

function SideNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const item = (n: (typeof NAV)[number]) => {
    const active = isActive(pathname, n.href);
    const Icon = n.icon;
    return (
      <Link
        key={n.href}
        href={n.href}
        onClick={onClose}
        className={cx(
          "group flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] font-medium transition-colors",
          active ? "bg-primary text-white" : "text-muted hover:bg-sunken hover:text-ink",
        )}
      >
        <Icon size={20} strokeWidth={active ? 2 : 1.75} className={active ? "text-white" : "text-[#7c8799] group-hover:text-ink"} />
        <span>{n.label}</span>
      </Link>
    );
  };
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-navy/30 lg:hidden" onClick={onClose} />}
      <nav
        className={cx(
          "fixed top-14 bottom-0 left-0 z-30 flex w-[84px] flex-col justify-between border-r border-line bg-surface px-2 py-3 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col gap-1">{NAV.map(item)}</div>
        <div className="flex flex-col gap-1">
          {NAV_BOTTOM.map(item)}
          <a
            href="mailto:al@advisorly.uk"
            className="group flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] font-medium text-muted hover:bg-sunken hover:text-ink"
          >
            <CircleHelp size={20} strokeWidth={1.75} className="text-[#7c8799] group-hover:text-ink" />
            <span>Help</span>
          </a>
        </div>
      </nav>
    </>
  );
}

/* ---------- Top bar: New menu ---------- */

function NewMenu() {
  const { canEdit } = useStore();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<null | "employee" | "room" | "doc">(null);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const items = [
    { label: "Add employee", icon: UserPlus, run: () => setModal("employee") },
    { label: "Assign room", icon: KeyRound, run: () => setModal("room") },
    { label: "Upload document", icon: FileUp, run: () => setModal("doc") },
  ];

  if (!canEdit) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-white hover:bg-primary-hover"
      >
        <Plus size={16} />
        New
      </button>
      {open && (
        <div className="absolute top-10 right-0 z-50 w-56 rounded-md border border-line bg-surface py-1 text-ink shadow-pop">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.run();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-sunken"
            >
              <it.icon size={16} className="text-muted" />
              {it.label}
            </button>
          ))}
        </div>
      )}
      {modal === "employee" && <AddEmployeeModal open onClose={() => setModal(null)} />}
      {modal === "room" && <AssignRoomModal open onClose={() => setModal(null)} />}
      {modal === "doc" && <UploadDocumentModal open onClose={() => setModal(null)} />}
    </div>
  );
}

/* ---------- Top bar: hotel switcher ---------- */

function HotelSwitcher() {
  const { hotel, myHotels, switchHotel, createDemoHotel, demoMode } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  if (!hotel) return null;
  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 rounded px-2 text-[13px] text-[#c3cfe2] hover:bg-navy-soft hover:text-white"
      >
        <span className="max-w-[200px] truncate">{hotel.name}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute top-10 right-0 z-50 w-72 rounded-md border border-line bg-surface py-1 text-ink shadow-pop">
          {hotel.seasonLabel && (
            <div className="border-b border-line px-3 py-2 text-[12px] text-muted">
              Season
              <div className="text-[13px] font-medium text-ink">{hotel.seasonLabel}</div>
            </div>
          )}
          {myHotels.map((h) => (
            <button
              key={h.id}
              onClick={() => {
                setOpen(false);
                if (h.id !== hotel.id) switchHotel(h.id);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-sunken"
            >
              <span className="truncate">
                {h.name}
                {h.isDemo && <span className="ml-1.5 rounded-[3px] bg-warning-soft px-1.5 py-px text-[11px] text-warning">Demo</span>}
              </span>
              {h.id === hotel.id && <Check size={15} className="shrink-0 text-primary" />}
            </button>
          ))}
          {!demoMode && <div className="border-t border-line">
            {!myHotels.some((h) => h.isDemo) && (
              <button
                onClick={() => {
                  setOpen(false);
                  createDemoHotel();
                }}
                className="block w-full px-3 py-2 text-left text-[13px] text-primary hover:bg-sunken"
              >
                Try the demo hotel
              </button>
            )}
            <Link href="/shiftcomply-demo/welcome" onClick={() => setOpen(false)} className="block px-3 py-2 text-[13px] text-primary hover:bg-sunken">
              Set up another hotel
            </Link>
          </div>}
        </div>
      )}
    </div>
  );
}

/* ---------- Top bar: search ---------- */

function GlobalSearch() {
  const { employees } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const router = useRouter();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return employees
      .filter((e) => e.name.toLowerCase().includes(s) || e.role.toLowerCase().includes(s) || e.roomId?.includes(s))
      .slice(0, 6);
  }, [q, employees]);

  return (
    <div ref={ref} className="relative hidden w-full max-w-[420px] md:block">
      <div className="flex h-[34px] w-full items-center gap-2 rounded border border-[#2a4c7f] bg-navy-soft px-3 text-[#9fb1cc] focus-within:border-white focus-within:bg-white focus-within:text-muted">
        <Search size={15} />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search staff, rooms, documents"
          className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#9fb1cc] focus:text-ink focus:placeholder:text-subtle"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-11 left-0 z-50 w-80 rounded-md border border-line bg-surface py-1 shadow-pop">
          {results.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setOpen(false);
                setQ("");
                router.push(`/shiftcomply-demo/staff/${e.id}`);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-sunken"
            >
              <Avatar name={e.name} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{e.name}</span>
                <span className="block truncate text-[12px] text-muted">
                  {e.role}
                  {e.roomId ? `, room ${e.roomId}` : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Top bar: notifications ---------- */

function NotificationsMenu() {
  const { employees, rooms, documents } = useStore();
  const alerts = useMemo(() => buildAlerts(employees, rooms, documents), [employees, rooms, documents]);
  const urgent = alerts.filter((a) => a.severity === "critical");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-navy-soft hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {urgent.length > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white tabular">
            {urgent.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-10 right-0 z-50 w-[360px] rounded-md border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-[14px] font-semibold text-ink">Needs attention</span>
            <span className="text-[12px] text-muted">{alerts.length} open</span>
          </div>
          <div className="scroll-thin max-h-[360px] overflow-y-auto">
            {alerts.slice(0, 8).map((a) => (
              <Link
                key={a.id}
                href={a.href}
                onClick={() => setOpen(false)}
                className="block border-b border-line px-4 py-3 last:border-0 hover:bg-sunken"
              >
                <span className="block text-[13px] font-medium text-ink">{a.title}</span>
                <span className="block truncate text-[12px] text-muted">{a.detail}</span>
              </Link>
            ))}
          </div>
          <Link
            href="/shiftcomply-demo/reminders"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-[13px] font-medium text-primary hover:bg-sunken"
          >
            View all reminders
          </Link>
        </div>
      )}
    </div>
  );
}

/* ---------- Toasts ---------- */

function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-[60] flex max-w-[420px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-md bg-navy px-4 py-2.5 text-[13px] text-white shadow-pop [animation:toast-in_.18s_ease-out]"
        >
          {t.tone === "error" ? (
            <CircleAlert size={16} className="mt-0.5 shrink-0 text-[#ff8a8a]" />
          ) : (
            <Check size={16} className="mt-0.5 shrink-0 text-success-bar" />
          )}
          <span className="flex-1">{t.text}</span>
          <button onClick={() => dismissToast(t.id)} className="mt-0.5 text-white/50 hover:text-white" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- Account menu ---------- */

function AccountMenu() {
  const { userEmail, hotel, myRole, signOut, demoMode } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const roleLabel = { admin: "Administrator", housing_manager: "Housing manager", viewer: "Read only" }[myRole];
  const displayName = nameFromEmail(userEmail);
  return (
    <div ref={ref} className="relative ml-2">
      <button onClick={() => setOpen((o) => !o)} aria-label="Account" className="flex items-center gap-2.5 text-[13px] text-white">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#2d5ea8] text-[12px] font-semibold">
          {initials(displayName) || "?"}
        </span>
        <span className="hidden max-w-[160px] truncate xl:block">{displayName}</span>
      </button>
      {open && (
        <div className="absolute top-10 right-0 z-50 w-64 rounded-md border border-line bg-surface py-1 text-ink shadow-pop">
          <div className="border-b border-line px-3 py-2.5">
            <div className="truncate text-[13px] font-medium">{userEmail}</div>
            <div className="text-[12px] text-muted">
              {hotel?.name}, {roleLabel}
            </div>
          </div>
          <Link href="/shiftcomply-demo/settings" onClick={() => setOpen(false)} className="block px-3 py-2 text-[13px] hover:bg-sunken">
            Settings
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-sunken">
            <LogOut size={15} className="text-muted" />
            {demoMode ? "Exit demo" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- First-time setup and loading states ---------- */

function CenterCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 items-center bg-navy px-6">
        <BrandLogo />
      </header>
      <div className="flex flex-1 items-start justify-center px-4 pt-[12vh]">
        <div className="w-full max-w-[440px] rounded-lg border border-line bg-surface p-7 shadow-card">{children}</div>
      </div>
      <Toasts />
    </div>
  );
}

function LoadError() {
  const { errorMessage, signOut } = useStore();
  const notSetUp =
    errorMessage?.includes("does not exist") || errorMessage?.includes("schema cache") || errorMessage?.includes("Could not find");
  return (
    <CenterCard>
      <h1 className="text-[20px] font-semibold">Could not load your data</h1>
      <p className="mt-2 text-[14px] text-muted">
        {notSetUp
          ? "The database is missing some tables or columns. In the Supabase SQL editor, run supabase/setup.sql (new projects only) and then supabase/upgrade-2026-10-team-and-onboarding.sql, then reload this page."
          : errorMessage}
      </p>
      <div className="mt-5 flex gap-2">
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try again
        </Button>
        <Button onClick={signOut}>Sign out</Button>
      </div>
    </CenterCard>
  );
}

/* ---------- Shell ---------- */

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const { status, hotel, myHotels, switchHotel, demoMode, loadDemoData, signOut } = useStore();
  const pathname = usePathname();

  if (status === "no-hotel" || (pathname === "/shiftcomply-demo/welcome" && status === "ready")) return <OnboardingWizard />;
  if (status === "error") return <LoadError />;

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-4 bg-navy px-3 text-white sm:px-6 lg:gap-8">
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded text-white/80 hover:bg-navy-soft lg:hidden"
            onClick={() => setMobileNav((o) => !o)}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
          <Link href="/shiftcomply-demo" className="lg:w-[184px]" aria-label="ShiftComply home">
            <BrandLogo />
          </Link>
        </div>

        <GlobalSearch />

        <div className="ml-auto flex shrink-0 items-center gap-2 text-[13px] text-[#c3cfe2]">
          <NewMenu />
          <HotelSwitcher />
          <Link
            href="/shiftcomply-demo/calendar"
            className="hidden h-8 w-8 items-center justify-center rounded text-white/80 hover:bg-navy-soft hover:text-white sm:flex"
            aria-label="Calendar"
          >
            <CalendarDays size={18} />
          </Link>
          <NotificationsMenu />
          <AccountMenu />
        </div>
      </header>

      <SideNav mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />

      <main className="pt-14 lg:pl-[84px]">
        {demoMode && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-[#f0dca8] bg-warning-soft px-4 py-2 text-[13px] text-warning">
            <span>
              <span className="font-semibold">Demo.</span> Sample data only. Changes stay in this browser tab and are not saved.
            </span>
            <button onClick={() => loadDemoData()} className="font-medium underline">
              Reset sample data
            </button>
            <button onClick={signOut} className="font-medium underline">
              Exit demo
            </button>
          </div>
        )}
        {hotel?.isDemo && !demoMode && status === "ready" && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-[#f0dca8] bg-warning-soft px-4 py-2 text-[13px] text-warning">
            <span>
              <span className="font-semibold">Demo hotel.</span> Everything here is sample data. Changes are safe to try.
            </span>
            {myHotels.some((h) => !h.isDemo) ? (
              <button onClick={() => switchHotel(myHotels.find((h) => !h.isDemo)!.id)} className="font-medium underline">
                Back to my hotel
              </button>
            ) : (
              <Link href="/shiftcomply-demo/welcome" className="font-medium underline">
                Set up my real hotel
              </Link>
            )}
          </div>
        )}
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          {status === "ready" ? (
            children
          ) : (
            <div className="flex items-center justify-center py-32 text-[14px] text-muted">Loading your hotel</div>
          )}
        </div>
      </main>
      <Toasts />
    </div>
  );
}
