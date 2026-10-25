"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Upload, UserPlus, MapPin, Download, X, ChevronLeft, ChevronRight, ArrowUpDown, FileSpreadsheet } from "lucide-react";
import { Segmented, StatusPill, Avatar, Progress, Fact, cx } from "@/compliance/components/ui";
import { WorkforceHeader } from "@/compliance/components/workforce/WorkforceHeader";
import { Modal, ModalFooter, ResultNotice, useAfterSuccess } from "@/compliance/components/Modal";
import { createWorker, importWorkersCsv, assignToSite } from "@/app/compliance-demo/workers/actions";
import { downloadCsv } from "@/compliance/components/CsvButton";
import type { PeopleData, PersonRow } from "@/compliance/lib/db/views";
import { useT } from "@/compliance/components/I18nProvider";

const PAGE = 10;
const NATIONALITIES = ["Andorra", "Spain", "France", "Portugal", "Morocco", "Other"];
const STATUS_LABEL = { ok: "Compliant", warn: "Expiring", bad: "Blocked", pending: "Pending" } as const;

type SortKey = "name" | "ends";

export function PeopleView({ data }: { data: PeopleData }) {
  const { workers } = data;
  const { t } = useT();
  const [view, setView] = useState("all");
  const [selId, setSelId] = useState<string | null>(workers.find((w) => w.status === "warn")?.id ?? workers[0]?.id ?? null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [company, setCompany] = useState("");
  const [nat, setNat] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<null | "add" | "csv" | "assign">(null);

  const views = useMemo(() => [
    { id: "all", label: t("All workers"), count: workers.length },
    { id: "warn", label: t("Expiring"), count: workers.filter((w) => w.status === "warn").length },
    { id: "bad", label: t("Blocked & pending"), count: workers.filter((w) => w.status === "bad" || w.status === "pending").length },
    { id: "foreign", label: t("Foreign company workers"), count: workers.filter((w) => isForeign(w)).length },
  ], [workers, t]);

  const rows = useMemo(() => {
    const endKey = (w: PersonRow) => (w.ends === "Permanent" ? Infinity : Date.parse(w.ends) || Infinity);
    return workers
      .filter((r) => view === "all" || (view === "warn" && r.status === "warn") || (view === "bad" && (r.status === "bad" || r.status === "pending")) || (view === "foreign" && isForeign(r)))
      .filter((r) => !q || (r.name + " " + r.role + " " + t(r.role)).toLowerCase().includes(q.toLowerCase()))
      .filter((r) => !company || r.companyId === company)
      .filter((r) => !nat || (nat === "Other" ? !NATIONALITIES.slice(0, -1).includes(r.nat) : r.nat === nat))
      .filter((r) => !status || r.status === status)
      .sort((a, b) => sort.dir * (sort.key === "name" ? a.name.localeCompare(b.name) : endKey(a) - endKey(b)));
  }, [workers, view, q, company, nat, status, sort, t]);

  useEffect(() => setPage(0), [view, q, company, nat, status]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pageRows = rows.slice(page * PAGE, page * PAGE + PAGE);

  const s = workers.find((w) => w.id === selId) ?? rows[0];
  const [have, need] = (s?.docs ?? "0/0").split("/").map(Number);
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allOn = pageRows.length > 0 && pageRows.every((r) => checked.has(r.id));
  const sortBtn = (key: SortKey, label: string) => (
    <button onClick={() => setSort((p) => ({ key, dir: p.key === key ? (p.dir === 1 ? -1 : 1) : 1 }))} className={cx("inline-flex items-center gap-1 font-medium", sort.key === key && "text-ink")}>
      {label} <ArrowUpDown className="size-3" aria-hidden />
    </button>
  );

  return (
    <>
      <WorkforceHeader
        counts={{ people: workers.length }}
        description={data.companies.length === 1 ? t("{n} people across 1 company", { n: workers.length }) : t("{n} people across {c} companies", { n: workers.length, c: data.companies.length })}
        actions={data.canEdit && <>
          <button className="btn-secondary" onClick={() => setDialog("csv")}><Upload className="size-4" aria-hidden />{t("Import CSV")}</button>
          <button className="btn-primary" onClick={() => setDialog("add")}><UserPlus className="size-4" aria-hidden />{t("Add worker")}</button>
        </>}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        <section aria-label={t("Workers table")} className="card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 pt-3 pb-2.5">
            <Segmented label={t("Saved views")} active={view} onSelect={setView} items={views.map((v) => ({ id: v.id, label: `${v.label} · ${v.count}` }))} />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3.5 py-3">
            <label htmlFor="w-search" className="sr-only">{t("Filter workers")}</label>
            <input id="w-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Filter by name or role")} className="input-dense min-w-[160px] flex-1 basis-[160px]" />
            <select aria-label={t("Company")} className="input-dense" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">{t("All companies")}</option>
              {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select aria-label={t("Nationality")} className="input-dense" value={nat} onChange={(e) => setNat(e.target.value)}>
              <option value="">{t("All nationalities")}</option>
              {NATIONALITIES.map((n) => <option key={n} value={n}>{t(n)}</option>)}
            </select>
            <select aria-label={t("Status")} className="input-dense" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">{t("Any status")}</option><option value="ok">{t("Compliant")}</option><option value="warn">{t("Expiring")}</option><option value="bad">{t("Blocked")}</option><option value="pending">{t("Pending")}</option>
            </select>
          </div>

          {checked.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-[#D3E6E8] bg-accent-tint px-3.5 py-2 text-sm">
              <span className="font-medium">{t("{n} selected", { n: checked.size })}</span>
              {data.canEdit && <button className="btn-row btn-secondary border-accent-ring" onClick={() => setDialog("assign")}><MapPin className="size-3.5" aria-hidden />{t("Assign to site")}</button>}
              <button className="btn-row btn-secondary border-accent-ring" onClick={() => downloadCsv("workers.csv", workers.filter((w) => checked.has(w.id)).map((w) => ({ [t("Name")]: w.name, [t("Role")]: t(w.role), [t("Company")]: w.company, [t("Nationality")]: t(w.nat), [t("Site")]: t(w.site), [t("Contract ends")]: t(w.ends), [t("Documents")]: w.docs, [t("Status")]: t(STATUS_LABEL[w.status]), [t("Needs attention")]: t(w.note) })))}><Download className="size-3.5" aria-hidden />{t("Export")}</button>
              <button onClick={() => setChecked(new Set())} className="ml-auto inline-flex items-center gap-1 text-ink-soft hover:text-ink"><X className="size-3.5" aria-hidden />{t("Clear")}</button>
            </div>
          )}

          <div className="overflow-x-auto scroll-thin">
            <table className="tbl tbl-hover min-w-[760px]">
              <thead>
                <tr>
                  <th className="w-7"><input type="checkbox" aria-label={t("Select all on this page")} checked={allOn} onChange={() => setChecked((c) => { const n = new Set(c); pageRows.forEach((r) => (allOn ? n.delete(r.id) : n.add(r.id))); return n; })} className="accent-accent" /></th>
                  <th>{sortBtn("name", t("Worker"))}</th>
                  <th>{t("Company")}</th><th className="hidden 2xl:table-cell">{t("Nationality")}</th><th>{t("Site")}</th>
                  <th>{sortBtn("ends", t("Contract ends"))}</th>
                  <th>{t("Docs")}</th><th>{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((w) => (
                  <tr key={w.id} onClick={() => setSelId(w.id)} className={cx("cursor-pointer", w.id === s?.id && "bg-accent-tint!")}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={t("Select {name}", { name: w.name })} checked={checked.has(w.id)} onChange={() => toggle(w.id)} className="accent-accent" /></td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={w.name} />
                        <div><div className="font-medium">{w.name}</div><div className="text-xs text-ink-muted">{t(w.role)}</div></div>
                      </div>
                    </td>
                    <td>{w.company}</td>
                    <td className="hidden 2xl:table-cell">{t(w.nat)}</td>
                    <td className={cx(w.site === "Unassigned" && "text-ink-muted")}>{t(w.site)}</td>
                    <td className="num text-xs">{t(w.ends)}</td>
                    <td className="num text-xs">{w.docs}</td>
                    <td><StatusPill status={w.status}>{t(STATUS_LABEL[w.status])}</StatusPill></td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-ink-muted">
                    {workers.length === 0 ? <>{t("No workers yet.")} {data.canEdit && <button className="font-medium text-accent" onClick={() => setDialog("add")}>{t("Add the first one")}</button>}</> : t("No workers match these filters.")}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-row px-3.5 py-2.5 text-sm text-ink-muted">
            <span>{rows.length ? t("Showing {from}–{to} of {n}", { from: page * PAGE + 1, to: Math.min(rows.length, page * PAGE + PAGE), n: rows.length }) : t("0 workers")}</span>
            {pages > 1 && (
              <div className="flex items-center gap-1.5">
                <button className="btn-secondary btn-row" aria-label={t("Previous page")} disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="size-4" aria-hidden /></button>
                {Array.from({ length: pages }, (_, p) => (
                  <button key={p} onClick={() => setPage(p)} aria-current={p === page ? "page" : undefined} className={cx("btn-row btn min-w-8 px-2", p === page ? "bg-accent-tint text-accent-hover font-semibold" : "text-ink-soft hover:bg-surface-muted")}>{p + 1}</button>
                ))}
                <button className="btn-secondary btn-row" aria-label={t("Next page")} disabled={page === pages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="size-4" aria-hidden /></button>
              </div>
            )}
          </div>
        </section>

        {s && (
          <aside aria-label={t("Selected worker")} className="card min-w-0 xl:sticky xl:top-[88px]">
            <div className="flex items-center gap-3 border-b border-line p-4">
              <Avatar name={s.name} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-semibold">{s.name}</div>
                <div className="truncate text-sm text-ink-muted">{s.role ? t(s.role) : "—"} · {s.company}</div>
              </div>
              <StatusPill status={s.status}>{t(STATUS_LABEL[s.status])}</StatusPill>
            </div>
            <dl className="grid grid-cols-2 gap-3 border-b border-line px-4 py-3.5">
              <Fact label={t("Site")}>{t(s.site)}</Fact>
              <Fact label={t("Nationality")}>{t(s.nat)}</Fact>
              <Fact label={t("Permit")}>{t(s.permit)}</Fact>
              <Fact label={t("Contract ends")} mono>{t(s.ends)}</Fact>
            </dl>
            <div className="border-b border-line px-4 py-3.5">
              <div className="mb-1.5 text-xs text-ink-muted">{t("What needs attention")}</div>
              <div className="font-medium">{t(s.note)}</div>
            </div>
            <div className="border-b border-line px-4 py-3.5">
              <div className="mb-1.5 flex justify-between text-xs text-ink-muted"><span>{t("Required documents")}</span><span className="num">{s.docs}</span></div>
              <Progress value={need ? Math.round((have / need) * 100) : 0} />
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              <Link href={`/compliance-demo/workers/${s.id}`} className="btn-primary">{t("Open full profile")}</Link>
            </div>
          </aside>
        )}
      </div>

      {dialog === "add" && <AddWorkerDialog open onClose={() => setDialog(null)} data={data} />}
      {dialog === "csv" && <ImportCsvDialog open onClose={() => setDialog(null)} />}
      {dialog === "assign" && <AssignDialog onClose={() => setDialog(null)} ids={[...checked]} sites={data.sites} onDone={() => setChecked(new Set())} />}
    </>
  );
}

const isForeign = (w: PersonRow) => w.foreignEmployer;

function AddWorkerDialog({ open, onClose, data }: { open: boolean; onClose: () => void; data: PeopleData }) {
  const { t } = useT();
  const [result, action, pending] = useActionState(createWorker, null);
  useAfterSuccess(result, onClose);
  return (
    <Modal open={open} onClose={onClose} title={t("Add worker")} description={t("Required documents are worked out from their nationality and employer.")}>
      <form action={action}>
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="aw-name" className="label">{t("Full name")}</label><input id="aw-name" name="full_name" required autoFocus className="input w-full" /></div>
          <div><label htmlFor="aw-title" className="label">{t("Role")}</label><input id="aw-title" name="job_title" placeholder={t("e.g. Electrician")} className="input w-full" /></div>
          <div>
            <label htmlFor="aw-nat" className="label">{t("Nationality")}</label>
            <input id="aw-nat" name="nationality" required list="aw-nat-list" placeholder={t("e.g. Portugal")} className="input w-full" />
            <datalist id="aw-nat-list">{NATIONALITIES.slice(0, -1).map((n) => <option key={n} value={t(n)} />)}</datalist>
          </div>
          <div>
            <label htmlFor="aw-company" className="label">{t("Employer")}</label>
            <select id="aw-company" name="company_id" required className="input w-full" defaultValue="">
              <option value="" disabled>{t("Choose…")}</option>
              {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="aw-site" className="label">{t("Site")}</label>
            <select id="aw-site" name="site_id" className="input w-full" defaultValue="">
              <option value="">{t("Not assigned yet")}</option>
              {data.sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {result && <div className="sm:col-span-2"><ResultNotice result={result} /></div>}
        </div>
        <ModalFooter onCancel={onClose} submitLabel={t("Add worker")} pending={pending} />
      </form>
    </Modal>
  );
}

function ImportCsvDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [result, action, pending] = useActionState(importWorkersCsv, null);
  useAfterSuccess(result, onClose, 1600);
  const template = "data:text/csv;charset=utf-8," + encodeURIComponent("name,role,nationality,company,site\nMaria Pons,Electrician,Andorra,Grupo Heracles,Encamp\n");
  return (
    <Modal open={open} onClose={onClose} title={t("Import workers from CSV")} description={t("Columns: name, role, nationality, company, site. Company and site must already exist.")}>
      <form action={action}>
        <div className="flex flex-col gap-3 px-5 py-4">
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-ctl border border-dashed border-line-dashed bg-surface-subtle px-4 py-6 text-center text-sm text-ink-soft hover:border-accent">
            <FileSpreadsheet className="size-6 text-ink-muted" aria-hidden />
            <span>{t("Choose a .csv file")}</span>
            <input type="file" name="file" accept=".csv,text/csv" required className="text-xs file:mr-3 file:rounded-ctl file:border file:border-line-input file:bg-surface file:px-3 file:py-1.5 file:text-sm" />
            <span className="text-xs text-ink-muted">{t("Comma or semicolon separated · up to 1,000 rows")}</span>
          </label>
          <a href={template} download="workers-template.csv" className="text-sm font-medium">{t("Download a template")}</a>
          <ResultNotice result={result} />
        </div>
        <ModalFooter onCancel={onClose} submitLabel={t("Import")} pending={pending} />
      </form>
    </Modal>
  );
}

function AssignDialog({ onClose, ids, sites, onDone }: { onClose: () => void; ids: string[]; sites: PeopleData["sites"]; onDone: () => void }) {
  const { t } = useT();
  const [result, action, pending] = useActionState(assignToSite, null);
  useAfterSuccess(result, () => { onDone(); onClose(); });
  return (
    <Modal open onClose={onClose} title={ids.length === 1 ? t("Assign 1 worker to a site") : t("Assign {n} workers to a site", { n: ids.length })} description={t("Their site access is checked against the rules straight away.")}>
      <form action={action}>
        <input type="hidden" name="ids" value={ids.join(",")} />
        <div className="flex flex-col gap-3 px-5 py-4">
          <div>
            <label htmlFor="as-site" className="label">{t("Site")}</label>
            <select id="as-site" name="site_id" className="input w-full" defaultValue={sites[0]?.id ?? ""}>
              {sites.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              <option value="">{t("Unassign from all sites")}</option>
            </select>
          </div>
          <ResultNotice result={result} />
        </div>
        <ModalFooter onCancel={onClose} submitLabel={t("Assign")} pending={pending} />
      </form>
    </Modal>
  );
}
