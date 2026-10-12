"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ChevronRight, Pencil, Send, Upload, FileText, Eye, Mail, Phone, ShieldAlert, Lock, Download } from "lucide-react";
import { Avatar, StatusPill, TabBar, Fact, cx } from "@/compliance/components/ui";
import type { ProfileData, CheckRow } from "@/compliance/lib/db/views";
import { SoonButton, useToast } from "@/compliance/components/Toast";
import { CsvButton } from "@/compliance/components/CsvButton";
import { Modal, ModalFooter, ResultNotice, useAfterSuccess } from "@/compliance/components/Modal";
import { updateWorker } from "@/app/compliance-demo/workers/actions";

const headerBadge = (d: ProfileData) => {
  const expiring = d.checklist.filter((c) => c.state === "expiring").length;
  switch (d.worker.status) {
    case "ok": return "All documents valid";
    case "warn": return expiring ? `${expiring} item${expiring === 1 ? "" : "s"} expiring` : "Needs attention";
    case "bad": return "Access blocked";
    case "pending": return "Waiting on a decision";
  }
};

function CheckPill({ row }: { row: CheckRow }) {
  switch (row.state) {
    case "valid": return <StatusPill status="ok">Valid</StatusPill>;
    case "expiring": return <StatusPill status="warn">{row.daysLeft === 0 ? "Expires today" : `Expires in ${row.daysLeft} day${row.daysLeft === 1 ? "" : "s"}`}</StatusPill>;
    case "expired": return <StatusPill status="bad">Expired</StatusPill>;
    case "missing": return <StatusPill status={row.blocks ? "bad" : "warn"}>Missing</StatusPill>;
    case "unconfirmed": return <StatusPill status="pending">Confirm dates</StatusPill>;
    case "awaiting_decision": return <StatusPill status="pending">Awaiting decision</StatusPill>;
  }
}

function CheckAction({ row, workerId }: { row: CheckRow; workerId: string }) {
  const needsWork = row.state !== "valid";
  if (row.kind === "contract") {
    return needsWork
      ? <Link href={`/compliance-demo/workers/contracts?new=${workerId}`} className="btn-primary btn-row">{row.state === "missing" ? "Add contract" : "Renew"}</Link>
      : <Link href="/compliance-demo/workers/contracts" className="btn-secondary btn-row font-normal"><Eye className="size-3.5" aria-hidden />View</Link>;
  }
  if (row.kind === "permit") {
    return <Link href="/compliance-demo/permits" className={needsWork ? "btn-primary btn-row" : "btn-secondary btn-row font-normal"}>{row.state === "awaiting_decision" ? "View application" : needsWork ? "Start renewal" : "View"}</Link>;
  }
  switch (row.state) {
    case "valid": return <SoonButton feature="pdf" className="btn-secondary btn-row font-normal"><Eye className="size-3.5" aria-hidden />View</SoonButton>;
    case "unconfirmed": return <SoonButton feature="uploads" className="btn-primary btn-row">Review dates</SoonButton>;
    default: return <SoonButton feature="uploads" className="btn-primary btn-row">{row.state === "missing" ? "Upload" : "Replace"}</SoonButton>;
  }
}

