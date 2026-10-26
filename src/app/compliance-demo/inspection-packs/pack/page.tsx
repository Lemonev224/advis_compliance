import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, ShieldCheck, Check, AlertTriangle } from "lucide-react";
import { PageHeader, StatusPill, cx } from "@/compliance/components/ui";
import { CsvButton } from "@/compliance/components/CsvButton";
import { PrintButton } from "@/compliance/components/reports/PrintButton";
import { getLang, getT } from "@/compliance/lib/i18n-server";
import { demoToday, longDate, type TFunction } from "@/compliance/lib/i18n";
import { RENEWALS_COOKIE, parseRenewals } from "@/compliance/lib/demo-state";
import { workerHref, type Status } from "@/compliance/lib/data";
import { INSPECTION_SITES, inspectionPack, EMPLOYERS, type InspectionSiteId, type RegisterRow } from "@/compliance/lib/inspection";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Labour inspection pack") };
}

const STATUS_LABEL: Record<Status, string> = { ok: "Compliant", warn: "Expiring", bad: "Blocked", pending: "Pending" };

function Section({ n, id, title, sub, children, breakBefore }: { n: number; id: string; title: string; sub?: string; children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cx("card min-w-0 scroll-mt-24", breakBefore && "print:break-before-page")}>
      <div className="card-head">
        <div>
          <h2 id={`${id}-h`} className="card-title"><span className="num mr-2 text-ink-muted">{n}</span>{title}</h2>
          {sub && <div className="card-sub">{sub}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs text-ink-muted">{label}</dt><dd className="text-sm font-medium">{children}</dd></div>;
}

function docStatus(t: TFunction, d: RegisterRow["docs"][number]) {
  const label = d.status === "ok" ? "Valid" : d.status === "warn" ? "Expiring" : d.status === "pending" ? "Pending" : d.until === "—" ? "Missing" : "Expired";
  return <StatusPill status={d.status}>{t(label)}</StatusPill>;
}

const docName = (t: TFunction, name: string, site: string) => (name === "Site induction" ? t("Site induction · {site}", { site }) : t(name));

export default async function InspectionPackPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const { site: siteParam } = await searchParams;
  const t = await getT();
  const lang = await getLang();
  const renewals = parseRenewals((await cookies()).get(RENEWALS_COOKIE)?.value);
  const siteId = (INSPECTION_SITES.some((s) => s.id === siteParam) ? siteParam : INSPECTION_SITES[0].id) as InspectionSiteId;
  const pack = inspectionPack(siteId, renewals);
  const { site, register, employers, openIssues, daily, events, audit, totals } = pack;
  const today = demoToday();
  const ref = `INS-${site.code}-${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
  const pct = Math.round((totals.ok / totals.workers) * 100);
  const docPct = Math.round((totals.validDocs / totals.docs) * 100);
  const notReady = totals.bad + totals.pending;

  const csv = register.map((w) => ({
    [t("Worker")]: w.name, [t("Role")]: t(w.role), [t("Employer")]: w.company, [t("Nationality")]: t(w.nat),
    [t("Contract until")]: t(w.contract), [t("Permit until")]: t(w.permit), [t("PRL training until")]: t(w.prl),
    [t("Medical until")]: t(w.medical), [t("Induction signed")]: t(w.induction), [t("Status")]: t(STATUS_LABEL[w.status]), [t("Issue")]: w.issue ? t(w.issue) : "",
  }));

  const contents = [
    { id: "issues", title: t("Open issues and action taken") },
    { id: "register", title: t("Worker register") },
    { id: "employers", title: t("Employers on site") },
    { id: "access", title: t("Site access, last 7 days") },
    { id: "files", title: t("Worker files") },
    { id: "log", title: t("Change log") },
    { id: "declaration", title: t("Declaration") },
  ];

  return (
    <>
      <Link href="/compliance-demo/inspection-packs" className="inline-flex items-center gap-1 text-sm text-ink-muted no-underline hover:text-ink print:hidden"><ArrowLeft className="size-3.5" aria-hidden />{t("Inspection packs")}</Link>
      <PageHeader
        section={`Grupo Heracles · ${site.name} · ${longDate(lang, today)}`}
        title={t("Labour inspection pack")}
        description={t("Everything an inspector asks for on this site, in one document. Built from live data, so it is always up to date.")}
        actions={<span className="flex gap-2 print:hidden"><CsvButton filename={`inspection-pack-${site.id}.csv`} rows={csv} /><PrintButton /></span>}
      />

      <nav aria-label={t("Site")} className="flex flex-wrap gap-2 print:hidden">
        {INSPECTION_SITES.map((s) => (
          <Link key={s.id} href={`/compliance-demo/inspection-packs/pack?site=${s.id}`} aria-current={s.id === site.id ? "page" : undefined}
            className={cx("rounded-ctl border px-3 py-1.5 text-sm no-underline", s.id === site.id ? "border-accent bg-accent-tint font-medium text-accent" : "border-line bg-surface text-ink-body hover:border-line-strong hover:text-ink")}>
            {s.name}
          </Link>
        ))}
      </nav>

      {/* Cover */}
      <section className="card print-keep flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-ctl bg-accent-tint text-accent"><ShieldCheck className="size-6" aria-hidden /></span>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-muted">{t("Labour inspection pack")}</div>
              <div className="text-[20px] font-semibold leading-7">{site.name} · {t(site.project)}</div>
            </div>
          </div>
          <div className="text-right text-xs text-ink-muted"><div>{t("Reference")}</div><div className="num text-sm font-medium text-ink">{ref}</div></div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
          <Fact label={t("Site address")}>{site.address}</Fact>
          <Fact label={t("Principal contractor")}>Grupo Heracles · {EMPLOYERS["Grupo Heracles"].taxId}</Fact>
          <Fact label={t("Site contact")}>{site.manager}</Fact>
          <Fact label={t("Prepared by")}>{t("Demo admin")} · Grupo Heracles</Fact>
          <Fact label={t("Generated")}>{longDate(lang, today)}</Fact>
          <Fact label={t("Covers")}>{t("{n} workers · {e} employers · {d} documents", { n: totals.workers, e: employers.length, d: totals.docs })}</Fact>
        </dl>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: t("Workers on site"), value: String(totals.workers), note: t("{n} employers", { n: employers.length }) },
            { label: t("Fully compliant"), value: `${pct}%`, note: t("{n} of {m} workers", { n: totals.ok, m: totals.workers }), tone: "ok" },
            { label: t("Expiring within 30 days"), value: String(totals.warn), note: t("being renewed"), tone: totals.warn ? "warn" : undefined },
            { label: t("Blocked or pending"), value: String(notReady), note: t("cannot check in"), tone: notReady ? "bad" : "ok" },
          ].map((x) => (
            <div key={x.label} className="rounded-ctl border border-line px-4 py-3">
              <div className="text-sm text-ink-muted">{x.label}</div>
              <div className={cx("text-[26px] font-semibold leading-8", x.tone === "ok" && "text-ok-fg", x.tone === "warn" && "text-warn-fg", x.tone === "bad" && "text-bad-fg")}>{x.value}</div>
              <div className="text-xs text-ink-muted">{x.note}</div>
            </div>
          ))}
        </div>
        <p className="max-w-3xl text-[15px] leading-6">
          {notReady === 0
            ? t("Every worker on this site has valid papers. {p}% of the {d} documents on file are in force; the rest are already being renewed.", { p: docPct, d: totals.docs })
            : notReady === 1
              ? t("1 worker on this site cannot check in until their papers are fixed; the system blocks them automatically. Everyone else is cleared to work.")
              : t("{n} workers on this site cannot check in until their papers are fixed; the system blocks them automatically. Everyone else is cleared to work.", { n: notReady })}
        </p>
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("Contents")}</h2>
          <ol className="grid gap-1 text-sm sm:grid-cols-2">
            {contents.map((c, i) => <li key={c.id}><a href={`#${c.id}`} className="no-underline"><span className="num mr-2 text-ink-muted">{i + 1}</span>{c.title}</a></li>)}
          </ol>
        </div>
      </section>

      <Section n={1} id="issues" title={contents[0].title} sub={openIssues.length ? t("{n} open", { n: openIssues.length }) : t("None")}>
        {openIssues.length === 0
          ? <p className="flex items-center gap-2 px-[18px] py-4 text-sm text-ok-fg"><Check className="size-4" aria-hidden />{t("No open issues on this site.")}</p>
          : (
            <div className="overflow-x-auto scroll-thin">
              <table className="tbl min-w-[720px]">
                <thead><tr><th>{t("Worker")}</th><th>{t("Issue")}</th><th>{t("When")}</th><th>{t("Action taken")}</th></tr></thead>
                <tbody>
                  {openIssues.map((q) => (
                    <tr key={q.worker + q.issue}>
                      <td><span className="font-medium">{q.worker}</span><div className="text-xs text-ink-muted">{q.company}</div></td>
                      <td>{t(q.issue)}</td>
                      <td><StatusPill status={q.severity === "overdue" ? "bad" : "warn"}>{t(q.when)}</StatusPill></td>
                      <td className="text-ink-body">{t(q.taken)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Section>

      <Section n={2} id="register" title={contents[1].title} sub={t("{n} workers assigned to {site}", { n: totals.workers, site: site.name })} breakBefore>
        <div className="overflow-x-auto scroll-thin">
          <table className="tbl min-w-[980px] text-[13px]">
            <thead><tr><th>{t("Worker")}</th><th>{t("Employer")}</th><th>{t("Nationality")}</th><th>{t("Contract until")}</th><th>{t("Permit until")}</th><th>{t("PRL training")}</th><th>{t("Medical")}</th><th>{t("Induction")}</th><th>{t("Status")}</th></tr></thead>
            <tbody>
              {register.map((w) => (
                <tr key={w.name}>
                  <td>
                    {w.named && !workerHref(w.name).endsWith("/workers") ? <Link href={workerHref(w.name)} className="font-medium text-ink no-underline hover:text-accent">{w.name}</Link> : <span className="font-medium">{w.name}</span>}
                    <div className="text-xs text-ink-muted">{t(w.role)}</div>
                  </td>
                  <td>{w.company}</td>
                  <td>{t(w.nat)}</td>
                  <td className="num">{t(w.contract)}</td>
                  <td className="num">{t(w.permit)}</td>
                  <td className="num">{t(w.prl)}</td>
                  <td className="num">{t(w.medical)}</td>
                  <td className="num">{t(w.induction)}</td>
                  <td><StatusPill status={w.status}>{t(STATUS_LABEL[w.status])}</StatusPill>{w.issue && <div className="mt-1 max-w-[220px] text-xs text-ink-muted">{t(w.issue)}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={3} id="employers" title={contents[2].title} sub={t("Subcontractors are checked like our own staff")}>
        <div className="overflow-x-auto scroll-thin">
          <table className="tbl min-w-[860px]">
            <thead><tr><th>{t("Employer")}</th><th>{t("Tax ID")}</th><th className="text-right">{t("Workers")}</th><th>{t("Social security")}</th><th>{t("Liability and accident insurance")}</th><th className="text-right">{t("Documents valid")}</th></tr></thead>
            <tbody>
              {employers.map((e) => (
                <tr key={e.company}>
                  <td><span className="font-medium">{e.company}</span><div className="text-xs text-ink-muted">{e.foreign ? t("Foreign company · {country}", { country: t(e.country) }) : t("Principal contractor")}</div></td>
                  <td className="num text-xs">{e.taxId}</td>
                  <td className="num text-right">{e.workers}</td>
                  <td>{t(e.social)}</td>
                  <td>{e.insurer} · <span className="num">{t(e.insurance)}</span></td>
                  <td className={cx("num text-right font-medium", e.pct === 100 ? "text-ok-fg" : e.pct >= 90 ? "text-warn-fg" : "text-bad-fg")}>{e.valid}/{e.docs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={4} id="access" title={contents[3].title} sub={t("Every check-in is checked against the worker's papers at the gate")} breakBefore>
        <div className="grid gap-4 px-[18px] py-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <table className="tbl print-keep">
            <thead><tr><th>{t("Day")}</th><th className="text-right">{t("Check-ins")}</th></tr></thead>
            <tbody>{daily.map((d) => <tr key={d.label}><td className={cx(d.weekend && "text-ink-muted")}>{t(d.label)}{d.today ? ` · ${t("today")}` : ""}</td><td className="num text-right">{d.n}</td></tr>)}</tbody>
          </table>
          <div>
            <h3 className="mb-2 text-sm font-semibold">{t("Refused check-ins and overrides")}</h3>
            {events.filter((e) => e.kind !== "in").length === 0
              ? <p className="text-sm text-ink-muted">{t("None in the last 7 days.")}</p>
              : (
                <ul className="flex flex-col gap-2.5">
                  {events.filter((e) => e.kind !== "in").map((e) => (
                    <li key={e.time + e.who} className="flex gap-2.5 text-sm">
                      <AlertTriangle className={cx("mt-0.5 size-4 flex-none", e.kind === "blocked" ? "text-bad-fg" : "text-warn-fg")} aria-hidden />
                      <span><span className="font-medium">{e.who}</span> · {e.kind === "blocked" ? t("refused") : t("override")} · <span className="num text-ink-muted">{t(e.time)}</span><br /><span className="text-ink-body">{t(e.reason)}</span> <span className="text-xs text-ink-muted">({e.by === "System" ? t("System") : e.by})</span></span>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </Section>

      <Section n={5} id="files" title={contents[4].title} sub={t("Each worker's documents with their expiry dates. Originals are attached in the app.")} breakBefore>
        <div className="grid gap-3 px-[18px] py-4 lg:grid-cols-2">
          {register.map((w) => (
            <article key={w.name} className="print-keep rounded-ctl border border-line">
              <header className="flex items-start justify-between gap-3 border-b border-line-row px-3.5 py-2.5">
                <div><div className="text-sm font-semibold">{w.name}</div><div className="text-xs text-ink-muted">{t(w.role)} · {w.company} · {t(w.nat)}</div></div>
                <StatusPill status={w.status}>{t(STATUS_LABEL[w.status])}</StatusPill>
              </header>
              <table className="w-full text-[13px]">
                <tbody>
                  {w.docs.map((d) => (
                    <tr key={d.name} className="border-b border-line-row last:border-0">
                      <td className="px-3.5 py-1.5">{docName(t, d.name, site.name)}</td>
                      <td className="num whitespace-nowrap px-2 py-1.5 text-ink-muted">{d.name === "Site induction" ? `${t("Signed")} ${t(d.until)}` : t(d.until)}</td>
                      <td className="px-3.5 py-1.5 text-right">{docStatus(t, d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
      </Section>

      <Section n={6} id="log" title={contents[5].title} sub={t("Who changed what, so the record stands up to questions")}>
        {audit.length === 0
          ? <p className="px-[18px] py-4 text-sm text-ink-muted">{t("No changes in the last 7 days.")}</p>
          : (
            <ol className="flex flex-col gap-2.5 px-[18px] py-4">
              {audit.map((a, i) => (
                <li key={i} className="flex flex-wrap gap-x-3 text-sm">
                  <span className="num w-[110px] flex-none text-ink-muted">{t(a.time)}</span>
                  <span className="min-w-0 flex-1">{t(a.text, { ...a.vars, reason: a.vars?.reason ? t(a.vars.reason) : "" })}</span>
                  <span className="text-xs text-ink-muted">{a.by === "System" ? t("System") : a.by === "Demo admin" ? t("Demo admin") : a.by}</span>
                </li>
              ))}
            </ol>
          )}
      </Section>

      <Section n={7} id="declaration" title={contents[6].title} breakBefore>
        <div className="flex flex-col gap-6 px-[18px] py-4">
          <p className="max-w-3xl text-[15px] leading-6">{t("I confirm that this pack reflects the workers assigned to {site} and the documents held for them on the date shown. Workers without valid papers are blocked from checking in until their documents are renewed.", { site: site.name })}</p>
          <div className="grid gap-8 sm:grid-cols-2">
            {[t("For Grupo Heracles"), t("Received by the inspector")].map((who) => (
              <div key={who} className="flex flex-col gap-1.5">
                <div className="h-12 border-b border-ink-muted" />
                <div className="text-sm font-medium">{who}</div>
                <div className="text-xs text-ink-muted">{t("Name, signature and date")}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted">{t("Reference")} {ref} · {t("Sample data for demonstration.")}</p>
        </div>
      </Section>
    </>
  );
}
