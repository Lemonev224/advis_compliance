"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { PageHeader, InfoBanner, Avatar, cx } from "@/compliance/components/ui";
import { permits, permitStages, permitChecklist, workerHref } from "@/compliance/lib/data";
import { useT } from "@/compliance/components/I18nProvider";

const stageStyle: Record<string, string> = {
  draft: "bg-pending-bg text-ink-body",
  submitted: "bg-info-bg text-info-fg",
  approved: "bg-ok-bg text-ok-fg",
  renewal: "bg-warn-bg text-warn-fg",
};

const steps = ["Worker", "Permit type", "Documents", "Review"];

export default function PermitsPage() {
  const { t } = useT();
  const [stage, setStage] = useState("all");
  const rows = permits.filter((r) => stage === "all" || r.key === stage);
  const missing = permitChecklist.filter((c) => !c.done).length;

  return (
    <>
      <PageHeader
        section={t("Workforce")}
        title={t("Permits & immigration")}
        description={t("Andorran work and immigration authorisations for every worker who needs one")}
      />

      <InfoBanner>
        <strong className="font-semibold">{t("2026 general quota: 800 residence and work permits")}</strong>{t(", 11% fewer than 2025. Permits for foreign company workers on a specific project follow their own procedure.")}
      </InfoBanner>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {permitStages.map((s) => {
          const on = s.id === stage;
          return (
            <button key={s.id} aria-pressed={on} onClick={() => setStage(s.id)}
              className={cx("card flex flex-col items-start gap-1 px-4 py-3.5 text-left transition-colors", on ? "border-accent ring-1 ring-accent" : "hover:border-line-strong")}>
              <span className="flex w-full items-center justify-between text-sm text-ink-soft">
                {t(s.label)}
              </span>
              <span className="num text-[26px] leading-8">{s.count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        <section className="card min-w-0">
          <div className="card-head">
            <div><h2 className="card-title">{t("Applications & permits")}</h2><div className="card-sub">{t(permitStages.find((s) => s.id === stage)!.label)} · {t("{n} shown", { n: rows.length })}</div></div>
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="tbl tbl-hover min-w-[780px]">
              <thead><tr><th>{t("Worker")}</th><th>{t("Permit type")}</th><th>{t("Stage")}</th><th>{t("Valid until")}</th><th>{t("Next step")}</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name + r.key}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} />
                        <div><Link href={workerHref(r.name)} className="font-medium text-ink no-underline hover:text-accent">{r.name}</Link><div className="text-xs text-ink-muted">{r.company} · {t(r.nat)}</div></div>
                      </div>
                    </td>
                    <td>{t(r.type)}</td>
                    <td><span className={cx("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", stageStyle[r.key])}>{t(r.stage)}</span></td>
                    <td className={cx("num text-xs", r.key === "renewal" && "text-warn-fg")}>{t(r.valid)}</td>
                    <td className="text-ink-body">{t(r.next)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside aria-labelledby="new-title" className="card min-w-0 xl:sticky xl:top-[88px]">
          <div className="card-head">
            <div><h2 id="new-title" className="card-title">{t("New application")}</h2><div className="card-sub">{t("The checklist is built from the permit type you choose")}</div></div>
          </div>
          <ol className="flex gap-1.5 border-b border-line-row px-[18px] py-3.5 text-xs">
            {steps.map((st, i) => (
              <li key={st} className={cx("flex flex-1 flex-col gap-1.5", i === 2 && "font-semibold", i > 2 && "text-ink-muted")}>
                <span className={cx("h-1 rounded-full", i <= 2 ? "bg-accent" : "bg-[#DDE2E8]")} />
                <span>{i + 1} {t(st)}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-3 px-[18px] py-3.5">
            <div>
              <label htmlFor="ptype" className="label text-ink-soft font-normal text-xs">{t("Permit type")}</label>
              <select id="ptype" className="input w-full">
                <option>{t("Temporary immigration · foreign company workers")}</option><option>{t("Residence and work")}</option><option>{t("Cross-border work")}</option><option>{t("Seasonal temporary")}</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span>{t("Documents for {name}", { name: "Tiago Sousa" })} · Obras Lusitânia Lda</span>
              <span className="num">{permitChecklist.length - missing}/{permitChecklist.length}</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {permitChecklist.map((c) => (
                <li key={c.name} className="flex items-start gap-2.5 text-sm">
                  {c.done
                    ? <span className="mt-px inline-flex size-5 flex-none items-center justify-center rounded-full bg-ok-fg text-white"><Check className="size-3" strokeWidth={3} aria-hidden /></span>
                    : <span className="mt-px size-5 flex-none rounded-full border border-dashed border-ink-muted" />}
                  <span><span className="font-medium">{t(c.name)}</span><br /><span className="text-xs text-ink-muted">{t(c.note)}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
