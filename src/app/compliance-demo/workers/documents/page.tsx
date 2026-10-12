"use client";

import { useState } from "react";
import { Upload, Send, UploadCloud, FileText, FileImage, Download, RefreshCw, CheckCircle2, ScanText } from "lucide-react";
import { StatusPill, Fact, cx } from "@/compliance/components/ui";
import { WorkforceHeader } from "@/compliance/components/workforce/WorkforceHeader";
import { documents, docCategories } from "@/compliance/lib/data";
import { SoonButton } from "@/compliance/components/Toast";

const statusLabel = { ok: "Valid", warn: "Expiring", bad: "Expired", pending: "Pending" } as const;

export default function DocumentsPage() {
  const [cat, setCat] = useState("all");
  const [sel, setSel] = useState(1);
  const rows = documents.map((d, i) => ({ ...d, i })).filter((d) => cat === "all" || d.cat === cat);
  const s = documents[sel];

  return (
    <>
      <WorkforceHeader
        actions={<>
          <SoonButton feature="reminders" className="btn-secondary"><Send className="size-4" aria-hidden />Request from subcontractor</SoonButton>
          <SoonButton feature="uploads" className="btn-primary"><Upload className="size-4" aria-hidden />Upload</SoonButton>
        </>}
      />

      <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_300px] 2xl:grid-cols-[220px_minmax(0,1fr)_340px] items-start">
        <aside aria-label="Document types" className="card p-2">
          {docCategories.map((c) => {
            const on = c.id === cat;
            return (
              <button key={c.id} aria-pressed={on} onClick={() => setCat(c.id)}
                className={cx("flex h-[38px] w-full items-center justify-between gap-2 rounded-ctl px-2.5 text-left transition-colors", on ? "bg-accent-tint font-semibold text-accent-hover" : "text-ink-body hover:bg-surface-subtle")}>
                {c.label}
                <span className={cx("num text-xs", !on && "text-ink-muted")}>{c.count}</span>
              </button>
            );
          })}
          <div className="mx-1 mb-1 mt-2.5 flex flex-col items-center gap-1 rounded-ctl border border-dashed border-line-dashed bg-surface-subtle p-4 text-center text-sm text-ink-soft">
            <UploadCloud className="mb-1 size-6 text-ink-muted" aria-hidden />
            Drop files here
            <span className="text-xs text-ink-muted">PDF, JPG or PNG · dates are read automatically</span>
          </div>
          <div className="mx-1 mt-2 rounded-ctl bg-warn-soft px-3 py-2.5 text-xs text-warn-fg">
            <span className="font-semibold">3 uploads</span> waiting for date confirmation
          </div>
        </aside>

        <section aria-labelledby="docs-title" className="card min-w-0">
          <div className="card-head">
            <div><h2 id="docs-title" className="card-title">{docCategories.find((c) => c.id === cat)!.label}</h2><div className="card-sub">{rows.length} shown · sorted by expiry</div></div>
            <input type="search" placeholder="Search documents" aria-label="Search documents" className="input-dense w-56" />
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="tbl tbl-hover min-w-[540px]">
              <thead><tr><th>Document</th><th>Worker</th><th>Expires</th><th className="hidden 2xl:table-cell">Dates</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.file} onClick={() => setSel(d.i)} className={cx("cursor-pointer", d.i === sel && "bg-accent-tint!")}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex size-8 flex-none items-center justify-center rounded-ctl bg-surface-muted text-ink-soft">
                          {d.file.endsWith(".jpg") ? <FileImage className="size-4" aria-hidden /> : <FileText className="size-4" aria-hidden />}
                        </span>
                        <div><div className="font-medium">{d.name}</div><div className="text-xs text-ink-muted">{d.file}{!d.confirmed && <span className="2xl:hidden font-medium text-warn-fg"> · Needs review</span>}</div></div>
                      </div>
                    </td>
                    <td>{d.worker}</td>
                    <td className={cx("num text-xs", d.status === "bad" && "text-bad-fg", d.status === "warn" && "text-warn-fg")}>{d.exp}</td>
                    <td className="hidden 2xl:table-cell text-xs">{d.confirmed ? <span className="text-ink-soft">Confirmed</span> : <span className="inline-flex items-center gap-1 font-medium text-warn-fg"><ScanText className="size-3.5" aria-hidden />Needs review</span>}</td>
                    <td><StatusPill status={d.status}>{statusLabel[d.status]}</StatusPill></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-ink-muted">No documents in this category in the sample data.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <aside aria-labelledby="prev-title" className="card min-w-0 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-[88px]">
          <div className="border-b border-line px-[18px] py-3.5">
            <h2 id="prev-title" className="card-title">{s.name}</h2>
            <div className="card-sub">{s.worker}</div>
          </div>
          <div className="mx-[18px] my-4 flex h-[200px] flex-col gap-2 overflow-hidden rounded-ctl border border-line bg-surface-muted p-5">
            {/* Stylised page placeholder */}
            <div className="mx-auto flex h-full w-[150px] flex-col gap-1.5 rounded-xs bg-white p-3 shadow-seg">
              <div className="h-2 w-2/3 rounded-sm bg-line" />
              <div className="h-1.5 w-full rounded-sm bg-line-row" /><div className="h-1.5 w-11/12 rounded-sm bg-line-row" /><div className="h-1.5 w-4/5 rounded-sm bg-line-row" />
              <div className="mt-2 h-1.5 w-full rounded-sm bg-line-row" /><div className="h-1.5 w-3/4 rounded-sm bg-line-row" />
              <div className="mt-auto flex justify-between"><div className="h-4 w-12 rounded-sm bg-warn-bg ring-1 ring-warn-line" /><div className="h-1.5 w-10 self-end rounded-sm bg-line" /></div>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 px-[18px] pb-3.5">
            <Fact label="Issued" mono>{s.issued}</Fact>
            <Fact label="Expires" mono tone={s.status === "bad" ? "bad" : s.status === "warn" ? "warn" : undefined}>{s.exp}</Fact>
            <Fact label="Uploaded by">{s.by}</Fact>
            <Fact label="Used for">{s.use}</Fact>
          </dl>
          {s.confirmed ? (
            <div className="mx-[18px] mb-3.5 flex items-center gap-2 rounded-ctl bg-ok-bg px-3 py-2.5 text-sm text-ok-fg"><CheckCircle2 className="size-4" aria-hidden />Dates confirmed by Sandra Ruiz</div>
          ) : (
            <div className="mx-[18px] mb-3.5 flex gap-2 rounded-ctl bg-info-bg px-3 py-2.5 text-sm text-info-fg"><ScanText className="mt-0.5 size-4 flex-none" aria-hidden />Expiry date read from the document. Confirm it before it drives site access.</div>
          )}
          <div className="flex flex-wrap gap-2 px-[18px] pb-[18px]">
            {s.confirmed ? <button className="btn-primary" disabled>Confirmed</button> : <SoonButton feature="uploads" className="btn-primary">Confirm dates</SoonButton>}
            <SoonButton feature="uploads" className="btn-secondary"><RefreshCw className="size-4" aria-hidden />Replace</SoonButton>
            <SoonButton feature="uploads" className="btn-secondary w-10 px-0" aria-label="Download"><Download className="size-4" aria-hidden /></SoonButton>
          </div>
        </aside>
      </div>
    </>
  );
}
