// The labour inspection pack: everything an inspector asks for on one site, in one place, ready to print.
// Built from the same sample data as the rest of the demo (and the visitor's changes), so it agrees with the
// dashboard. The named workers are the demo's; the rest of each site's headcount is filled with invented,
// fully compliant workers so the register adds up to the real totals (52 workers across 4 sites).
// Dates are sample-data dates (as if today were 8 Oct 2026); translate them with t() one by one so they move.
// Safe to import from server and client code.

import { demoData, PERMIT_KEY, type Renewals } from "./demo-state";
import { ACCESS_EVENTS, accessDays, accessBySite } from "./reports";
import type { Status } from "./data";

export const INSPECTION_SITES = [
  { id: "escaldes", name: "Escaldes-Engordany", project: "Office refurbishment · 4 floors", address: "Av. Carlemany 61, AD700 Escaldes-Engordany", manager: "Carlos Méndez", code: "ESC" },
  { id: "la-massana", name: "La Massana", project: "Residential block · 24 units", address: "Ctra. de Arinsal 14, AD400 La Massana", manager: "Sandra Ruiz", code: "LMA" },
  { id: "andorra-la-vella", name: "Andorra la Vella", project: "Retail fit-out · Av. Meritxell", address: "Av. Meritxell 88, AD500 Andorra la Vella", manager: "Pau Serra", code: "ALV" },
  { id: "encamp", name: "Encamp", project: "Hotel extension · phase 2", address: "Av. Joan Martí 112, AD200 Encamp", manager: "Ana Soler", code: "ENC" },
] as const;
export type InspectionSiteId = (typeof INSPECTION_SITES)[number]["id"];

export const EMPLOYERS: Record<string, { taxId: string; country: string; foreign: boolean; insurer: string; insurance: string; social: string }> = {
  "Grupo Heracles": { taxId: "NRT L-712345-A", country: "Andorra", foreign: false, insurer: "Assegurances Valira", insurance: "31 Dec 2026", social: "CASS certificate, 1 Oct 2026" },
  "Obras Lusitânia Lda": { taxId: "NIF PT 509 381 274", country: "Portugal", foreign: true, insurer: "Seguros Atlântico", insurance: "30 Jun 2027", social: "Posting forms P/AND-2 and P/AND-3" },
  "Grues Pirineu SL": { taxId: "NIF ES B-25614398", country: "Spain", foreign: true, insurer: "Seguros Montsec", insurance: "31 Mar 2027", social: "Posting forms P/AND-2 and P/AND-3" },
  "BTP Ariège SARL": { taxId: "SIRET FR 812 455 903 00017", country: "France", foreign: true, insurer: "Assurances Garonne", insurance: "31 Jan 2027", social: "Posting form SE 130-01" },
};

type Doc = { name: string; until: string; status: Status; note?: string };
export type RegisterRow = {
  name: string; role: string; company: string; nat: string; status: Status; issue: string;
  contract: string; permit: string; prl: string; medical: string; induction: string; docs: Doc[]; named: boolean;
};

