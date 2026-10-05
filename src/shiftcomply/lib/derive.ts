import { daysUntil, TODAY, toISO } from "./dates";
import type { DocumentItem, Employee, Room } from "./mock-data";

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
  title: string;
  detail: string;
  employeeId: string;
  action: string;
  href: string;
  days: number;
}

export function buildAlerts(employees: Employee[], rooms: Room[], docs: DocumentItem[]): Alert[] {
  const alerts: Alert[] = [];

  for (const room of rooms) {
    const { status, occupant } = roomStatus(room, employees);
    if (status === "overdue" && occupant) {
      const d = Math.abs(daysUntil(occupant.checkout ?? occupant.contract.end) ?? 0);
      alerts.push({
        id: `r-${room.id}`,
        severity: "critical",
        kind: "overdue-room",
        title: `Room ${room.id} checkout overdue by ${d} days`,
        detail: `${occupant.name}, ${occupant.role}, contract ended, no extension on file`,
        employeeId: occupant.id,
        action: "Resolve",
        href: `/shiftcomply-demo/housing?room=${room.id}`,
        days: -d,
      });
    }
  }

  for (const e of employees) {
    const s = contractStatus(e);
    if (s === "expiring") {
      const d = daysUntil(e.contract.end)!;
      alerts.push({
        id: `c-${e.id}`,
        severity: d <= 10 ? "critical" : "warning",
        kind: "contract-expiring",
        title: `Contract ends in ${d} days — ${e.name}`,
        detail: `${e.role}${e.roomId ? `, Room ${e.roomId}` : ""}, ${e.contract.renewal === "pending" ? "Renewal requested" : "Renewal not started"}`,
        employeeId: e.id,
        action: "Renew",
        href: `/shiftcomply-demo/staff/${e.id}`,
        days: d,
      });
    }
    if (s === "unsigned") {
      alerts.push({
        id: `s-${e.id}`,
        severity: "warning",
        kind: "signature",
        title: `Contract awaiting signature — ${e.name}`,
        detail: `${e.role}, starts ${e.contract.start.split("-").reverse().join("/")}`,
        employeeId: e.id,
        action: "Review",
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
      alerts.push({
        id: `d-${d.id}`,
        severity: st === "expiring" ? "warning" : "critical",
        kind: "document",
        title: `${d.type} ${st === "missing" ? "missing" : st === "expired" ? "expired" : "expiring"} — ${e.name}`,
        detail:
          st === "missing"
            ? `${e.role}, required before ${contractStatus(e) === "upcoming" ? "start date" : "next inspection"}`
            : `${e.role}, expires ${d.expires?.split("-").reverse().join("/")}`,
        employeeId: e.id,
        action: "Upload",
        href: `/shiftcomply-demo/staff/${e.id}?tab=documents`,
        days: daysUntil(d.expires) ?? 0,
      });
    }
  }

  const rank = { critical: 0, warning: 1, info: 2 } as const;
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity] || a.days - b.days);
}
