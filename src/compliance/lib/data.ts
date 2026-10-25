// Sample data lifted from the renderVals() blocks of the .dc.html screens.
// It doubles as a spec for what each view will need from the API.

export type Status = "ok" | "warn" | "bad" | "pending";

// The sample data was written as if today were Thursday 8 October 2026. The demo moves every date so that
// "today" is the real date: see demoDate() and shiftDates() in ./i18n.ts.
export const SITES = ["Escaldes-Engordany", "La Massana", "Andorra la Vella", "Encamp"] as const;
export const COMPANIES = ["Grupo Heracles", "Grues Pirineu SL", "Obras Lusitânia Lda", "BTP Ariège SARL"] as const;

export const initials = (name: string) => {
  const clean = name.replace(/[\[\]]/g, "").trim();
  if (!clean.includes(" ") && clean.length <= 3) return clean.toUpperCase();
  return clean.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
};

/* ---------------- Dashboard ---------------- */

export const kpis = [
  { label: "On site today", value: "46", meta: "of 52 assigned across 4 sites", href: "/compliance-demo/site-access" },
  { label: "Fully compliant", value: "88%", meta: "+3 pts vs last month", progress: 88, href: "/compliance-demo/workers" },
  { label: "Expiring in 30 days", value: "7", meta: "3 contracts · 3 documents · 1 permit", tone: "warn" as const, href: "/compliance-demo/calendar" },
  { label: "Access blocked", value: "3", meta: "Workers who can’t enter a site today", tone: "bad" as const, href: "/compliance-demo/site-access" },
  { label: "Permits in progress", value: "4", meta: "2 awaiting Govern decision", href: "/compliance-demo/permits" },
];

export type QueueItem = {
  worker: string; issue: string; site: string; company: string; when: string;
  severity: "overdue" | "soon"; action: string; kind: "Contract" | "Document" | "Permit";
};

export const actionQueue: QueueItem[] = [
  { worker: "Antoni Vidal", issue: "Contract ended 3 Oct, still assigned to site", site: "Encamp", company: "Grues Pirineu SL", when: "5 days overdue", severity: "overdue", action: "Renew contract", kind: "Contract" },
  { worker: "Tiago Sousa", issue: "Accident insurance certificate missing", site: "Encamp", company: "Obras Lusitânia Lda", when: "Blocked", severity: "overdue", action: "Request document", kind: "Document" },
  { worker: "Mehdi Benali", issue: "Work permit awaiting Govern decision", site: "Escaldes-Engordany", company: "Grupo Heracles", when: "Blocked", severity: "overdue", action: "View application", kind: "Permit" },
  { worker: "Rui Carvalho", issue: "Medical fitness check expires", site: "La Massana", company: "Obras Lusitânia Lda", when: "In 4 days", severity: "soon", action: "Book check", kind: "Document" },
  { worker: "Jordi Puig", issue: "PRL safety certificate expires", site: "Andorra la Vella", company: "Grupo Heracles", when: "In 7 days", severity: "soon", action: "Upload new", kind: "Document" },
  { worker: "Jordi Puig", issue: "Fixed-term contract ends", site: "Andorra la Vella", company: "Grupo Heracles", when: "In 23 days", severity: "soon", action: "Start renewal", kind: "Contract" },
  { worker: "Carlos Méndez", issue: "Residence and work permit renewal window opens", site: "Escaldes-Engordany", company: "Grupo Heracles", when: "In 22 days", severity: "soon", action: "Start renewal", kind: "Permit" },
  { worker: "Marc Torres", issue: "Fixed-term contract ends", site: "Andorra la Vella", company: "Grupo Heracles", when: "In 53 days", severity: "soon", action: "Start renewal", kind: "Contract" },
  { worker: "Élodie Martin", issue: "Posting form SE 130-01 renewal", site: "Escaldes-Engordany", company: "BTP Ariège SARL", when: "In 130 days", severity: "soon", action: "Remind employer", kind: "Document" },
];

