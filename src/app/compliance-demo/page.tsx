import Link from "next/link";
import { ShieldCheck, ArrowUpRight, HardHat, CheckCircle2, CalendarClock, Ban, IdCard } from "lucide-react";
import { PageHeader, Card, Progress, Avatar, cx } from "@/compliance/components/ui";
import { ActionQueue } from "@/compliance/components/dashboard/ActionQueue";
import { CsvButton } from "@/compliance/components/CsvButton";
import { SoonButton } from "@/compliance/components/Toast";
import { getDashboardData } from "@/compliance/lib/db/queries";

const kpiIcons = [HardHat, CheckCircle2, CalendarClock, Ban, IdCard];

export default async function DashboardPage() {
  const d = await getDashboardData();
  const max = Math.max(1, ...d.weeks.map((w) => w.n));
  const peak = d.weeks.reduce((a, w) => (w.n > a.n ? w : a), d.weeks[0]);

  return (
    <>
      <PageHeader
        section="Overview"
        title="Dashboard"
        description={d.subtitle}
        actions={<>
          <CsvButton filename="compliance-actions.csv" rows={d.queue.map((q) => ({ Worker: q.worker, Issue: q.issue, Type: q.kind, Site: q.site, Company: q.company, When: q.when, "Next step": q.action }))} />
          <SoonButton feature="packs" className="btn-primary"><ShieldCheck className="size-4" aria-hidden />Generate inspection pack</SoonButton>
        </>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
        {d.kpis.map((k, i) => {
          const Icon = kpiIcons[i];
          return (
            <Link key={k.label} href={k.href} className="card group flex flex-col gap-1.5 p-4 text-ink no-underline transition-colors hover:border-line-strong hover:text-ink">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">{k.label}</span>
                <span className={cx("inline-flex size-7 items-center justify-center rounded-ctl",
                  k.tone === "bad" ? "bg-bad-bg text-bad-fg" : k.tone === "warn" ? "bg-warn-bg text-warn-fg" : "bg-surface-muted text-ink-soft")}>
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <span className={cx("num text-[26px] leading-8 sm:text-[30px] sm:leading-9", k.tone === "bad" && "text-bad-fg", k.tone === "warn" && "text-warn-fg")}>{k.value}</span>
              {k.progress !== undefined && <Progress value={k.progress} tone="ok" height={6} />}
              <span className="flex items-center justify-between gap-2 text-xs text-ink-muted">
                {k.meta}
                <ArrowUpRight className="size-3.5 flex-none opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ActionQueue items={d.queue} limit={6} />

        <Card title="Compliance by site" subtitle="Workers with every required document valid" bodyClass="px-[18px] pt-3 pb-4">
          <ul className="flex flex-col gap-4">
            {d.sites.map((s) => (
              <li key={s.name}>
                <div className="mb-1.5 flex justify-between gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="num text-sm">{s.pct}%</span>
                </div>
                <Progress value={s.pct} />
                <div className="mt-1 text-xs text-ink-muted">{s.detail}</div>
              </li>
            ))}
            {d.sites.length === 0 && <li className="py-6 text-center text-sm text-ink-muted">No sites yet.</li>}
          </ul>
          {d.sites.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-ctl bg-surface-subtle px-3 py-2.5 text-sm">
              <span className="text-ink-muted">Average across sites</span>
              <span className="num">{d.averagePct}%</span>
            </div>
          )}
        </Card>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card
          title="Expiries, next 13 weeks"
          subtitle="Contracts, permits and documents reaching their end date"
          actions={<Link href="/compliance-demo/calendar" className="text-sm font-medium">Open calendar</Link>}
          bodyClass="overflow-x-auto scroll-thin p-[18px]"
        >
          <div role="img" aria-label={`Bar chart of items expiring per week${peak?.n ? `, peaking at ${peak.n} in the week of ${peak.label}` : ""}`} className="min-w-[540px]">
            <div className="relative grid h-[190px] items-end gap-2 border-b border-line-strong" style={{ gridTemplateColumns: "repeat(13, minmax(36px, 1fr))" }}>
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <div key={f} aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line-row" style={{ bottom: `${f * 150}px` }} />
              ))}
              {d.weeks.map((w) => (
                <div key={w.label} className="group relative flex h-full flex-col items-center justify-end gap-1">
                  <span className="num text-xs text-ink-soft">{w.n}</span>
                  <div className="w-[70%] rounded-t-[3px] bg-chart transition-opacity group-hover:opacity-80" style={{ height: Math.max(2, (w.n / max) * 150) }} />
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-sm bg-nav-bg px-2 py-1 text-xs text-white group-hover:block">
                    Week of {w.label}: {w.n} {w.n === 1 ? "item" : "items"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: "repeat(13, minmax(36px, 1fr))" }}>
              {d.weeks.map((w) => <span key={w.label} className="text-center text-2xs text-ink-muted">{w.label}</span>)}
            </div>
          </div>
        </Card>

        <Card title="Recent activity" subtitle="From the audit log" bodyClass="px-[18px] pb-2 pt-1.5">
          <ul>
            {d.activity.map((a, i) => (
              <li key={i} className="flex gap-2.5 border-b border-line-row py-2.5 last:border-b-0">
                <Avatar name={a.name} size={28} system={a.system} />
                <div className="min-w-0">
                  <div className="text-sm">{a.text}</div>
                  <div className="text-xs text-ink-muted">{a.time}</div>
                </div>
              </li>
            ))}
            {d.activity.length === 0 && <li className="py-6 text-center text-sm text-ink-muted">No activity yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
