"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cx } from "@/compliance/components/ui";

type Tone = "info" | "success" | "error";
type Toast = { id: number; title: string; body?: string; tone: Tone };
type Notify = (t: { title: string; body?: string; tone?: Tone }) => void;

const Ctx = createContext<Notify>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const next = useRef(1);
  const dismiss = useCallback((id: number) => setList((l) => l.filter((t) => t.id !== id)), []);
  const notify = useCallback<Notify>(({ title, body, tone = "info" }) => {
    const id = next.current++;
    setList((l) => [...l.filter((t) => t.title !== title).slice(-2), { id, title, body, tone }]);
    setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4500);
  }, [dismiss]);

  return (
    <Ctx.Provider value={notify}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-60 flex w-[min(380px,calc(100vw-32px))] flex-col gap-2">
        {list.map((t) => <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />)}
      </div>
    </Ctx.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(r); }, []);
  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? AlertTriangle : Info;
  return (
    <div role={toast.tone === "error" ? "alert" : "status"}
      className={cx("pointer-events-auto flex gap-3 rounded-card border bg-surface p-3.5 shadow-pop transition-all duration-200",
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        toast.tone === "error" ? "border-bad-bg" : "border-line")}>
      <Icon className={cx("mt-0.5 size-[18px] flex-none", toast.tone === "success" ? "text-ok-fg" : toast.tone === "error" ? "text-bad-fg" : "text-accent")} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{toast.title}</div>
        {toast.body && <div className="mt-0.5 text-sm text-ink-muted">{toast.body}</div>}
      </div>
      <button onClick={onClose} aria-label="Dismiss" className="inline-flex size-6 flex-none items-center justify-center rounded-sm text-ink-muted hover:bg-surface-muted hover:text-ink"><X className="size-3.5" aria-hidden /></button>
    </div>
  );
}

/* Features that exist in the design but are not in the demo yet. */
// What visitors see when they try something the demo doesn't do yet.
const ROADMAP = {
  uploads: "Document uploads, with dates read from the file, are coming soon.",
  reminders: "Automatic reminders to workers and employers are coming soon.",
  access: "Site check-ins, QR passes and access overrides are coming soon.",
  permits: "Permit applications are coming soon.",
  packs: "Inspection packs (one PDF per site and period) are coming soon.",
  reports: "Reports are coming soon.",
  calendar: "Calendar actions are coming soon.",
  rules: "Editing document rules isn’t available in the demo.",
  integrations: "Integrations (ERP, CAE platforms, calendar feed) are coming soon.",
  security: "Single sign-on and retention settings are coming soon.",
  notifications: "Notification settings are coming soon.",
  pdf: "Viewing contract PDFs is coming soon.",
  columns: "Choosing table columns is coming soon.",
  language: "Català, Español, Français and Português are coming soon.",
  account: "In Advisorly, each person signs in with their own access key. Admins manage keys in Settings → Users & roles.",
  help: "Questions about what you see? Book a walkthrough from the banner at the top.",
} as const;
export type Feature = keyof typeof ROADMAP;

export function useSoon() {
  const notify = useToast();
  return useCallback((feature: Feature, title = "Not connected yet") => notify({ title, body: ROADMAP[feature] }), [notify]);
}

/** A button for a designed-but-not-built feature: it explains instead of doing nothing. */
export function SoonButton({ feature, className, children, title, ...rest }: { feature: Feature; className?: string; children: ReactNode; title?: string } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">) {
  const soon = useSoon();
  return (
    <button type="button" className={className} onClick={() => soon(feature, title)} {...rest}>{children}</button>
  );
}