// Invented, fully compliant workers that make up the rest of each site's headcount.
const FILL: Record<InspectionSiteId, [string, string, string, string][]> = {
  escaldes: [
    ["Julien Fabre", "Site engineer", "BTP Ariège SARL", "France"], ["Thomas Roux", "Scaffolder", "BTP Ariège SARL", "France"], ["Nicolas Garcia", "Welder", "BTP Ariège SARL", "France"],
    ["Josep Riba", "Bricklayer", "Grupo Heracles", "Andorra"], ["Miguel Ortega", "Plasterer", "Grupo Heracles", "Spain"], ["Paulo Ferreira", "Labourer", "Grupo Heracles", "Portugal"],
    ["Youssef Amrani", "Steel fixer", "Grupo Heracles", "Morocco"], ["Laura Casals", "Site administrator", "Grupo Heracles", "Andorra"], ["Andrés Gil", "Electrician", "Grupo Heracles", "Spain"],
    ["Hugo Pinto", "Tiler", "Grupo Heracles", "Portugal"], ["David Ferrer", "Machine operator", "Grupo Heracles", "Spain"], ["Oriol Mas", "Painter", "Grupo Heracles", "Andorra"],
  ],
  "la-massana": [
    ["João Silva", "Formwork carpenter", "Obras Lusitânia Lda", "Portugal"], ["Bruno Costa", "Labourer", "Obras Lusitânia Lda", "Portugal"], ["Ricardo Lopes", "Bricklayer", "Obras Lusitânia Lda", "Portugal"],
    ["André Martins", "Steel fixer", "Obras Lusitânia Lda", "Portugal"], ["Jaume Font", "Site foreman", "Grupo Heracles", "Andorra"], ["Sergio Navarro", "Plumber", "Grupo Heracles", "Spain"],
    ["Karim Haddad", "Labourer", "Grupo Heracles", "Morocco"], ["Marta Vila", "Quantity surveyor", "Grupo Heracles", "Andorra"], ["Diego Romero", "Electrician", "Grupo Heracles", "Spain"],
  ],
  "andorra-la-vella": [
    ["Gerard Pons", "Electrician", "Grupo Heracles", "Andorra"], ["Raúl Medina", "Plasterer", "Grupo Heracles", "Spain"], ["Filipe Rocha", "Painter", "Grupo Heracles", "Portugal"],
    ["Àlex Bonet", "Site foreman", "Grupo Heracles", "Andorra"], ["Iván Moreno", "Glazier", "Grupo Heracles", "Spain"], ["Nuno Alves", "Tiler", "Grupo Heracles", "Portugal"],
    ["Omar Tazi", "Labourer", "Grupo Heracles", "Morocco"], ["Cristina Prat", "Site engineer", "Grupo Heracles", "Andorra"], ["Javier Ruiz", "Plumber", "Grupo Heracles", "Spain"],
    ["Luis Herrera", "Carpenter", "Grupo Heracles", "Colombia"],
  ],
  encamp: [
    ["Xavier Bosch", "Crane operator", "Grues Pirineu SL", "Spain"], ["Ramon Puigdemont", "Rigger", "Grues Pirineu SL", "Spain"], ["Enric Sala", "Crane operator", "Grues Pirineu SL", "Spain"],
    ["Rui Gomes", "Labourer", "Obras Lusitânia Lda", "Portugal"], ["Pedro Sousa", "Bricklayer", "Obras Lusitânia Lda", "Portugal"], ["Marc Camp", "Site foreman", "Grupo Heracles", "Andorra"],
    ["Fernando Díaz", "Machine operator", "Grupo Heracles", "Spain"], ["Said Benjelloun", "Steel fixer", "Grupo Heracles", "Morocco"], ["Pere Vidal", "Electrician", "Grupo Heracles", "Andorra"],
  ],
};

// Extra named people from the site board who aren't in the worker list.
const BOARD_EXTRA: Record<string, [string, string, string, string]> = {
  "Pau Serra": ["Pau Serra", "Electrician", "Grupo Heracles", "Andorra"],
  "Nuno Pereira": ["Nuno Pereira", "Labourer", "Obras Lusitânia Lda", "Portugal"],
};

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const pick = <T,>(s: string, list: readonly T[]) => list[hash(s) % list.length];
const CONTRACT_ENDS = ["31 Mar 2027", "30 Jun 2027", "Permanent", "31 Dec 2027", "15 Jan 2027", "Permanent", "30 Sep 2027"];
const PRL_UNTIL = ["14 Feb 2028", "3 May 2027", "21 Sep 2027", "9 Jan 2028", "30 Jun 2028", "12 Nov 2027"];
const MEDICAL_UNTIL = ["18 Jan 2027", "6 Mar 2027", "22 Apr 2027", "11 Jun 2027", "2 Aug 2027", "15 Sep 2027", "27 Feb 2027"];
const INDUCTION_ON = ["2 Jun 2026", "15 Jun 2026", "1 Jul 2026", "1 Sep 2026", "8 Sep 2026", "16 Mar 2026"];

