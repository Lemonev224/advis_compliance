// Changes a visitor makes in the demo (for now: contracts added or renewed), applied on top of the sample data.
// They live in a cookie for the visit, so server pages and client pages show the same thing.
// "Reset sample data" in the account menu, or leaving the demo, clears them.
// Safe to import from server and client code.

import * as sample from "./data";
import { demoOffsetDays } from "./i18n";

export const RENEWALS_COOKIE = "adv_renewals";

/** A contract added in the demo. Dates are stored in sample-data time ("31 Mar 2027" as if today were 8 Oct 2026),
 *  so the demo's date shifting shows them on the date the visitor actually picked. */
export type Renewal = { start: string; end: string | null };
export type Renewals = Record<string, Renewal>;

/** Permit steps taken in the demo live in the same cookie, under "permit:<id>":
 *  start is the step ("submitted" or "approved"), end is the new valid-until date (sample-data time) once approved. */
export const PERMIT_KEY = "permit:";
export type PermitStep = "submitted" | "approved";
const PERMIT_STEPS: PermitStep[] = ["submitted", "approved"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86_400_000;

/** A real date picked in a form (YYYY-MM-DD) as a sample-data date label. */
export function toSampleLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d) - demoOffsetDays() * DAY);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function parseRenewals(raw: string | null | undefined): Renewals {
  if (!raw) return {};
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!data || typeof data !== "object") return {};
    const out: Renewals = {};
    for (const [id, v] of Object.entries(data as Record<string, Renewal>)) {
      if (id.startsWith(PERMIT_KEY)) {
        if (sample.permits.some((p) => PERMIT_KEY + p.id === id) && v && PERMIT_STEPS.includes(v.start as PermitStep) && (v.end === null || typeof v.end === "string")) out[id] = { start: v.start, end: v.end };
        continue;
      }
      if (sample.workers.some((w) => w.id === id) && v && typeof v.start === "string" && (v.end === null || typeof v.end === "string")) out[id] = { start: v.start, end: v.end };
    }
    return out;
  } catch {
    return {};
  }
}

export const serializeRenewals = (r: Renewals) => encodeURIComponent(JSON.stringify(r));

// Sample workers whose only problem is their contract. Jordi Puig also has a PRL certificate expiring.
const CONTRACT_ONLY = new Set(["antoni-vidal", "marc-torres"]);

