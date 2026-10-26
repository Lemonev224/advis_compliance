"use server";

// Demo versions of the permit actions. Like contracts, the step is kept for this visit only (in the demo-state
// cookie), so the permit's stage, the worker's status, site access and the dashboard all follow it.

import { cookies } from "next/headers";
import { getT } from "@/compliance/lib/i18n-server";
import { permits } from "@/compliance/lib/data";
import { demoToday } from "@/compliance/lib/i18n";
import { PERMIT_KEY, RENEWALS_COOKIE, parseRenewals, serializeRenewals, toSampleLabel } from "@/compliance/lib/demo-state";
import type { ActionResult } from "@/app/compliance-demo/workers/actions";

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/** Sends a renewal (or a completed draft) to the Govern. */
export async function submitPermit(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const t = await getT();
  const permit = permits.find((p) => p.id === text(fd, "permit_id"));
  if (!permit) return { ok: false, error: t("Choose a permit.") };
  if (fd.get("confirm") !== "on") return { ok: false, error: t("Confirm the details are correct before submitting.") };

  const jar = await cookies();
  const state = parseRenewals(jar.get(RENEWALS_COOKIE)?.value);
  state[PERMIT_KEY + permit.id] = { start: "submitted", end: null };
  jar.set(RENEWALS_COOKIE, serializeRenewals(state), { path: "/", sameSite: "lax" });
  return { ok: true, message: t("Renewal submitted for {name}. You'll be told when the Govern decides.", { name: permit.name }) };
}

/** Records the Govern's decision on a submitted application. */
export async function recordDecision(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const t = await getT();
  const permit = permits.find((p) => p.id === text(fd, "permit_id"));
  if (!permit) return { ok: false, error: t("Choose a permit.") };
  const decision = text(fd, "decision");
  if (decision === "info") {
    return { ok: true, message: `${t("The request for more information would be logged and the employer asked for the documents.")} ${t("This is a demo, so nothing is saved.")}` };
  }
  if (decision !== "approved") return { ok: false, error: t("Choose the decision.") };
  const valid = text(fd, "valid_until");
  if (!isDate(valid)) return { ok: false, error: t("Enter the date the permit is valid until.") };
  if (valid <= demoToday().toISOString().slice(0, 10)) return { ok: false, error: t("The valid-until date must be in the future.") };

  const jar = await cookies();
  const state = parseRenewals(jar.get(RENEWALS_COOKIE)?.value);
  state[PERMIT_KEY + permit.id] = { start: "approved", end: toSampleLabel(valid) };
  jar.set(RENEWALS_COOKIE, serializeRenewals(state), { path: "/", sameSite: "lax" });
  return { ok: true, message: t("Permit approved for {name}. Site access is updated everywhere.", { name: permit.name }) };
}
