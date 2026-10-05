// "Today" at noon, so day differences are not affected by time zones.
export const TODAY = (() => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
})();

const MS_DAY = 86_400_000;

export function parse(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.round((parse(iso).getTime() - TODAY.getTime()) / MS_DAY);
}

export function addDays(iso: string, days: number): string {
  const d = parse(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function addMonths(iso: string, months: number): string {
  const d = parse(iso);
  d.setMonth(d.getMonth() + months);
  return toISO(d);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function fmt(iso: string | null | undefined, withYear = true): string {
  if (!iso) return "—";
  const d = parse(iso);
  return withYear
    ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function relative(iso: string | null | undefined): string {
  const n = daysUntil(iso);
  if (n === null) return "No end date";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n > 0) return `In ${n} days`;
  return `${Math.abs(n)} days ago`;
}

export function monthsBetween(a: string, b: string): number {
  const d1 = parse(a);
  const d2 = parse(b);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()) + (d2.getDate() >= d1.getDate() ? 0 : -1);
}
