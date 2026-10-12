// Sample data for the public demo at /compliance-demo. Nothing here reads or writes a database.
// The full app (with Supabase) lives in its own project; this file keeps only its sample-data branches.
import { notFound } from "next/navigation";
import * as sample from "@/compliance/lib/data";
import type { PeopleData, ProfileData, CheckRow, ContractsData, SettingsData, DashboardData, QueueItem } from "./views";

/* ───────────────────────────── People ───────────────────────────── */

export async function getPeopleData(): Promise<PeopleData> {
  return {
    live: false, canEdit: true,
    workers: sample.workers.map((w) => ({ ...w, companyId: w.company, siteId: w.site, foreignEmployer: w.company !== "Grupo Heracles" })),
    companies: sample.COMPANIES.map((c) => ({ id: c, name: c })),
    sites: sample.SITES.map((s) => ({ id: s, name: s })),
  };
}

/* ───────────────────────────── Worker profile ───────────────────────────── */

export async function getWorkerProfileData(id: string): Promise<ProfileData> {
  return sampleProfile(id);
}

function sampleProfile(id: string): ProfileData {
  const w = sample.workers.find((x) => x.id === id);
  if (!w) notFound();
  const stateOf = (st: sample.Status): CheckRow["state"] => (st === "warn" ? "expiring" : st === "bad" ? "expired" : "valid");
  return {
    live: false,
    worker: { ...w, companyId: w.company, siteId: w.site, foreignEmployer: w.company !== "Grupo Heracles" },
    facts: {
      permitType: w.permit === "Foreign company worker" ? "Temporary · foreign company worker" : w.permit,
      permitValidUntil: "20 Dec 2026",
      socialSecurity: `${w.nat} · posting forms`,
      accessUntil: w.status === "bad" ? "Blocked" : "12 Oct 2026",
      accessTone: w.status === "bad" ? "bad" : "warn",
    },
    ruleSets: ["Portugal · foreign company worker · construction"],
    checklist: sample.profileDocs.map((d) => ({ name: d.name, note: d.note, exp: d.exp, expiringSoon: d.status === "warn", state: stateOf(d.status), daysLeft: d.status === "warn" ? 4 : null, blocks: d.blocks, kind: d.name === "Employment contract" ? "contract" : d.name === "Immigration permit" ? "permit" : "document" })),
    validCount: 9,
    requiredCount: 10,
    contracts: [
      { title: "Employment contract · fixed term", parties: `${w.company} → ${w.name} · signed 2 Jun 2026`, range: "2 Jun 2026 – 20 Dec 2026", progress: 52 },
      { title: "Subcontract · formwork, La Massana residential block", parties: `Grupo Heracles → ${w.company}`, range: "1 Jun 2026 – 31 Dec 2026", progress: 61 },
    ],
    access: {
      items: [
        { label: "Medical fitness check", date: "12 Oct 2026", day: 4, binding: true },
        { label: "Posting form (social security)", date: "20 Nov 2026", day: 43, binding: false },
        { label: "Employment contract", date: "20 Dec 2026", day: 73, binding: false },
        { label: "Immigration permit", date: "20 Dec 2026", day: 73, binding: false },
      ],
      horizon: 80,
      endLabel: "27 Dec",
      message: `Access to ${w.site} will be blocked automatically on 12 Oct unless a new medical certificate is uploaded and its dates are confirmed.`,
    },
    history: sample.profileHistory,
    employer: { name: w.company, contact: "No contact on file", email: null },
    canEdit: true,
    options: { companies: sample.COMPANIES.map((c) => ({ id: c, name: c })), sites: sample.SITES.map((x) => ({ id: x, name: x })) },
    today: { allowed: w.status !== "bad", site: w.site, lastCheckIn: "07:41 by Ana Soler" },
  };
}

/* ───────────────────────────── Contracts ───────────────────────────── */

export async function getContractsData(): Promise<ContractsData> {
  return {
    live: false, canEdit: true,
    contracts: sample.contracts.map((c, i) => ({ id: String(i), worker: c.worker, workerId: sample.workers.find((w) => w.name === c.worker)?.id ?? null, type: c.type, parties: c.parties, start: c.start, end: c.end, status: c.status, label: c.label })),
    summary: { active: 61, endingSoon: 6, endedAssigned: 1, subcontracts: 3 },
    workers: sample.workers.map((w) => ({ id: w.id, name: w.name })),
  };
}

/* ───────────────────────────── Settings ───────────────────────────── */

export async function getSettingsData(): Promise<SettingsData> {
  return {
    live: false, orgName: "Grupo Heracles",
    ruleSets: sample.ruleSets.map((r) => ({ name: r.name, when: r.when, nat: r.nat, emp: r.emp, docs: r.items.length, workers: r.workers, items: r.items })),
    users: sample.users,
    isAdmin: true,
    org: { name: "Grupo Heracles", register: "", country: "Andorra", language: "ca" },
    keys: [
      { id: "k1", label: "Sandra Ruiz", role: "Compliance", prefix: "adv_7kqm", scope: "All sites", created: "2 Oct 2026", lastUsed: "Today", revoked: false },
      { id: "k2", label: "Ana Soler", role: "Site manager", prefix: "adv_p3xe", scope: "La Massana", created: "2 Oct 2026", lastUsed: "Today", revoked: false },
      { id: "k3", label: "Obras Lusitânia Lda", role: "Subcontractor", prefix: "adv_hn9w", scope: "Obras Lusitânia Lda", created: "5 Oct 2026", lastUsed: "Never", revoked: false },
    ],
    sites: sample.SITES.map((x) => ({ id: x, name: x })),
    companies: sample.COMPANIES.map((x) => ({ id: x, name: x })),
  };
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

function sampleQueue(): QueueItem[] {
  return sample.actionQueue.map((q, i) => {
    const w = sample.workers.find((x) => x.name === q.worker);
    const profile = w ? `/compliance-demo/workers/${w.id}` : "/compliance-demo/workers";
    const href = q.kind === "Contract" ? `/compliance-demo/workers/contracts?new=${w?.id ?? ""}` : q.kind === "Permit" ? "/compliance-demo/permits" : profile;
    return { id: String(i), worker: q.worker, workerId: w?.id ?? null, issue: q.issue, site: q.site, company: q.company, when: q.when, severity: q.severity, kind: q.kind, action: q.action, href };
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  return {
    live: false,
    subtitle: `Grupo Heracles · All sites · ${sample.TODAY_LABEL}`,
    kpis: sample.kpis.map((k) => ({ ...k })),
    queue: sampleQueue(),
    sites: sample.siteCompliance,
    averagePct: 86,
    weeks: sample.expiryWeeks,
    activity: sample.activity.map((a) => ({ name: a.ini, text: a.text, time: a.time, system: Boolean(a.system) })),
  };
}
