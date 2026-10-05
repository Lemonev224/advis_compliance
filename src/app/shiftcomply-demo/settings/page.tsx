"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button, Card, CardHeader, ConfirmModal, Field, inputClass, PageHeader, Select, Td, Th } from "@/shiftcomply/components/ui";
import { RoomBadge } from "@/shiftcomply/components/status";
import { InviteForm } from "@/shiftcomply/components/team";
import { ROLE_NAMES, useStore, type MemberRole } from "@/shiftcomply/lib/store";
import { roomStatus } from "@/shiftcomply/lib/derive";


function HotelDetails() {
  const { hotel, updateHotel, myRole } = useStore();
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
      <CardHeader title="Hotel details" />
      <form
        className="space-y-4 px-5 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          updateHotel({ ...form, seasonStart: form.seasonStart || null, seasonEnd: form.seasonEnd || null });
        }}
      >
        <Field label="Hotel name">
          <input className={inputClass} disabled={!isAdmin} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Location">
          <input className={inputClass} disabled={!isAdmin} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Season">
            <input
              className={inputClass}
              disabled={!isAdmin}
              value={form.seasonLabel}
              placeholder="Winter 2026/27"
              onChange={(e) => setForm({ ...form, seasonLabel: e.target.value })}
            />
          </Field>
          <Field label="Season starts">
            <input type="date" className={inputClass} disabled={!isAdmin} value={form.seasonStart} onChange={(e) => setForm({ ...form, seasonStart: e.target.value })} />
          </Field>
          <Field label="Season ends">
            <input type="date" className={inputClass} disabled={!isAdmin} value={form.seasonEnd} onChange={(e) => setForm({ ...form, seasonEnd: e.target.value })} />
          </Field>
        </div>
        <Field label="Email for reminders" hint="Where contract, checkout and document reminders will be sent.">
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
            Save changes
          </Button>
        )}
      </form>
    </Card>
  );
}

