"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ChevronRight, Pencil, FileText, Eye, ShieldAlert, Lock } from "lucide-react";
import { Avatar, StatusPill, TabBar, Fact, cx } from "@/compliance/components/ui";
import type { ProfileData, CheckRow } from "@/compliance/lib/db/views";
import { SoonButton } from "@/compliance/components/Toast";
import { CsvButton } from "@/compliance/components/CsvButton";
import { Modal, ModalFooter, ResultNotice, useAfterSuccess } from "@/compliance/components/Modal";
import { updateWorker } from "@/app/compliance-demo/workers/actions";
import { useT } from "@/compliance/components/I18nProvider";
import type { TFunction } from "@/compliance/lib/i18n";

const headerBadge = (d: ProfileData, t: TFunction) => {
  const expiring = d.checklist.filter((c) => c.state === "expiring").length;
  switch (d.worker.status) {
    case "ok": return t("All documents valid");
    case "warn": return expiring ? (expiring === 1 ? t("1 item expiring") : t("{n} items expiring", { n: expiring })) : t("Needs attention");
    case "bad": return t("Access blocked");
    case "pending": return t("Waiting on a decision");
  }
};

function CheckPill({ row }: { row: CheckRow }) {
  const { t } = useT();
  switch (row.state) {
    case "valid": return <StatusPill status="ok">{t("Valid")}</StatusPill>;
    case "expiring": return <StatusPill status="warn">{row.daysLeft === 0 ? t("Expires today") : row.daysLeft === 1 ? t("Expires in 1 day") : t("Expires in {n} days", { n: row.daysLeft })}</StatusPill>;
    case "expired": return <StatusPill status="bad">{t("Expired")}</StatusPill>;
    case "missing": return <StatusPill status={row.blocks ? "bad" : "warn"}>{t("Missing")}</StatusPill>;
    case "unconfirmed": return <StatusPill status="pending">{t("Confirm dates")}</StatusPill>;
    case "awaiting_decision": return <StatusPill status="pending">{t("Awaiting decision")}</StatusPill>;
  }
}

function CheckAction({ row, workerId }: { row: CheckRow; workerId: string }) {
  const { t } = useT();
  const needsWork = row.state !== "valid";
  // Valid rows need nothing; documents' own actions (view, upload, replace) aren't in the demo yet.
  if (!needsWork) return null;
  if (row.kind === "contract") {
    return needsWork
      ? <Link href={`/compliance-demo/workers/contracts?new=${workerId}`} className="btn-primary btn-row">{row.state === "missing" ? t("Add contract") : t("Renew")}</Link>
      : <Link href="/compliance-demo/workers/contracts" className="btn-secondary btn-row font-normal"><Eye className="size-3.5" aria-hidden />{t("View")}</Link>;
  }
  if (row.kind === "permit") {
    return <Link href="/compliance-demo/permits" className={needsWork ? "btn-primary btn-row" : "btn-secondary btn-row font-normal"}>{row.state === "awaiting_decision" ? t("View application") : needsWork ? t("Start renewal") : t("View")}</Link>;
  }
  switch (row.state) {
    case "valid": return <SoonButton feature="pdf" className="btn-secondary btn-row font-normal"><Eye className="size-3.5" aria-hidden />{t("View")}</SoonButton>;
    case "unconfirmed": return <SoonButton feature="uploads" className="btn-primary btn-row">{t("Review dates")}</SoonButton>;
    default: return <SoonButton feature="uploads" className="btn-primary btn-row">{row.state === "missing" ? t("Upload") : t("Replace")}</SoonButton>;
  }
}

