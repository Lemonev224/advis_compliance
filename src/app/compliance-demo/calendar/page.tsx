"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarPlus, Rss, FileText, FileBadge, IdCard } from "lucide-react";
import { PageHeader, Segmented, cx } from "@/compliance/components/ui";
import { calendarEvents, type EventType } from "@/compliance/lib/data";
import { SoonButton } from "@/compliance/components/Toast";
import { useShellUser } from "@/compliance/components/shell/UserContext";

const evStyle: Record<EventType, { chip: string; dot: string; label: string; Icon: typeof FileText }> = {
  contract: { chip: "bg-ev-contract text-ev-contractFg", dot: "bg-ev-contractDot", label: "Contract", Icon: FileText },
  document: { chip: "bg-ev-document text-ev-documentFg", dot: "bg-ev-documentDot", label: "Document", Icon: FileBadge },
  permit: { chip: "bg-ev-permit text-ev-permitFg", dot: "bg-ev-permitDot", label: "Permit", Icon: IdCard },
};

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY = 8;

export default function CalendarPage() {
  const { live } = useShellUser();
  const [sel, setSel] = useState(12);
  const [types, setTypes] = useState<Record<EventType, boolean>>({ contract: true, document: true, permit: true });
  const [mode, setMode] = useState("month");

  const cells = [
    ...[28, 29, 30].map((n) => ({ n, muted: true })),
    ...Array.from({ length: 31 }, (_, i) => ({ n: i + 1, muted: false })),
    { n: 1, muted: true },
  ];
  const evFor = (n: number) => (calendarEvents[n] ?? []).filter((e) => types[e.type]);
  const selEvents = evFor(sel);
  const upcoming = Object.entries(calendarEvents).flatMap(([d, es]) => es.map((e) => ({ ...e, d: +d }))).filter((e) => e.d >= TODAY && types[e.type]);

  return (
    <>
      <PageHeader
        section="Compliance"
        title="Calendar"
        description="Every contract end, permit deadline and document expiry in one place"
        actions={<>
          <SoonButton feature="integrations" className="btn-secondary"><Rss className="size-4" aria-hidden />Subscribe (iCal)</SoonButton>
          <SoonButton feature="calendar" className="btn-primary"><CalendarPlus className="size-4" aria-hidden />Add deadline</SoonButton>
        </>}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <section aria-labelledby="month-title" className="card min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <SoonButton feature="calendar" aria-label="Previous month" className="btn-secondary btn-dense w-9 px-0"><ChevronLeft className="size-4" aria-hidden /></SoonButton>
            <h2 id="month-title" className="min-w-[120px] text-center text-[16px] font-semibold">October 2026</h2>
            <SoonButton feature="calendar" aria-label="Next month" className="btn-secondary btn-dense w-9 px-0"><ChevronRight className="size-4" aria-hidden /></SoonButton>
            <button className="btn-secondary btn-dense font-normal" onClick={() => setSel(TODAY)}>Today</button>
            <Segmented label="Range" active={mode} onSelect={setMode} items={[{ id: "month", label: "Month" }, { id: "week", label: "Week" }, { id: "list", label: "List" }]} />
            <div className="ml-auto flex flex-wrap gap-1.5">
              {(Object.keys(evStyle) as EventType[]).map((t) => (
                <button key={t} aria-pressed={types[t]} onClick={() => setTypes((s) => ({ ...s, [t]: !s[t] }))}
                  className={cx("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-opacity", types[t] ? "border-line-input text-ink-soft" : "border-dashed border-line-input text-ink-muted opacity-60")}>
                  <span className={cx("size-2.5 rounded-xs", evStyle[t].dot)} />{evStyle[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto scroll-thin">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 border-b border-line bg-surface-subtle">
                {DOW.map((d, i) => <div key={d} className={cx("px-2.5 py-2 text-xs font-medium", i > 4 ? "text-ink-muted" : "text-ink-soft")}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((c, idx) => {
                  const ev = c.muted ? [] : evFor(c.n);
                  const isSel = !c.muted && c.n === sel;
                  const today = !c.muted && c.n === TODAY;
                  const weekend = idx % 7 >= 5;
                  return (
                    <button
                      key={idx}
                      onClick={() => !c.muted && setSel(c.n)}
                      aria-label={c.muted ? undefined : `${c.n} October${ev.length ? `, ${ev.length} due` : ""}`}
                      aria-pressed={isSel}
                      className={cx(
                        "flex min-h-[108px] flex-col items-stretch gap-1 border-b border-r border-line-row px-2 py-1.5 text-left transition-colors nth-[7n]:border-r-0",
                        isSel ? "bg-accent-tint shadow-[inset_0_0_0_1.5px_#0E6F78]" : c.muted ? "bg-[#FAFBFC] cursor-default" : weekend ? "bg-surface-subtle/60 hover:bg-surface-subtle" : "bg-surface hover:bg-surface-subtle",
                      )}
                    >
                      {today
                        ? <span className="inline-flex size-6 items-center justify-center self-start rounded-full bg-accent text-xs font-semibold text-white">{c.n}</span>
                        : <span className={cx("px-0.5 py-1 text-xs font-medium", c.muted ? "text-nav-label" : "text-ink")}>{c.n}</span>}
                      {ev.map((e, i) => (
                        <span key={i} className={cx("block truncate rounded-[3px] px-1.5 py-0.5 text-2xs font-medium", evStyle[e.type].chip)}>{e.short}</span>
                      ))}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <aside aria-labelledby="day-title" className="card">
            <div className="border-b border-line px-[18px] py-3.5">
              <h2 id="day-title" className="card-title">{sel} October 2026</h2>
              <div className="card-sub">{selEvents.length === 1 ? "1 item due" : `${selEvents.length} items due`}</div>
            </div>
            {selEvents.length === 0 ? (
              <div className="px-[18px] py-6 text-sm text-ink-muted">Nothing due on this day.</div>
            ) : (
              <ul className="px-[18px] pb-3.5 pt-1.5">
                {selEvents.map((e, i) => {
                  const S = evStyle[e.type];
                  return (
                    <li key={i} className="flex gap-3 border-b border-line-row py-3 last:border-0">
                      <span className={cx("inline-flex size-8 flex-none items-center justify-center rounded-ctl", S.chip)}><S.Icon className="size-4" aria-hidden /></span>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs font-medium text-ink-soft">{S.label}</span>
                        <span className="font-medium">{e.title}</span>
                        <span className="text-sm text-ink-muted">{e.who}</span>
                        <Link href={live ? "/compliance-demo/workers" : "/compliance-demo/workers/rui-carvalho"} className="mt-1 text-sm font-medium">Open worker →</Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="card">
            <div className="card-head"><div><h2 className="card-title">Coming up</h2><div className="card-sub">Rest of October</div></div></div>
            <ul className="px-[18px] py-1.5">
              {upcoming.map((e, i) => (
                <li key={i}>
                  <button onClick={() => setSel(e.d)} className="flex w-full items-center gap-3 border-b border-line-row py-2.5 text-left last:border-0 hover:text-accent">
                    <span className="num w-14 flex-none whitespace-nowrap text-xs text-ink-soft">{e.d} Oct</span>
                    <span className={cx("size-2 flex-none rounded-full", evStyle[e.type].dot)} />
                    <span className="min-w-0 flex-1 truncate text-sm">{e.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
