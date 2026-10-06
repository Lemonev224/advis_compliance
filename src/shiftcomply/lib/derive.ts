import { daysUntil, TODAY, toISO } from "./dates";
import type { DocumentItem, Employee, Room } from "./mock-data";
import type { TFunction } from "./i18n";

// Status labels below are English; show them through t() from useI18n().

export const EXPIRING_WINDOW = 30;
export const CHECKOUT_WINDOW = 7;

export type ContractStatus = "active" | "expiring" | "expired" | "upcoming" | "unsigned" | "permanent";
export type RoomStatus = "vacant" | "occupied" | "checkout-soon" | "overdue";
export type DocStatus = "valid" | "expiring" | "expired" | "missing";

export function contractStatus(e: Employee): ContractStatus {
  const c = e.contract;
  if (!c.signed) return "unsigned";
  if (c.start > toISO(TODAY)) return "upcoming";
  if (!c.end) return "permanent";
  const d = daysUntil(c.end)!;
  if (d < 0) return "expired";
  if (d <= EXPIRING_WINDOW) return "expiring";
  return "active";
}

export const contractStatusLabel: Record<ContractStatus, string> = {
  active: "Active",
  expiring: "Expiring",
  expired: "Expired",
  upcoming: "Starts soon",
  unsigned: "Awaiting signature",
  permanent: "Indefinite",
};

export function isUnderContract(e: Employee) {
  const s = contractStatus(e);
  return s === "active" || s === "expiring" || s === "permanent";
}

export function roomStatus(room: Room, employees: Employee[]): { status: RoomStatus; occupant: Employee | null } {
  const occupant = employees.find((e) => e.roomId === room.id) ?? null;
  if (!occupant) return { status: "vacant", occupant: null };
  const contractDays = daysUntil(occupant.contract.end);
  const checkoutDays = daysUntil(occupant.checkout);
  if ((contractDays !== null && contractDays < 0) || (checkoutDays !== null && checkoutDays < 0)) {
    return { status: "overdue", occupant };
  }
  if (checkoutDays !== null && checkoutDays <= CHECKOUT_WINDOW) return { status: "checkout-soon", occupant };
  return { status: "occupied", occupant };
}

export const roomStatusLabel: Record<RoomStatus, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  "checkout-soon": "Checkout this week",
  overdue: "Overdue",
};

export function docStatus(d: DocumentItem): DocStatus {
  if (!d.fileName) return "missing";
  const days = daysUntil(d.expires);
  if (days === null) return "valid";
  if (days < 0) return "expired";
  if (days <= EXPIRING_WINDOW) return "expiring";
  return "valid";
}

export const docStatusLabel: Record<DocStatus, string> = {
  valid: "Valid",
  expiring: "Expiring",
  expired: "Expired",
  missing: "Missing",
};

/** Andorran labour law checks used for the contract compliance column. */
export function complianceChecks(e: Employee) {
  const c = e.contract;
  const months = c.end ? monthDiff(c.start, c.end) : 0;
  return [
    { label: "Written contract in Catalan", ok: c.language === "Catalan" },
    { label: "Signed by both parties", ok: c.signed },
    { label: "Within statutory maximum duration", ok: c.type !== "Seasonal" || months <= 12 },
    { label: "Weekly hours declared", ok: c.hoursPerWeek > 0 },
  ];
}

function monthDiff(a: string, b: string) {
  const [y1, m1] = a.split("-").map(Number);
  const [y2, m2] = b.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  kind: "overdue-room" | "contract-expiring" | "contract-expired" | "document" | "signature" | "checkout";
  /** The issue followed by the employee's name, when there is one. */
  title: string;
  /** The issue on its own, for tables that show the name in its own column. */
  issue: string;
  detail: string;
  employeeId: string;
  action: string;
  href: string;
  days: number;
}

const ddmmyyyy = (iso: string | null | undefined) => iso?.split("-").reverse().join("/") ?? "";

export function buildAlerts(employees: Employee[], rooms: Room[], docs: DocumentItem[], t: TFunction): Alert[] {
  const alerts: Alert[] = [];
  const withName = (issue: string, name: string) => `${issue} — ${name}`;

  for (const room of rooms) {
    const { status, occupant } = roomStatus(room, employees);
    if (status === "overdue" && occupant) {
      const d = Math.abs(daysUntil(occupant.checkout ?? occupant.contract.end) ?? 0);
      const issue = t("Room {room} checkout overdue by {n} days", { room: room.id, n: d });
      alerts.push({
        id: `r-${room.id}`,
        severity: "critical",
        kind: "overdue-room",
        title: issue,
        issue,
        detail: t("{name}, {role}, contract ended, no extension on file", { name: occupant.name, role: t(occupant.role) }),
        employeeId: occupant.id,
        action: t("Resolve"),
        href: `/shiftcomply-demo/housing?room=${room.id}`,
        days: -d,
      });
    }
  }

  for (const e of employees) {
    const s = contractStatus(e);
    if (s === "expiring") {
      const d = daysUntil(e.contract.end)!;
      const issue = d === 1 ? t("Contract ends in 1 day") : t("Contract ends in {n} days", { n: d });
      alerts.push({
        id: `c-${e.id}`,
        severity: d <= 10 ? "critical" : "warning",
        kind: "contract-expiring",
        title: withName(issue, e.name),
        issue,
        detail: [
          t(e.role),
          e.roomId ? t("Room {room}", { room: e.roomId }) : null,
          e.contract.renewal === "pending" ? t("Renewal requested") : t("Renewal not started"),
        ]
          .filter(Boolean)
          .join(", "),
        employeeId: e.id,
        action: t("Renew"),
        href: `/shiftcomply-demo/staff/${e.id}`,
        days: d,
      });
    }
    if (s === "unsigned") {
      const issue = t("Contract awaiting signature");
      alerts.push({
        id: `s-${e.id}`,
        severity: "warning",
        kind: "signature",
        title: withName(issue, e.name),
        issue,
        detail: t("{role}, starts {date}", { role: t(e.role), date: ddmmyyyy(e.contract.start) }),
        employeeId: e.id,
        action: t("Review"),
        href: `/shiftcomply-demo/staff/${e.id}`,
        days: daysUntil(e.contract.start) ?? 0,
      });
    }
  }

  for (const d of docs) {
    const st = docStatus(d);
    const e = employees.find((x) => x.id === d.employeeId);
    if (!e || d.type === "Employment contract" || d.type === "Housing agreement") continue;
    if (st === "missing" || st === "expired" || st === "expiring") {
      const issue = t(st === "missing" ? "{doc} missing" : st === "expired" ? "{doc} expired" : "{doc} expiring", {
        doc: t(d.type),
      });
      alerts.push({
        id: `d-${d.id}`,
        severity: st === "expiring" ? "warning" : "critical",
        kind: "document",
        title: withName(issue, e.name),
        issue,
        detail:
          st === "missing"
            ? contractStatus(e) === "upcoming"
              ? t("{role}, required before the start date", { role: t(e.role) })
              : t("{role}, required before the next inspection", { role: t(e.role) })
            : t("{role}, expires {date}", { role: t(e.role), date: ddmmyyyy(d.expires) }),
        employeeId: e.id,
        action: t("Upload"),
        href: `/shiftcomply-demo/staff/${e.id}?tab=documents`,
        days: daysUntil(d.expires) ?? 0,
      });
    }
  }

  const rank = { critical: 0, warning: 1, info: 2 } as const;
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity] || a.days - b.days);
}