export const siteCompliance = [
  { name: "Escaldes-Engordany", pct: 93, detail: "14 of 15 workers · 1 permit pending" },
  { name: "La Massana", pct: 92, detail: "11 of 12 workers · 1 expiring" },
  { name: "Andorra la Vella", pct: 85, detail: "11 of 13 workers · 2 expiring" },
  { name: "Encamp", pct: 75, detail: "9 of 12 workers · 2 blocked" },
];

export const expiryWeeks = [2, 3, 1, 4, 2, 0, 3, 1, 2, 5, 1, 2, 3].map((n, i) => ({
  n,
  label: ["12 Oct", "19 Oct", "26 Oct", "2 Nov", "9 Nov", "16 Nov", "23 Nov", "30 Nov", "7 Dec", "14 Dec", "21 Dec", "28 Dec", "4 Jan"][i],
}));

export const activity = [
  { ini: "AS", text: "Ana Soler uploaded a PRL certificate for Marc Torres", time: "Today, 09:42" },
  { ini: "SY", text: "Access blocked automatically for Antoni Vidal (contract ended)", time: "Today, 07:00", system: true },
  { ini: "SR", text: "Sandra Ruiz submitted a permit application for Mehdi Benali", time: "Yesterday, 16:18" },
  { ini: "CM", text: "Carlos Méndez checked in 11 workers at Escaldes-Engordany", time: "Yesterday, 07:35" },
  { ini: "SY", text: "Reminder sent to Obras Lusitânia Lda for 2 missing documents", time: "5 Oct, 08:00", system: true },
];

/* ---------------- Workers ---------------- */

export type Worker = {
  id: string; name: string; role: string; company: string; nat: string; site: string;
  ends: string; docs: string; status: Status; permit: string; note: string;
};

export const workers: Worker[] = [
  { id: "carlos-mendez", name: "Carlos Méndez", role: "Site foreman", company: "Grupo Heracles", nat: "Spain", site: "Escaldes-Engordany", ends: "31 Mar 2027", docs: "9/9", status: "ok", permit: "Work & residence", note: "Nothing to do. All documents valid." },
  { id: "jordi-puig", name: "Jordi Puig", role: "Electrician", company: "Grupo Heracles", nat: "Andorra", site: "Andorra la Vella", ends: "31 Oct 2026", docs: "8/9", status: "warn", permit: "Not required", note: "PRL certificate expires 15 Oct; contract ends 31 Oct." },
  { id: "antoni-vidal", name: "Antoni Vidal", role: "Crane operator", company: "Grues Pirineu SL", nat: "Spain", site: "Encamp", ends: "3 Oct 2026", docs: "7/9", status: "bad", permit: "Foreign company worker", note: "Contract ended 3 Oct. Site access blocked automatically." },
  { id: "rui-carvalho", name: "Rui Carvalho", role: "Formwork carpenter", company: "Obras Lusitânia Lda", nat: "Portugal", site: "La Massana", ends: "20 Dec 2026", docs: "9/10", status: "warn", permit: "Foreign company worker", note: "Medical fitness check expires 12 Oct." },
  { id: "ana-soler", name: "Ana Soler", role: "Safety officer", company: "Grupo Heracles", nat: "Spain", site: "La Massana", ends: "Permanent", docs: "9/9", status: "ok", permit: "Work & residence", note: "Nothing to do. All documents valid." },
  { id: "mehdi-benali", name: "Mehdi Benali", role: "Steel fixer", company: "Grupo Heracles", nat: "Morocco", site: "Escaldes-Engordany", ends: "30 Jun 2027", docs: "6/9", status: "pending", permit: "Application submitted", note: "Cannot start until the Govern approves his work permit." },
  { id: "marc-torres", name: "Marc Torres", role: "Plumber", company: "Grupo Heracles", nat: "Andorra", site: "Andorra la Vella", ends: "30 Nov 2026", docs: "9/9", status: "warn", permit: "Not required", note: "Contract ends 30 Nov. Start renewal." },
  { id: "elodie-martin", name: "Élodie Martin", role: "Site engineer", company: "BTP Ariège SARL", nat: "France", site: "Escaldes-Engordany", ends: "15 Feb 2027", docs: "10/10", status: "ok", permit: "Foreign company worker", note: "Nothing to do. All documents valid." },
  { id: "sandra-ruiz", name: "Sandra Ruiz", role: "Project coordinator", company: "Grupo Heracles", nat: "Spain", site: "La Massana", ends: "Permanent", docs: "9/9", status: "ok", permit: "Work & residence", note: "Nothing to do. All documents valid." },
  { id: "tiago-sousa", name: "Tiago Sousa", role: "Labourer", company: "Obras Lusitânia Lda", nat: "Portugal", site: "Encamp", ends: "20 Dec 2026", docs: "8/10", status: "bad", permit: "Foreign company worker", note: "Accident insurance certificate missing. Access blocked." },
];

