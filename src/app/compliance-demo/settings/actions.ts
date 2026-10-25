"use server";

// Demo versions of the settings actions. Nothing is saved and no real sign-in keys are created.

import { getT } from "@/compliance/lib/i18n-server";

export type KeyResult = { ok: true; key: string; label: string } | { ok: false; error: string } | null;
export type RevokeResult = { ok: boolean; error?: string } | null;
export type OrgResult = { ok: boolean; message?: string; error?: string } | null;

const ROLES = ["admin", "compliance", "site_manager", "subcontractor"] as const;

export async function createAccessKey(_prev: KeyResult, fd: FormData): Promise<KeyResult> {
  const t = await getT();
  const label = String(fd.get("label") ?? "").trim();
  const role = String(fd.get("role") ?? "") as (typeof ROLES)[number];
  if (!label) return { ok: false, error: t("Give the key a name, e.g. the person it’s for.") };
  if (!ROLES.includes(role)) return { ok: false, error: t("Choose a role.") };
  if (role === "subcontractor" && !String(fd.get("company_id") ?? "")) return { ok: false, error: t("Subcontractor keys need the company whose staff they can see.") };
  // A sample key so the whole flow can be shown. It is not stored and can't be used to sign in.
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const random = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return { ok: true, key: `adv_${random.slice(0, 4)}_${random.slice(4)}`, label };
}

export async function revokeAccessKey(): Promise<RevokeResult> {
  const t = await getT();
  return { ok: false, error: t("Keys can’t be revoked in the demo.") };
}

export async function updateOrganisation(_prev: OrgResult, fd: FormData): Promise<OrgResult> {
  const t = await getT();
  if (!String(fd.get("name") ?? "").trim()) return { ok: false, error: t("Legal name is required.") };
  return { ok: true, message: t("Organisation details checked. This is a demo, so nothing is saved.") };
}
