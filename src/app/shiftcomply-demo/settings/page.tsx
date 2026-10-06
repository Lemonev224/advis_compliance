"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button, Card, CardHeader, ConfirmModal, Field, inputClass, PageHeader, Select, Td, Th } from "@/shiftcomply/components/ui";
import { RoomBadge } from "@/shiftcomply/components/status";
import { InviteForm } from "@/shiftcomply/components/team";
import { ROLE_NAMES, useStore, type MemberRole } from "@/shiftcomply/lib/store";
import { roomStatus } from "@/shiftcomply/lib/derive";
import { useI18n } from "@/shiftcomply/lib/i18n";


function HotelDetails() {
  const { hotel, updateHotel, myRole } = useStore();
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: hotel?.name ?? "",
    location: hotel?.location ?? "",
    reminderEmail: hotel?.reminderEmail ?? "",
    seasonLabel: hotel?.seasonLabel ?? "",
    seasonStart: hotel?.seasonStart ?? "",
    seasonEnd: hotel?.seasonEnd ?? "",
  });
  const isAdmin = myRole === "admin";
  return (
    <Card>
      <CardHeader title={t("Hotel details")} />
      <form
        className="space-y-4 px-5 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          updateHotel({ ...form, seasonStart: form.seasonStart || null, seasonEnd: form.seasonEnd || null });
        }}
      >
        <Field label={t("Hotel name")}>
          <input className={inputClass} disabled={!isAdmin} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={t("Location")}>
          <input className={inputClass} disabled={!isAdmin} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t("Season")}>
            <input
              className={inputClass}
              disabled={!isAdmin}
              value={form.seasonLabel}
              placeholder={t("Winter 2026/27")}
              onChange={(e) => setForm({ ...form, seasonLabel: e.target.value })}
            />
          </Field>
          <Field label={t("Season starts")}>
            <input type="date" className={inputClass} disabled={!isAdmin} value={form.seasonStart} onChange={(e) => setForm({ ...form, seasonStart: e.target.value })} />
          </Field>
          <Field label={t("Season ends")}>
            <input type="date" className={inputClass} disabled={!isAdmin} value={form.seasonEnd} onChange={(e) => setForm({ ...form, seasonEnd: e.target.value })} />
          </Field>
        </div>
        <Field label={t("Email for reminders")} hint={t("Where contract, checkout and document reminders will be sent.")}>
          <input
            type="email"
            className={inputClass}
            disabled={!isAdmin}
            value={form.reminderEmail}
            onChange={(e) => setForm({ ...form, reminderEmail: e.target.value })}
          />
        </Field>
        {isAdmin && (
          <Button type="submit" variant="primary" disabled={form.name.trim().length < 2}>
            {t("Save changes")}
          </Button>
        )}
      </form>
    </Card>
  );
}