export const workerViews = [
  { id: "all", label: "All workers", count: 52 },
  { id: "warn", label: "Expiring", count: 7 },
  { id: "bad", label: "Blocked & pending", count: 4 },
  { id: "foreign", label: "Foreign company workers", count: 18 },
];

/* ---------------- Worker profile (Rui Carvalho) ---------------- */

export const profileDocs = [
  { name: "Passport", note: "Apostilled copy on file", exp: "14 Mar 2031", status: "ok" as Status, action: "View", blocks: true },
  { name: "Employment contract", note: "With Obras Lusitânia Lda", exp: "20 Dec 2026", status: "ok" as Status, action: "View", blocks: true },
  { name: "Proof of link to foreign employer", note: "Company certificate", exp: "20 Dec 2026", status: "ok" as Status, action: "View", blocks: true },
  { name: "Social security posting form P/AND-2", note: "Issued in Portugal", exp: "20 Nov 2026", status: "ok" as Status, action: "View", blocks: true },
  { name: "Social security posting form P/AND-3", note: "Issued in Portugal", exp: "20 Nov 2026", status: "ok" as Status, action: "View", blocks: true },
  { name: "Immigration permit", note: "Temporary · foreign company worker", exp: "20 Dec 2026", status: "ok" as Status, action: "View", blocks: true },
  { name: "Proof of accommodation in Andorra", note: "Rental contract, Ordino", exp: "31 Dec 2026", status: "ok" as Status, action: "View", blocks: false },
  { name: "PRL safety training certificate", note: "Formwork and work at height", exp: "2 Jun 2027", status: "ok" as Status, action: "View", blocks: true },
  { name: "Medical fitness check", note: "Annual occupational check", exp: "12 Oct 2026", status: "warn" as Status, action: "Request new", blocks: true },
  { name: "Site induction · La Massana", note: "Signed on arrival", exp: "31 Dec 2026", status: "ok" as Status, action: "View", blocks: false },
];

export const profileHistory = [
  { time: "8 Oct · 07:41", text: "Checked in at La Massana by Ana Soler", actor: "Ana Soler" },
  { time: "5 Oct · 08:00", text: "Automatic reminder sent to Obras Lusitânia Lda: medical check expiring", actor: "System" },
  { time: "14 Jul · 11:20", text: "Immigration permit approved, valid until 20 Dec 2026", actor: "System" },
  { time: "9 Jun · 15:02", text: "Permit application submitted by Sandra Ruiz", actor: "Sandra Ruiz" },
  { time: "2 Jun · 10:15", text: "Worker created from subcontractor portal upload", actor: "Obras Lusitânia Lda" },
];

/* ---------------- Permits ---------------- */

export const permitStages = [
  { id: "all", label: "All", count: 18 },
  { id: "draft", label: "Draft", count: 1 },
  { id: "submitted", label: "Submitted", count: 2 },
  { id: "approved", label: "Approved", count: 13 },
  { id: "renewal", label: "Renewal due", count: 2 },
];

