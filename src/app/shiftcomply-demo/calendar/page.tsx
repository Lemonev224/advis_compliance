"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, cx, PageHeader } from "@/shiftcomply/components/ui";
import { useStore } from "@/shiftcomply/lib/store";
import { TODAY, toISO } from "@/shiftcomply/lib/dates";
import { useI18n } from "@/shiftcomply/lib/i18n";

type Kind = "contract-end" | "checkout" | "start";

interface CalEvent {
  date: string;
  kind: Kind;
  employeeId: string;
  name: string;
  room?: string;
}

const KIND_STYLE: Record<Kind, string> = {
  "contract-end": "bg-warning-soft text-warning",
  checkout: "bg-primary-soft text-primary",
  start: "bg-success-soft text-success",
};

const KIND_LABEL: Record<Kind, string> = {
  "contract-end": "Contract ends",
  checkout: "Room checkout",
  start: "Contract starts",
};

export default function CalendarPage() {
  const { employees } = useStore();
  const { t, fmt, monthYear, weekdaysShort } = useI18n();
  const [year, setYear] = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth());
  const [selected, setSelected] = useState(toISO(TODAY));

  const events = useMemo(() => {
    const list: CalEvent[] = [];
    for (const e of employees) {
      if (e.contract.end) list.push({ date: e.contract.end, kind: "contract-end", employeeId: e.id, name: e.name });
      if (e.roomId && e.checkout) list.push({ date: e.checkout, kind: "checkout", employeeId: e.id, name: e.name, room: e.roomId });
      if (e.contract.start > toISO(TODAY)) list.push({ date: e.contract.start, kind: "start", employeeId: e.id, name: e.name });
    }
    return list;
  }, [employees]);

  const byDate = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const ev of events) m.set(ev.date, [...(m.get(ev.date) ?? []), ev]);
    return m;
  }, [events]);

  // Build a Monday-first grid for the month
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(year, month, i + 1, 12))),
  ];
  while (cells.length % 7) cells.push(null);

  const shift = (n: number) => {
    const d = new Date(year, month + n, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const todayISO = toISO(TODAY);
  const dayEvents = byDate.get(selected) ?? [];

  return (
    <>
      <PageHeader title={t("Calendar")} description={t("Contract start and end dates, and room checkouts")} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => shift(-1)} aria-label={t("Previous month")}>
                <ChevronLeft size={16} />
              </Button>
              <Button size="sm" onClick={() => shift(1)} aria-label={t("Next month")}>
                <ChevronRight size={16} />
              </Button>
              <span className="ml-2 text-[15px] font-semibold">
                {monthYear(month, year)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <span key={k} className={cx("rounded px-2 py-0.5 text-[12px] font-medium", KIND_STYLE[k])}>
                  {t(KIND_LABEL[k])}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-line bg-sunken">
            {weekdaysShort.map((d) => (
              <div key={d} className="px-2 py-2 text-[12px] font-medium text-muted">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((iso, i) => {
              const evs = iso ? byDate.get(iso) ?? [] : [];
              return (
                <button
                  key={i}
                  disabled={!iso}
                  onClick={() => iso && setSelected(iso)}
                  className={cx(
                    "min-h-[104px] border-r border-b border-line p-1.5 text-left align-top [&:nth-child(7n)]:border-r-0",
                    !iso && "bg-sunken/50",
                    iso === selected && "bg-primary-soft/50",
                  )}
                >
                  {iso && (
                    <>
                      <span
                        className={cx(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] tabular",
                          iso === todayISO ? "bg-primary font-semibold text-white" : "text-body",
                        )}
                      >
                        {Number(iso.slice(8))}
                      </span>
                      <div className="mt-1 space-y-1">
                        {evs.slice(0, 3).map((ev, j) => (
                          <div key={j} className={cx("truncate rounded px-1.5 py-0.5 text-[11px] font-medium", KIND_STYLE[ev.kind])}>
                            {ev.name}
                          </div>
                        ))}
                        {evs.length > 3 && <div className="px-1.5 text-[11px] text-muted">{t("{n} more", { n: evs.length - 3 })}</div>}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="h-fit">
          <div className="border-b border-line px-5 py-3">
            <div className="text-[15px] font-semibold">{fmt(selected)}</div>
            <div className="text-[13px] text-muted">
              {dayEvents.length === 0
                ? t("Nothing scheduled")
                : dayEvents.length === 1
                  ? t("1 event")
                  : t("{n} events", { n: dayEvents.length })}
            </div>
          </div>
          <ul>
            {dayEvents.map((ev, i) => (
              <li key={i} className="border-b border-line px-5 py-3 last:border-0">
                <div className="text-[12px] text-muted">{t(KIND_LABEL[ev.kind])}</div>
                <Link href={`/shiftcomply-demo/staff/${ev.employeeId}`} className="text-[14px] font-medium text-ink hover:text-primary">
                  {ev.room ? `${ev.name}, ${t("room {room}", { room: ev.room })}` : ev.name}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