export function WorkerProfile({ data }: { data: ProfileData }) {
  const [tab, setTab] = useState("compliance");
  const [editing, setEditing] = useState(false);
  const notify = useToast();
  const { worker, facts } = data;

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-ink-muted">
        <Link href="/compliance-demo/workers">Workers</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-ink">{worker.name}</span>
      </nav>

      <section className="card flex flex-wrap items-center gap-4 px-5 py-[18px]">
        <Avatar name={worker.name} size={56} />
        <div className="min-w-0 flex-1 basis-[260px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.01em]">{worker.name}</h1>
            <StatusPill status={worker.status} size="md">{headerBadge(data)}</StatusPill>
          </div>
          <div className="mt-1 text-ink-muted">{[worker.role, `${worker.company}${worker.foreignEmployer ? " (subcontractor)" : ""}`, `${worker.nat} national`].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.canEdit && <button className="btn-secondary" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden />Edit</button>}
          <SoonButton feature="reminders" className="btn-secondary"><Send className="size-4" aria-hidden />Send reminder</SoonButton>
          <SoonButton feature="uploads" className="btn-primary"><Upload className="size-4" aria-hidden />Upload document</SoonButton>
        </div>
        <dl className="mt-1 grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 border-t border-line-row pt-3.5">
          <Fact label="Current site">{worker.site}</Fact>
          <Fact label="Permit type">{facts.permitType}</Fact>
          <Fact label="Permit valid until" mono>{facts.permitValidUntil}</Fact>
          <Fact label="Social security">{facts.socialSecurity}</Fact>
          <Fact label="Site access until" mono tone={facts.accessTone ?? undefined}>{facts.accessUntil}</Fact>
        </dl>
      </section>

      <TabBar
        label="Worker sections"
        active={tab}
        onSelect={setTab}
        items={[{ id: "compliance", label: "Compliance" }, { id: "contracts", label: "Contracts", count: data.contracts.length }, { id: "access", label: "Site access" }, { id: "history", label: "History" }]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="min-w-0">
          {tab === "compliance" && (
            <section className="card">
              <div className="card-head">
                <div>
                  <h2 className="card-title">Required documents</h2>
                  <div className="card-sub">
                    {data.ruleSets.length
                      ? <>Rule set{data.ruleSets.length > 1 ? "s" : ""}: {data.ruleSets.map((r, i) => <span key={r}>{i > 0 && ", "}<Link href="/compliance-demo/settings">{r}</Link></span>)}</>
                      : <>No rule set matches this worker. <Link href="/compliance-demo/settings">Check document rules</Link></>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="num text-sm">{data.validCount} of {data.requiredCount} valid</span>
                  <CsvButton className="btn-secondary btn-dense font-normal" label="Export list" filename={`${worker.name.replace(/\s+/g, "-").toLowerCase()}-documents.csv`} rows={data.checklist.map((c) => ({ Document: c.name, Detail: c.note, Expires: c.exp, Status: c.state, "Blocks access": c.blocks ? "Yes" : "No" }))} />
                </div>
              </div>
              <div className="overflow-x-auto scroll-thin">
                <table className="tbl tbl-hover min-w-[680px]">
                  <thead><tr><th>Document</th><th>Expires</th><th>Blocks access</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                  <tbody>
                    {data.checklist.map((d) => (
                      <tr key={d.name}>
                        <td><div className="flex items-center gap-2.5"><FileText className="size-4 flex-none text-ink-muted" aria-hidden /><div><div className="font-medium">{d.name}</div><div className="text-xs text-ink-muted">{d.note}</div></div></div></td>
                        <td className={cx("num text-xs", d.state === "expiring" && "text-warn-fg", d.state === "expired" && "text-bad-fg")}>{d.exp}</td>
                        <td className="text-xs text-ink-soft">{d.blocks ? <span className="inline-flex items-center gap-1"><Lock className="size-3" aria-hidden />Yes</span> : "—"}</td>
                        <td><CheckPill row={d} /></td>
                        <td className="text-right"><CheckAction row={d} workerId={worker.id} /></td>
                      </tr>
                    ))}
                    {data.checklist.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-ink-muted">No documents required by the current rules.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "contracts" && (
            <section className="card">
              <div className="card-head"><div><h2 className="card-title">Contracts</h2><div className="card-sub">Employment with {worker.company} and the service contract it works under</div></div></div>
              <ul>
                {data.contracts.map((c) => (
                  <li key={c.title + c.range} className="flex flex-wrap items-center gap-3 border-b border-line-row px-[18px] py-3.5 last:border-0">
                    <span className="inline-flex size-9 items-center justify-center rounded-ctl bg-surface-muted text-ink-soft"><FileText className="size-4" aria-hidden /></span>
                    <div className="min-w-0 flex-1 basis-[240px]">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-ink-muted">{c.parties}</div>
                    </div>
                    <div className="w-[210px]">
                      <div className="num mb-1 text-xs">{c.range}</div>
                      <div className="h-1.5 rounded-full bg-track"><div className="h-full rounded-full bg-chart" style={{ width: `${c.progress}%` }} /></div>
                    </div>
                    <SoonButton feature="pdf" className="btn-secondary btn-row font-normal">View PDF</SoonButton>
                  </li>
                ))}
                {data.contracts.length === 0 && <li className="px-[18px] py-10 text-center text-ink-muted">No contracts on file. <Link href="/compliance-demo/workers/contracts">Add one</Link></li>}
              </ul>
            </section>
          )}

          {tab === "access" && (
            <section className="card">
              <div className="card-head"><div><h2 className="card-title">Site access</h2><div className="card-sub">Access ends on the earliest of contract end, permit end, or any blocking document expiring</div></div></div>
              <div className="p-[18px]">
                {data.access.items.length > 0 && (
                  <div className="relative mb-6 mt-2 h-10">
                    <div className="absolute left-0 right-0 top-4 h-1.5 rounded-full bg-track" />
                    {data.access.items.filter((a) => a.binding).map((a) => (
                      <div key="fill" className="absolute left-0 top-4 h-1.5 rounded-full bg-warn-fg/70" style={{ width: `${Math.max(1, (a.day / data.access.horizon) * 100)}%` }} />
                    ))}
                    {data.access.items.map((a) => (
                      <div key={a.label} title={`${a.label} · ${a.date}`} className="absolute top-2.5" style={{ left: `calc(${Math.max(0, Math.min(100, (a.day / data.access.horizon) * 100))}% - 7px)` }}>
                        <span className={cx("block size-[14px] rounded-full border-2 border-white shadow-seg", a.binding ? "bg-warn-fg" : a.day < 0 ? "bg-bad-fg" : "bg-chart")} />
                      </div>
                    ))}
                    <div className="absolute -bottom-3 left-0 text-2xs text-ink-muted">Today</div>
                    <div className="absolute -bottom-3 right-0 text-2xs text-ink-muted">{data.access.endLabel}</div>
                  </div>
                )}
                <ul className="flex flex-col">
                  {data.access.items.map((a) => (
                    <li key={a.label} className={cx("flex flex-wrap justify-between gap-3 border-b border-line-row py-2.5 last:border-0", a.binding && "font-semibold text-warn-fg", a.day < 0 && "text-bad-fg")}>
                      <span className="flex items-center gap-2">{a.label}{a.binding && <span className="rounded-sm bg-warn-bg px-1.5 text-2xs font-semibold">Earliest</span>}</span>
                      <span className="num text-sm">{a.date}</span>
                    </li>
                  ))}
                  {data.access.items.length === 0 && <li className="py-4 text-sm text-ink-muted">No blocking item has an end date, so access has no end date.</li>}
                </ul>
                {data.access.message && (
                  <div className={cx("mt-3 flex gap-2.5 rounded-ctl border p-3 text-sm", worker.status === "bad" ? "border-bad-bg bg-bad-bg text-bad-fg" : "border-warn-line bg-warn-soft")}>
                    <ShieldAlert className={cx("mt-0.5 size-4 flex-none", worker.status === "bad" ? "text-bad-fg" : "text-warn-fg")} aria-hidden />
                    {data.access.message}
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === "history" && (
            <section className="card">
              <div className="card-head"><div><h2 className="card-title">History</h2><div className="card-sub">Every change to this worker, from the audit log</div></div></div>
              <ol className="px-[18px] py-3">
                {data.history.map((h, i) => (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-1">
                    {i < data.history.length - 1 && <span aria-hidden className="absolute left-[5px] top-4 bottom-0 w-px bg-line" />}
                    <span aria-hidden className={cx("relative mt-1.5 size-[11px] flex-none rounded-full border-2", i === 0 ? "border-accent bg-accent" : "border-line-strong bg-surface")} />
                    <div className="min-w-0 flex-1">
                      <div>{h.text}</div>
                      <div className="mt-0.5 text-xs text-ink-muted"><span className="num">{h.time}</span> · {h.actor}</div>
                    </div>
                  </li>
                ))}
                {data.history.length === 0 && <li className="py-6 text-center text-ink-muted">No changes recorded yet.</li>}
              </ol>
            </section>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <section className="card p-4">
            <h2 className="mb-2.5 text-[15px] font-semibold">Today</h2>
            {data.today.allowed
              ? <div className="flex items-center gap-2.5 rounded-ctl bg-ok-bg p-2.5 font-medium text-ok-fg">Allowed on site · {data.today.site}</div>
              : <div className="flex items-center gap-2.5 rounded-ctl bg-bad-bg p-2.5 font-medium text-bad-fg">Blocked from {data.today.site}</div>}
            <div className="mt-2.5 text-sm text-ink-muted">{data.today.lastCheckIn ? `Last check-in ${data.today.lastCheckIn}` : "No check-ins recorded"}</div>
            <SoonButton feature="access" className="btn-secondary btn-dense mt-3 w-full font-normal"><Lock className="size-4" aria-hidden />Override access…</SoonButton>
            <div className="mt-1.5 text-2xs text-ink-muted">Admin and Compliance only. A reason is required and logged.</div>
          </section>
          <section className="card p-4">
            <h2 className="mb-2.5 text-[15px] font-semibold">Employer contact</h2>
            <div className="font-medium">{data.employer.name}</div>
            <div className="text-sm text-ink-muted">{data.employer.contact}</div>
            <div className="mt-3 flex gap-2">
              {data.employer.email
                ? <a href={`mailto:${data.employer.email}?subject=${encodeURIComponent(`Documents for ${worker.name}`)}`} className="btn-secondary btn-dense flex-1 font-normal"><Mail className="size-4" aria-hidden />Email</a>
                : <button className="btn-secondary btn-dense flex-1 font-normal" onClick={() => notify({ title: "No email on file", body: `Add a contact email for ${data.employer.name} to write to them from here.` })}><Mail className="size-4" aria-hidden />Email</button>}
              <button className="btn-secondary btn-dense flex-1 font-normal" onClick={() => notify({ title: "No phone number on file", body: `Phone numbers for ${data.employer.name} can be stored once company details are editable.` })}><Phone className="size-4" aria-hidden />Call</button>
            </div>
            <div className="mt-2.5 text-xs text-ink-muted">Uploads documents through the subcontractor portal</div>
          </section>
          <section className="card p-4">
            <label htmlFor="note" className="mb-2.5 block text-[15px] font-semibold">Internal note</label>
            <textarea id="note" rows={3} placeholder="Add a note for your team…" className="input h-auto w-full resize-y py-2" />
          </section>
        </aside>
      </div>
      {data.canEdit && editing && <EditWorkerDialog open onClose={() => setEditing(false)} data={data} />}
    </>
  );
}

function EditWorkerDialog({ open, onClose, data }: { open: boolean; onClose: () => void; data: ProfileData }) {
  const [result, action, pending] = useActionState(updateWorker, null);
  const w = data.worker;
  useAfterSuccess(result, onClose);
  return (
    <Modal open={open} onClose={onClose} title={`Edit ${w.name}`} description="Changing nationality or employer changes which documents are required.">
      <form action={action}>
        <input type="hidden" name="id" value={w.id} />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="ew-name" className="label">Full name</label><input id="ew-name" name="full_name" required defaultValue={w.name} className="input w-full" /></div>
          <div><label htmlFor="ew-title" className="label">Role</label><input id="ew-title" name="job_title" defaultValue={w.role} className="input w-full" /></div>
          <div><label htmlFor="ew-nat" className="label">Nationality</label><input id="ew-nat" name="nationality" required defaultValue={w.nat} className="input w-full" /></div>
          <div>
            <label htmlFor="ew-company" className="label">Employer</label>
            <select id="ew-company" name="company_id" required defaultValue={w.companyId} className="input w-full">
              {data.options.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ew-site" className="label">Site</label>
            <select id="ew-site" name="site_id" defaultValue={w.siteId ?? ""} className="input w-full">
              <option value="">Not assigned</option>
              {data.options.sites.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          {result && <div className="sm:col-span-2"><ResultNotice result={result} /></div>}
        </div>
        <ModalFooter onCancel={onClose} submitLabel="Save changes" pending={pending} />
      </form>
    </Modal>
  );
}
