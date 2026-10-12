"use server";

// Demo versions of the settings actions. Nothing is saved and no real sign-in keys are created.

export type KeyResult = { ok: true; key: string; label: string } | { ok: false; error: string } | null;
export type RevokeResult = { ok: boolean; error?: string } | null;
export type OrgResult = { ok: boolean; message?: string; error?: string } | null;

const ROLES = ["admin", "compliance", "site_manager", "subcontractor"] as const;

export async function createAccessKey(_prev: KeyResult, fd: FormData): Promise<KeyResult> {
  const label = String(fd.get("label") ?? "").trim();
  const role = String(fd.get("role") ?? "") as (typeof ROLES)[number];
  if (!label) return { ok: false, error: "Give the key a name, e.g. the person it’s for." };
  if (!ROLES.includes(role)) return { ok: false, error: "Choose a role." };
  if (role === "subcontractor" && !String(fd.get("company_id") ?? "")) return { ok: false, error: "Subcontractor keys need the company whose staff they can see." };
  return { ok: false, error: `In the real app, ${label} would get a sign-in key with this role now. Keys can’t be created in the demo.` };
}

export async function revokeAccessKey(): Promise<RevokeResult> {
  return { ok: false, error: "Keys can’t be revoked in the demo." };
}

export async function updateOrganisation(_prev: OrgResult, fd: FormData): Promise<OrgResult> {
  if (!String(fd.get("name") ?? "").trim()) return { ok: false, error: "Legal name is required." };
  return { ok: true, message: "Organisation details checked. This is a demo, so nothing is saved." };
}
