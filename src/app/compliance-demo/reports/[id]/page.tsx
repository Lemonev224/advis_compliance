import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { PageHeader, Card, StatusPill, cx } from "@/compliance/components/ui";
import { CsvButton } from "@/compliance/components/CsvButton";
import { PrintButton } from "@/compliance/components/reports/PrintButton";
import { SmallMultiples, Columns, Bars } from "@/compliance/components/reports/Charts";
import { getLang, getT } from "@/compliance/lib/i18n-server";
import { demoToday, longDate, type Lang, type TFunction } from "@/compliance/lib/i18n";
import { RENEWALS_COOKIE, parseRenewals } from "@/compliance/lib/demo-state";
import { workerHref } from "@/compliance/lib/data";
import {
  REPORTS, type ReportId, complianceReport, expiries, expiryWeeks, expiryLabel, daysLeft, accessDays, ACCESS_EVENTS, accessBySite,
  scorecard, permitsReport, UNCONFIRMED,
} from "@/compliance/lib/reports";

const TYPE_COLORS = { contract: "#3b6fb6", document: "#c77700", permit: "#6b4aa0" } as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const r = REPORTS.find((x) => x.id === id);
  return { title: r ? t(r.title) : t("Reports") };
}

function Tile({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "warn" | "bad" | "ok" }) {
  return (
    <div className="card flex flex-col gap-1 p-4">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className={cx("text-[28px] leading-9 font-semibold", tone === "bad" && "text-bad-fg", tone === "warn" && "text-warn-fg", tone === "ok" && "text-ok-fg")}>{value}</span>
      {note && <span className="text-xs text-ink-muted">{note}</span>}
    </div>
  );
}

const Tiles = ({ children }: { children: React.ReactNode }) => <div className="print-keep grid grid-cols-2 gap-3 md:grid-cols-4">{children}</div>;
const Finding = ({ children }: { children: React.ReactNode }) => <p className="max-w-3xl text-[15px] leading-6">{children}</p>;
const WorkerLink = ({ name }: { name: string }) => {
  const href = workerHref(name);
  return href.endsWith("/workers") ? <>{name}</> : <Link href={href} className="text-ink no-underline hover:text-accent">{name}</Link>;
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = REPORTS.find((x) => x.id === id);
  if (!report) notFound();
  const t = await getT();
  const lang = await getLang();
  const renewals = parseRenewals((await cookies()).get(RENEWALS_COOKIE)?.value);
  const { body, csv } = build(report.id, t, renewals, lang);

  return (
    <>
      <Link href="/compliance-demo/reports" className="inline-flex items-center gap-1 text-sm text-ink-muted no-underline hover:text-ink print:hidden"><ArrowLeft className="size-3.5" aria-hidden />{t("Reports")}</Link>
      <PageHeader
        section={`Grupo Heracles · ${t("All sites")} · ${longDate(lang, demoToday())}`}
        title={t(report.title)}
        description={t(report.text)}
        actions={<span className="flex gap-2 print:hidden"><CsvButton filename={`${report.id}-report.csv`} rows={csv} /><PrintButton /></span>}
      />
      {body}
    </>
  );
}

type Row = Record<string, string | number>;

