"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Badge, Button, Card, cx, Progress, type Tone } from "@/shiftcomply/components/ui";
import { AddEmployeeModal, AddRoomModal, AssignRoomModal, RenewContractModal, UploadDocumentModal } from "@/shiftcomply/components/actions";
import { useStore } from "@/shiftcomply/lib/store";
import { SetupChecklist } from "@/shiftcomply/components/setup-checklist";
import { buildAlerts, contractStatus, docStatus, isUnderContract, roomStatus, type Alert } from "@/shiftcomply/lib/derive";
import { daysUntil, parse, TODAY } from "@/shiftcomply/lib/dates";
import { useI18n } from "@/shiftcomply/lib/i18n";
import type { ContractType } from "@/shiftcomply/lib/mock-data";

const ISSUE_BADGE: Record<Alert["kind"], { label: string; tone: Tone }> = {
  "overdue-room": { label: "Overdue", tone: "danger" },
  "contract-expired": { label: "Expired", tone: "danger" },
  "contract-expiring": { label: "Expiring", tone: "warning" },
  document: { label: "Document", tone: "warning" },
  signature: { label: "Signature", tone: "info" },
  checkout: { label: "Housing", tone: "info" },
};

function Kpi({ label, value, caption, href }: { label: string; value: number; caption: string; href: string }) {
  return (
    <Link href={href} className="block rounded border border-line bg-surface px-[18px] py-4 transition-colors hover:border-primary/50">
      <div className="text-[13px] text-muted">{label}</div>
      <div className="mt-1.5 text-[30px] leading-tight font-semibold tracking-[-0.02em] tabular">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-[#6b7587]">{caption}</div>
    </Link>
  );
}

function Section({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3 border-b border-line px-[18px] py-3.5">
        <span className="text-[15px] font-semibold">{title}</span>
        {aside && <span className="text-[13px]">{aside}</span>}
      </div>
      {children}
    </Card>
  );
}

const GRID = "grid grid-cols-[1.3fr_0.9fr_1.6fr_96px] gap-3";

export default function DashboardPage() {
  const { employees, rooms, documents, hotel, canEdit } = useStore();
  const { t, longDate, monthShort } = useI18n();
  const [modal, setModal] = useState<null | "employee" | "room" | "doc" | "add-room">(null);
  const [renewId, setRenewId] = useState<string | null>(null);

  const m = useMemo(() => {
    const active = employees.filter(isUnderContract);
    const byType = (t: ContractType) => active.filter((e) => e.contract.type === t).length;
    const typeSummary = (["Seasonal", "Indefinite", "Fixed-term", "Part-time"] as const)
      .map((t) => [t, byType(t)] as const)
      .filter(([, n]) => n > 0)
      .map(([type, n]) => t(`{n} ${type.toLowerCase()}`, { n }))
      .join(" · ");
    const expiring = employees.filter((e) => contractStatus(e) === "expiring");
    const undecided = expiring.filter((e) => e.contract.renewal !== "pending").length;
    const overdue = rooms.filter((r) => roomStatus(r, employees).status === "overdue").length;
    const missingDocs = documents.filter((d) => {
      const st = docStatus(d);
      return d.required && (st === "missing" || st === "expired");
    }).length;
    return { active: active.length, typeSummary, expiring: expiring.length, undecided, overdue, missingDocs };
  }, [employees, rooms, documents, t]);

  const alerts = useMemo(() => buildAlerts(employees, rooms, documents, t), [employees, rooms, documents, t]);

  const occupancy = useMemo(() => {
    const map = new Map<string, { total: number; occupied: number }>();
    for (const r of rooms) {
      const key = r.building || "Staff rooms";
      const o = map.get(key) ?? { total: 0, occupied: 0 };
      o.total += 1;
      if (roomStatus(r, employees).status !== "vacant") o.occupied += 1;
      map.set(key, o);
    }
    return Array.from(map, ([building, o]) => ({ building, ...o })).sort((a, b) =>
      a.building.localeCompare(b.building, undefined, { numeric: true }),
    );
  }, [rooms, employees]);
  const occupiedTotal = occupancy.reduce((n, o) => n + o.occupied, 0);

  const endingSoon = useMemo(
    () =>
      employees
        .filter((e) => {
          const d = daysUntil(e.contract.end);
          return d !== null && d >= 0 && d <= 30;
        })
        .sort((a, b) => (a.contract.end! < b.contract.end! ? -1 : 1)),
    [employees],
  );

  const roomCell = (roomId: string | null) => {
    if (!roomId) return <span className="text-muted">—</span>;
    const r = rooms.find((x) => x.id === roomId);
    return (
      <div className="min-w-0">
        <div className="tabular">{roomId}</div>
        {r?.building && <div className="truncate text-[12px] text-[#6b7587]">{t(r.building)}</div>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.01em]">{t("Dashboard")}</h1>
          <p className="mt-1 text-[13px] text-muted">
            {longDate(TODAY)}
            {hotel?.name ? ` · ${hotel.name}` : ""}
            {hotel?.seasonLabel ? ` · ${t(hotel.seasonLabel)}` : ""}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2.5">
            <Button onClick={() => setModal("room")}>{t("Assign room")}</Button>
            <Button variant="primary" onClick={() => setModal("employee")}>
              {t("Add employee")}
            </Button>
          </div>
        )}
      </div>

      <SetupChecklist />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <Kpi
          label={t("Active contracts")}
          value={m.active}
          caption={m.typeSummary || t("of {n} employees", { n: employees.length })}
          href="/shiftcomply-demo/staff"
        />
        <Kpi
          label={t("Ending in 30 days")}
          value={m.expiring}
          caption={m.expiring ? t("{n} without renewal decision", { n: m.undecided }) : t("No contracts ending soon")}
          href="/shiftcomply-demo/staff?filter=expiring"
        />
        <Kpi
          label={t("Rooms overdue")}
          value={m.overdue}
          caption={t("Occupied after contract end")}
          href="/shiftcomply-demo/housing?filter=overdue"
        />
        <Kpi
          label={t("Missing documents")}
          value={m.missingDocs}
          caption={t("Permits and signed contracts")}
          href="/shiftcomply-demo/reminders"
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-start gap-4">
        <Section
          title={t("Requires attention")}
          aside={
            <Link href="/shiftcomply-demo/reminders" className="text-primary hover:underline">
              {t("View all")}
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className={cx(GRID, "border-b border-line bg-sunken px-[18px] py-[9px] text-[12px] font-medium text-[#6b7587]")}>
                <span>{t("Employee")}</span>
                <span>{t("Room")}</span>
                <span>{t("Issue")}</span>
                <span>{t("Status")}</span>
              </div>
              {alerts.slice(0, 7).map((a) => {
                const e = employees.find((x) => x.id === a.employeeId);
                const badge = ISSUE_BADGE[a.kind];
                return (
                  <Link
                    key={a.id}
                    href={a.href}
                    className={cx(GRID, "items-center border-b border-[#eef1f5] px-[18px] py-[11px] text-[13.5px] last:border-0 hover:bg-sunken")}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{e?.name ?? "—"}</div>
                      <div className="truncate text-[12px] text-[#6b7587]">{t(e?.department ?? e?.role ?? "")}</div>
                    </div>
                    {roomCell(e?.roomId ?? null)}
                    <span className="text-body">{e ? a.issue : a.title}</span>
                    <span>
                      <Badge tone={badge.tone}>{t(badge.label)}</Badge>
                    </span>
                  </Link>
                );
              })}
              {alerts.length === 0 && <p className="px-[18px] py-6 text-[13px] text-muted">{t("Nothing needs attention right now.")}</p>}
            </div>
          </div>
        </Section>

        <div className="flex flex-col gap-4">
          <Section
            title={t("Staff housing occupancy")}
            aside={
              <span className="text-muted tabular">
                {rooms.length ? t("{n} of {total} rooms", { n: occupiedTotal, total: rooms.length }) : ""}
              </span>
            }
          >
            <div className="flex flex-col gap-3.5 px-[18px] py-4">
              {occupancy.map((o) => (
                <Link key={o.building} href="/shiftcomply-demo/housing" className="block">
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span>{t(o.building)}</span>
                    <span className="text-muted tabular">{t("{n} / {total} rooms", { n: o.occupied, total: o.total })}</span>
                  </div>
                  <Progress value={o.occupied} max={o.total} />
                </Link>
              ))}
              {rooms.length === 0 && (
                <p className="text-[13px] text-muted">
                  {t("No rooms yet.")}{" "}
                  {canEdit && (
                    <button onClick={() => setModal("add-room")} className="font-medium text-primary hover:underline">
                      {t("Add a room")}
                    </button>
                  )}
                </p>
              )}
            </div>
          </Section>

          <Section title={t("Contracts ending · next 30 days")}>
            {endingSoon.map((e) => {
              const d = parse(e.contract.end!);
              return (
                <div key={e.id} className="flex items-center gap-3.5 border-b border-[#eef1f5] px-[18px] py-2.5 text-[13.5px] last:border-0">
                  <div className="w-11 flex-none text-center">
                    <div className="text-[11.5px] text-[#6b7587]">{monthShort(d.getMonth())}</div>
                    <div className="text-[18px] leading-tight font-semibold tabular">{String(d.getDate()).padStart(2, "0")}</div>
                  </div>
                  <Link href={`/shiftcomply-demo/staff/${e.id}`} className="min-w-0 flex-1 hover:text-primary">
                    <div className="truncate font-medium">{e.name}</div>
                    <div className="truncate text-[12px] text-[#6b7587]">
                      {t(e.department)} · {t(e.contract.type)}
                    </div>
                  </Link>
                  {canEdit && (
                    <button onClick={() => setRenewId(e.id)} className="text-[13px] text-primary hover:underline">
                      {t("Renew")}
                    </button>
                  )}
                </div>
              );
            })}
            {endingSoon.length === 0 && <p className="px-[18px] py-6 text-[13px] text-muted">{t("No contracts ending soon.")}</p>}
          </Section>
        </div>
      </div>

      {modal === "employee" && <AddEmployeeModal open onClose={() => setModal(null)} />}
      {modal === "room" && <AssignRoomModal open onClose={() => setModal(null)} onAddRoom={() => setModal("add-room")} />}
      {modal === "add-room" && <AddRoomModal open onClose={() => setModal(null)} />}
      {modal === "doc" && <UploadDocumentModal open onClose={() => setModal(null)} />}
      {renewId && <RenewContractModal open employeeId={renewId} onClose={() => setRenewId(null)} />}
    </div>
  );
}