/** The sample data with the visitor's renewals applied. */
export function demoData(r: Renewals) {
  const idOf = (name: string) => sample.workers.find((w) => w.name === name)?.id;
  const renewalOf = (name: string) => { const id = idOf(name); return id ? r[id] : undefined; };
  const fixed = (name: string) => { const id = idOf(name); return Boolean(id && r[id] && CONTRACT_ONLY.has(id)); };

  const vidal = Boolean(r["antoni-vidal"]);
  const torres = Boolean(r["marc-torres"]);
  const puig = Boolean(r["jordi-puig"]);
  const stepOf = (id: string) => r[PERMIT_KEY + id]?.start as PermitStep | undefined;
  const mendezStep = stepOf("carlos-mendez");
  const benali = stepOf("mehdi-benali") === "approved";

  const workers = sample.workers.map((w) => {
    if (w.id === "mehdi-benali" && benali) return { ...w, status: "ok" as const, docs: "9/9", permit: "Work & residence", note: "Work permit approved. Can start on site." };
    if (w.id === "carlos-mendez" && mendezStep === "submitted") return { ...w, note: "Permit renewal submitted. Current permit stays valid while the Govern decides." };
    const x = r[w.id];
    if (!x) return w;
    const ends = x.end ?? "Permanent";
    if (w.id === "jordi-puig") return { ...w, ends, note: "PRL certificate expires 15 Oct." };
    if (!CONTRACT_ONLY.has(w.id)) return { ...w, ends };
    const [, need] = w.docs.split("/");
    return { ...w, ends, status: "ok" as const, docs: `${need}/${need}`, note: "Contract renewed. Nothing else to do." };
  });

  const actionQueue = sample.actionQueue.filter((q) => !(q.kind === "Contract" && renewalOf(q.worker))
    && !(q.kind === "Permit" && ((q.worker === "Carlos Méndez" && mendezStep) || (q.worker === "Mehdi Benali" && benali))));

  const permits = sample.permits.map((p) => {
    const step = stepOf(p.id);
    if (step === "approved") return { ...p, stage: "Approved", key: "approved", valid: r[PERMIT_KEY + p.id].end ?? p.valid, next: "None" };
    if (step === "submitted") return { ...p, stage: "Submitted", key: "submitted", next: "Awaiting Govern decision" };
    if (p.id === "antoni-vidal" && vidal) return { ...p, stage: "Approved", key: "approved", valid: r["antoni-vidal"].end ?? "—", next: "None" };
    return p;
  });
  // Stage counts move with every permit whose stage changed.
  const moved = (from: string, to: string) => permits.filter((p, i) => sample.permits[i].key === from && p.key === to).length;
  const permitStages = sample.permitStages.map((s) => {
    if (s.id === "all") return s;
    const into = permits.filter((p, i) => p.key === s.id && sample.permits[i].key !== s.id).length;
    const out = permits.filter((p, i) => sample.permits[i].key === s.id && p.key !== s.id).length;
    return { ...s, count: s.count + into - out };
  });
  const awaiting = permits.filter((p) => p.key === "submitted").length;
  const inProgress = 4 + moved("renewal", "submitted") - moved("draft", "approved") - moved("submitted", "approved");

  const contractsExpiring = 3 - (puig ? 1 : 0);
  const kpis = sample.kpis.map((k) => {
    if (k.label === "On site today" && vidal) return { ...k, value: "47" };
    if (k.label === "Access blocked") return { ...k, value: String(3 - (vidal ? 1 : 0) - (benali ? 1 : 0)) };
    if (k.label === "Permits in progress") return { ...k, value: String(inProgress), meta: `${awaiting} awaiting Govern decision` };
    if (k.label === "Expiring in 30 days") return { ...k, value: String(7 - (puig ? 1 : 0)), meta: `${contractsExpiring} ${contractsExpiring === 1 ? "contract" : "contracts"} · 3 documents · 1 permit` };
    return k;
  });

  const siteCompliance = sample.siteCompliance.map((s) => {
    if (s.name === "Encamp" && vidal) return { ...s, pct: 83, detail: "10 of 12 workers · 1 blocked" };
    if (s.name === "Escaldes-Engordany" && benali) return { ...s, pct: 100, detail: "15 of 15 workers" };
    if (s.name === "Andorra la Vella" && torres) return { ...s, pct: 92, detail: "12 of 13 workers · 1 expiring" };
    return s;
  });
  const averagePct = Math.round(siteCompliance.reduce((a, s) => a + s.pct, 0) / siteCompliance.length);

  const renewedNames = sample.workers.filter((w) => r[w.id]).map((w) => w.name);
  const permitNames = (step: PermitStep) => sample.permits.filter((p) => stepOf(p.id) === step).map((p) => p.name);
  const activity = [
    ...permitNames("approved").map((name) => ({ ini: "DA", text: "Demo admin recorded the Govern approval for {name}", vars: { name } as Record<string, string> | undefined, time: "Just now", system: false })),
    ...permitNames("submitted").map((name) => ({ ini: "DA", text: "Demo admin submitted the permit renewal for {name}", vars: { name } as Record<string, string> | undefined, time: "Just now", system: false })),
    ...renewedNames.map((name) => ({ ini: "DA", text: "Demo admin renewed the contract of {name}", vars: { name } as Record<string, string> | undefined, time: "Just now", system: false })),
    ...sample.activity.map((a) => ({ ...a, vars: undefined as Record<string, string> | undefined, system: Boolean(a.system) })),
  ].slice(0, 5);

  const siteBoard = sample.siteBoard.map((s) => ({
    ...s,
    workers: s.workers.map((w) => (fixed(w.name) ? { ...w, status: "ok" as const, detail: "contract renewed" } : w.name === "Mehdi Benali" && benali ? { ...w, status: "ok" as const, detail: "permit approved" } : w)),
  }));

  const accessSummary = { assigned: 45, ok: 39 + (vidal ? 1 : 0) + (torres ? 1 : 0) + (benali ? 1 : 0), warn: 4 - (torres ? 1 : 0), bad: 3 - (vidal ? 1 : 0) - (benali ? 1 : 0) };

  // The upcoming "contract ends" deadline goes away once the contract is renewed.
  const calendarEvents = Object.fromEntries(
    Object.entries(sample.calendarEvents).map(([d, list]) => [d, list.filter((e) => !(e.type === "contract" && Number(d) > 8 && renewedNames.some((n) => e.who.startsWith(n)))
      && !(e.type === "permit" && ((benali && e.who.startsWith("Mehdi Benali")) || (mendezStep && e.who.startsWith("Carlos Méndez")))))]),
  );

  const inbox = [
    ...(benali ? [{ title: "Permit approved", body: "Mehdi Benali · Residence and work", time: "Just now", tone: "ok" as const }] : []),
    ...sample.inbox.filter((n) => !(vidal && n.title === "Access blocked: Antoni Vidal")),
  ];

  const contracts = sample.contracts.map((c) => {
    const x = renewalOf(c.worker);
    if (!x) return c;
    return { ...c, type: x.end ? "Employment · fixed term" : "Employment · permanent", start: x.start, end: x.end ?? "—", status: "ok" as const, label: "Active" };
  });

  return { workers, actionQueue, kpis, siteCompliance, averagePct, activity, siteBoard, accessSummary, calendarEvents, inbox, contracts, permits, permitStages };
}

export type DemoData = ReturnType<typeof demoData>;
