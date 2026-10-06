"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { initials } from "@/shiftcomply/lib/derive";
import { useI18n } from "@/shiftcomply/lib/i18n";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ---------- Card ---------- */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-lg border border-line bg-surface shadow-card", className)}>{children}</div>;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4 px-5 pt-4 pb-3", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------- Page header ---------- */

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-1 inline-block text-[13px] text-muted hover:text-primary">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-ink">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Button ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid";

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  const styles: Record<Variant, string> = {
    primary: "bg-primary text-white hover:bg-primary-hover border border-primary hover:border-primary-hover",
    secondary: "bg-surface text-ink border border-line-strong hover:bg-sunken",
    ghost: "text-primary hover:bg-primary-soft border border-transparent",
    danger: "bg-surface text-danger border border-line-strong hover:bg-danger-soft",
    dangerSolid: "bg-danger text-white border border-danger hover:bg-[#86310f]",
  };
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-[13px]",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "secondary",
  children,
  className,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  const styles: Record<Variant, string> = {
    primary: "bg-primary text-white hover:bg-primary-hover border border-primary",
    secondary: "bg-surface text-ink border border-line-strong hover:bg-sunken",
    ghost: "text-primary hover:bg-primary-soft border border-transparent",
    danger: "bg-surface text-danger border border-line-strong hover:bg-danger-soft",
    dangerSolid: "bg-danger text-white border border-danger hover:bg-[#86310f]",
  };
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ---------- Status badge ---------- */

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({ tone = "neutral", children, dot = false }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  const styles: Record<Tone, string> = {
    neutral: "bg-info-soft text-body",
    info: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
  };
  const dots: Record<Tone, string> = {
    neutral: "bg-subtle",
    info: "bg-primary",
    success: "bg-success-bar",
    warning: "bg-warning-bar",
    danger: "bg-danger",
  };
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-[3px] px-2 py-[3px] text-[12px] font-medium whitespace-nowrap", styles[tone])}>
      {dot && <span className={cx("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}

/* ---------- Avatar ---------- */

const AVATAR_TONES = [
  "bg-[#e6edfb] text-[#2a4f9c]",
  "bg-[#e8f3ee] text-[#26694a]",
  "bg-[#f6ece4] text-[#8a4c22]",
  "bg-[#efe9f7] text-[#5b3f8c]",
  "bg-[#e7f1f4] text-[#2c6371]",
  "bg-[#f4eaea] text-[#8b3a3a]",
];

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const tone = AVATAR_TONES[name.charCodeAt(0) % AVATAR_TONES.length];
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", tone)}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {initials(name)}
    </span>
  );
}

/* ---------- Ring gauge (matches the KPI rings in the reference) ---------- */

export function Ring({
  value,
  max,
  color,
  label,
  size = 84,
}: {
  value: number;
  max: number;
  color: string;
  label?: ReactNode;
  size?: number;
}) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9edf2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[22px] font-semibold text-ink tabular">
        {label ?? value}
      </div>
    </div>
  );
}

/* ---------- Progress bar ---------- */

export function Progress({ value, max, color = "var(--color-primary)" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-[2px] bg-[#e8edf4]">
      <div className="h-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ---------- Segmented tabs ---------- */

export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cx(
            "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
            value === it.value ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {it.label}
          {it.count !== undefined && (
            <span
              className={cx(
                "rounded-full px-1.5 text-[11px] tabular",
                value === it.value ? "bg-primary-soft text-primary" : "bg-info-soft text-muted",
              )}
            >
              {it.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-line-strong bg-surface p-0.5">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cx(
            "flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition-colors",
            value === it.value ? "bg-navy text-white" : "text-body hover:bg-sunken",
          )}
        >
          {it.label}
          {it.count !== undefined && (
            <span className={cx("text-[12px] tabular", value === it.value ? "text-white/70" : "text-subtle")}>{it.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Form fields ---------- */

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-body">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "h-9 w-full rounded-md border border-line-strong bg-surface px-3 text-[13px] text-ink outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-primary/15";

export function Select({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cx(inputClass, "pr-8", className)}>
      {children}
    </select>
  );
}

/* ---------- Modal & drawer ---------- */

function useEscape(onClose: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const { t } = useI18n();
  useEscape(onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/40 px-4 pt-[10vh] pb-8 [animation:fade-in_.12s_ease-out]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full rounded-lg bg-surface shadow-pop" style={{ maxWidth: width }}>
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="text-[16px] font-semibold">{title}</h3>
            {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-sunken" aria-label={t("Close")}>
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line bg-sunken px-5 py-3 rounded-b-lg">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
  useEscape(onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-navy/25 [animation:fade-in_.12s_ease-out]" onClick={onClose} />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-[420px] flex-col bg-surface shadow-pop [animation:drawer-in_.16s_ease-out]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="text-[16px] font-semibold">{title}</div>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-sunken" aria-label={t("Close")}>
            <X size={18} />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </aside>
    </div>
  );
}

/* ---------- Misc ---------- */

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

export function EmptyState({ title, text, icon }: { title: string; text?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-3 text-subtle">{icon}</div>}
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-[13px] text-muted">{text}</p>}
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cx("border-b border-line bg-sunken px-4 py-2.5 text-left text-[12px] font-medium text-muted", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cx("border-b border-line px-4 py-3 align-middle text-[13px]", className)}>{children}</td>;
}

/* ---------- Confirm dialog ---------- */

/**
 * Asks before doing something that cannot be undone. Pass `confirmText` to make the person
 * type a word (for example the hotel name) before the button becomes active.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  confirmText,
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<unknown> | void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmText?: string;
  danger?: boolean;
}) {
  const { t, rich } = useI18n();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = !confirmText || typed.trim().toLowerCase() === confirmText.trim().toLowerCase();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>
            {t("Cancel")}
          </Button>
          <Button
            variant={danger ? "dangerSolid" : "primary"}
            disabled={!ready || busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
              onClose();
            }}
          >
            {busy ? t("Working") : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-[13px] text-body">{children}</div>
      {confirmText && (
        <label className="mt-4 block">
          <span className="mb-1 block text-[13px] font-medium text-body">
            {rich("Type {text} to confirm", { text: <span className="font-semibold text-ink">{confirmText}</span> })}
          </span>
          <input autoFocus className={inputClass} value={typed} onChange={(e) => setTyped(e.target.value)} />
        </label>
      )}
    </Modal>
  );
}