export const permits = [
  { name: "Tiago Sousa", company: "Obras Lusitânia Lda", nat: "Portugal", type: "Temporary · foreign company worker", stage: "Draft", key: "draft", valid: "—", next: "Collect 2 documents from employer" },
  { name: "Mehdi Benali", company: "Grupo Heracles", nat: "Morocco", type: "Residence and work", stage: "Submitted", key: "submitted", valid: "—", next: "Awaiting Govern decision" },
  { name: "Lucas Bernard", company: "BTP Ariège SARL", nat: "France", type: "Temporary · foreign company worker", stage: "Submitted", key: "submitted", valid: "—", next: "Awaiting Govern decision" },
  { name: "Rui Carvalho", company: "Obras Lusitânia Lda", nat: "Portugal", type: "Temporary · foreign company worker", stage: "Approved", key: "approved", valid: "20 Dec 2026", next: "None" },
  { name: "Élodie Martin", company: "BTP Ariège SARL", nat: "France", type: "Temporary · foreign company worker", stage: "Approved", key: "approved", valid: "15 Feb 2027", next: "None" },
  { name: "Carlos Méndez", company: "Grupo Heracles", nat: "Spain", type: "Residence and work", stage: "Renewal due", key: "renewal", valid: "30 Nov 2026", next: "Start renewal before 31 Oct" },
  { name: "Antoni Vidal", company: "Grues Pirineu SL", nat: "Spain", type: "Temporary · foreign company worker", stage: "Renewal due", key: "renewal", valid: "3 Oct 2026", next: "Extend with new contract" },
];

export const permitChecklist = [
  { name: "Official application form", note: "Signed by the worker and the Andorran client", done: true },
  { name: "Passport", note: "Apostilled or legalised copy", done: true },
  { name: "Link to the foreign employer and employment contract", note: "Employer activity must match the works", done: true },
  { name: "Social security posting forms P/AND-2 and P/AND-3", note: "Or insurance covering 100% of medical and work-accident costs", done: false },
  { name: "Proof of accommodation in Andorra", note: "Rental contract or host declaration", done: false },
  { name: "Description of the works and site address", note: "Pulled from the La Massana project", done: true },
  { name: "Client company registration", note: "Grupo Heracles, on file", done: true },
];

/* ---------------- Site access ---------------- */

export const siteBoard = [
  { name: "Escaldes-Engordany", project: "Office refurbishment · 4 floors", assigned: 14, capacity: 15, workers: [
    { name: "Mehdi Benali", role: "Steel fixer", status: "bad" as Status, detail: "permit pending" },
    { name: "Carlos Méndez", role: "Site foreman", status: "ok" as Status, detail: "all valid" },
    { name: "Élodie Martin", role: "Site engineer", status: "ok" as Status, detail: "all valid" },
  ] },
  { name: "La Massana", project: "Residential block · 24 units", assigned: 11, capacity: 12, workers: [
    { name: "Rui Carvalho", role: "Formwork carpenter", status: "warn" as Status, detail: "medical expires 12 Oct" },
    { name: "Ana Soler", role: "Safety officer", status: "ok" as Status, detail: "all valid" },
    { name: "Sandra Ruiz", role: "Project coordinator", status: "ok" as Status, detail: "all valid" },
  ] },
  { name: "Andorra la Vella", project: "Retail fit-out · Av. Meritxell", assigned: 11, capacity: 13, workers: [
    { name: "Jordi Puig", role: "Electrician", status: "warn" as Status, detail: "PRL expires 15 Oct" },
    { name: "Marc Torres", role: "Plumber", status: "warn" as Status, detail: "contract ends 30 Nov" },
    { name: "Pau Serra", role: "Electrician", status: "ok" as Status, detail: "all valid" },
  ] },
  { name: "Encamp", project: "Hotel extension · phase 2", assigned: 9, capacity: 12, workers: [
    { name: "Antoni Vidal", role: "Crane operator", status: "bad" as Status, detail: "contract ended 3 Oct" },
    { name: "Tiago Sousa", role: "Labourer", status: "bad" as Status, detail: "insurance missing" },
    { name: "Nuno Pereira", role: "Labourer", status: "ok" as Status, detail: "all valid" },
  ] },
];

/* ---------------- Calendar ---------------- */

