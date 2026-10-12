"use client";

import { useActionState, useState } from "react";
import { SoonButton } from "@/compliance/components/Toast";
import { ResultNotice, useAfterSuccess } from "@/compliance/components/Modal";
import { updateOrganisation } from "@/app/compliance-demo/settings/actions";
import { Plus, Check, Minus, Building2, Users, ListChecks, Bell, Plug, ShieldCheck, Lock, GripVertical, Trash2, FileSpreadsheet, Database, Network, CalendarDays, Mail, Webhook } from "lucide-react";
import { Avatar, NeutralPill, cx } from "@/compliance/components/ui";
import { permissions, notifications, integrations } from "@/compliance/lib/data";
import type { SettingsData } from "@/compliance/lib/db/views";
import { AccessKeys } from "./AccessKeys";

const sections = [
  { id: "org", label: "Organisation", hint: "Company details, language", icon: Building2 },
  { id: "users", label: "Users & roles", hint: "Access keys and permissions", icon: Users },
  { id: "rules", label: "Document rules", hint: "Requirements per worker type", icon: ListChecks },
  { id: "notif", label: "Notifications", hint: "Reminders and digests", icon: Bell },
  { id: "int", label: "Integrations", hint: "ERP, CAE platforms, CSV", icon: Plug },
  { id: "sec", label: "Security & data", hint: "SSO, data location", icon: ShieldCheck },
];

