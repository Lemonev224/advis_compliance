"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, PageHeader, Segmented } from "@/shiftcomply/components/ui";
import { useStore } from "@/shiftcomply/lib/store";
import { contractStatus } from "@/shiftcomply/lib/derive";
import { addMonths, fmt, parse, TODAY, toISO } from "@/shiftcomply/lib/dates";

// Read-only season view: who is under contract, who is housed, and where the two do not line up.

const MONTHS_SHOWN = 8;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MS_DAY = 86_400_000;

type View = "all" | "housed";

const monthLabel = (iso: string) => `${MONTH_NAMES[parse(iso).getMonth()]} ${parse(iso).getFullYear()}`;

export default function TimelinePage() {
  const { employees } = useStore();
  const [windowStart, setWindowStart] = useState(() => addMonths(`${toISO(TODAY).slice(0, 7)}-01`, -1));
  const [view, setView] = useState<View>("all");

  const windowEnd = addMonths(windowStart, MONTHS_SHOWN);
  const total = (parse(windowEnd).getTime() - parse(windowStart).getTime()) / MS_DAY;
  const pos = (iso: string) => {
    const d = (parse(iso).getTime() - parse(windowStart).getTime()) / MS_DAY;
    return Math.max(0, Math.min(100, (d / total) * 100));
  };

  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) => addMonths(windowStart, i));
  const today = toISO(TODAY);

  const rows = useMemo(
    () =>
      employees
        .filter((e) => view === "all" || e.roomId)
        .filter((e) => (e.contract.end ?? "9999") >= windowStart && e.contract.start < windowEnd)
        .sort((a, b) => (a.contract.end ?? "9999").localeCompare(b.contract.end ?? "9999")),
    [employees, view, windowStart, windowEnd],
  );

  return (
    <>
      <PageHeader
        title="Timeline"
        description="Contracts and room stays across the season. Gaps between the two are where compliance risk sits."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setWindowStart(addMonths(windowStart, -1))} aria-label="Earlier">
              <ChevronLeft size={16} />
            </Button>
            <span className="min-w-[150px] text-center text-[13px] font-medium">
              {monthLabel(windowStart)} to {monthLabel(addMonths(windowEnd, -1))}
            </span>
            <Button size="sm" onClick={() => setWindowStart(addMonths(windowStart, 1))} aria-label="Later">
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={view}
          onChange={setView}
          items={[
            { value: "all", label: "Everyone" },
            { value: "housed", label: "Housed on site" },
          ]}
        />
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm bg-primary/80" />
            Contract
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-sm bg-[#8a94a6]" />
            Room stay
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-sm bg-danger" />
            Housed without a contract
          </span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Month header */}
            <div className="flex border-b border-line bg-sunken">
              <div className="w-60 shrink-0 px-4 py-2.5 text-[12px] font-medium text-muted">Employee</div>
              <div className="relative flex flex-1">
                {months.map((m) => (
                  <div key={m} className="flex-1 border-l border-line px-2 py-2.5 text-[12px] font-medium text-muted">
                    {MONTH_NAMES[parse(m).getMonth()]} {m.slice(2, 4)}
                  </div>
                ))}
              </div>
            </div>

            {rows.map((e) => {
              const cStart = e.contract.start;
              const cEnd = e.contract.end ?? windowEnd;
              const left = pos(cStart);
              const width = pos(cEnd) - left;

              // Room stay: from contract start (or window start) to checkout, or until today when still housed past it.
              const status = contractStatus(e);
              const stayEnd = e.roomId ? (e.checkout && e.checkout > today ? e.checkout : today) : null;
              const stayStart = cStart;
              const overdueFrom = e.roomId && e.contract.end && e.contract.end < today ? e.contract.end : null;

              return (
                <div key={e.id} className="flex border-b border-line last:border-0 hover:bg-sunken/60">
                  <div className="w-60 shrink-0 px-4 py-2.5">
                    <Link href={`/shiftcomply-demo/staff/${e.id}`} className="block truncate text-[13px] font-medium text-ink hover:text-primary">
                      {e.name}
                    </Link>
                    <div className="truncate text-[12px] text-muted">
                      {e.role}
                      {e.roomId ? `, room ${e.roomId}` : ""}
                    </div>
                  </div>
                  <div className="relative flex-1">
                    {/* month grid */}
                    <div className="absolute inset-0 flex">
                      {months.map((m) => (
                        <div key={m} className="flex-1 border-l border-line/70" />
                      ))}
                    </div>
                    {/* today */}
                    <div className="absolute top-0 bottom-0 w-px bg-primary" style={{ left: `${pos(today)}%` }} />

                    {/* contract bar */}
                    {width > 0 && (
                      <div
                        className={`absolute top-3 h-2.5 rounded-sm ${status === "unsigned" ? "border border-dashed border-primary bg-primary-soft" : "bg-primary/80"}`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`Contract ${fmt(e.contract.start)} to ${e.contract.end ? fmt(e.contract.end) : "no end date"}`}
                      />
                    )}

                    {/* room stay bar */}
                    {stayEnd && (
                      <div
                        className="absolute top-7 h-1.5 rounded-sm bg-[#8a94a6]"
                        style={{ left: `${pos(stayStart)}%`, width: `${pos(overdueFrom ?? stayEnd) - pos(stayStart)}%` }}
                        title={`Room ${e.roomId}, checkout ${fmt(e.checkout)}`}
                      />
                    )}
                    {overdueFrom && (
                      <div
                        className="absolute top-7 h-1.5 rounded-sm bg-danger"
                        style={{ left: `${pos(overdueFrom)}%`, width: `${pos(today) - pos(overdueFrom)}%` }}
                        title={`In room ${e.roomId} since the contract ended on ${fmt(overdueFrom)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-muted">Nobody in this period.</p>}
          </div>
        </div>
      </Card>
      <p className="mt-3 text-[12px] text-muted">
        The blue line is today. Dashed bars are contracts not yet signed.
      </p>
    </>
  );
}