export type EventType = "contract" | "document" | "permit";
export const calendarEvents: Record<number, { type: EventType; short: string; title: string; who: string }[]> = {
  3: [{ type: "contract", short: "A. Vidal contract", title: "Contract ended", who: "Antoni Vidal · Grues Pirineu SL · Encamp" }],
  12: [{ type: "document", short: "R. Carvalho medical", title: "Medical fitness check expires", who: "Rui Carvalho · Obras Lusitânia Lda · La Massana" }],
  15: [{ type: "document", short: "J. Puig PRL cert", title: "PRL safety certificate expires", who: "Jordi Puig · Grupo Heracles · Andorra la Vella" }],
  20: [{ type: "document", short: "Encamp inductions", title: "Site induction refresh due", who: "12 workers · Encamp" }],
  23: [{ type: "permit", short: "M. Benali decision", title: "Expected Govern decision on work permit", who: "Mehdi Benali · Grupo Heracles" }],
  27: [{ type: "document", short: "T. Sousa insurance", title: "Insurance certificate deadline set for employer", who: "Tiago Sousa · Obras Lusitânia Lda" }],
  30: [{ type: "permit", short: "C. Méndez renewal", title: "Start residence and work permit renewal", who: "Carlos Méndez · Grupo Heracles" }],
  31: [{ type: "contract", short: "J. Puig contract", title: "Fixed-term contract ends", who: "Jordi Puig · Grupo Heracles" }],
};

/* ---------------- Documents ---------------- */

export const docCategories = [
  { id: "all", label: "All documents", count: 412 },
  { id: "contracts", label: "Contracts", count: 64 },
  { id: "id", label: "ID & residence", count: 88 },
  { id: "permits", label: "Permits", count: 18 },
  { id: "social", label: "Social security forms", count: 36 },
  { id: "prl", label: "PRL & training", count: 97 },
  { id: "medical", label: "Medical", count: 52 },
  { id: "insurance", label: "Insurance", count: 57 },
];

export const documents = [
  { name: "Employment contract", file: "contract_vidal_2026.pdf", worker: "Antoni Vidal", cat: "contracts", exp: "3 Oct 2026", issued: "3 Apr 2026", status: "bad" as Status, by: "Grues Pirineu SL", use: "Site access, Encamp", confirmed: true },
  { name: "Medical fitness check", file: "medical_carvalho.pdf", worker: "Rui Carvalho", cat: "medical", exp: "12 Oct 2026", issued: "12 Oct 2025", status: "warn" as Status, by: "Obras Lusitânia Lda", use: "Site access, La Massana", confirmed: false },
  { name: "PRL safety certificate", file: "prl_puig_electrical.pdf", worker: "Jordi Puig", cat: "prl", exp: "15 Oct 2026", issued: "15 Oct 2024", status: "warn" as Status, by: "Ana Soler", use: "Site access, Andorra la Vella", confirmed: true },
  { name: "Posting form P/AND-3", file: "pand3_carvalho.pdf", worker: "Rui Carvalho", cat: "social", exp: "20 Nov 2026", issued: "1 Jun 2026", status: "ok" as Status, by: "Obras Lusitânia Lda", use: "Immigration permit", confirmed: true },
  { name: "Immigration permit", file: "permit_carvalho.pdf", worker: "Rui Carvalho", cat: "permits", exp: "20 Dec 2026", issued: "14 Jul 2026", status: "ok" as Status, by: "Sandra Ruiz", use: "Site access, all sites", confirmed: true },
  { name: "Proof of accommodation", file: "lease_ordino.pdf", worker: "Rui Carvalho", cat: "id", exp: "31 Dec 2026", issued: "1 Jun 2026", status: "ok" as Status, by: "Obras Lusitânia Lda", use: "Immigration permit", confirmed: true },
  { name: "Passport", file: "passport_martin.jpg", worker: "Élodie Martin", cat: "id", exp: "9 May 2032", issued: "9 May 2022", status: "ok" as Status, by: "BTP Ariège SARL", use: "Immigration permit", confirmed: true },
  { name: "Posting form SE 130-01", file: "se13001_martin.pdf", worker: "Élodie Martin", cat: "social", exp: "15 Feb 2027", issued: "1 Sep 2026", status: "ok" as Status, by: "BTP Ariège SARL", use: "Immigration permit", confirmed: true },
];

