import Link from "next/link";
import { Check, Clock, X, Minus, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { initials, type Status } from "@/compliance/lib/data";

/** Joins class names, skipping empty values. */
export const cx = (...parts: (string | false | null | undefined | 0)[]) => parts.filter(Boolean).join(" ");

/* -------- Status pill: always colour + icon + word (handoff §5) -------- */

const statusMap: Record<Status, { cls: string; Icon: LucideIcon }> = {
  ok: { cls: "bg-ok-bg text-ok-fg", Icon: Check },
  warn: { cls: "bg-warn-bg text-warn-fg", Icon: Clock },
  bad: { cls: "bg-bad-bg text-bad-fg", Icon: X },
  pending: { cls: "bg-pending-bg text-pending-fg", Icon: Minus },
};

const defaultLabels: Record<Status, string> = { ok: "Compliant", warn: "Expiring", bad: "Blocked", pending: "Pending" };

export function StatusPill({ status, children, size = "sm", className }: { status: Status; children?: ReactNode; size?: "sm" | "md"; className?: string }) {
  const { cls, Icon } = statusMap[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap", size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold", cls, className)}>
      <Icon aria-hidden className={size === "sm" ? "size-[11px]" : "size-3"} strokeWidth={3} />
      {children ?? defaultLabels[status]}
    </span>
  );
}

export function NeutralPill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-pending-bg text-ink-body whitespace-nowrap", className)}>{children}</span>;
}

export function StatusText({ status, children }: { status: Status; children: ReactNode }) {
  const { Icon } = statusMap[status];
  const color = { ok: "text-ok-fg", warn: "text-warn-fg", bad: "text-bad-fg", pending: "text-pending-fg" }[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-xs font-medium", color)}>
      <Icon aria-hidden className="size-3" strokeWidth={3} />
      {children}
    </span>
  );
}

/* -------- Avatar -------- */

export function Avatar({ name, size = 30, system }: { name: string; size?: number; system?: boolean }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size >= 44 ? Math.round(size / 3.1) : 11 }}
      className={cx("inline-flex flex-none items-center justify-center rounded-full font-semibold", system ? "bg-nav-bg text-nav-brand" : "bg-avatar-bg text-avatar-fg")}
    >
      {system ? "SY" : initials(name)}
    </span>
  );
}

/* -------- Progress -------- */

export function Progress({ value, tone = "accent", height = 8, track = "bg-track" }: { value: number; tone?: "accent" | "ok"; height?: number; track?: string }) {
  return (
    <div className={cx("w-full overflow-hidden rounded-full", track)} style={{ height }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx("h-full rounded-full", tone === "ok" ? "bg-ok-fg" : "bg-accent")} style={{ width: `${value}%` }} />
    </div>
  );
}

/* -------- Page header: section label → H1 → description → actions -------- */

export function PageHeader({ section, title, description, actions }: { section: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm text-ink-muted">{section}</div>
        <h1 className="mt-0.5 text-[24px] leading-8 font-semibold tracking-[-0.01em]">{title}</h1>
        {description && <div className="mt-1 text-sm text-ink-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------- Card shell -------- */

export function Card({ title, subtitle, actions, children, className, bodyClass, id }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; id?: string }) {
  return (
    <section id={id} className={cx("card min-w-0", className)}>
      {(title || actions) && (
        <div className="card-head">
          <div className="min-w-0">
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <div className="card-sub">{subtitle}</div>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/* -------- Info banner -------- */

export function InfoBanner({ children, aside, className }: { children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-3 rounded-card border border-info-line bg-info-bg px-4 py-3.5 text-info-fg", className)}>
      <Info aria-hidden className="size-5 text-info-icon flex-none" />
      <div className="flex-1 min-w-[260px]">{children}</div>
      {aside && <span className="text-xs">{aside}</span>}
    </div>
  );
}

/* -------- Definition list item -------- */

export function Fact({ label, children, mono, tone }: { label: string; children: ReactNode; mono?: boolean; tone?: "warn" | "bad" }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={cx("mt-0.5 font-medium wrap-break-word", mono && "num text-sm", tone === "warn" && "text-warn-fg", tone === "bad" && "text-bad-fg")}>{children}</dd>
    </div>
  );
}

/* -------- Underline tabs (presentational; pages own the state) -------- */

export function TabBar({ items, active, onSelect, label }: { items: { id: string; label: string; count?: number }[]; active: string; onSelect: (id: string) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 border-b border-[#DDE2E8] overflow-x-auto scroll-thin">
      {items.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(t.id)}
            className={cx("-mb-px h-ctl px-3.5 border-b-2 whitespace-nowrap transition-colors", on ? "border-accent font-semibold text-ink" : "border-transparent text-ink-soft hover:text-ink")}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 num text-xs text-ink-muted">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* -------- Segmented control -------- */

export function Segmented({ items, active, onSelect, label, tone = "muted" }: { items: { id: string; label: string }[]; active: string; onSelect: (id: string) => void; label: string; tone?: "muted" | "strong" }) {
  return (
    <div role="group" aria-label={label} className={cx("inline-flex gap-1 rounded-ctl p-[3px]", tone === "muted" ? "bg-surface-muted" : "bg-track")}>
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button key={it.id} aria-pressed={on} onClick={() => onSelect(it.id)} className={cx("h-ctl-row px-3 rounded-sm text-sm transition-all", on ? "bg-surface shadow-seg font-medium text-ink" : "text-ink-soft hover:text-ink")}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------- Placeholder (not yet designed screens) -------- */

export function ComingSoon({ icon: Icon, title, text, href, cta }: { icon: LucideIcon; title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center px-6 py-16">
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-accent-tint text-accent"><Icon className="size-6" aria-hidden /></span>
      <h2 className="text-[16px] font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{text}</p>
      {href && <Link href={href} className="btn-secondary mt-5">{cta}</Link>}
    </div>
  );
}
