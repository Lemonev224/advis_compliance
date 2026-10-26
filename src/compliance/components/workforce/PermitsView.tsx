"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Check, ChevronRight, Send, FileCheck2, Gavel, ArrowRight } from "lucide-react";
import { PageHeader, InfoBanner, Avatar, cx } from "@/compliance/components/ui";
import { permitChecklist, permitTimeline, renewalChecklist, workerHref } from "@/compliance/lib/data";
import { useDemo } from "@/compliance/components/DemoState";
import { useT } from "@/compliance/components/I18nProvider";
import { useToast } from "@/compliance/components/Toast";
import { Modal, ModalFooter, ResultNotice, useAfterSuccess } from "@/compliance/components/Modal";
import { submitPermit, recordDecision } from "@/app/compliance-demo/permits/actions";
import { demoToday } from "@/compliance/lib/i18n";

const stageStyle: Record<string, string> = {
  draft: "bg-pending-bg text-ink-body",
  submitted: "bg-info-bg text-info-fg",
  approved: "bg-ok-bg text-ok-fg",
  renewal: "bg-warn-bg text-warn-fg",
};

const steps = ["Worker", "Permit type", "Documents", "Review"];

type Permit = ReturnType<typeof useDemo>["data"]["permits"][number];
type Mode = "detail" | "renew" | "decide";

/** The one action each permit needs next, shown on its row and in its dialog. */
function nextAction(p: Permit): { label: string; mode?: Mode; href?: string; primary: boolean; scroll?: boolean } {
  if (p.key === "renewal" && p.id === "antoni-vidal") return { label: "Renew contract", href: "/compliance-demo/workers/contracts?new=antoni-vidal", primary: true };
  if (p.key === "renewal") return { label: "Start renewal", mode: "renew", primary: true };
  if (p.key === "submitted") return { label: "Record decision", mode: "decide", primary: true };
  if (p.key === "draft") return { label: "Continue", scroll: true, primary: true };
  return { label: "View", mode: "detail", primary: false };
}