/* ---------------- Settings ---------------- */

const yes = true, no = false;
export const ruleSets = [
  { name: "Portugal · foreign company worker · construction", when: "Nationality is Portugal and employer is a foreign company", nat: "Nationality is Portugal", emp: "Employer is a foreign company", docs: 10, workers: 9, items: [
    { name: "Passport (apostilled copy)", remind: "90 days", blocks: yes },
    { name: "Employment contract with foreign employer", remind: "30 days", blocks: yes },
    { name: "Proof of link to foreign employer", remind: "30 days", blocks: yes },
    { name: "Posting forms P/AND-2 and P/AND-3", remind: "45 days", blocks: yes },
    { name: "Immigration permit", remind: "60 days", blocks: yes },
    { name: "Proof of accommodation in Andorra", remind: "30 days", blocks: no },
    { name: "PRL safety training certificate", remind: "30 days", blocks: yes },
    { name: "Medical fitness check", remind: "30 days", blocks: yes },
  ] },
  { name: "Spain · foreign company worker · construction", when: "Nationality is Spain and employer is a foreign company", nat: "Nationality is Spain", emp: "Employer is a foreign company", docs: 10, workers: 6, items: [
    { name: "National ID or passport", remind: "90 days", blocks: yes },
    { name: "Employment contract with foreign employer", remind: "30 days", blocks: yes },
    { name: "Posting forms E-AND-28 and E/AND.101", remind: "45 days", blocks: yes },
    { name: "Immigration permit", remind: "60 days", blocks: yes },
    { name: "PRL safety training certificate", remind: "30 days", blocks: yes },
    { name: "Medical fitness check", remind: "30 days", blocks: yes },
  ] },
  { name: "France · foreign company worker · construction", when: "Nationality is France and employer is a foreign company", nat: "Nationality is France", emp: "Employer is a foreign company", docs: 10, workers: 3, items: [
    { name: "National ID or passport", remind: "90 days", blocks: yes },
    { name: "Employment contract with foreign employer", remind: "30 days", blocks: yes },
    { name: "Posting forms SE 130-01 and SE 130-08", remind: "45 days", blocks: yes },
    { name: "Immigration permit", remind: "60 days", blocks: yes },
    { name: "PRL safety training certificate", remind: "30 days", blocks: yes },
  ] },
  { name: "Direct employee · Grupo Heracles", when: "Employer is Grupo Heracles", nat: "Nationality is any", emp: "Employer is Grupo Heracles", docs: 9, workers: 31, items: [
    { name: "Employment contract", remind: "30 days", blocks: yes },
    { name: "Residence and work permit (non-Andorran)", remind: "60 days", blocks: yes },
    { name: "CASS registration", remind: "—", blocks: yes },
    { name: "PRL safety training certificate", remind: "30 days", blocks: yes },
    { name: "Medical fitness check", remind: "30 days", blocks: yes },
  ] },
];

export const users = [
  { name: "Demo admin", email: "Setup key (owner)", role: "Admin", sites: "All", last: "Now" },
  { name: "Sandra Ruiz", email: "Access key", role: "Compliance", sites: "All", last: "Today" },
  { name: "Ana Soler", email: "Access key", role: "Site manager", sites: "La Massana", last: "Today" },
  { name: "Carlos Méndez", email: "Access key", role: "Site manager", sites: "Escaldes-Engordany", last: "Yesterday" },
  { name: "Obras Lusitânia Lda", email: "Access key", role: "Subcontractor", sites: "La Massana, Encamp", last: "5 Oct" },
];

export const permissions = [
  { name: "View workers", a: "All", c: "All", s: "Own sites", x: "Own staff" },
  { name: "Upload documents", a: true, c: true, s: true, x: true },
  { name: "Confirm document dates", a: true, c: true, s: false, x: false },
  { name: "Override site access", a: true, c: true, s: false, x: false },
  { name: "Edit document rules", a: true, c: false, s: false, x: false },
];