function Rooms() {
  const { rooms, employees, addRoom, deleteRoom, canEdit } = useStore();
  const [form, setForm] = useState({ number: "", floor: "1", type: "Single" as "Single" | "Double", building: "Staff residence" });
  return (
    <Card>
      <CardHeader title="Staff rooms" description={`${rooms.length} rooms`} />
      {canEdit && (
        <form
          className="flex flex-wrap items-end gap-3 border-t border-line px-5 py-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await addRoom({ number: form.number.trim(), floor: Number(form.floor) || 0, type: form.type, building: form.building.trim() });
            setForm((f) => ({ ...f, number: "" }));
          }}
        >
          <div className="w-28">
            <Field label="Room number">
              <input required className={inputClass} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="e.g. 204" />
            </Field>
          </div>
          <div className="w-20">
            <Field label="Floor">
              <input type="number" className={inputClass} value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            </Field>
          </div>
          <div className="w-32">
            <Field label="Type">
              <Select value={form.type} onChange={(v) => setForm({ ...form, type: v as "Single" | "Double" })}>
                <option>Single</option>
                <option>Double</option>
              </Select>
            </Field>
          </div>
          <div className="w-48">
            <Field label="Building">
              <input className={inputClass} value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" variant="primary" disabled={!form.number.trim()}>
            Add room
          </Button>
        </form>
      )}
      {rooms.length > 0 && (
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0">
              <tr>
                <Th>Room</Th>
                <Th>Floor</Th>
                <Th>Type</Th>
                <Th>Building</Th>
                <Th>Status</Th>
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
                    <Td className="text-body">{r.type}</Td>
                    <Td className="text-body">{r.building}</Td>
                    <Td>
                      <RoomBadge status={st} />
                    </Td>
                    <Td className="text-right">
                      {canEdit && st === "vacant" && (
                        <button
                          onClick={() => deleteRoom(r.id)}
                          className="text-muted hover:text-danger"
                          aria-label={`Remove room ${r.id}`}
                          title="Remove room"
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

  return (
    <Card>
      <CardHeader title="Team" description="People who can sign in to this hotel" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr>
              <Th>Email</Th>
              <Th>Access</Th>
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
                    {me && <span className="ml-2 text-[12px] text-muted">You</span>}
                  </Td>
                  <Td className="w-56 text-body">
                    {isAdmin && !lastAdmin ? (
                      <Select value={m.role} onChange={(v) => updateMemberRole(m.userId, v as MemberRole)} className="h-8">
                        <option value="admin">{ROLE_NAMES.admin}</option>
                        <option value="housing_manager">{ROLE_NAMES.housing_manager}</option>
                        <option value="viewer">{ROLE_NAMES.viewer}</option>
                      </Select>
                    ) : (
                      <span title={lastAdmin ? "Every hotel needs at least one administrator" : undefined}>{ROLE_NAMES[m.role]}</span>
                    )}
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    {me
                      ? !lastAdmin && (
                          <button onClick={() => setConfirm({ kind: "leave" })} className="text-[13px] text-muted hover:text-danger">
                            Leave hotel
                          </button>
                        )
                      : isAdmin &&
                        !lastAdmin && (
                          <button
                            onClick={() => setConfirm({ kind: "remove", userId: m.userId, email: m.email })}
                            className="text-[13px] text-muted hover:text-danger"
                          >
                            Remove
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
                  <span className="ml-2 text-[12px] text-muted">Invited, not signed in yet</span>
                </Td>
                <Td className="text-body">{ROLE_NAMES[i.role]}</Td>
                <Td className="text-right">
                  {isAdmin && (
                    <button onClick={() => cancelInvite(i.email)} className="text-[13px] text-muted hover:text-danger">
                      Cancel invite
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
        Administrators manage the team and hotel settings. Housing managers can change rooms, staff and documents. Read
        only suits an outside advisor such as your gestoria.
      </p>

      <ConfirmModal
        open={confirm?.kind === "remove"}
        onClose={() => setConfirm(null)}
        onConfirm={() => (confirm?.kind === "remove" ? removeMember(confirm.userId) : undefined)}
        title="Remove from team"
        confirmLabel="Remove"
      >
        <p>
          {confirm?.kind === "remove" && confirm.email} will no longer be able to sign in to {hotel?.name}. Their past
          changes stay in the history.
        </p>
      </ConfirmModal>
      <ConfirmModal
        open={confirm?.kind === "leave"}
        onClose={() => setConfirm(null)}
        onConfirm={leaveHotel}
        title={`Leave ${hotel?.name}`}
        confirmLabel="Leave hotel"
      >
        <p>You will lose access to this hotel. An administrator can invite you again later.</p>
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

  return (
    <Card>
      <CardHeader title="Account and data" description="Export, or permanently delete, what is stored" />
      <div className="divide-y divide-line border-t border-line">
        {isAdmin && (
          <Row
            title="Download hotel data"
            text="A file with every record stored for this hotel: staff, contracts, rooms, document details and history. Uploaded files are not included; download those from each employee."
            action={<Button onClick={exportHotelData}>Download</Button>}
          />
        )}
        {isAdmin && (
          <Row
            title={hotel?.isDemo ? "Delete demo hotel" : "Delete this hotel"}
            text={
              hotel?.isDemo
                ? "Removes the sample hotel. Your own hotel is not affected."
                : "Permanently deletes the hotel for everyone on the team, with all staff records and uploaded files. This cannot be undone."
            }
            action={
              <Button variant="danger" onClick={() => setConfirm("hotel")}>
                Delete hotel
              </Button>
            }
          />
        )}
        <Row
          title="Delete my account"
          text={
            blocksAccount
              ? `You are the only administrator of ${hotel?.name}. Make someone else an administrator, or delete the hotel, before deleting your account.`
              : `Deletes your sign-in (${userEmail}). The hotels you belong to and their data stay with the rest of the team.`
          }
          action={
            <Button variant="danger" disabled={blocksAccount} onClick={() => setConfirm("account")}>
              Delete account
            </Button>
          }
        />
      </div>

      <ConfirmModal
        open={confirm === "hotel"}
        onClose={() => setConfirm(null)}
        onConfirm={deleteHotel}
        title={`Delete ${hotel?.name}`}
        confirmLabel="Delete permanently"
        confirmText={hotel?.isDemo ? undefined : hotel?.name}
      >
        {hotel?.isDemo ? (
          <p>The demo hotel and its sample data will be removed.</p>
        ) : (
          <>
            <p>
              This deletes every employee, contract, room, uploaded document and history entry for {hotel?.name}, and removes
              access for all {members.length} team member{members.length === 1 ? "" : "s"}.
            </p>
            <p className="font-medium text-danger">This cannot be undone. Download the hotel data first if you need a copy.</p>
          </>
        )}
      </ConfirmModal>
      <ConfirmModal
        open={confirm === "account"}
        onClose={() => setConfirm(null)}
        onConfirm={deleteMyAccount}
        title="Delete my account"
        confirmLabel="Delete my account"
        confirmText="delete"
      >
        <p>
          Your sign-in for {userEmail} will be deleted and you will be signed out.
          {soleAdminOf.length > 1 && " This applies to every hotel you belong to."}
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
  return (
    <>
      <PageHeader
        title="Settings"
        actions={
          <>
            <span className="text-[13px] text-muted">Signed in as {userEmail}</span>
            <Button onClick={signOut}>Sign out</Button>
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
