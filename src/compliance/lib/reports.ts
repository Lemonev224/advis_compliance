// Data for the demo's reports. Built from the same sample data as the rest of the demo (and the visitor's changes,
// e.g. renewed contracts), so the numbers agree with the dashboard. Dates are sample-data dates (as if today were
// 8 Oct 2026); the translate step moves them to the real date like everywhere else in the demo.
// Safe to import from server and client code.

import { demoData, PERMIT_KEY, type Renewals } from "./demo-state";
import { demoOffsetDays } from "./i18n";

export type ReportId = "compliance" | "expiries" | "access" | "subcontractors" | "permits" | "unconfirmed";

export const REPORTS: { id: ReportId; title: string; text: string }[] = [
  { id: "compliance", title: "Compliance over time", text: "Share of fully compliant workers per site, week by week." },
  { id: "expiries", title: "Upcoming expiries", text: "Every contract, permit and document ending in the next 90 days." },
  { id: "access", title: "Site access log", text: "Check-ins, blocks and overrides per site, with reasons." },
  { id: "subcontractors", title: "Subcontractor scorecard", text: "Missing and late documents by employer." },
  { id: "permits", title: "Permits and quota", text: "Applications by stage and time to Govern decision." },
  { id: "unconfirmed", title: "Unconfirmed dates", text: "Uploads whose dates were read automatically and still need a person to confirm." },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86_400_000;
const TODAY = Date.UTC(2026, 9, 8); // the sample data's "today"
const label = (ts: number, year = false) => {
  const d = new Date(ts);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${year ? ` ${d.getUTCFullYear()}` : ""}`;
};
const at = (month: number, day: number, year = 2026) => Date.UTC(year, month, day);

/* ---------------- Compliance over time ---------------- */

// 13 weeks ending the week of 5 Oct. The last value of each site is its current figure on the dashboard.
const WEEKS = Array.from({ length: 13 }, (_, i) => label(at(9, 5) - (12 - i) * 7 * DAY));
const SITE_HISTORY: Record<string, number[]> = {
  "Escaldes-Engordany": [86, 87, 87, 88, 89, 89, 90, 91, 91, 92, 92, 93, 93],
  "La Massana": [88, 88, 89, 90, 89, 90, 91, 91, 92, 91, 92, 92, 92],
  "Andorra la Vella": [82, 83, 83, 84, 84, 85, 86, 86, 85, 86, 86, 85, 85],
  Encamp: [84, 83, 82, 82, 81, 80, 80, 79, 78, 77, 77, 76, 75],
};

export function complianceReport(r: Renewals) {
  const d = demoData(r);
  const sites = d.siteCompliance.map((s) => {
    const history = [...SITE_HISTORY[s.name]];
    history[history.length - 1] = s.pct; // a renewal in this visit moves this week's figure
    return { name: s.name, detail: s.detail, values: history };
  });
  const group = WEEKS.map((_, i) => Math.round(sites.reduce((a, s) => a + s.values[i], 0) / sites.length));
  const weakest = [...sites].sort((a, b) => a.values[12] - b.values[12])[0];
  return { weeks: WEEKS, sites, group, weakest };
}

/* ---------------- Upcoming expiries ---------------- */

export type ExpiryType = "contract" | "document" | "permit";
export type Expiry = { date: number; type: ExpiryType; item: string; worker: string; company: string; site: string; blocks: boolean };

const EXPIRIES: Expiry[] = [
  // Next 30 days: 3 contracts, 3 documents, 1 permit (the dashboard's "Expiring in 30 days").
  { date: at(9, 12), type: "document", item: "Medical fitness check", worker: "Rui Carvalho", company: "Obras Lusitânia Lda", site: "La Massana", blocks: true },
  { date: at(9, 15), type: "document", item: "PRL safety certificate", worker: "Jordi Puig", company: "Grupo Heracles", site: "Andorra la Vella", blocks: true },
  { date: at(9, 20), type: "document", item: "Site induction refresh", worker: "12 workers", company: "Several employers", site: "Encamp", blocks: true },
  { date: at(9, 23), type: "contract", item: "Fixed-term contract", worker: "Joan Casals", company: "Grupo Heracles", site: "Encamp", blocks: true },
  { date: at(9, 30), type: "permit", item: "Residence and work permit renewal", worker: "Carlos Méndez", company: "Grupo Heracles", site: "Escaldes-Engordany", blocks: true },
  { date: at(9, 31), type: "contract", item: "Fixed-term contract", worker: "Jordi Puig", company: "Grupo Heracles", site: "Andorra la Vella", blocks: true },
  { date: at(10, 6), type: "contract", item: "Fixed-term contract", worker: "Miguel Ferreira", company: "Obras Lusitânia Lda", site: "La Massana", blocks: true },
  // 30 to 90 days.
  { date: at(10, 12), type: "document", item: "Medical fitness check", worker: "Nuno Pereira", company: "Obras Lusitânia Lda", site: "Encamp", blocks: true },
  { date: at(10, 18), type: "document", item: "PRL safety training certificate", worker: "Laura Gil", company: "Grupo Heracles", site: "Escaldes-Engordany", blocks: true },
  { date: at(10, 20), type: "document", item: "Social security posting form P/AND-2", worker: "Rui Carvalho", company: "Obras Lusitânia Lda", site: "La Massana", blocks: true },
  { date: at(10, 20), type: "document", item: "Social security posting form P/AND-3", worker: "Rui Carvalho", company: "Obras Lusitânia Lda", site: "La Massana", blocks: true },
  { date: at(10, 26), type: "document", item: "Posting form SE 130-01", worker: "Hugo Lefèvre", company: "BTP Ariège SARL", site: "Escaldes-Engordany", blocks: true },
  { date: at(10, 30), type: "contract", item: "Fixed-term contract", worker: "Marc Torres", company: "Grupo Heracles", site: "Andorra la Vella", blocks: true },
  { date: at(11, 3), type: "document", item: "PRL safety training certificate", worker: "Pau Serra", company: "Grupo Heracles", site: "Andorra la Vella", blocks: true },
  { date: at(11, 11), type: "contract", item: "Fixed-term contract", worker: "Sergi Font", company: "Grupo Heracles", site: "Andorra la Vella", blocks: true },
  { date: at(11, 15), type: "permit", item: "Immigration permit", worker: "João Lopes", company: "Obras Lusitânia Lda", site: "Encamp", blocks: true },
  { date: at(11, 20), type: "contract", item: "Employment contract", worker: "Rui Carvalho", company: "Obras Lusitânia Lda", site: "La Massana", blocks: true },
  { date: at(11, 20), type: "contract", item: "Employment contract", worker: "Tiago Sousa", company: "Obras Lusitânia Lda", site: "Encamp", blocks: true },
  { date: at(11, 20), type: "permit", item: "Immigration permit", worker: "Rui Carvalho", company: "Obras Lusitânia Lda", site: "La Massana", blocks: true },
  { date: at(11, 22), type: "document", item: "Medical fitness check", worker: "Pierre Durand", company: "BTP Ariège SARL", site: "Escaldes-Engordany", blocks: true },
  { date: at(11, 31), type: "contract", item: "Subcontract · formwork", worker: "—", company: "Obras Lusitânia Lda", site: "La Massana", blocks: false },
  { date: at(11, 31), type: "document", item: "Proof of accommodation in Andorra", worker: "Rui Carvalho", company: "Obras Lusitânia Lda", site: "La Massana", blocks: false },
  { date: at(11, 31), type: "document", item: "Site induction · La Massana", worker: "Rui Carvalho", company: "Obras Lusitânia Lda", site: "La Massana", blocks: false },
  { date: at(0, 4, 2027), type: "document", item: "Medical fitness check", worker: "Marta Vila", company: "Grupo Heracles", site: "La Massana", blocks: true },
];

const workerIdByName: Record<string, string> = {
  "Jordi Puig": "jordi-puig", "Marc Torres": "marc-torres", "Rui Carvalho": "rui-carvalho", "Tiago Sousa": "tiago-sousa",
  "Carlos Méndez": "carlos-mendez",
};

/** Expiries in the next 90 days, without the contracts the visitor already renewed. */
export function expiries(r: Renewals): Expiry[] {
  return EXPIRIES.filter((e) => !(e.type === "contract" && r[workerIdByName[e.worker] ?? ""]));
}

/** 13 weeks from the week of 12 Oct, each with its expiries counted by type. Also drives the dashboard chart. */
export function expiryWeeks(r: Renewals) {
  const start = at(9, 12);
  const list = expiries(r);
  return Array.from({ length: 13 }, (_, i) => {
    const from = start + i * 7 * DAY;
    const inWeek = list.filter((e) => e.date >= from && e.date < from + 7 * DAY);
    const count = (type: ExpiryType) => inWeek.filter((e) => e.type === type).length;
    return { label: label(from), contract: count("contract"), document: count("document"), permit: count("permit"), n: inWeek.length };
  });
}

export const expiryLabel = (e: Expiry) => label(e.date, true);
export const daysLeft = (e: Expiry) => Math.round((e.date - TODAY) / DAY);

/* ---------------- Site access log ---------------- */

// Check-ins per day, all sites, for the last 14 days (today last). Weekends are quiet on the real calendar,
// whatever day the demo is shown; labels stay in sample time so translation moves them like every other date.
const WEEKDAY_CHECKINS = [44, 45, 43, 46, 44, 42, 45, 44, 47, 43];
export const accessDays = () => {
  const offset = demoOffsetDays();
  let w = 0;
  return Array.from({ length: 14 }, (_, i) => {
    const sample = TODAY - (13 - i) * DAY;
    const wd = new Date(sample + offset * DAY).getUTCDay();
    const weekend = wd === 0 || wd === 6;
    const today = i === 13;
    const n = today ? 46 : weekend ? (wd === 6 ? 3 : 0) : WEEKDAY_CHECKINS[w++ % WEEKDAY_CHECKINS.length];
    return { label: label(sample), weekend, today, n };
  });
};

export type AccessEvent = { time: string; site: string; who: string; kind: "in" | "blocked" | "override"; reason: string; by: string };
export const ACCESS_EVENTS: AccessEvent[] = [
  { time: "8 Oct · 07:41", site: "La Massana", who: "Rui Carvalho", kind: "in", reason: "All documents valid", by: "Ana Soler" },
  { time: "8 Oct · 07:35", site: "Escaldes-Engordany", who: "11 workers", kind: "in", reason: "All documents valid", by: "Carlos Méndez" },
  { time: "8 Oct · 07:12", site: "Encamp", who: "Antoni Vidal", kind: "blocked", reason: "Contract ended 3 Oct", by: "System" },
  { time: "8 Oct · 07:05", site: "Encamp", who: "Tiago Sousa", kind: "blocked", reason: "Accident insurance certificate missing", by: "System" },
  { time: "7 Oct · 16:40", site: "Escaldes-Engordany", who: "Mehdi Benali", kind: "blocked", reason: "Work permit awaiting Govern decision", by: "System" },
  { time: "6 Oct · 08:10", site: "Andorra la Vella", who: "Pau Serra", kind: "override", reason: "Induction renewed on site; certificate to follow within 48 h", by: "Sandra Ruiz" },
  { time: "5 Oct · 07:20", site: "Encamp", who: "Tiago Sousa", kind: "blocked", reason: "Accident insurance certificate missing", by: "System" },
  { time: "2 Oct · 07:50", site: "La Massana", who: "Nuno Pereira", kind: "override", reason: "Medical check booked for 3 Oct; supervised work only", by: "Ana Soler" },
];

/** Last 7 days per site; check-ins split by each site's headcount so they add up to the chart's total. */
export function accessBySite(weekTotal: number) {
  const sites = [
    { site: "Escaldes-Engordany", staff: 15, blocked: 1, overrides: 0 },
    { site: "La Massana", staff: 12, blocked: 0, overrides: 1 },
    { site: "Andorra la Vella", staff: 13, blocked: 0, overrides: 1 },
    { site: "Encamp", staff: 12, blocked: 3, overrides: 0 },
  ];
  const rows = sites.map((s) => ({ ...s, checkins: Math.floor((weekTotal * s.staff) / 52) }));
  rows[0].checkins += weekTotal - rows.reduce((a, s) => a + s.checkins, 0);
  return rows;
}

/* ---------------- Subcontractor scorecard ---------------- */

export function scorecard(r: Renewals) {
  const vidal = Boolean(r["antoni-vidal"]);
  return [
    { company: "Obras Lusitânia Lda", own: false, workers: 9, required: 90, valid: 81, missing: 2, expired: 0, days: 6.5, onTime: 71 },
    { company: "Grues Pirineu SL", own: false, workers: 4, required: 36, valid: vidal ? 32 : 31, missing: 1, expired: vidal ? 0 : 1, days: 4.0, onTime: 80 },
    { company: "BTP Ariège SARL", own: false, workers: 4, required: 40, valid: 39, missing: 0, expired: 0, days: 1.5, onTime: 96 },
    { company: "Grupo Heracles", own: true, workers: 35, required: 315, valid: 303, missing: 1, expired: 0, days: 1.0, onTime: 98 },
  ].map((c) => ({ ...c, pct: Math.round((c.valid / c.required) * 100) }));
}

/* ---------------- Permits ---------------- */

export function permitsReport(r: Renewals) {
  const d = demoData(r);
  const stages = d.permitStages.filter((s) => s.id !== "all");
  const extra: Record<string, { submitted: string; decided: string; days: number | null }> = {
    "Tiago Sousa": { submitted: "—", decided: "—", days: null },
    "Mehdi Benali": { submitted: "7 Oct 2026", decided: "—", days: 1 },
    "Lucas Bernard": { submitted: "18 Sep 2026", decided: "—", days: 20 },
    "Rui Carvalho": { submitted: "9 Jun 2026", decided: "14 Jul 2026", days: 35 },
    "Élodie Martin": { submitted: "28 Jul 2026", decided: "1 Sep 2026", days: 35 },
    "Carlos Méndez": { submitted: "12 Feb 2025", decided: "20 Mar 2025", days: 36 },
    "Antoni Vidal": { submitted: "10 Mar 2026", decided: "8 Apr 2026", days: 29 },
  };
  // Steps taken in the demo happen "today"; they are left out of the average decision time.
  const rows = d.permits.map((p) => {
    const step = r[PERMIT_KEY + p.id]?.start;
    if (step === "submitted") return { ...p, submitted: "8 Oct 2026", decided: "—", days: 0 };
    if (step === "approved") return { ...p, ...extra[p.name], decided: "8 Oct 2026", days: null };
    return { ...p, ...extra[p.name] };
  });
  const decided = rows.filter((p) => p.decided && p.decided !== "—" && p.days !== null);
  const avgDays = Math.round(decided.reduce((a, p) => a + (p.days ?? 0), 0) / Math.max(1, decided.length));
  const waiting = rows.filter((p) => p.key === "submitted").length;
  return { stages, rows, avgDays, waiting };
}

/* ---------------- Unconfirmed dates ---------------- */

export const UNCONFIRMED = [
  { file: "medical_carvalho.pdf", document: "Medical fitness check", worker: "Rui Carvalho", read: "12 Oct 2026", where: "Page 1, “Valid until”", confidence: "High", by: "Obras Lusitânia Lda", uploaded: "6 Oct 2026" },
  { file: "pand2_sousa.pdf", document: "Social security posting form P/AND-2", worker: "Tiago Sousa", read: "20 Dec 2026", where: "Page 2, box 7", confidence: "Medium", by: "Obras Lusitânia Lda", uploaded: "7 Oct 2026" },
  { file: "passport_sousa.jpg", document: "Passport", worker: "Tiago Sousa", read: "3 Mar 2030", where: "Photo page, machine-readable zone", confidence: "High", by: "Obras Lusitânia Lda", uploaded: "7 Oct 2026" },
];