function Rooms() {
  const { rooms, employees, addRoom, deleteRoom, canEdit } = useStore();
  const { t } = useI18n();
  const [form, setForm] = useState({ number: "", floor: "1", type: "Single" as "Single" | "Double", building: t("Staff residence") });
  // The building is shown translated; save it under the existing building's name when it matches one.
  const buildingName = (shown: string) => rooms.map((r) => r.building).find((b) => t(b) === shown) ?? shown;
  return (
    <Card>
      <CardHeader title={t("Staff rooms")} description={t("{n} rooms", { n: rooms.length })} />
      {canEdit && (
        <form
          className="flex flex-wrap items-end gap-3 border-t border-line px-5 py-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await addRoom({ number: form.number.trim(), floor: Number(form.floor) || 0, type: form.type, building: buildingName(form.building.trim()) });
            setForm((f) => ({ ...f, number: "" }));
          }}
        >
          <div className="w-28">
            <Field label={t("Room number")}>
              <input
                required
                className={inputClass}
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                placeholder={t("e.g. {example}", { example: "204" })}
              />
            </Field>
          </div>
          <div className="w-20">
            <Field label={t("Floor")}>
              <input type="number" className={inputClass} value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            </Field>
          </div>
          <div className="w-32">
            <Field label={t("Type")}>
              <Select value={form.type} onChange={(v) => setForm({ ...form, type: v as "Single" | "Double" })}>
                <option value="Single">{t("Single")}</option>
                <option value="Double">{t("Double")}</option>
              </Select>
            </Field>
          </div>
          <div className="w-48">
            <Field label={t("Building")}>
              <input className={inputClass} value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" variant="primary" disabled={!form.number.trim()}>
            {t("Add room")}
          </Button>
        </form>
      )}
      {rooms.length > 0 && (
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0">
              <tr>
                <Th>{t("Room")}</Th>
                <Th>{t("Floor")}</Th>
                <Th>{t("Type")}</Th>
                <Th>{t("Building")}</Th>
                <Th>{t("Status")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => {
                const st = roomStatus(r, employees).status;
                return (
                  <tr key={r.id}>
                    <Td className="font-medium tabular">{r.id}</Td>
                    <Td className="tabular text-body">{r.floor}</Td>
                    <Td className="text-body">{t(r.type)}</Td>
                    <Td className="text-body">{t(r.building)}</Td>
                    <Td>
                      <RoomBadge status={st} />
                    </Td>
                    <Td className="text-right">
                      {canEdit && st === "vacant" && (
                        <button
                          onClick={() => deleteRoom(r.id)}
                          className="text-muted hover:text-danger"
                          aria-label={t("Remove room {room}", { room: r.id })}
                          title={t("Remove room")}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Team() {
  const { members, invites, invite, cancelInvite, myRole, myUserId, updateMemberRole, removeMember, leaveHotel, hotel } = useStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("housing_manager");
  const [confirm, setConfirm] = useState<null | { kind: "remove"; userId: string; email: string } | { kind: "leave" }>(null);
  const isAdmin = myRole === "admin";
  const adminCount = members.filter((m) => m.role === "admin").length;
  const isLastAdmin = (userId: string) => adminCount <= 1 && members.find((m) => m.userId === userId)?.role === "admin";
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader title={t("Team")} description={t("People who can sign in to this hotel")} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr>
              <Th>{t("Email")}</Th>
              <Th>{t("Access")}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const me = m.userId === myUserId;
              const lastAdmin = isLastAdmin(m.userId);
              return (
                <tr key={m.userId}>
                  <Td className="text-ink">
                    {m.email}
                    {me && <span className="ml-2 text-[12px] text-muted">{t("You")}</span>}
                  </Td>
                  <Td className="w-56 text-body">
                    {isAdmin && !lastAdmin ? (
                      <Select value={m.role} onChange={(v) => updateMemberRole(m.userId, v as MemberRole)} className="h-8">
                        <option value="admin">{t(ROLE_NAMES.admin)}</option>
                        <option value="housing_manager">{t(ROLE_NAMES.housing_manager)}</option>
                        <option value="viewer">{t(ROLE_NAMES.viewer)}</option>
                      </Select>
                    ) : (
                      <span title={lastAdmin ? t("Every hotel needs at least one administrator") : undefined}>{t(ROLE_NAMES[m.role])}</span>
                    )}
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    {me
                      ? !lastAdmin && (
                          <button onClick={() => setConfirm({ kind: "leave" })} className="text-[13px] text-muted hover:text-danger">
                            {t("Leave hotel")}
                          </button>
                        )
                      : isAdmin &&
                        !lastAdmin && (
                          <button
                            onClick={() => setConfirm({ kind: "remove", userId: m.userId, email: m.email })}
                            className="text-[13px] text-muted hover:text-danger"
                          >
                            {t("Remove")}
                          </button>
                        )}
                  </Td>
                </tr>
              );
            })}
            {invites.map((i) => (
              <tr key={i.email}>
                <Td className="text-ink">
                  {i.email}
                  <span className="ml-2 text-[12px] text-muted">{t("Invited, not signed in yet")}</span>
                </Td>
                <Td className="text-body">{t(ROLE_NAMES[i.role])}</Td>
                <Td className="text-right">
                  {isAdmin && (
                    <button onClick={() => cancelInvite(i.email)} className="text-[13px] text-muted hover:text-danger">
                      {t("Cancel invite")}
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAdmin && <InviteForm email={email} setEmail={setEmail} role={role} setRole={setRole} onInvite={invite} />}
      <p className="border-t border-line px-5 py-3 text-[12px] text-muted">
        {t(
          "Administrators manage the team and hotel settings. Housing managers can change rooms, staff and documents. Read only suits an outside advisor such as your gestoria.",
        )}
      </p>

      <ConfirmModal
        open={confirm?.kind === "remove"}
        onClose={() => setConfirm(null)}
        onConfirm={() => (confirm?.kind === "remove" ? removeMember(confirm.userId) : undefined)}
        title={t("Remove from team")}
        confirmLabel={t("Remove")}
      >
        <p>
          {t("{email} will no longer be able to sign in to {hotel}. Their past changes stay in the history.", {
            email: confirm?.kind === "remove" ? confirm.email : "",
            hotel: hotel?.name,
          })}
        </p>
      </ConfirmModal>
      <ConfirmModal
        open={confirm?.kind === "leave"}
        onClose={() => setConfirm(null)}
        onConfirm={leaveHotel}
        title={t("Leave {hotel}", { hotel: hotel?.name })}
        confirmLabel={t("Leave hotel")}
      >
        <p>{t("You will lose access to this hotel. An administrator can invite you again later.")}</p>
      </ConfirmModal>
    </Card>
  );
}

function AccountAndData() {
  const { hotel, myRole, userEmail, members, myHotels, exportHotelData, deleteHotel, deleteMyAccount } = useStore();
  const [confirm, setConfirm] = useState<null | "hotel" | "account">(null);
  const isAdmin = myRole === "admin";
  const soleAdminOf = myHotels.filter((h) => h.role === "admin" && !h.isDemo);
  const blocksAccount = myRole === "admin" && members.filter((m) => m.role === "admin").length <= 1 && !hotel?.isDemo;
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader title={t("Account and data")} description={t("Export, or permanently delete, what is stored")} />
      <div className="divide-y divide-line border-t border-line">
        {isAdmin && (
          <Row
            title={t("Download hotel data")}
            text={t(
              "A file with every record stored for this hotel: staff, contracts, rooms, document details and history. Uploaded files are not included; download those from each employee.",
            )}
            action={<Button onClick={exportHotelData}>{t("Download")}</Button>}
          />
        )}
        {isAdmin && (
          <Row
            title={hotel?.isDemo ? t("Delete demo hotel") : t("Delete this hotel")}
            text={
              hotel?.isDemo
                ? t("Removes the sample hotel. Your own hotel is not affected.")
                : t(
                    "Permanently deletes the hotel for everyone on the team, with all staff records and uploaded files. This cannot be undone.",
                  )
            }
            action={
              <Button variant="danger" onClick={() => setConfirm("hotel")}>
                {t("Delete hotel")}
              </Button>
            }
          />
        )}
        <Row
          title={t("Delete my account")}
          text={
            blocksAccount
              ? t(
                  "You are the only administrator of {hotel}. Make someone else an administrator, or delete the hotel, before deleting your account.",
                  { hotel: hotel?.name },
                )
              : t("Deletes your sign-in ({email}). The hotels you belong to and their data stay with the rest of the team.", {
                  email: userEmail,
                })
          }
          action={
            <Button variant="danger" disabled={blocksAccount} onClick={() => setConfirm("account")}>
              {t("Delete account")}
            </Button>
          }
        />
      </div>

      <ConfirmModal
        open={confirm === "hotel"}
        onClose={() => setConfirm(null)}
        onConfirm={deleteHotel}
        title={t("Delete {hotel}", { hotel: hotel?.name })}
        confirmLabel={t("Delete permanently")}
        confirmText={hotel?.isDemo ? undefined : hotel?.name}
      >
        {hotel?.isDemo ? (
          <p>{t("The demo hotel and its sample data will be removed.")}</p>
        ) : (
          <>
            <p>
              {members.length === 1
                ? t(
                    "This deletes every employee, contract, room, uploaded document and history entry for {hotel}, and removes access for the 1 team member.",
                    { hotel: hotel?.name },
                  )
                : t(
                    "This deletes every employee, contract, room, uploaded document and history entry for {hotel}, and removes access for all {n} team members.",
                    { hotel: hotel?.name, n: members.length },
                  )}
            </p>
            <p className="font-medium text-danger">{t("This cannot be undone. Download the hotel data first if you need a copy.")}</p>
          </>
        )}
      </ConfirmModal>
      <ConfirmModal
        open={confirm === "account"}
        onClose={() => setConfirm(null)}
        onConfirm={deleteMyAccount}
        title={t("Delete my account")}
        confirmLabel={t("Delete my account")}
        confirmText={t("delete")}
      >
        <p>
          {t("Your sign-in for {email} will be deleted and you will be signed out.", { email: userEmail })}
          {soleAdminOf.length > 1 && ` ${t("This applies to every hotel you belong to.")}`}
        </p>
      </ConfirmModal>
    </Card>
  );
}

function Row({ title, text, action }: { title: string; text: string; action: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="max-w-xl">
        <div className="text-[14px] font-medium">{title}</div>
        <p className="mt-0.5 text-[13px] text-muted">{text}</p>
      </div>
      {action}
    </div>
  );
}

export default function SettingsPage() {
  const { userEmail, signOut } = useStore();
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        title={t("Settings")}
        actions={
          <>
            <span className="text-[13px] text-muted">{t("Signed in as {email}", { email: userEmail })}</span>
            <Button onClick={signOut}>{t("Sign out")}</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <HotelDetails />
        <Team />
      </div>
      <div className="mt-4">
        <Rooms />
      </div>
      <div className="mt-4">
        <AccountAndData />
      </div>
    </>
  );
}
