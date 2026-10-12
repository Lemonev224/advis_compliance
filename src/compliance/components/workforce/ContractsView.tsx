"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Upload, Plus, FileText } from "lucide-react";
import { StatusPill, Avatar, cx } from "@/compliance/components/ui";
import { WorkforceHeader } from "@/compliance/components/workforce/WorkforceHeader";
import { Modal, ModalFooter, ResultNotice, useAfterSuccess } from "@/compliance/components/Modal";
import { createContract } from "@/app/compliance-demo/workers/actions";
import { SoonButton } from "@/compliance/components/Toast";
import { useRouter } from "next/navigation";
import type { ContractsData } from "@/compliance/lib/db/views";

export function ContractsView({ data, renewFor }: { data: ContractsData; renewFor: string | null }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const preset = renewFor && data.workers.some((w) => w.id === renewFor) ? renewFor : null;
  const [open, setOpen] = useState(Boolean(preset));
  const [renew, setRenew] = useState<string | null>(null);
  const close = () => { setOpen(false); if (renewFor) router.replace("/compliance-demo/workers/contracts", { scroll: false }); };

  const rows = useMemo(() => data.contracts.filter((c) =>
    (!q || `${c.worker} ${c.type} ${c.parties}`.toLowerCase().includes(q.toLowerCase())) &&
    (!kind || (kind === "subcontract" ? c.workerId === null && c.worker === "—" : c.worker !== "—"))), [data.contracts, q, kind]);

  const summary = [
    { label: "Active contracts", value: data.summary.active },
    { label: "Ending in 60 days", value: data.summary.endingSoon, tone: "warn" },
    { label: "Ended, still assigned", value: data.summary.endedAssigned, tone: "bad" },
    { label: "Subcontracts", value: data.summary.subcontracts },
  ];

  return (
    <>
      <WorkforceHeader
        counts={{ contracts: data.contracts.length }}
        actions={data.canEdit && <>
          <SoonButton feature="integrations" className="btn-secondary"><Upload className="size-4" aria-hidden />Import from ERP</SoonButton>
          <button className="btn-primary" onClick={() => { setRenew(null); setOpen(true); }}><Plus className="size-4" aria-hidden />Add contract</button>
        </>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-sm text-ink-muted">{s.label}</div>
            <div className={cx("num mt-1 text-[26px] leading-8", s.value > 0 && s.tone === "warn" && "text-warn-fg", s.value > 0 && s.tone === "bad" && "text-bad-fg")}>{s.value}</div>
          </div>
        ))}
      </div>
      <section className="card min-w-0">
        <div className="card-head">
          <div><h2 className="card-title">All contracts</h2><div className="card-sub">Sorted by end date · {rows.length} shown</div></div>
          <div className="flex flex-wrap gap-2">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contracts" aria-label="Search contracts" className="input-dense w-56" />
            <select aria-label="Type" className="input-dense" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">All types</option><option value="employment">Employment</option><option value="subcontract">Subcontract</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto scroll-thin">
          <table className="tbl tbl-hover min-w-[860px]">
            <thead><tr><th>Contract</th><th>Worker</th><th>Parties</th><th>Start</th><th>End</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td><div className="flex items-center gap-2.5"><span className="inline-flex size-8 flex-none items-center justify-center rounded-ctl bg-surface-muted text-ink-soft"><FileText className="size-4" aria-hidden /></span><span className="font-medium">{c.type}</span></div></td>
                  <td>{c.workerId ? <div className="flex items-center gap-2"><Avatar name={c.worker} size={26} /><Link href={`/compliance-demo/workers/${c.workerId}`} className="text-ink no-underline hover:text-accent">{c.worker}</Link></div> : <span className="text-ink-muted">—</span>}</td>
                  <td className="text-ink-soft">{c.parties}</td>
                  <td className="num text-xs">{c.start}</td>
                  <td className={cx("num text-xs", c.status === "bad" && "text-bad-fg", c.status === "warn" && "text-warn-fg")}>{c.end}</td>
                  <td><StatusPill status={c.status}>{c.label}</StatusPill></td>
                  <td className="text-right">{c.workerId && c.status !== "ok" ? <button className="btn-primary btn-row" onClick={() => { setRenew(c.workerId); setOpen(true); }}>Renew</button> : <SoonButton feature="pdf" className="btn-secondary btn-row font-normal">View PDF</SoonButton>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-ink-muted">{data.contracts.length ? "No contracts match." : "No contracts yet."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {open && <AddContractDialog open onClose={close} workers={data.workers} preset={renew ?? preset} renewal={Boolean(renew ?? preset)} />}
    </>
  );
}

function AddContractDialog({ open, onClose, workers, preset, renewal }: { open: boolean; onClose: () => void; workers: ContractsData["workers"]; preset: string | null; renewal: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const [result, action, pending] = useActionState(createContract, null);
  useAfterSuccess(result, onClose);
  return (
    <Modal open={open} onClose={onClose} title={renewal ? "Renew contract" : "Add employment contract"} description="The end date feeds straight into the worker’s site-access date.">
      <form action={action}>
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="ac-worker" className="label">Worker</label>
            <select id="ac-worker" name="worker_id" required className="input w-full" defaultValue={preset ?? ""}>
              <option value="" disabled>Choose…</option>
              {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label htmlFor="ac-title" className="label">Title</label><input id="ac-title" name="title" required defaultValue={renewal ? "Employment contract · renewal" : "Employment contract · fixed term"} className="input w-full" /></div>
          <div><label htmlFor="ac-start" className="label">Starts</label><input id="ac-start" name="starts_on" type="date" required defaultValue={renewal ? today : undefined} className="input w-full" /></div>
          <div><label htmlFor="ac-end" className="label">Ends <span className="font-normal text-ink-muted">(empty = permanent)</span></label><input id="ac-end" name="ends_on" type="date" className="input w-full" /></div>
          {result && <div className="sm:col-span-2"><ResultNotice result={result} /></div>}
        </div>
        <ModalFooter onCancel={onClose} submitLabel="Add contract" pending={pending} />
      </form>
    </Modal>
  );
}