/** Each worker's file: the documents an inspector checks, with what's wrong (if anything) flagged. */
function buildRow(name: string, role: string, company: string, nat: string, overrides: Partial<Record<string, Doc>>, named: boolean): RegisterRow {
  const emp = EMPLOYERS[company];
  const contractEnd = pick(name + "c", CONTRACT_ENDS);
  const docs: Doc[] = [
    { name: nat === "Andorra" ? "Andorran passport or ID" : "Passport", until: pick(name + "p", ["14 Mar 2031", "9 May 2032", "2 Feb 2030", "27 Oct 2033"]), status: "ok" },
    { name: "Employment contract", until: contractEnd, status: "ok" },
    emp.foreign ? { name: emp.social, until: pick(name + "s", ["20 Dec 2026", "30 Jun 2027", "15 Feb 2027"]), status: "ok" } : { name: "CASS social security registration", until: "In force", status: "ok" },
    ...(nat === "Andorra" ? [] : [emp.foreign
      ? { name: "Immigration permit", until: pick(name + "i", ["20 Dec 2026", "15 Feb 2027", "31 Mar 2027"]), status: "ok" as Status, note: "Temporary · foreign company worker" }
      : { name: "Residence and work permit", until: pick(name + "r", ["30 Apr 2027", "31 Jul 2027", "15 Jan 2028"]), status: "ok" as Status }]),
    { name: "PRL safety training certificate", until: pick(name + "t", PRL_UNTIL), status: "ok" },
    { name: "Medical fitness check", until: pick(name + "m", MEDICAL_UNTIL), status: "ok" },
    { name: "Site induction", until: pick(name + "n", INDUCTION_ON), status: "ok", note: "Signed on arrival" },
    ...(emp.foreign ? [{ name: "Accident insurance certificate", until: emp.insurance, status: "ok" as Status }] : []),
  ];
  for (const [key, d] of Object.entries(overrides)) {
    const i = docs.findIndex((x) => x.name === key || x.name.startsWith(key));
    if (i >= 0 && d) docs[i] = d;
  }
  const worst: Status = docs.some((d) => d.status === "bad") ? "bad" : docs.some((d) => d.status === "pending") ? "pending" : docs.some((d) => d.status === "warn") ? "warn" : "ok";
  const issue = docs.find((d) => d.status === worst && worst !== "ok");
  // A note on a valid document (e.g. "Renewal submitted") is still worth showing in the register.
  const info = worst === "ok" ? docs.find((d) => d.note && d.name !== "Site induction" && d.name !== "Immigration permit") : undefined;
  const get = (k: string) => docs.find((d) => d.name.startsWith(k));
  const permit = docs.find((d) => d.name === "Immigration permit" || d.name === "Residence and work permit");
  return {
    name, role, company, nat, status: worst, issue: issue ? issue.note ?? issue.name : info?.note ?? "",
    contract: get("Employment contract")!.until, permit: permit ? permit.until : "Not required",
    prl: get("PRL")!.until, medical: get("Medical")!.until, induction: get("Site induction")!.until, docs, named,
  };
}

