"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, FileBadge, IdCard } from "lucide-react";
import { PageHeader, cx } from "@/compliance/components/ui";
import { type EventType } from "@/compliance/lib/data";
import { useDemo } from "@/compliance/components/DemoState";
import { useShellUser } from "@/compliance/components/shell/UserContext";
import { useT } from "@/compliance/components/I18nProvider";
import { WEEKDAYS_SHORT, dayMonth, dayMonthYear, dayShort, demoDate, demoToday, monthYear } from "@/compliance/lib/i18n";

const evStyle: Record<EventType, { chip: string; dot: string; label: string; Icon: typeof FileText }> = {
  contract: { chip: "bg-ev-contract text-ev-contractFg", dot: "bg-ev-contractDot", label: "Contract", Icon: FileText },
  document: { chip: "bg-ev-document text-ev-documentFg", dot: "bg-ev-documentDot", label: "Document", Icon: FileBadge },
  permit: { chip: "bg-ev-permit text-ev-permitFg", dot: "bg-ev-permitDot", label: "Permit", Icon: IdCard },
};

const DAY = 86_400_000;
const UPCOMING_DAYS = 30;

export default function CalendarPage() {
  const { live } = useShellUser();
  const { t, lang } = useT();
  const today = demoToday().getTime();
  const { calendarEvents } = useDemo().data;

  // Sample events were written for October 2026; demoDate() moves them to the same distance from today.
  const events = useMemo(
    () => Object.entries(calendarEvents)
      .flatMap(([d, list]) => list.map((e) => ({ ...e, day: demoDate(2026, 9, Number(d)).getTime() })))
      .sort((a, b) => a.day - b.day),
    [calendarEvents],
  );

  const firstUpcoming = events.find((e) => e.day >= today)?.day ?? today;
  const [sel, setSel] = useState(firstUpcoming);
  const [view, setView] = useState(() => { const d = new Date(today); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const [types, setTypes] = useState<Record<EventType, boolean>>({ contract: true, document: true, permit: true });

  const evOn = (day: number) => events.filter((e) => e.day === day && types[e.type]);
  const selEvents = evOn(sel);
  const upcoming = events.filter((e) => e.day >= today && e.day <= today + UPCOMING_DAYS * DAY && types[e.type]);

  // Monday-first grid covering the whole month.
  const first = Date.UTC(view.y, view.m, 1);
  const lead = (new Date(first).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cellCount = Math.ceil((lead + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, i) => first + (i - lead) * DAY);

  const moveMonth = (by: number) => setView((v) => { const d = new Date(Date.UTC(v.y, v.m + by, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const pick = (day: number) => {
    setSel(day);
    const d = new Date(day);
    if (d.getUTCMonth() !== view.m || d.getUTCFullYear() !== view.y) setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  return (
    <>
      <PageHeader
        section={t("Compliance")}
        title={t("Calendar")}
        description={t("Every contract end, permit deadline and document expiry in one place")}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <section aria-labelledby="month-title" className="card min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <button onClick={() => moveMonth(-1)} aria-label={t("Previous month")} className="btn-secondary btn-dense w-9 px-0"><ChevronLeft className="size-4" aria-hidden /></button>
            <h2 id="month-title" className="min-w-[150px] text-center text-[16px] font-semibold">{monthYear(lang, view.y, view.m)}</h2>
            <button onClick={() => moveMonth(1)} aria-label={t("Next month")} className="btn-secondary btn-dense w-9 px-0"><ChevronRight className="size-4" aria-hidden /></button>
            <button className="btn-secondary btn-dense font-normal" onClick={() => pick(today)}>{t("Today")}</button>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {(Object.keys(evStyle) as EventType[]).map((ty) => (
                <button key={ty} aria-pressed={types[ty]} onClick={() => setTypes((s) => ({ ...s, [ty]: !s[ty] }))}
                  className={cx("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-opacity", types[ty] ? "border-line-input text-ink-soft" : "border-dashed border-line-input text-ink-muted opacity-60")}>
                  <span className={cx("size-2.5 rounded-xs", evStyle[ty].dot)} />{t(evStyle[ty].label)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto scroll-thin">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 border-b border-line bg-surface-subtle">
                {WEEKDAYS_SHORT[lang].map((d, i) => <div key={d} className={cx("px-2.5 py-2 text-xs font-medium", i > 4 ? "text-ink-muted" : "text-ink-soft")}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  const date = new Date(day);
                  const muted = date.getUTCMonth() !== view.m;
                  const ev = evOn(day);
                  const isSel = day === sel;
                  const isToday = day === today;
                  const weekend = idx % 7 >= 5;
                  return (
                    <button
                      key={day}
                      onClick={() => pick(day)}
                      aria-label={ev.length ? t("{date}, {n} due", { date: dayMonth(lang, date), n: ev.length }) : dayMonth(lang, date)}
                      aria-pressed={isSel}
                      className={cx(
                        "flex min-h-[108px] flex-col items-stretch gap-1 border-b border-r border-line-row px-2 py-1.5 text-left transition-colors nth-[7n]:border-r-0",
                        isSel ? "bg-accent-tint shadow-[inset_0_0_0_1.5px_#0E6F78]" : muted ? "bg-[#FAFBFC] hover:bg-surface-subtle" : weekend ? "bg-surface-subtle/60 hover:bg-surface-subtle" : "bg-surface hover:bg-surface-subtle",
                      )}
                    >
                      {isToday
                        ? <span className="inline-flex size-6 items-center justify-center self-start rounded-full bg-accent text-xs font-semibold text-white">{date.getUTCDate()}</span>
                        : <span className={cx("px-0.5 py-1 text-xs font-medium", muted ? "text-nav-label" : "text-ink")}>{date.getUTCDate()}</span>}
                      {ev.map((e, i) => (
                        <span key={i} className={cx("block truncate rounded-[3px] px-1.5 py-0.5 text-2xs font-medium", evStyle[e.type].chip, muted && "opacity-60")}>{t(e.short)}</span>
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
              <h2 id="day-title" className="card-title">{dayMonthYear(lang, new Date(sel))}</h2>
              <div className="card-sub">{selEvents.length === 1 ? t("1 item due") : t("{n} items due", { n: selEvents.length })}</div>
            </div>
            {selEvents.length === 0 ? (
              <div className="px-[18px] py-6 text-sm text-ink-muted">{t("Nothing due on this day.")}</div>
            ) : (
              <ul className="px-[18px] pb-3.5 pt-1.5">
                {selEvents.map((e, i) => {
                  const S = evStyle[e.type];
                  return (
                    <li key={i} className="flex gap-3 border-b border-line-row py-3 last:border-0">
                      <span className={cx("inline-flex size-8 flex-none items-center justify-center rounded-ctl", S.chip)}><S.Icon className="size-4" aria-hidden /></span>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs font-medium text-ink-soft">{t(S.label)}</span>
                        <span className="font-medium">{t(e.title)}</span>
                        <span className="text-sm text-ink-muted">{t(e.who)}</span>
                        <Link href={live ? "/compliance-demo/workers" : "/compliance-demo/workers/rui-carvalho"} className="mt-1 text-sm font-medium">{t("Open worker →")}</Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="card">
            <div className="card-head"><div><h2 className="card-title">{t("Coming up")}</h2><div className="card-sub">{t("Next 30 days")}</div></div></div>
            <ul className="px-[18px] py-1.5">
              {upcoming.map((e, i) => (
                <li key={i}>
                  <button onClick={() => pick(e.day)} className="flex w-full items-center gap-3 border-b border-line-row py-2.5 text-left last:border-0 hover:text-accent">
                    <span className="num w-14 flex-none whitespace-nowrap text-xs text-ink-soft">{dayShort(lang, new Date(e.day))}</span>
                    <span className={cx("size-2 flex-none rounded-full", evStyle[e.type].dot)} />
                    <span className="min-w-0 flex-1 truncate text-sm">{t(e.title)}</span>
                  </button>
                </li>
              ))}
              {upcoming.length === 0 && <li className="py-4 text-sm text-ink-muted">{t("Nothing due in the next 30 days.")}</li>}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
