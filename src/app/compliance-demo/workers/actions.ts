"use server";

// Demo versions of the workforce actions. They check the form exactly like the real app,
// then confirm without saving anything: the public demo only ever shows sample data.

import { parseCsv } from "@/compliance/lib/csv";
import { cookies } from "next/headers";
import { getT } from "@/compliance/lib/i18n-server";
import { workers } from "@/compliance/lib/data";
import { demoToday } from "@/compliance/lib/i18n";
import { RENEWALS_COOKIE, parseRenewals, serializeRenewals, toSampleLabel } from "@/compliance/lib/demo-state";

export type ActionResult = { ok: true; message: string; details?: string[] } | { ok: false; error: string; details?: string[] } | null;


const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/* ───────── Add worker ───────── */

export async function createWorker(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const t = await getT();
  const full_name = text(fd, "full_name");
  if (!full_name) return { ok: false, error: t("Name is required.") };
  if (!text(fd, "nationality")) return { ok: false, error: t("Nationality is required.") };
  if (!text(fd, "company_id")) return { ok: false, error: t("Choose the employer.") };
  return { ok: true, message: `${t("{name} would now be added.", { name: full_name })} ${t("This is a demo, so nothing is saved.")}` };
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
  const t = await getT();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: t("Choose a CSV file.") };
  if (file.size > 2_000_000) return { ok: false, error: t("File is larger than 2 MB.") };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { ok: false, error: t("The file has no data rows.") };

  const header = rows[0].map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? "");
  const colName = (k: string) => t(k.replace("_", " "));
  for (const required of ["full_name", "nationality", "company"]) {
    if (!header.includes(required)) return { ok: false, error: t("Missing column: {col}. Expected: name, role, nationality, company, site.", { col: colName(required) }) };
  }
  const col = (r: string[], k: string) => (r[header.indexOf(k)] ?? "").trim();
  const problems: string[] = [];
  let good = 0;
  rows.slice(1).forEach((r, i) => {
    if (r.every((c) => !c.trim())) return;
    const missing = ["full_name", "nationality", "company"].filter((k) => !col(r, k));
    if (missing.length) problems.push(t("Row {row}: missing {cols}", { row: i + 2, cols: missing.map(colName).join(", ") }));
    else good++;
  });
  if (!good) return { ok: false, error: t("No rows could be read."), details: problems.slice(0, 8) };
  const read = good === 1 ? t("1 worker read from the file and ready to import.") : t("{n} workers read from the file and ready to import.", { n: good });
  return { ok: true, message: `${read} ${t("This is a demo, so nothing is saved.")}`, details: problems.slice(0, 8) };
}

/* ───────── Add employment contract ───────── */

export async function createContract(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const t = await getT();
  const starts_on = text(fd, "starts_on");
  const ends_on = text(fd, "ends_on");
  const worker = workers.find((w) => w.id === text(fd, "worker_id"));
  if (!worker) return { ok: false, error: t("Choose a worker.") };
  if (!text(fd, "title")) return { ok: false, error: t("Give the contract a title.") };
  if (!isDate(starts_on)) return { ok: false, error: t("Start date is required.") };
  if (ends_on && !isDate(ends_on)) return { ok: false, error: t("End date is not valid.") };
  if (ends_on && ends_on < starts_on) return { ok: false, error: t("End date is before the start date.") };
  if (ends_on && ends_on < demoToday().toISOString().slice(0, 10)) return { ok: false, error: t("End date is in the past.") };

  // Kept for this visit only, so the whole demo shows the new contract: status, site access, action queue.
  const jar = await cookies();
  const renewals = parseRenewals(jar.get(RENEWALS_COOKIE)?.value);
  renewals[worker.id] = { start: toSampleLabel(starts_on), end: ends_on ? toSampleLabel(ends_on) : null };
  jar.set(RENEWALS_COOKIE, serializeRenewals(renewals), { path: "/", sameSite: "lax" });
  return { ok: true, message: t("Contract saved for {name}. Site access is updated everywhere.", { name: worker.name }) };
}

/* ───────── Edit worker ───────── */

export async function updateWorker(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const t = await getT();
  if (!text(fd, "id")) return { ok: false, error: t("Missing worker.") };
  if (!text(fd, "full_name")) return { ok: false, error: t("Name is required.") };
  if (!text(fd, "nationality")) return { ok: false, error: t("Nationality is required.") };
  if (!text(fd, "company_id")) return { ok: false, error: t("Choose the employer.") };
  return { ok: true, message: `${t("Changes checked. In the real app, required documents and status are recalculated now.")} ${t("This is a demo, so nothing is saved.")}` };
}

/* ───────── Assign selected workers to a site ───────── */

export async function assignToSite(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const ids = String(fd.get("ids") ?? "").split(",").filter(Boolean);
  const t = await getT();
  const site = text(fd, "site_id");
  if (!ids.length) return { ok: false, error: t("Select at least one worker.") };
  const n = ids.length;
  const what = site
    ? (n === 1 ? t("1 worker would be assigned to {site}.", { site }) : t("{n} workers would be assigned to {site}.", { n, site }))
    : (n === 1 ? t("1 worker would be unassigned.") : t("{n} workers would be unassigned.", { n }));
  return { ok: true, message: `${what} ${t("This is a demo, so nothing is saved.")}` };
}