function Toggle({ on, label }: { on: boolean; label: string }) {
  const [v, setV] = useState(on);
  return (
    <button role="switch" aria-checked={v} aria-label={label} onClick={() => setV(!v)}
      className={cx("relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors", v ? "bg-accent" : "bg-line-input")}>
      <span className={cx("inline-block size-4 rounded-full bg-white shadow-sm transition-transform", v ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

function Check2({ on, label }: { on: boolean; label: string }) {
  const [v, setV] = useState(on);
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm">
      <input type="checkbox" checked={v} onChange={() => setV(!v)} className="size-4 accent-accent" />{label}
    </label>
  );
}

function Section({ title, sub, action, children }: { title: string; sub: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div><h2 className="card-title">{title}</h2><div className="card-sub">{sub}</div></div>
        {action}
      </div>
      {children}
    </section>
  );
}

const intIcons = [FileSpreadsheet, Database, Network, CalendarDays, Mail, Webhook];

export function SettingsView({ data }: { data: SettingsData }) {
  const { ruleSets, users, orgName } = data;
  const [sec, setSec] = useState("rules");
  const [rule, setRule] = useState(0);
  const r = ruleSets[rule] ?? ruleSets[0];

  return (
    <>
      <div>
        <div className="text-sm text-ink-muted">Admin</div>
        <h1 className="mt-0.5 text-[24px] leading-8 font-semibold tracking-[-0.01em]">Settings</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] items-start">
        <nav aria-label="Settings sections" className="flex flex-col gap-0.5 lg:sticky lg:top-[88px]">
          {sections.map((s) => {
            const on = s.id === sec;
            return (
              <button key={s.id} aria-current={on || undefined} onClick={() => setSec(s.id)}
                className={cx("flex w-full items-start gap-2.5 rounded-ctl px-3 py-2 text-left transition-colors", on ? "bg-surface shadow-[0_0_0_1px_#E3E7EC]" : "hover:bg-surface/60")}>
                <s.icon className={cx("mt-0.5 size-4 flex-none", on ? "text-accent" : "text-ink-muted")} aria-hidden />
                <span><span className={cx("block", on ? "font-semibold" : "font-medium text-ink-body")}>{s.label}</span><span className="block text-xs text-ink-muted">{s.hint}</span></span>
              </button>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          {sec === "org" && <OrgForm data={data} />}

          {sec === "users" && (
            <>
            <AccessKeys data={data} />
            <Section title="Users & roles" sub="Everyone who has signed in, and what each role can do">
              <div className="overflow-x-auto scroll-thin">
                <table className="tbl tbl-hover min-w-[640px]">
                  <thead><tr><th>User</th><th>Role</th><th>Sites</th><th>Last active</th><th /></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.name}>
                        <td><div className="flex items-center gap-2.5"><Avatar name={u.name} /><div><div className="font-medium">{u.name}</div><div className="text-xs text-ink-muted">{u.email}</div></div></div></td>
                        <td><NeutralPill>{u.role}</NeutralPill></td>
                        <td>{u.sites}</td>
                        <td className="text-ink-soft">{u.last}</td>
                        <td />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-line-row px-5 py-4">
                <h3 className="mb-2.5 text-base font-semibold">Role permissions</h3>
                <div className="overflow-x-auto scroll-thin rounded-ctl border border-line">
                  <table className="tbl min-w-[560px]">
                    <thead><tr><th>Permission</th>{["Admin", "Compliance", "Site manager", "Subcontractor"].map((h) => <th key={h} className="text-center">{h}</th>)}</tr></thead>
                    <tbody>
                      {permissions.map((p) => (
                        <tr key={p.name}>
                          <td>{p.name}</td>
                          {[p.a, p.c, p.s, p.x].map((v, i) => (
                            <td key={i} className="text-center">
                              {v === true ? <Check className="mx-auto size-4 text-ok-fg" strokeWidth={2.5} aria-label="Yes" />
                                : v === false ? <Minus className="mx-auto size-4 text-line-strong" aria-label="No" />
                                : <span className="text-sm text-ink-soft">{v}</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
            </>
          )}

          {sec === "rules" && r && (
            <Section title="Document rules" sub="Which documents each kind of worker needs. Checklists and site access follow these rules." action={<SoonButton feature="rules" className="btn-primary"><Plus className="size-4" aria-hidden />New rule set</SoonButton>}>
              <ul>
                {ruleSets.map((rs, i) => (
                  <li key={rs.name}>
                    <button onClick={() => setRule(i)} className={cx("flex w-full flex-wrap items-center gap-3 border-b border-line-row px-5 py-3 text-left transition-colors", i === rule ? "bg-accent-tint" : "hover:bg-surface-subtle")}>
                      <span className={cx("h-8 w-1 flex-none rounded-full", i === rule ? "bg-accent" : "bg-transparent")} />
                      <div className="min-w-0 flex-1 basis-[260px]"><div className="font-medium">{rs.name}</div><div className="text-xs text-ink-muted">{rs.when}</div></div>
                      <span className="text-xs text-ink-soft"><span className="num">{rs.docs}</span> documents · <span className="num">{rs.workers}</span> worker{rs.workers === 1 ? "" : "s"}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3.5 px-5 py-[18px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[15px] font-semibold">Editing: {r.name}</h3>
                  <span className="text-xs text-ink-muted">Changes apply to <span className="num">{r.workers}</span> worker{r.workers === 1 ? "" : "s"} on save</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-ctl bg-surface-subtle p-3 text-sm">
                  <span className="text-ink-soft">Applies when</span>
                  <select aria-label="Nationality" className="input-dense" key={`n${rule}`} defaultValue={r.nat}>
                    {[...new Set([r.nat, "Nationality is any", "Nationality is Portugal", "Nationality is Spain", "Nationality is France", "Nationality is outside EU"])].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span className="text-ink-soft">and</span>
                  <select aria-label="Employment" className="input-dense" key={`e${rule}`} defaultValue={r.emp}>
                    {[...new Set([r.emp, "Employer is a foreign company", `Employer is ${orgName}`, "Any employer"])].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <SoonButton feature="rules" className="btn-dashed btn-dense font-normal"><Plus className="size-3.5" aria-hidden />Add condition</SoonButton>
                </div>
                <div className="overflow-x-auto scroll-thin rounded-ctl border border-line">
                  <table className="tbl min-w-[600px]">
                    <thead><tr><th className="w-6" /><th>Required document</th><th>Remind before expiry</th><th>Blocks site access</th><th /></tr></thead>
                    <tbody key={rule}>
                      {r.items.map((it) => (
                        <tr key={it.name} className="group">
                          <td className="pr-0!"><GripVertical className="size-4 cursor-grab text-line-strong" aria-hidden /></td>
                          <td className="font-medium">{it.name}</td>
                          <td>
                            <select aria-label={`Reminder for ${it.name}`} defaultValue={it.remind} className="input-dense h-ctl-row num text-xs">
                              {["—", "14 days", "30 days", "45 days", "60 days", "90 days"].map((o) => <option key={o}>{o}</option>)}
                            </select>
                          </td>
                          <td><div className="flex items-center gap-2"><Toggle on={it.blocks} label={`${it.name} blocks site access`} />{it.blocks && <Lock className="size-3.5 text-ink-muted" aria-hidden />}</div></td>
                          <td className="text-right"><SoonButton feature="rules" aria-label={`Remove ${it.name}`} className="inline-flex size-7 items-center justify-center rounded-sm text-ink-muted opacity-0 hover:bg-bad-bg hover:text-bad-fg group-hover:opacity-100"><Trash2 className="size-3.5" aria-hidden /></SoonButton></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <SoonButton feature="rules" className="btn-dashed"><Plus className="size-4" aria-hidden />Add document</SoonButton>
                  <div className="flex gap-2"><button type="button" className="btn-secondary" onClick={() => setRule(rule)}>Reset</button><SoonButton feature="rules" className="btn-primary">Save rule set</SoonButton></div>
                </div>
              </div>
            </Section>
          )}

          {sec === "notif" && (
            <Section title="Notifications" sub="When reminders go out, and to whom">
              <ul className="px-5 py-1.5">
                {notifications.map((n) => (
                  <li key={n.name} className="flex flex-wrap items-center gap-4 border-b border-line-row py-3 last:border-0">
                    <div className="min-w-0 flex-1 basis-[260px]"><div className="font-medium">{n.name}</div><div className="text-xs text-ink-muted">{n.to}</div></div>
                    <Check2 on={n.email} label="Email" /><Check2 on={n.app} label="In app" /><Check2 on={n.sms} label="SMS" />
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 border-t border-line-row px-5 py-4">
                <div><label htmlFor="n-days" className="label">Default first reminder</label><select id="n-days" className="input"><option>60 days before</option><option>30 days before</option><option>14 days before</option></select></div>
                <div><label htmlFor="n-digest" className="label">Daily digest time</label><select id="n-digest" className="input"><option>07:00</option><option>08:00</option><option>09:00</option></select></div>
              </div>
            </Section>
          )}

          {sec === "int" && (
            <Section title="Integrations" sub="Read contract and worker data from the tools you already use">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3 px-5 py-[18px]">
                {integrations.map((g, i) => {
                  const I = intIcons[i];
                  const connected = g.status === "Connected";
                  return (
                    <div key={g.name} className="flex flex-col gap-2 rounded-card border border-line p-4 hover:border-line-strong">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2.5 font-semibold"><span className="inline-flex size-8 items-center justify-center rounded-ctl bg-surface-muted text-ink-soft"><I className="size-4" aria-hidden /></span>{g.name}</span>
                        <span className={cx("inline-flex items-center gap-1.5 text-xs font-medium", g.status === "Not connected" ? "text-ink-soft" : "text-ok-fg")}>
                          <span className={cx("size-1.5 rounded-full", g.status === "Not connected" ? "bg-ink-muted" : "bg-ok-fg")} />{g.status}
                        </span>
                      </div>
                      <div className="text-sm text-ink-muted">{g.desc}</div>
                      <SoonButton feature="integrations" className={cx("btn-dense mt-1 self-start", connected ? "btn-secondary font-normal" : "btn-secondary")}>{g.action}</SoonButton>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {sec === "sec" && (
            <Section title="Security & data" sub="Sign-in, data location and retention">
              <ul className="px-5 py-1.5">
                <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line-row py-3"><div><div className="font-medium">Single sign-on</div><div className="text-xs text-ink-muted">Microsoft Entra ID or Google Workspace</div></div><SoonButton feature="security" className="btn-secondary btn-dense font-normal">Configure</SoonButton></li>
                <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line-row py-3"><div><div className="font-medium">Two-step verification</div><div className="text-xs text-ink-muted">Required for Admin and Compliance roles</div></div><Toggle on label="Two-step verification required" /></li>
                <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line-row py-3"><div><div className="font-medium">Data location</div><div className="text-xs text-ink-muted">Documents and records stored in the EU</div></div><span className="text-sm font-medium">EU (Frankfurt)</span></li>
                <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line-row py-3"><div><div className="font-medium">Retention after a worker leaves</div><div className="text-xs text-ink-muted">Records then deleted automatically</div></div><select aria-label="Retention period" className="input-dense"><option>Not set</option><option>3 years</option><option>5 years</option></select></li>
                <li className="flex flex-wrap items-center justify-between gap-3 py-3"><div><div className="font-medium">Audit log</div><div className="text-xs text-ink-muted">Every change, kept for the retention period</div></div><SoonButton feature="security" className="btn-secondary btn-dense font-normal">Export CSV</SoonButton></li>
              </ul>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}

const COUNTRIES = ["Andorra", "Spain", "France", "Portugal"];
const LANGS: [string, string][] = [["ca", "Català"], ["es", "Español"], ["fr", "Français"], ["pt", "Português"], ["en", "English"]];

function OrgForm({ data }: { data: SettingsData }) {
  const [result, action, pending] = useActionState(updateOrganisation, null);
  const [formKey, setFormKey] = useState(0);
  useAfterSuccess(result, () => {}, 0);
  const o = data.org;
  return (
    <section className="card">
      <div className="border-b border-line px-5 py-4"><h2 className="card-title">Organisation</h2><div className="card-sub">Company details used on applications and inspection packs</div></div>
      <form key={formKey} action={action}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 px-5 py-[18px]">
          <div><label htmlFor="o-name" className="label">Legal name</label><input id="o-name" name="name" required defaultValue={o.name} className="input w-full" /></div>
          <div><label htmlFor="o-reg" className="label">Commerce register number</label><input id="o-reg" name="register_number" defaultValue={o.register} placeholder="e.g. 902345-K" className="input w-full" /></div>
          <div><label htmlFor="o-country" className="label">Country of operation</label><select id="o-country" name="country" defaultValue={o.country} className="input w-full">{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label htmlFor="o-lang" className="label">Default language</label><select id="o-lang" name="default_language" defaultValue={o.language} className="input w-full">{LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="col-span-full">
            <span className="label">Logo</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-card bg-nav-bg font-semibold text-white">{o.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
              <SoonButton feature="uploads" className="btn-secondary btn-dense font-normal">Replace</SoonButton>
              <span className="text-xs text-ink-muted">PNG or SVG, shown on inspection packs</span>
            </div>
          </div>
          {result && <div className="col-span-full"><ResultNotice result={result.ok ? { ok: true, message: result.message ?? "Saved." } : { ok: false, error: result.error ?? "Could not save." }} /></div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-line-row px-5 py-3.5">
          <button type="button" className="btn-secondary" onClick={() => setFormKey((k) => k + 1)}>Reset</button>
          <button type="submit" className="btn-primary" disabled={pending || !data.isAdmin} title={data.isAdmin ? undefined : "Only admins can change these"}>{pending ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </section>
  );
}