export const notifications = [
  { name: "Document or contract expiring", to: "Compliance team and the worker’s employer", email: true, app: true, sms: false },
  { name: "Site access blocked", to: "Site manager of that site", email: true, app: true, sms: true },
  { name: "Permit decision received", to: "Compliance team", email: true, app: true, sms: false },
  { name: "Subcontractor uploaded documents", to: "Compliance team", email: false, app: true, sms: false },
  { name: "Weekly compliance summary", to: "Admins", email: true, app: false, sms: false },
];

export const integrations = [
  { name: "CSV import", desc: "Upload workers and contracts from a spreadsheet", status: "Available", action: "Import file" },
  { name: "Payroll / ERP", desc: "Sync worker and contract dates nightly, read only", status: "Not connected", action: "Connect" },
  { name: "CAE platforms", desc: "Send valid documents to the platforms your clients require", status: "Not connected", action: "Connect" },
  { name: "Calendar feed", desc: "Deadlines in Outlook or Google Calendar", status: "Connected", action: "Manage" },
  { name: "Email", desc: "Send reminders from your own domain", status: "Connected", action: "Manage" },
  { name: "API & webhooks", desc: "For your own systems", status: "Available", action: "View keys" },
];

/* ---------------- Notification tray ---------------- */

export const inbox = [
  { title: "Access blocked: Antoni Vidal", body: "Contract ended 3 Oct · Encamp", time: "07:00", tone: "bad" as Status },
  { title: "Medical check expiring", body: "Rui Carvalho · in 4 days", time: "Yesterday", tone: "warn" as Status },
  { title: "Obras Lusitânia uploaded 2 documents", body: "Awaiting date confirmation", time: "Yesterday", tone: "pending" as Status },
  { title: "Permit submitted", body: "Mehdi Benali · Residence and work", time: "6 Oct", tone: "pending" as Status },
];

/* ---------------- Contracts (not yet designed — derived from data model) ---------------- */

export const contracts = [
  { worker: "Antoni Vidal", type: "Employment · fixed term", parties: "Grues Pirineu SL → Antoni Vidal", start: "3 Apr 2026", end: "3 Oct 2026", status: "bad" as Status, label: "Ended" },
  { worker: "Jordi Puig", type: "Employment · fixed term", parties: "Grupo Heracles → Jordi Puig", start: "1 Nov 2025", end: "31 Oct 2026", status: "warn" as Status, label: "Ends in 23 days" },
  { worker: "Marc Torres", type: "Employment · fixed term", parties: "Grupo Heracles → Marc Torres", start: "1 Dec 2025", end: "30 Nov 2026", status: "warn" as Status, label: "Ends in 53 days" },
  { worker: "Rui Carvalho", type: "Employment · fixed term", parties: "Obras Lusitânia Lda → Rui Carvalho", start: "2 Jun 2026", end: "20 Dec 2026", status: "ok" as Status, label: "Active" },
  { worker: "—", type: "Subcontract · formwork", parties: "Grupo Heracles → Obras Lusitânia Lda", start: "1 Jun 2026", end: "31 Dec 2026", status: "ok" as Status, label: "Active" },
  { worker: "Élodie Martin", type: "Employment · posted worker", parties: "BTP Ariège SARL → Élodie Martin", start: "1 Sep 2026", end: "15 Feb 2027", status: "ok" as Status, label: "Active" },
  { worker: "Carlos Méndez", type: "Employment · fixed term", parties: "Grupo Heracles → Carlos Méndez", start: "1 Apr 2025", end: "31 Mar 2027", status: "ok" as Status, label: "Active" },
  { worker: "Ana Soler", type: "Employment · permanent", parties: "Grupo Heracles → Ana Soler", start: "15 Jan 2022", end: "—", status: "ok" as Status, label: "Active" },
];

export const workerHref = (name: string) => {
  const w = workers.find((x) => x.name === name);
  return w ? `/compliance-demo/workers/${w.id}` : "/compliance-demo/workers";
};
