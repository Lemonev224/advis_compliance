"use server";

// Demo versions of the workforce actions. They check the form exactly like the real app,
// then confirm without saving anything: the public demo only ever shows sample data.

import { parseCsv } from "@/compliance/lib/csv";

export type ActionResult = { ok: true; message: string; details?: string[] } | { ok: false; error: string; details?: string[] } | null;

const NOT_SAVED = "This is a demo, so nothing is saved.";

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

/* ───────── Add worker ───────── */

export async function createWorker(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const full_name = text(fd, "full_name");
  if (!full_name) return { ok: false, error: "Name is required." };
  if (!text(fd, "nationality")) return { ok: false, error: "Nationality is required." };
  if (!text(fd, "company_id")) return { ok: false, error: "Choose the employer." };
  return { ok: true, message: `${full_name} would now be added. ${NOT_SAVED}` };
}

/* ───────── CSV import ───────── */

const HEADER_ALIASES: Record<string, string> = {
  name: "full_name", "full name": "full_name", full_name: "full_name", worker: "full_name",
  role: "job_title", "job title": "job_title", job_title: "job_title", title: "job_title",
  nationality: "nationality", country: "nationality",
  company: "company", employer: "company",
  site: "site",
};

export async function importWorkersCsv(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a CSV file." };
  if (file.size > 2_000_000) return { ok: false, error: "File is larger than 2 MB." };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { ok: false, error: "The file has no data rows." };

  const header = rows[0].map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? "");
  for (const required of ["full_name", "nationality", "company"]) {
    if (!header.includes(required)) return { ok: false, error: `Missing column: ${required.replace("_", " ")}. Expected: name, role, nationality, company, site.` };
  }
  const col = (r: string[], k: string) => (r[header.indexOf(k)] ?? "").trim();
  const problems: string[] = [];
  let good = 0;
  rows.slice(1).forEach((r, i) => {
    if (r.every((c) => !c.trim())) return;
    const missing = ["full_name", "nationality", "company"].filter((k) => !col(r, k));
    if (missing.length) problems.push(`Row ${i + 2}: missing ${missing.map((m) => m.replace("_", " ")).join(", ")}`);
    else good++;
  });
  if (!good) return { ok: false, error: "No rows could be read.", details: problems.slice(0, 8) };
  return { ok: true, message: `${plural(good, "worker")} read from the file and ready to import. ${NOT_SAVED}`, details: problems.slice(0, 8) };
}

/* ───────── Add employment contract ───────── */

export async function createContract(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const starts_on = text(fd, "starts_on");
  const ends_on = text(fd, "ends_on");
  if (!text(fd, "worker_id")) return { ok: false, error: "Choose a worker." };
  if (!text(fd, "title")) return { ok: false, error: "Give the contract a title." };
  if (!isDate(starts_on)) return { ok: false, error: "Start date is required." };
  if (ends_on && !isDate(ends_on)) return { ok: false, error: "End date is not valid." };
  if (ends_on && ends_on < starts_on) return { ok: false, error: "End date is before the start date." };
  return { ok: true, message: `Contract checked. In the real app, site access dates are recalculated now. ${NOT_SAVED}` };
}

/* ───────── Edit worker ───────── */

export async function updateWorker(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  if (!text(fd, "id")) return { ok: false, error: "Missing worker." };
  if (!text(fd, "full_name")) return { ok: false, error: "Name is required." };
  if (!text(fd, "nationality")) return { ok: false, error: "Nationality is required." };
  if (!text(fd, "company_id")) return { ok: false, error: "Choose the employer." };
  return { ok: true, message: `Changes checked. In the real app, required documents and status are recalculated now. ${NOT_SAVED}` };
}

/* ───────── Assign selected workers to a site ───────── */

export async function assignToSite(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const ids = String(fd.get("ids") ?? "").split(",").filter(Boolean);
  const site = text(fd, "site_id");
  if (!ids.length) return { ok: false, error: "Select at least one worker." };
  return { ok: true, message: `${plural(ids.length, "worker")} would be ${site ? `assigned to ${site}` : "unassigned"}. ${NOT_SAVED}` };
}
