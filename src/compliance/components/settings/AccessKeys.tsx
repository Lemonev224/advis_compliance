"use client";

import { useActionState, useState } from "react";
import { KeyRound, Plus, Copy, Check, AlertTriangle, ShieldAlert } from "lucide-react";
import { Modal, useAfterSuccess } from "@/compliance/components/Modal";
import { NeutralPill, cx } from "@/compliance/components/ui";
import { createAccessKey, revokeAccessKey } from "@/app/compliance-demo/settings/actions";
import type { SettingsData } from "@/compliance/lib/db/views";

const ROLE_HELP: Record<string, string> = {
  admin: "Everything, including document rules and access keys",
  compliance: "All workers; confirm dates and override site access",
  site_manager: "Workers on one site; record check-ins",
  subcontractor: "Their own staff only; upload documents",
};

export function AccessKeys({ data }: { data: SettingsData }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const show = () => { setSession((n) => n + 1); setOpen(true); };
  const active = data.keys.filter((k) => !k.revoked);
  const revoked = data.keys.filter((k) => k.revoked);

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="card-title">Access keys</h2>
          <div className="card-sub">People sign in with a key instead of email. Each key has one role, and everything done with it is logged under its name.</div>
        </div>
        {data.isAdmin && <button className="btn-primary" onClick={show}><Plus className="size-4" aria-hidden />Create access key</button>}
      </div>
      <div className="overflow-x-auto scroll-thin">
        <table className="tbl tbl-hover min-w-[720px]">
          <thead><tr><th>Name</th><th>Role</th><th>Can see</th><th>Key</th><th>Created</th><th>Last used</th><th /></tr></thead>
          <tbody>
            {active.map((k) => (
              <tr key={k.id}>
                <td><div className="flex items-center gap-2"><KeyRound className="size-4 text-ink-muted" aria-hidden /><span className="font-medium">{k.label}</span></div></td>
                <td><NeutralPill>{k.role}</NeutralPill></td>
                <td className="text-ink-soft">{k.scope}</td>
                <td className="num text-xs text-ink-soft">{k.prefix}…</td>
                <td className="num text-xs">{k.created}</td>
                <td className={cx("num text-xs", k.lastUsed === "Never" && "text-ink-muted")}>{k.lastUsed}</td>
                <td className="text-right">{data.isAdmin && <RevokeButton id={k.id} label={k.label} live={data.live} />}</td>
              </tr>
            ))}
            {active.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-ink-muted">
                No access keys yet. {data.isAdmin && <button className="font-medium text-accent" onClick={show}>Create one for a colleague</button>}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {revoked.length > 0 && (
        <div className="border-t border-line-row px-5 py-3 text-xs text-ink-muted">
          Revoked: {revoked.map((k) => `${k.label} (${k.prefix}…)`).join(", ")}
        </div>
      )}
      {session > 0 && <CreateKeyDialog key={session} open={open} onClose={() => setOpen(false)} data={data} />}
    </section>
  );
}

function RevokeButton({ id, label, live }: { id: string; label: string; live: boolean }) {
  const [state, action, pending] = useActionState(revokeAccessKey, null);
  useAfterSuccess(state, () => {}, 0);
  const [confirm, setConfirm] = useState(false);
  if (state?.error) return <span className="text-xs text-bad-fg">{state.error}</span>;
  if (!confirm) return <button className="btn-ghost btn-row font-normal text-bad-fg hover:bg-bad-bg" disabled={!live} title={live ? undefined : "Not available in the demo"} onClick={() => setConfirm(true)}>Revoke</button>;
  return (
    <form action={action} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs text-ink-soft">Revoke {label}?</span>
      <button type="submit" disabled={pending} className="btn-row btn bg-bad-fg text-white hover:bg-bad-fg/90">{pending ? "…" : "Revoke"}</button>
      <button type="button" className="btn-ghost btn-row font-normal" onClick={() => setConfirm(false)}>Cancel</button>
    </form>
  );
}

function CreateKeyDialog({ open, onClose, data }: { open: boolean; onClose: () => void; data: SettingsData }) {
  const [state, action, pending] = useActionState(createAccessKey, null);
  useAfterSuccess(state, () => {}, 0);
  const [role, setRole] = useState("compliance");
  const [copied, setCopied] = useState(false);
  const created = state?.ok ? state : null;

  return (
    <Modal open={open} onClose={onClose} title={created ? "Key created" : "Create access key"} description={created ? undefined : "The key is shown once. Send it to the person privately."}>
      {created ? (
        <div className="flex flex-col gap-4 px-5 py-4">
          <p className="text-sm">Access key for <span className="font-medium">{created.label}</span>:</p>
          <div className="flex items-center gap-2 rounded-ctl border border-line bg-surface-subtle p-2 pl-3">
            <code className="num flex-1 break-all text-sm">{created.key}</code>
            <button className="btn-secondary btn-dense" onClick={() => { navigator.clipboard?.writeText(created.key); setCopied(true); }}>
              {copied ? <><Check className="size-4" aria-hidden />Copied</> : <><Copy className="size-4" aria-hidden />Copy</>}
            </button>
          </div>
          <div className="flex gap-2 rounded-ctl border border-warn-line bg-warn-soft p-3 text-sm text-warn-fg">
            <ShieldAlert className="mt-0.5 size-4 flex-none" aria-hidden />
            You won’t be able to see this key again. If it’s lost, revoke it and create a new one.
          </div>
          <div className="flex justify-end"><button className="btn-primary" onClick={onClose}>Done</button></div>
        </div>
      ) : (
        <form action={action}>
          <div className="grid gap-4 px-5 py-4">
            <div><label htmlFor="ak-label" className="label">Name</label><input id="ak-label" name="label" required autoFocus placeholder="e.g. Sandra Ruiz" className="input w-full" /></div>
            <div>
              <span className="label">Role</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(ROLE_HELP).map(([r, help]) => (
                  <label key={r} className={cx("flex cursor-pointer gap-2.5 rounded-ctl border p-2.5", role === r ? "border-accent bg-accent-tint" : "border-line hover:border-line-strong")}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="mt-0.5 accent-accent" />
                    <span><span className="block text-sm font-medium">{{ admin: "Admin", compliance: "Compliance", site_manager: "Site manager", subcontractor: "Subcontractor" }[r]}</span><span className="block text-xs text-ink-muted">{help}</span></span>
                  </label>
                ))}
              </div>
            </div>
            {role === "site_manager" && (
              <div>
                <label htmlFor="ak-site" className="label">Site</label>
                <select id="ak-site" name="site_id" className="input w-full" defaultValue="">
                  <option value="">All sites</option>
                  {data.sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            {role === "subcontractor" && (
              <div>
                <label htmlFor="ak-company" className="label">Company</label>
                <select id="ak-company" name="company_id" required className="input w-full" defaultValue="">
                  <option value="" disabled>Choose…</option>
                  {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {state && !state.ok && <div role="alert" className="flex gap-2 rounded-ctl bg-bad-bg px-3 py-2.5 text-sm text-bad-fg"><AlertTriangle className="mt-0.5 size-4 flex-none" aria-hidden />{state.error}</div>}
          </div>
          <div className="flex justify-end gap-2 border-t border-line-row px-5 py-3.5">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Creating…" : "Create key"}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
