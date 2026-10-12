"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { navDone } from "@/compliance/components/shell/NavProgress";
import { useToast } from "@/compliance/components/Toast";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ActionResult } from "@/app/compliance-demo/workers/actions";

export function Modal({ open, onClose, title, description, children, width = 520 }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; width?: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={(e) => { if (e.target === ref.current) onClose(); }}
      style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      className="m-auto rounded-card border border-line bg-surface p-0 text-ink shadow-pop backdrop:bg-nav-bg/40 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[16px] font-semibold">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-8 items-center justify-center rounded-ctl text-ink-muted hover:bg-surface-muted hover:text-ink">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ResultNotice({ result }: { result: ActionResult }) {
  if (!result) return null;
  const ok = result.ok;
  return (
    <div role={ok ? "status" : "alert"} className={`flex gap-2 rounded-ctl px-3 py-2.5 text-sm ${ok ? "bg-ok-bg text-ok-fg" : "bg-bad-bg text-bad-fg"}`}>
      {ok ? <CheckCircle2 className="mt-0.5 size-4 flex-none" aria-hidden /> : <AlertTriangle className="mt-0.5 size-4 flex-none" aria-hidden />}
      <div>
        <div className="font-medium">{ok ? result.message : result.error}</div>
        {result.details && result.details.length > 0 && (
          <ul className="mt-1 list-disc pl-4 text-xs">{result.details.map((d) => <li key={d}>{d}</li>)}</ul>
        )}
      </div>
    </div>
  );
}

export function ModalFooter({ onCancel, submitLabel, pending }: { onCancel: () => void; submitLabel: string; pending: boolean }) {
  return (
    <div className="flex justify-end gap-2 border-t border-line-row px-5 py-3.5">
      <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
    </div>
  );
}

/** Runs `fn` once, shortly after each new successful result (e.g. to close the dialog). Also completes the progress bar. */
export function useAfterSuccess(result: { ok?: boolean; error?: string; message?: string } | null | undefined, fn: () => void, delay = 700) {
  const seen = useRef(result);
  const latest = useRef(fn);
  latest.current = fn;
  const notify = useToast();
  useEffect(() => {
    if (!result || result === seen.current) return;
    seen.current = result;
    navDone();
    if (result.ok === false || result.error) return;
    // In the demo nothing changes on the page, so when a dialog closes its message stays on screen as a toast.
    if (delay > 0 && result.message) notify({ title: result.message, tone: "success" });
    const t = setTimeout(() => latest.current(), delay);
    return () => clearTimeout(t);
  }, [result, delay, notify]);
}
