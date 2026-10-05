"use client";

import { Button, Field, inputClass, Select } from "./ui";
import { ROLE_NAMES, type MemberRole } from "@/shiftcomply/lib/store";

export function InviteForm({
  email,
  setEmail,
  role,
  setRole,
  onInvite,
}: {
  email: string;
  setEmail: (v: string) => void;
  role: MemberRole;
  setRole: (v: MemberRole) => void;
  onInvite: (email: string, role: MemberRole) => Promise<unknown>;
}) {
  return (
    <form
      className="flex flex-wrap items-end gap-3 border-t border-line px-5 py-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await onInvite(email, role);
        setEmail("");
      }}
    >
      <div className="min-w-[220px] flex-1">
        <Field label="Invite by email">
          <input type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@hotel.com" />
        </Field>
      </div>
      <div className="w-44">
        <Field label="Access">
          <Select value={role} onChange={(v) => setRole(v as MemberRole)}>
            <option value="admin">{ROLE_NAMES.admin}</option>
            <option value="housing_manager">{ROLE_NAMES.housing_manager}</option>
            <option value="viewer">{ROLE_NAMES.viewer}</option>
          </Select>
        </Field>
      </div>
      <Button type="submit">Invite</Button>
    </form>
  );
}

