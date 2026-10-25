"use client";

import { useState } from "react";
import { FileText, FileImage, CheckCircle2, ScanText } from "lucide-react";
import { StatusPill, Fact, cx } from "@/compliance/components/ui";
import { WorkforceHeader } from "@/compliance/components/workforce/WorkforceHeader";
import { documents, docCategories } from "@/compliance/lib/data";
import { useToast } from "@/compliance/components/Toast";
import { useT } from "@/compliance/components/I18nProvider";

const statusLabel = { ok: "Valid", warn: "Expiring", bad: "Expired", pending: "Pending" } as const;

export default function DocumentsPage() {
  const { t } = useT();
  const [cat, setCat] = useState("all");
  const [sel, setSel] = useState(1);
  // Dates confirmed during this visit. Nothing is saved: reloading shows the sample data again.
  const [confirmedNow, setConfirmedNow] = useState<Set<number>>(new Set());
  const notify = useToast();
  const docs = documents.map((d, i) => ({ ...d, i, confirmed: d.confirmed || confirmedNow.has(i) }));
  const rows = docs.filter((d) => cat === "all" || d.cat === cat);
  const s = docs[sel];
  const waiting = docs.filter((d) => !d.confirmed).length + 2;
  const confirm = () => {
    setConfirmedNow((c) => new Set(c).add(sel));
    notify({ title: t("Dates confirmed"), body: t("{doc} now counts towards site access for {name}.", { doc: t(s.name), name: s.worker }), tone: "success" });
  };

  return (
    <>
      <WorkforceHeader />

      <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_300px] 2xl:grid-cols-[220px_minmax(0,1fr)_340px] items-start">
        <aside aria-label={t("Document types")} className="card p-2">
          {docCategories.map((c) => {
            const on = c.id === cat;
            return (
              <button key={c.id} aria-pressed={on} onClick={() => setCat(c.id)}
                className={cx("flex h-[38px] w-full items-center justify-between gap-2 rounded-ctl px-2.5 text-left transition-colors", on ? "bg-accent-tint font-semibold text-accent-hover" : "text-ink-body hover:bg-surface-subtle")}>
                {t(c.label)}
                <span className={cx("num text-xs", !on && "text-ink-muted")}>{c.count}</span>
              </button>
            );
          })}
          <div className="mx-1 mt-2.5 rounded-ctl bg-warn-soft px-3 py-2.5 text-xs text-warn-fg">
            <span className="font-semibold">{t("{n} uploads", { n: waiting })}</span> {t("waiting for date confirmation")}
          </div>
        </aside>

        <section aria-labelledby="docs-title" className="card min-w-0">
          <div className="card-head">
            <div><h2 id="docs-title" className="card-title">{t(docCategories.find((c) => c.id === cat)!.label)}</h2><div className="card-sub">{t("{n} shown · sorted by expiry", { n: rows.length })}</div></div>
            <input type="search" placeholder={t("Search documents")} aria-label={t("Search documents")} className="input-dense w-56" />
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="tbl tbl-hover min-w-[540px]">
              <thead><tr><th>{t("Document")}</th><th>{t("Worker")}</th><th>{t("Expires")}</th><th className="hidden 2xl:table-cell">{t("Dates")}</th><th>{t("Status")}</th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.file} onClick={() => setSel(d.i)} className={cx("cursor-pointer", d.i === sel && "bg-accent-tint!")}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex size-8 flex-none items-center justify-center rounded-ctl bg-surface-muted text-ink-soft">
                          {d.file.endsWith(".jpg") ? <FileImage className="size-4" aria-hidden /> : <FileText className="size-4" aria-hidden />}
                        </span>
                        <div><div className="font-medium">{t(d.name)}</div><div className="text-xs text-ink-muted">{d.file}{!d.confirmed && <span className="2xl:hidden font-medium text-warn-fg"> · {t("Needs review")}</span>}</div></div>
                      </div>
                    </td>
                    <td>{d.worker}</td>
                    <td className={cx("num text-xs", d.status === "bad" && "text-bad-fg", d.status === "warn" && "text-warn-fg")}>{t(d.exp)}</td>
                    <td className="hidden 2xl:table-cell text-xs">{d.confirmed ? <span className="text-ink-soft">{t("Confirmed")}</span> : <span className="inline-flex items-center gap-1 font-medium text-warn-fg"><ScanText className="size-3.5" aria-hidden />{t("Needs review")}</span>}</td>
                    <td><StatusPill status={d.status}>{t(statusLabel[d.status])}</StatusPill></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-ink-muted">{t("No documents in this category in the sample data.")}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <aside aria-labelledby="prev-title" className="card min-w-0 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-[88px]">
          <div className="border-b border-line px-[18px] py-3.5">
            <h2 id="prev-title" className="card-title">{t(s.name)}</h2>
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
            <Fact label={t("Issued")} mono>{t(s.issued)}</Fact>
            <Fact label={t("Expires")} mono tone={s.status === "bad" ? "bad" : s.status === "warn" ? "warn" : undefined}>{t(s.exp)}</Fact>
            <Fact label={t("Uploaded by")}>{s.by}</Fact>
            <Fact label={t("Used for")}>{t(s.use)}</Fact>
          </dl>
          {s.confirmed ? (
            <div className="mx-[18px] mb-3.5 flex items-center gap-2 rounded-ctl bg-ok-bg px-3 py-2.5 text-sm text-ok-fg"><CheckCircle2 className="size-4" aria-hidden />{t("Dates confirmed by {name}", { name: confirmedNow.has(sel) ? t("Demo admin") : "Sandra Ruiz" })}</div>
          ) : (
            <div className="mx-[18px] mb-3.5 flex gap-2 rounded-ctl bg-info-bg px-3 py-2.5 text-sm text-info-fg"><ScanText className="mt-0.5 size-4 flex-none" aria-hidden />{t("Expiry date read from the document. Confirm it before it drives site access.")}</div>
          )}
          {!s.confirmed && (
            <div className="flex flex-wrap gap-2 px-[18px] pb-[18px]">
              <button className="btn-primary" onClick={confirm}><CheckCircle2 className="size-4" aria-hidden />{t("Confirm dates")}</button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