/** The pack for one site. */
export function inspectionPack(siteId: InspectionSiteId, r: Renewals) {
  const site = INSPECTION_SITES.find((s) => s.id === siteId) ?? INSPECTION_SITES[0];
  const d = demoData(r);
  const vidal = r["antoni-vidal"];
  const puig = r["jordi-puig"];
  const torres = r["marc-torres"];
  const benali = r[PERMIT_KEY + "mehdi-benali"]?.start === "approved" ? r[PERMIT_KEY + "mehdi-benali"] : undefined;
  const mendez = r[PERMIT_KEY + "carlos-mendez"];

  // What's wrong with the demo's named workers today (matches the dashboard).
  const issues: Record<string, Partial<Record<string, Doc>>> = {
    "Antoni Vidal": vidal
      ? { "Employment contract": { name: "Employment contract", until: vidal.end ?? "Permanent", status: "ok", note: "Renewed today" }, "Immigration permit": { name: "Immigration permit", until: vidal.end ?? "Permanent", status: "ok", note: "Extended with the new contract" } }
      : { "Employment contract": { name: "Employment contract", until: "3 Oct 2026", status: "bad", note: "Contract ended 3 Oct. Site access blocked automatically." }, "Immigration permit": { name: "Immigration permit", until: "3 Oct 2026", status: "bad", note: "Lapsed with the contract" } },
    "Tiago Sousa": { "Accident insurance certificate": { name: "Accident insurance certificate", until: "—", status: "bad", note: "Accident insurance certificate missing. Access blocked." }, "Immigration permit": { name: "Immigration permit", until: "—", status: "pending", note: "Application in draft" } },
    "Rui Carvalho": { "Medical fitness check": { name: "Medical fitness check", until: "12 Oct 2026", status: "warn", note: "Medical fitness check expires 12 Oct." }, "Immigration permit": { name: "Immigration permit", until: "20 Dec 2026", status: "ok" } },
    "Jordi Puig": {
      "PRL safety training certificate": { name: "PRL safety training certificate", until: "15 Oct 2026", status: "warn", note: "PRL certificate expires 15 Oct." },
      "Employment contract": puig ? { name: "Employment contract", until: puig.end ?? "Permanent", status: "ok" } : { name: "Employment contract", until: "31 Oct 2026", status: "warn", note: "Fixed-term contract ends" },
    },
    "Marc Torres": { "Employment contract": torres ? { name: "Employment contract", until: torres.end ?? "Permanent", status: "ok" } : { name: "Employment contract", until: "30 Nov 2026", status: "warn", note: "Contract ends 30 Nov. Start renewal." } },
    "Mehdi Benali": { "Residence and work permit": benali
      ? { name: "Residence and work permit", until: benali.end ?? "—", status: "ok", note: "Approved today" }
      : { name: "Residence and work permit", until: "—", status: "pending", note: "Work permit awaiting Govern decision" } },
    "Carlos Méndez": { "Residence and work permit": { name: "Residence and work permit", until: mendez?.start === "approved" ? mendez.end ?? "30 Nov 2026" : "30 Nov 2026", status: "ok", note: mendez?.start === "submitted" ? "Renewal submitted" : mendez ? undefined : "Renewal window open" }, "Employment contract": { name: "Employment contract", until: "31 Mar 2027", status: "ok" } },
    "Élodie Martin": { "Posting form SE 130-01": { name: "Posting form SE 130-01", until: "15 Feb 2027", status: "ok" }, "Immigration permit": { name: "Immigration permit", until: "15 Feb 2027", status: "ok" } },
    "Ana Soler": { "Employment contract": { name: "Employment contract", until: "Permanent", status: "ok" } },
    "Sandra Ruiz": { "Employment contract": { name: "Employment contract", until: "Permanent", status: "ok" } },
  };

  const named = d.workers.filter((w) => w.site === site.name).map((w) => buildRow(w.name, w.role, w.company, w.nat, issues[w.name] ?? {}, true));
  const boardExtra = (d.siteBoard.find((b) => b.name === site.name)?.workers ?? []).filter((w) => BOARD_EXTRA[w.name])
    .map((w) => { const [n, role, company, nat] = BOARD_EXTRA[w.name]; return buildRow(n, role, company, nat, {}, true); });
  const fill = FILL[site.id].map(([n, role, company, nat]) => buildRow(n, role, company, nat, {}, false));
  const order: Status[] = ["bad", "pending", "warn", "ok"];
  const register = [...named, ...boardExtra, ...fill].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || Number(b.named) - Number(a.named));

  const count = (s: Status) => register.filter((w) => w.status === s).length;
  const employers = Object.entries(
    register.reduce<Record<string, number>>((a, w) => ({ ...a, [w.company]: (a[w.company] ?? 0) + 1 }), {}),
  ).map(([company, workers]) => {
    const rows = register.filter((w) => w.company === company);
    const docs = rows.flatMap((w) => w.docs);
    const valid = docs.filter((x) => x.status === "ok").length;
    return { company, workers, ...EMPLOYERS[company], docs: docs.length, valid, pct: Math.round((valid / docs.length) * 100) };
  }).sort((a, b) => Number(a.foreign) - Number(b.foreign) || b.workers - a.workers);

  const openIssues = d.actionQueue.filter((q) => q.site === site.name).map((q) => ({
    ...q,
    taken: (q.severity === "overdue" && q.when === "Blocked") || q.issue.startsWith("Contract ended")
      ? "Site access blocked automatically; worker cannot check in until resolved."
      : "Reminder sent to the employer; renewal tracked on the calendar.",
  }));

  const days = accessDays().slice(-7);
  const share = (accessBySite(1000).find((s) => s.site === site.name)?.staff ?? 12) / 52;
  const daily = days.map((x) => ({ ...x, n: Math.round(x.n * share) }));
  const events = ACCESS_EVENTS.filter((e) => e.site === site.name);

  const audit = [
    ...d.activity.filter((a) => a.vars?.name && register.some((w) => w.name === a.vars!.name)).map((a) => ({ time: "8 Oct 2026", text: a.text, vars: a.vars, by: "Demo admin" })),
    ...events.filter((e) => e.kind !== "in").map((e) => ({ time: e.time, text: e.kind === "blocked" ? "Check-in refused for {name}: {reason}" : "Access override for {name}: {reason}", vars: { name: e.who, reason: e.reason }, by: e.by })),
  ];

  return {
    site, register, employers, openIssues, daily, events, audit,
    totals: { workers: register.length, ok: count("ok"), warn: count("warn"), bad: count("bad"), pending: count("pending"), docs: register.reduce((a, w) => a + w.docs.length, 0), validDocs: register.reduce((a, w) => a + w.docs.filter((x) => x.status === "ok").length, 0) },
  };
}
export type InspectionPack = ReturnType<typeof inspectionPack>;