function build(id: ReportId, t: TFunction, renewals: ReturnType<typeof parseRenewals>, lang: Lang): { body: React.ReactNode; csv: Row[] } {
  // 6.5 in English, 6,5 in Spanish.
  const plural = (n: number, one: string, many: string) => (n === 1 ? t(one) : t(many, { n }));
  const dec = (v: number) => (lang === "es" ? v.toFixed(1).replace(".", ",") : v.toFixed(1));
  switch (id) {
    /* ---------------- Compliance over time ---------------- */
    case "compliance": {
      const d = complianceReport(renewals);
      const weeks = d.weeks.map((w) => t(w));
      const now = d.group[12], before = d.group[8];
      const w = d.weakest;
      return {
        csv: d.weeks.map((wk, i) => ({ [t("Week of")]: t(wk), ...Object.fromEntries(d.sites.map((s) => [s.name, `${s.values[i]}%`])), [t("Average across sites")]: `${d.group[i]}%` })),
        body: (
          <>
            <Finding>{t("{site} has dropped from {from}% to {to}% in 13 weeks while the other sites improved. It is the one to act on.", { site: w.name, from: w.values[0], to: w.values[12] })}</Finding>
            <Tiles>
              <Tile label={t("Average across sites")} value={`${now}%`} note={t("{n} pts in 4 weeks", { n: `${now - before >= 0 ? "+" : ""}${now - before}` })} />
              <Tile label={t("Best site")} value={`${Math.max(...d.sites.map((s) => s.values[12]))}%`} note={[...d.sites].sort((a, b) => b.values[12] - a.values[12])[0].name} tone="ok" />
              <Tile label={t("Weakest site")} value={`${w.values[12]}%`} note={w.name} tone="bad" />
              <Tile label={t("Weeks shown")} value="13" note={`${weeks[0]} – ${weeks[12]}`} />
            </Tiles>
            <Card title={t("Fully compliant workers per site, weekly")} subtitle={t("Same scale on every site; the gray line is the average across sites")} className="print-keep" bodyClass="p-[18px]">
              <SmallMultiples labels={weeks} panels={d.sites.map((s) => ({ name: s.name, values: s.values, sub: t(s.detail) }))} reference={d.group} seriesLabel={t("Site")} referenceLabel={t("Average across sites")} min={70} max={100} />
            </Card>
            <Card title={t("Weekly figures")} bodyClass="overflow-x-auto scroll-thin">
              <table className="tbl min-w-[640px]">
                <thead><tr><th>{t("Week of")}</th>{d.sites.map((s) => <th key={s.name} className="text-right">{s.name}</th>)}<th className="text-right">{t("Average")}</th></tr></thead>
                <tbody>{[...d.weeks.keys()].reverse().map((i) => (
                  <tr key={i}><td className="num text-xs">{weeks[i]}</td>{d.sites.map((s) => <td key={s.name} className="num text-right">{s.values[i]}%</td>)}<td className="num text-right font-medium">{d.group[i]}%</td></tr>
                ))}</tbody>
              </table>
            </Card>
          </>
        ),
      };
    }

    /* ---------------- Upcoming expiries ---------------- */
    case "expiries": {
      const list = expiries(renewals);
      const weeks = expiryWeeks(renewals);
      const in30 = list.filter((e) => daysLeft(e) <= 30);
      const count = (type: string, l = list) => l.filter((e) => e.type === type).length;
      const typeLabel = { contract: t("Contract"), document: t("Document"), permit: t("Permit") };
      return {
        csv: list.map((e) => ({ [t("Date")]: t(expiryLabel(e)), [t("Type")]: typeLabel[e.type], [t("Item")]: t(e.item), [t("Worker")]: t(e.worker), [t("Company")]: t(e.company), [t("Site")]: e.site, [t("Days left")]: daysLeft(e), [t("Blocks access")]: e.blocks ? t("Yes") : t("No") })),
        body: (
          <>
            <Finding>{t("{n} items end in the next 30 days. Each one blocks site access on its date unless it is renewed.", { n: in30.length })}</Finding>
            <Tiles>
              <Tile label={t("Next 30 days")} value={String(in30.length)} note={[plural(count("contract", in30), "1 contract", "{n} contracts"), plural(count("document", in30), "1 document", "{n} documents"), plural(count("permit", in30), "1 permit", "{n} permits")].join(" · ")} tone="warn" />
              <Tile label={t("Next 90 days")} value={String(list.length)} />
              <Tile label={t("Contracts")} value={String(count("contract"))} />
              <Tile label={t("Documents and permits")} value={String(count("document") + count("permit"))} />
            </Tiles>
            <Card title={t("Expiries per week, next 13 weeks")} subtitle={t("By type")} className="print-keep" bodyClass="p-[18px]">
              <Columns totalLabel={t("items")} series={(["contract", "document", "permit"] as const).map((k) => ({ key: k, label: typeLabel[k], color: TYPE_COLORS[k] }))}
                rows={weeks.map((w) => ({ label: t(w.label), values: { contract: w.contract, document: w.document, permit: w.permit } }))} />
            </Card>
            <Card title={t("All items, soonest first")} bodyClass="overflow-x-auto scroll-thin">
              <table className="tbl tbl-hover min-w-[820px]">
                <thead><tr><th>{t("Date")}</th><th>{t("Item")}</th><th>{t("Worker")}</th><th>{t("Site")}</th><th className="text-right">{t("Days left")}</th><th>{t("Blocks access")}</th></tr></thead>
                <tbody>{list.map((e, i) => (
                  <tr key={i}>
                    <td className={cx("num text-xs whitespace-nowrap", daysLeft(e) <= 30 && "text-warn-fg font-medium")}>{t(expiryLabel(e))}</td>
                    <td><span className="inline-flex items-center gap-2"><span aria-hidden className="size-2 flex-none rounded-full" style={{ background: TYPE_COLORS[e.type] }} /><span><span className="font-medium">{t(e.item)}</span><span className="block text-xs text-ink-muted">{typeLabel[e.type]}</span></span></span></td>
                    <td><WorkerLink name={t(e.worker)} /><div className="text-xs text-ink-muted">{t(e.company)}</div></td>
                    <td>{e.site}</td>
                    <td className="num text-right">{daysLeft(e)}</td>
                    <td className="text-xs text-ink-soft">{e.blocks ? t("Yes") : "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          </>
        ),
      };
    }

    /* ---------------- Site access log ---------------- */
    case "access": {
      const days = accessDays();
      const week = days.slice(-7);
      const weekTotal = week.reduce((a, d) => a + d.n, 0);
      const bySite = accessBySite(weekTotal);
      const kindLabel = { in: t("Checked in"), blocked: t("Entry refused"), override: t("Access override") };
      const kindTone = { in: "ok", blocked: "bad", override: "warn" } as const;
      const blocked = ACCESS_EVENTS.filter((e) => e.kind === "blocked").length;
      const overrides = ACCESS_EVENTS.filter((e) => e.kind === "override").length;
      return {
        csv: ACCESS_EVENTS.map((e) => ({ [t("When")]: t(e.time), [t("Site")]: e.site, [t("Worker")]: t(e.who), [t("Event")]: kindLabel[e.kind], [t("Reason")]: t(e.reason), [t("By")]: t(e.by) })),
        body: (
          <>
            <Finding>{t("Every refused entry this week was caught automatically, before the worker reached the site. Overrides are rare and each one has a reason and a name.")}</Finding>
            <Tiles>
              <Tile label={t("Check-ins, last 7 days")} value={String(weekTotal)} note={t("{n} today", { n: days[days.length - 1].n })} />
              <Tile label={t("Entries refused")} value={String(blocked)} note={t("Last 7 days")} tone="bad" />
              <Tile label={t("Access overrides")} value={String(overrides)} note={t("Each with a reason")} tone="warn" />
              <Tile label={t("Sites")} value="4" />
            </Tiles>
            <Card title={t("Check-ins per day, all sites")} subtitle={t("Last 14 days")} className="print-keep" bodyClass="p-[18px]">
              <Columns height={200} totalLabel={t("check-ins")} series={[{ key: "n", label: t("Check-ins"), color: "#3b6fb6" }]}
                rows={days.map((d) => ({ label: t(d.label), values: { n: d.n }, note: d.today ? t("Today") : d.weekend ? t("Weekend") : undefined }))} />
            </Card>
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <Card title={t("Access events")} subtitle={t("Newest first")} bodyClass="overflow-x-auto scroll-thin">
                <table className="tbl min-w-[720px]">
                  <thead><tr><th>{t("When")}</th><th>{t("Site")}</th><th>{t("Worker")}</th><th>{t("Event")}</th><th>{t("Reason")}</th><th>{t("By")}</th></tr></thead>
                  <tbody>{ACCESS_EVENTS.map((e, i) => (
                    <tr key={i}>
                      <td className="num text-xs whitespace-nowrap">{t(e.time)}</td><td>{e.site}</td><td><WorkerLink name={t(e.who)} /></td>
                      <td><StatusPill status={kindTone[e.kind]}>{kindLabel[e.kind]}</StatusPill></td>
                      <td className="text-sm text-ink-soft">{t(e.reason)}</td><td className="text-sm">{t(e.by)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </Card>
              <Card title={t("By site, last 7 days")} bodyClass="overflow-x-auto scroll-thin">
                <table className="tbl">
                  <thead><tr><th>{t("Site")}</th><th className="text-right">{t("Check-ins")}</th><th className="text-right">{t("Refused")}</th><th className="text-right">{t("Overrides")}</th></tr></thead>
                  <tbody>{bySite.map((s) => (
                    <tr key={s.site}><td>{s.site}</td><td className="num text-right">{s.checkins}</td><td className={cx("num text-right", s.blocked > 0 && "text-bad-fg font-medium")}>{s.blocked}</td><td className="num text-right">{s.overrides}</td></tr>
                  ))}</tbody>
                </table>
              </Card>
            </div>
          </>
        ),
      };
    }

    /* ---------------- Subcontractor scorecard ---------------- */
    case "subcontractors": {
      const rows = scorecard(renewals);
      const subs = rows.filter((r) => !r.own).sort((a, b) => a.pct - b.pct);
      const own = rows.find((r) => r.own)!;
      const worst = subs[0];
      const slowest = [...subs].sort((a, b) => b.days - a.days)[0];
      return {
        csv: rows.map((r) => ({ [t("Employer")]: r.company, [t("Workers")]: r.workers, [t("Documents required")]: r.required, [t("Valid")]: r.valid, [t("Valid %")]: `${r.pct}%`, [t("Missing")]: r.missing, [t("Expired")]: r.expired, [t("Avg. days to send a requested document")]: dec(r.days), [t("Sent on time")]: `${r.onTime}%` })),
        body: (
          <>
            <Finding>{t("{company} has the most gaps: {pct}% of required documents valid and {days} days on average to send a requested document. Your own staff are at {own}%.", { company: worst.company, pct: worst.pct, days: dec(worst.days), own: own.pct })}</Finding>
            <Tiles>
              <Tile label={t("Subcontractors")} value={String(subs.length)} note={t("{n} workers on your sites", { n: subs.reduce((a, s) => a + s.workers, 0) })} />
              <Tile label={t("Documents missing")} value={String(subs.reduce((a, s) => a + s.missing, 0))} tone="bad" />
              <Tile label={t("Documents expired")} value={String(subs.reduce((a, s) => a + s.expired, 0))} tone={subs.some((s) => s.expired) ? "bad" : undefined} />
              <Tile label={t("Slowest to respond")} value={t("{n} days", { n: dec(slowest.days) })} note={slowest.company} tone="warn" />
            </Tiles>
            <Card title={t("Required documents valid, by employer")} subtitle={t("Lowest first; your own staff in gray for comparison")} className="print-keep" bodyClass="p-[18px]">
              <Bars max={100} unit="%" rows={[...subs, own].map((r) => ({ label: r.company, value: r.pct, sub: r.own ? t("Your own staff") : t("{n} workers", { n: r.workers }), muted: r.own }))} />
            </Card>
            <Card title={t("Scorecard")} bodyClass="overflow-x-auto scroll-thin">
              <table className="tbl min-w-[760px]">
                <thead><tr><th>{t("Employer")}</th><th className="text-right">{t("Workers")}</th><th className="text-right">{t("Valid")}</th><th className="text-right">{t("Missing")}</th><th className="text-right">{t("Expired")}</th><th className="text-right">{t("Avg. days to respond")}</th><th className="text-right">{t("Sent on time")}</th></tr></thead>
                <tbody>{[...subs, own].map((r) => (
                  <tr key={r.company}>
                    <td><span className="font-medium">{r.company}</span>{r.own && <span className="block text-xs text-ink-muted">{t("Your own staff")}</span>}</td>
                    <td className="num text-right">{r.workers}</td>
                    <td className="num text-right">{r.valid} / {r.required} <span className="text-ink-muted">({r.pct}%)</span></td>
                    <td className={cx("num text-right", r.missing > 0 && "text-bad-fg font-medium")}>{r.missing}</td>
                    <td className={cx("num text-right", r.expired > 0 && "text-bad-fg font-medium")}>{r.expired}</td>
                    <td className="num text-right">{dec(r.days)}</td>
                    <td className="num text-right">{r.onTime}%</td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          </>
        ),
      };
    }

    /* ---------------- Permits ---------------- */
    case "permits": {
      const d = permitsReport(renewals);
      const stageTone: Record<string, string> = { draft: "bg-pending-bg text-ink-body", submitted: "bg-info-bg text-info-fg", approved: "bg-ok-bg text-ok-fg", renewal: "bg-warn-bg text-warn-fg" };
      return {
        csv: d.rows.map((p) => ({ [t("Worker")]: p.name, [t("Employer")]: p.company, [t("Permit type")]: t(p.type), [t("Stage")]: t(p.stage), [t("Submitted")]: t(p.submitted ?? "—"), [t("Decision")]: t(p.decided ?? "—"), [t("Days")]: p.days ?? "", [t("Valid until")]: t(p.valid), [t("Next step")]: t(p.next) })),
        body: (
          <>
            <Finding>{t("The Govern takes about {n} days to decide. {w} applications are waiting now; start renewals at least 6 weeks before a permit ends.", { n: d.avgDays, w: d.waiting })}</Finding>
            <Tiles>
              <Tile label={t("Average days to decision")} value={String(d.avgDays)} note={t("Approved applications")} />
              <Tile label={t("Awaiting Govern decision")} value={String(d.waiting)} tone="warn" />
              <Tile label={t("Renewal due")} value={String(d.stages.find((s) => s.id === "renewal")?.count ?? 0)} tone="warn" />
              <Tile label={t("Approved")} value={String(d.stages.find((s) => s.id === "approved")?.count ?? 0)} tone="ok" />
            </Tiles>
            <Card title={t("Permits by stage")} subtitle={t("All workers who need one")} className="print-keep" bodyClass="p-[18px]">
              <Bars max={Math.max(...d.stages.map((s) => s.count))} rows={d.stages.map((s) => ({ label: t(s.label), value: s.count }))} />
            </Card>
            <Card title={t("Applications")} bodyClass="overflow-x-auto scroll-thin">
              <table className="tbl tbl-hover min-w-[860px]">
                <thead><tr><th>{t("Worker")}</th><th>{t("Permit type")}</th><th>{t("Stage")}</th><th>{t("Submitted")}</th><th>{t("Decision")}</th><th className="text-right">{t("Days")}</th><th>{t("Next step")}</th></tr></thead>
                <tbody>{d.rows.map((p) => (
                  <tr key={p.name}>
                    <td><WorkerLink name={p.name} /><div className="text-xs text-ink-muted">{p.company}</div></td>
                    <td className="text-sm">{t(p.type)}</td>
                    <td><span className={cx("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", stageTone[p.key])}>{t(p.stage)}</span></td>
                    <td className="num text-xs">{t(p.submitted ?? "—")}</td>
                    <td className="num text-xs">{t(p.decided ?? "—")}</td>
                    <td className="num text-right">{p.days === null || p.days === undefined ? "—" : p.decided === "—" ? t("{n} so far", { n: p.days }) : p.days}</td>
                    <td className="text-sm text-ink-body">{t(p.next)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          </>
        ),
      };
    }

    /* ---------------- Unconfirmed dates ---------------- */
    case "unconfirmed": {
      return {
        csv: UNCONFIRMED.map((u) => ({ [t("File")]: u.file, [t("Document")]: t(u.document), [t("Worker")]: u.worker, [t("Date read")]: t(u.read), [t("Read from")]: t(u.where), [t("Confidence")]: t(u.confidence), [t("Uploaded by")]: u.by, [t("Uploaded")]: t(u.uploaded) })),
        body: (
          <>
            <Finding>{t("{n} uploads have an expiry date read automatically that no one has checked yet. Until a person confirms it, the date does not count towards site access.", { n: UNCONFIRMED.length })}</Finding>
            <Tiles>
              <Tile label={t("Waiting for confirmation")} value={String(UNCONFIRMED.length)} tone="warn" />
              <Tile label={t("Oldest waiting")} value={t("{n} days", { n: 2 })} note="medical_carvalho.pdf" />
              <Tile label={t("Confirmed this month")} value="41" tone="ok" />
              <Tile label={t("Dates corrected by a person")} value="3" note={t("of 44 read this month")} />
            </Tiles>
            <Card title={t("Waiting for confirmation")} subtitle={t("Oldest first")} actions={<Link href="/compliance-demo/workers/documents" className="btn-primary btn-dense print:hidden"><ShieldCheck className="size-4" aria-hidden />{t("Review in Documents")}</Link>} bodyClass="overflow-x-auto scroll-thin">
              <table className="tbl min-w-[860px]">
                <thead><tr><th>{t("Document")}</th><th>{t("Worker")}</th><th>{t("Date read")}</th><th>{t("Read from")}</th><th>{t("Confidence")}</th><th>{t("Uploaded")}</th></tr></thead>
                <tbody>{UNCONFIRMED.map((u) => (
                  <tr key={u.file}>
                    <td><span className="font-medium">{t(u.document)}</span><span className="block text-xs text-ink-muted">{u.file}</span></td>
                    <td><WorkerLink name={u.worker} /></td>
                    <td className="num text-sm font-medium">{t(u.read)}</td>
                    <td className="text-sm text-ink-soft">{t(u.where)}</td>
                    <td><span className={cx("inline-flex items-center gap-1 text-xs font-medium", u.confidence === "High" ? "text-ok-fg" : "text-warn-fg")}>{u.confidence === "High" ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <AlertTriangle className="size-3" aria-hidden />}{t(u.confidence)}</span></td>
                    <td className="text-sm">{t(u.uploaded)}<span className="block text-xs text-ink-muted">{u.by}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          </>
        ),
      };
    }
  }
}