export function WorkerProfile({ data }: { data: ProfileData }) {
  const [tab, setTab] = useState("compliance");
  const [editing, setEditing] = useState(false);
  const { t } = useT();
  const { worker, facts } = data;

  return (
    <>
      <nav aria-label={t("Breadcrumb")} className="flex items-center gap-1 text-sm text-ink-muted">
        <Link href="/compliance-demo/workers">{t("Workers")}</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-ink">{worker.name}</span>
      </nav>

      <section className="card flex flex-wrap items-center gap-4 px-5 py-[18px]">
        <Avatar name={worker.name} size={56} />
        <div className="min-w-0 flex-1 basis-[260px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.01em]">{worker.name}</h1>
            <StatusPill status={worker.status} size="md">{headerBadge(data, t)}</StatusPill>
          </div>
          <div className="mt-1 text-ink-muted">{[worker.role && t(worker.role), `${worker.company}${worker.foreignEmployer ? ` ${t("(subcontractor)")}` : ""}`, t("{country} national", { country: t(worker.nat) })].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.canEdit && <button className="btn-secondary" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden />{t("Edit")}</button>}
        </div>
        <dl className="mt-1 grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 border-t border-line-row pt-3.5">
          <Fact label={t("Current site")}>{t(worker.site)}</Fact>
          <Fact label={t("Permit type")}>{facts.permitType}</Fact>
          <Fact label={t("Permit valid until")} mono>{facts.permitValidUntil}</Fact>
          <Fact label={t("Social security")}>{facts.socialSecurity}</Fact>
          <Fact label={t("Site access until")} mono tone={facts.accessTone ?? undefined}>{facts.accessUntil}</Fact>
        </dl>
      </section>

      <TabBar
        label={t("Worker sections")}
        active={tab}
        onSelect={setTab}
        items={[{ id: "compliance", label: t("Compliance") }, { id: "contracts", label: t("Contracts"), count: data.contracts.length }, { id: "access", label: t("Site access") }, { id: "history", label: t("History") }]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="min-w-0">
          {tab === "compliance" && (
            <section className="card">
              <div className="card-head">
                <div>
                  <h2 className="card-title">{t("Required documents")}</h2>
                  <div className="card-sub">
                    {data.ruleSets.length
                      ? <>{data.ruleSets.length > 1 ? t("Rule sets") : t("Rule set")}: {data.ruleSets.map((r, i) => <span key={r}>{i > 0 && ", "}<Link href="/compliance-demo/settings">{t(r)}</Link></span>)}</>
                      : <>{t("No rule set matches this worker.")} <Link href="/compliance-demo/settings">{t("Check document rules")}</Link></>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="num text-sm">{t("{n} of {total} valid", { n: data.validCount, total: data.requiredCount })}</span>
                  <CsvButton className="btn-secondary btn-dense font-normal" label={t("Export list")} filename={`${worker.name.replace(/\s+/g, "-").toLowerCase()}-documents.csv`} rows={data.checklist.map((c) => ({ [t("Document")]: t(c.name), [t("Detail")]: t(c.note), [t("Expires")]: t(c.exp), [t("Status")]: t(c.state), [t("Blocks access")]: c.blocks ? t("Yes") : t("No") }))} />
                </div>
              </div>
              <div className="overflow-x-auto scroll-thin">
                <table className="tbl tbl-hover min-w-[680px]">
                  <thead><tr><th>{t("Document")}</th><th>{t("Expires")}</th><th>{t("Blocks access")}</th><th>{t("Status")}</th><th className="text-right">{t("Action")}</th></tr></thead>
                  <tbody>
                    {data.checklist.map((d) => (
                      <tr key={d.name}>
                        <td><div className="flex items-center gap-2.5"><FileText className="size-4 flex-none text-ink-muted" aria-hidden /><div><div className="font-medium">{t(d.name)}</div><div className="text-xs text-ink-muted">{t(d.note)}</div></div></div></td>
                        <td className={cx("num text-xs", d.state === "expiring" && "text-warn-fg", d.state === "expired" && "text-bad-fg")}>{t(d.exp)}</td>
                        <td className="text-xs text-ink-soft">{d.blocks ? <span className="inline-flex items-center gap-1"><Lock className="size-3" aria-hidden />{t("Yes")}</span> : "—"}</td>
                        <td><CheckPill row={d} /></td>
                        <td className="text-right"><CheckAction row={d} workerId={worker.id} /></td>
                      </tr>
                    ))}
                    {data.checklist.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-ink-muted">{t("No documents required by the current rules.")}</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "contracts" && (
            <section className="card">
              <div className="card-head"><div><h2 className="card-title">{t("Contracts")}</h2><div className="card-sub">{t("Employment with {company} and the service contract it works under", { company: worker.company })}</div></div></div>
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
                  </li>
                ))}
                {data.contracts.length === 0 && <li className="px-[18px] py-10 text-center text-ink-muted">{t("No contracts on file.")} <Link href="/compliance-demo/workers/contracts">{t("Add one")}</Link></li>}
              </ul>
            </section>
          )}

          {tab === "access" && (
            <section className="card">
              <div className="card-head"><div><h2 className="card-title">{t("Site access")}</h2><div className="card-sub">{t("Access ends on the earliest of contract end, permit end, or any blocking document expiring")}</div></div></div>
              <div className="p-[18px]">
                {data.access.items.length > 0 && (
                  <div className="relative mb-6 mt-2 h-10">
                    <div className="absolute left-0 right-0 top-4 h-1.5 rounded-full bg-track" />
                    {data.access.items.filter((a) => a.binding).map((a) => (
                      <div key="fill" className="absolute left-0 top-4 h-1.5 rounded-full bg-warn-fg/70" style={{ width: `${Math.max(1, (a.day / data.access.horizon) * 100)}%` }} />
                    ))}
                    {data.access.items.map((a) => (
                      <div key={a.label} title={`${t(a.label)} · ${t(a.date)}`} className="absolute top-2.5" style={{ left: `calc(${Math.max(0, Math.min(100, (a.day / data.access.horizon) * 100))}% - 7px)` }}>
                        <span className={cx("block size-[14px] rounded-full border-2 border-white shadow-seg", a.binding ? "bg-warn-fg" : a.day < 0 ? "bg-bad-fg" : "bg-chart")} />
                      </div>
                    ))}
                    <div className="absolute -bottom-3 left-0 text-2xs text-ink-muted">{t("Today")}</div>
                    <div className="absolute -bottom-3 right-0 text-2xs text-ink-muted">{data.access.endLabel}</div>
                  </div>
                )}
                <ul className="flex flex-col">
                  {data.access.items.map((a) => (
                    <li key={a.label} className={cx("flex flex-wrap justify-between gap-3 border-b border-line-row py-2.5 last:border-0", a.binding && "font-semibold text-warn-fg", a.day < 0 && "text-bad-fg")}>
                      <span className="flex items-center gap-2">{t(a.label)}{a.binding && <span className="rounded-sm bg-warn-bg px-1.5 text-2xs font-semibold">{t("Earliest")}</span>}</span>
                      <span className="num text-sm">{t(a.date)}</span>
                    </li>
                  ))}
                  {data.access.items.length === 0 && <li className="py-4 text-sm text-ink-muted">{t("No blocking item has an end date, so access has no end date.")}</li>}
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
              <div className="card-head"><div><h2 className="card-title">{t("History")}</h2><div className="card-sub">{t("Every change to this worker, from the audit log")}</div></div></div>
              <ol className="px-[18px] py-3">
                {data.history.map((h, i) => (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-1">
                    {i < data.history.length - 1 && <span aria-hidden className="absolute left-[5px] top-4 bottom-0 w-px bg-line" />}
                    <span aria-hidden className={cx("relative mt-1.5 size-[11px] flex-none rounded-full border-2", i === 0 ? "border-accent bg-accent" : "border-line-strong bg-surface")} />
                    <div className="min-w-0 flex-1">
                      <div>{t(h.text)}</div>
                      <div className="mt-0.5 text-xs text-ink-muted"><span className="num">{t(h.time)}</span> · {t(h.actor)}</div>
                    </div>
                  </li>
                ))}
                {data.history.length === 0 && <li className="py-6 text-center text-ink-muted">{t("No changes recorded yet.")}</li>}
              </ol>
            </section>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <section className="card p-4">
            <h2 className="mb-2.5 text-[15px] font-semibold">{t("Today")}</h2>
            {data.today.allowed
              ? <div className="flex items-center gap-2.5 rounded-ctl bg-ok-bg p-2.5 font-medium text-ok-fg">{t("Allowed on site · {site}", { site: data.today.site })}</div>
              : <div className="flex items-center gap-2.5 rounded-ctl bg-bad-bg p-2.5 font-medium text-bad-fg">{t("Blocked from {site}", { site: data.today.site })}</div>}
            <div className="mt-2.5 text-sm text-ink-muted">{data.today.lastCheckIn ? t("Last check-in {when}", { when: data.today.lastCheckIn }) : t("No check-ins recorded")}</div>
          </section>
          <section className="card p-4">
            <h2 className="mb-2.5 text-[15px] font-semibold">{t("Employer contact")}</h2>
            <div className="font-medium">{data.employer.name}</div>
            <div className="mt-1 text-sm text-ink-muted">{t("Uploads documents through the subcontractor portal")}</div>
          </section>
          <section className="card p-4">
            <label htmlFor="note" className="mb-2.5 block text-[15px] font-semibold">{t("Internal note")}</label>
            <textarea id="note" rows={3} placeholder={t("Add a note for your team…")} className="input h-auto w-full resize-y py-2" />
          </section>
        </aside>
      </div>
      {data.canEdit && editing && <EditWorkerDialog open onClose={() => setEditing(false)} data={data} />}
    </>
  );
}

function EditWorkerDialog({ open, onClose, data }: { open: boolean; onClose: () => void; data: ProfileData }) {
  const { t } = useT();
  const [result, action, pending] = useActionState(updateWorker, null);
  const w = data.worker;
  useAfterSuccess(result, onClose);
  return (
    <Modal open={open} onClose={onClose} title={t("Edit {name}", { name: w.name })} description={t("Changing nationality or employer changes which documents are required.")}>
      <form action={action}>
        <input type="hidden" name="id" value={w.id} />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="ew-name" className="label">{t("Full name")}</label><input id="ew-name" name="full_name" required defaultValue={w.name} className="input w-full" /></div>
          <div><label htmlFor="ew-title" className="label">{t("Role")}</label><input id="ew-title" name="job_title" defaultValue={t(w.role)} className="input w-full" /></div>
          <div><label htmlFor="ew-nat" className="label">{t("Nationality")}</label><input id="ew-nat" name="nationality" required defaultValue={t(w.nat)} className="input w-full" /></div>
          <div>
            <label htmlFor="ew-company" className="label">{t("Employer")}</label>
            <select id="ew-company" name="company_id" required defaultValue={w.companyId} className="input w-full">
              {data.options.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ew-site" className="label">{t("Site")}</label>
            <select id="ew-site" name="site_id" defaultValue={w.siteId ?? ""} className="input w-full">
              <option value="">{t("Not assigned")}</option>
              {data.options.sites.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          {result && <div className="sm:col-span-2"><ResultNotice result={result} /></div>}
        </div>
        <ModalFooter onCancel={onClose} submitLabel={t("Save changes")} pending={pending} />
      </form>
    </Modal>
  );
}