export function PermitsView({ initialOpen }: { initialOpen: string | null }) {
  const { t } = useT();
  const notify = useToast();
  const { permits, permitStages } = useDemo().data;
  const [stage, setStage] = useState("all");
  const first = permits.find((p) => p.id === initialOpen);
  const [open, setOpen] = useState<{ id: string; mode: Mode } | null>(first ? { id: first.id, mode: nextAction(first).mode === "renew" ? "renew" : "detail" } : null);
  const panel = useRef<HTMLElement>(null);
  const [flash, setFlash] = useState(false);

  const rows = permits.filter((r) => stage === "all" || r.key === stage);
  const missing = permitChecklist.filter((c) => !c.done).length;
  const current = open && permits.find((p) => p.id === open.id);
  const close = () => setOpen(null);

  const goToDraft = () => {
    panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    panel.current?.focus({ preventScroll: true });
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  };
  const act = (p: Permit) => {
    const a = nextAction(p);
    if (a.scroll) goToDraft();
    else if (a.mode) setOpen({ id: p.id, mode: a.mode });
  };

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
            <button key={s.id} aria-pressed={on} onClick={() => setStage(on && s.id !== "all" ? "all" : s.id)}
              className={cx("card flex flex-col items-start gap-1 px-4 py-3.5 text-left transition-colors", on ? "border-accent bg-accent-tint ring-1 ring-accent" : "hover:border-line-strong hover:bg-surface-muted")}>
              <span className={cx("flex w-full items-center justify-between text-sm", on ? "font-medium text-accent" : "text-ink-soft")}>
                {t(s.label)}
                {s.id === "renewal" && s.count > 0 && <span className="size-2 rounded-full bg-warn-fg" aria-hidden />}
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
            {stage !== "all" && <button type="button" className="btn-secondary h-[32px] px-3 text-sm" onClick={() => setStage("all")}>{t("Show all")}</button>}
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="tbl tbl-hover min-w-[720px]">
              <thead><tr><th>{t("Worker")}</th><th>{t("Permit type")}</th><th>{t("Stage")}</th><th>{t("Valid until")}</th><th>{t("Next step")}</th><th><span className="sr-only">{t("Action")}</span></th></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink-muted">{t("Nothing at this stage.")}</td></tr>}
                {rows.map((r) => {
                  const a = nextAction(r);
                  return (
                    <tr key={r.id} className="cursor-pointer" onClick={() => setOpen({ id: r.id, mode: "detail" })}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.name} />
                          <div><Link href={workerHref(r.name)} onClick={(e) => e.stopPropagation()} className="font-medium text-ink no-underline hover:text-accent">{r.name}</Link><div className="text-xs text-ink-muted">{r.company} · {t(r.nat)}</div></div>
                        </div>
                      </td>
                      <td>{t(r.type)}</td>
                      <td><span className={cx("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", stageStyle[r.key])}>{t(r.stage)}</span></td>
                      <td className={cx("num text-xs", r.key === "renewal" && "text-warn-fg")}>{t(r.valid)}</td>
                      <td className="text-ink-body">{t(r.next)}</td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        {a.href
                          ? <Link href={a.href} className="btn-primary btn-row">{t(a.label)}</Link>
                          : <button type="button" onClick={() => act(r)} className={a.primary ? "btn-primary btn-row" : "btn-secondary btn-row font-normal"}>{t(a.label)}{!a.primary && <ChevronRight className="size-3.5" aria-hidden />}</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside ref={panel} tabIndex={-1} aria-labelledby="new-title"
          className={cx("card min-w-0 scroll-mt-24 outline-none transition-shadow xl:sticky xl:top-[88px]", flash && "ring-2 ring-accent")}>
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
                  <span className="min-w-0 flex-1"><span className="font-medium">{t(c.name)}</span><br /><span className="text-xs text-ink-muted">{t(c.note)}</span></span>
                  {!c.done && (
                    <button type="button" className="btn-secondary btn-row flex-none font-normal"
                      onClick={() => notify({ title: t("Request sent to {company}", { company: "Obras Lusitânia Lda" }), body: t(c.name), tone: "success" })}>
                      {t("Request")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 border-t border-line-row px-[18px] py-3.5">
            <button type="button" className="btn-primary w-full" disabled aria-describedby="submit-hint"><Send className="size-4" aria-hidden />{t("Submit to the Govern")}</button>
            <p id="submit-hint" className="text-xs text-ink-muted">{t("{n} documents still missing. You can submit once the employer sends them.", { n: missing })}</p>
            <button type="button" className="btn-secondary w-full font-normal" onClick={() => notify({ title: t("Draft saved"), body: t("Tiago Sousa · Temporary · foreign company worker"), tone: "success" })}>{t("Save draft")}</button>
          </div>
        </aside>
      </div>

      {current && open?.mode === "detail" && <DetailDialog permit={current} onClose={close} onAct={(p) => { const a = nextAction(p); if (a.scroll) { close(); goToDraft(); } else if (a.mode) setOpen({ id: p.id, mode: a.mode }); }} />}
      {current && open?.mode === "renew" && <RenewDialog permit={current} onClose={close} />}
      {current && open?.mode === "decide" && <DecideDialog permit={current} onClose={close} />}
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-xs text-ink-muted">{label}</dt><dd className="text-sm font-medium">{children}</dd></div>;
}

function DetailDialog({ permit: p, onClose, onAct }: { permit: Permit; onClose: () => void; onAct: (p: Permit) => void }) {
  const { t } = useT();
  const a = nextAction(p);
  const history = permitTimeline[p.id] ?? [];
  return (
    <Modal open onClose={onClose} title={p.name} description={`${p.company} · ${t(p.nat)}`}>
      <div className="flex flex-col gap-4 px-5 py-4">
        <dl className="grid grid-cols-2 gap-3">
          <Fact label={t("Permit type")}>{t(p.type)}</Fact>
          <Fact label={t("Stage")}><span className={cx("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", stageStyle[p.key])}>{t(p.stage)}</span></Fact>
          <Fact label={t("Valid until")}>{t(p.valid)}</Fact>
          <Fact label={t("Next step")}>{t(p.next)}</Fact>
        </dl>
        {history.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("History")}</h3>
            <ol className="flex flex-col gap-2 border-l border-line pl-3.5">
              {history.map((h) => <li key={h.time + h.text} className="text-sm"><span className="num text-xs text-ink-muted">{t(h.time)}</span><br />{t(h.text)}</li>)}
            </ol>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-line-row px-5 py-3.5">
        <Link href={workerHref(p.name)} className="btn-secondary font-normal">{t("Worker profile")}</Link>
        {a.primary && (a.href
          ? <Link href={a.href} className="btn-primary">{t(a.label)}<ArrowRight className="size-4" aria-hidden /></Link>
          : <button type="button" className="btn-primary" onClick={() => onAct(p)}>{t(a.label)}<ArrowRight className="size-4" aria-hidden /></button>)}
      </div>
    </Modal>
  );
}

function RenewDialog({ permit: p, onClose }: { permit: Permit; onClose: () => void }) {
  const { t } = useT();
  const [result, action, pending] = useActionState(submitPermit, null);
  useAfterSuccess(result, onClose);
  return (
    <Modal open onClose={onClose} title={t("Renew permit · {name}", { name: p.name })} description={t("Everything the Govern needs is already on file, so the renewal can go today.")}>
      <form action={action}>
        <input type="hidden" name="permit_id" value={p.id} />
        <div className="flex flex-col gap-4 px-5 py-4">
          <ul className="flex flex-col gap-2.5">
            {renewalChecklist.map((c) => (
              <li key={c.name} className="flex items-start gap-2.5 text-sm">
                <span className="mt-px inline-flex size-5 flex-none items-center justify-center rounded-full bg-ok-fg text-white"><FileCheck2 className="size-3" strokeWidth={2.6} aria-hidden /></span>
                <span><span className="font-medium">{t(c.name)}</span><br /><span className="text-xs text-ink-muted">{t(c.note)}</span></span>
              </li>
            ))}
          </ul>
          <p className="rounded-ctl bg-surface-muted px-3 py-2.5 text-sm">{t("The current permit stays valid while the Govern decides, so {name} keeps working.", { name: p.name })}</p>
          <label className="flex items-start gap-2.5 text-sm">
            <input type="checkbox" name="confirm" className="mt-0.5 size-4 accent-[var(--color-accent)]" />
            <span>{t("I have checked the details and want to submit the renewal")}</span>
          </label>
          {result && <ResultNotice result={result} />}
        </div>
        <ModalFooter onCancel={onClose} submitLabel={t("Submit renewal")} pending={pending} />
      </form>
    </Modal>
  );
}

function DecideDialog({ permit: p, onClose }: { permit: Permit; onClose: () => void }) {
  const { t } = useT();
  const [result, action, pending] = useActionState(recordDecision, null);
  useAfterSuccess(result, onClose);
  const [decision, setDecision] = useState("approved");
  const inAYear = new Date(demoToday().getTime() + 365 * 86_400_000).toISOString().slice(0, 10);
  return (
    <Modal open onClose={onClose} title={t("Govern decision · {name}", { name: p.name })} description={t("Record the answer from the Govern when it arrives. Site access follows it straight away.")}>
      <form action={action}>
        <input type="hidden" name="permit_id" value={p.id} />
        <div className="flex flex-col gap-4 px-5 py-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="label mb-1">{t("Decision")}</legend>
            {[{ id: "approved", label: "Approved", icon: Gavel }, { id: "info", label: "More information requested", icon: Send }].map((o) => (
              <label key={o.id} className={cx("flex cursor-pointer items-center gap-2.5 rounded-ctl border px-3 py-2.5 text-sm", decision === o.id ? "border-accent bg-accent-tint" : "border-line hover:border-line-strong")}>
                <input type="radio" name="decision" value={o.id} checked={decision === o.id} onChange={() => setDecision(o.id)} className="accent-[var(--color-accent)]" />
                <o.icon className="size-4 text-ink-muted" aria-hidden />{t(o.label)}
              </label>
            ))}
          </fieldset>
          {decision === "approved" && (
            <div><label htmlFor="pd-valid" className="label">{t("Valid until")}</label><input id="pd-valid" name="valid_until" type="date" required defaultValue={inAYear} className="input w-full" /></div>
          )}
          {result && <ResultNotice result={result} />}
        </div>
        <ModalFooter onCancel={onClose} submitLabel={t("Save decision")} pending={pending} />
      </form>
    </Modal>
  );
}
