"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Button, Field, inputClass, Modal, Select } from "./ui";
import { useStore } from "@/shiftcomply/lib/store";
import { addMonths, TODAY, toISO } from "@/shiftcomply/lib/dates";
import { useI18n } from "@/shiftcomply/lib/i18n";
import { roomStatus } from "@/shiftcomply/lib/derive";
import type { ContractType, Department, DocType } from "@/shiftcomply/lib/mock-data";

/* ---------- Renew contract ---------- */

export function RenewContractModal({
  employeeId,
  open,
  onClose,
}: {
  employeeId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { getEmployee, renewContract } = useStore();
  const { t, fmt } = useI18n();
  const e = employeeId ? getEmployee(employeeId) : undefined;
  const base = e?.contract.end ?? toISO(TODAY);
  const [months, setMonths] = useState("4");
  const [custom, setCustom] = useState("");
  const [extendHousing, setExtendHousing] = useState(true);

  if (!e) return null;
  const newEnd = months === "custom" ? custom : addMonths(base, Number(months));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Renew contract")}
      description={t("{name}, {role}, current end {date}", { name: e.name, role: t(e.role), date: fmt(e.contract.end) })}
      footer={
        <>
          <Button onClick={onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            disabled={!newEnd}
            onClick={() => {
              renewContract(e.id, newEnd, extendHousing);
              onClose();
            }}
          >
            {t("Renew contract")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("Extend by")}>
          <Select value={months} onChange={setMonths}>
            <option value="1">{t("1 month")}</option>
            <option value="3">{t("{n} months", { n: 3 })}</option>
            <option value="4">{t("4 months (winter season)")}</option>
            <option value="6">{t("{n} months", { n: 6 })}</option>
            <option value="custom">{t("Custom end date")}</option>
          </Select>
        </Field>
        {months === "custom" && (
          <Field label={t("New end date")}>
            <input type="date" className={inputClass} value={custom} onChange={(ev) => setCustom(ev.target.value)} />
          </Field>
        )}
        {e.roomId && (
          <label className="flex items-start gap-2.5 rounded-md border border-line bg-sunken p-3 text-[13px]">
            <input
              type="checkbox"
              className="mt-0.5 accent-[var(--color-primary)]"
              checked={extendHousing}
              onChange={(ev) => setExtendHousing(ev.target.checked)}
            />
            <span>
              <span className="font-medium text-ink">{t("Extend room {room} to the same date", { room: e.roomId })}</span>
              <span className="block text-muted">{t("Keeps the housing assignment linked to the contract.")}</span>
            </span>
          </label>
        )}
        <div className="rounded-md border border-line px-3 py-2.5 text-[13px]">
          <div className="flex justify-between">
            <span className="text-muted">{t("New end date")}</span>
            <span className="font-medium">{newEnd ? fmt(newEnd) : "—"}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted">{t("Contract language")}</span>
            <span className="font-medium">{t(`language:${e.contract.language}`)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Assign room ---------- */

export function AssignRoomModal({
  open,
  onClose,
  roomId,
  employeeId,
  onAddRoom,
}: {
  open: boolean;
  onClose: () => void;
  roomId?: string | null;
  employeeId?: string | null;
  /** When given, offers a shortcut to add a room if none are vacant. */
  onAddRoom?: () => void;
}) {
  const { employees, rooms, assignRoom } = useStore();
  const { t, fmt } = useI18n();
  const vacant = rooms.filter((r) => roomStatus(r, employees).status === "vacant");
  const unhoused = employees.filter((e) => !e.roomId);
  const [room, setRoom] = useState(roomId ?? vacant[0]?.id ?? "");
  const [emp, setEmp] = useState(employeeId ?? unhoused[0]?.id ?? "");
  const selected = employees.find((e) => e.id === emp);
  const [checkout, setCheckout] = useState("");

  const effectiveCheckout = checkout || selected?.contract.end || "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Assign room")}
      description={t("Housing is linked to the employee's contract dates.")}
      footer={
        <>
          <Button onClick={onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            disabled={!room || !emp}
            onClick={() => {
              assignRoom(emp, room, effectiveCheckout || null);
              onClose();
            }}
          >
            {t("Assign room")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("Employee")}>
          <Select value={emp} onChange={setEmp}>
            {unhoused.length === 0 && <option value="">{t("No unhoused employees")}</option>}
            {unhoused.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {t(e.role)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("Room")}>
          <Select value={room} onChange={setRoom}>
            {vacant.length === 0 && <option value="">{t("No vacant rooms")}</option>}
            {vacant.map((r) => (
              <option key={r.id} value={r.id}>
                {t("Room {room}, {type}, {building}, floor {floor}", { room: r.id, type: t(r.type).toLowerCase(), building: t(r.building), floor: r.floor })}
              </option>
            ))}
          </Select>
        </Field>
        {vacant.length === 0 && onAddRoom && (
          <p className="rounded bg-primary-soft px-3 py-2 text-[13px] text-primary-hover">
            {rooms.length === 0 ? t("You have not added any rooms yet.") : t("Every room is taken.")}{" "}
            <button
              type="button"
              className="font-medium underline"
              onClick={() => {
                onClose();
                onAddRoom();
              }}
            >
              {t("Add a room")}
            </button>
          </p>
        )}
        <Field
          label={t("Checkout date")}
          hint={selected?.contract.end ? t("Defaults to contract end ({date})", { date: fmt(selected.contract.end) }) : undefined}
        >
          <input
            type="date"
            className={inputClass}
            value={effectiveCheckout}
            onChange={(ev) => setCheckout(ev.target.value)}
          />
        </Field>
        {selected?.contract.end && effectiveCheckout > selected.contract.end && (
          <p className="rounded-md bg-warning-soft px-3 py-2 text-[13px] text-warning">
            {t("Checkout is after the contract end date. A housing extension will need to be documented.")}
          </p>
        )}
      </div>
    </Modal>
  );
}

/* ---------- Add room ---------- */

function SingleRoomModal({ open, onClose, tabs }: { open: boolean; onClose: () => void; tabs: React.ReactNode }) {
  const { rooms, addRoom } = useStore();
  const { t } = useI18n();
  const buildings = useMemo(() => Array.from(new Set(rooms.map((r) => r.building).filter(Boolean))).sort(), [rooms]);
  const [form, setForm] = useState({
    number: "",
    floor: "1",
    type: "Single" as "Single" | "Double",
    // Shown translated; saved under the existing building's name when it matches one.
    building: t(buildings[0] ?? "Staff residence"),
  });
  const buildingName = (shown: string) => buildings.find((b) => t(b) === shown) ?? shown;
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const exists = rooms.some((r) => r.id === form.number.trim());

  const save = async (another: boolean) => {
    const number = form.number.trim();
    if (!number || exists) return;
    setBusy(true);
    const ok = await addRoom({ number, floor: Number(form.floor) || 0, type: form.type, building: buildingName(form.building.trim()) || "Staff residence" });
    setBusy(false);
    if (!ok) return;
    if (!another) return onClose();
    setAdded((a) => [...a, number]);
    // Suggest the next number on the same floor, e.g. 204 -> 205
    const next = /^\d+$/.test(number) ? String(Number(number) + 1).padStart(number.length, "0") : "";
    setForm((f) => ({ ...f, number: next }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Add room")}
      description={t("Add a staff room so you can assign employees to it.")}
      footer={
        <>
          <Button onClick={onClose}>{added.length ? t("Done") : t("Cancel")}</Button>
          <Button disabled={busy || !form.number.trim() || exists} onClick={() => save(true)}>
            {t("Save and add another")}
          </Button>
          <Button variant="primary" disabled={busy || !form.number.trim() || exists} onClick={() => save(false)}>
            {busy ? t("Saving") : t("Add room")}
          </Button>
        </>
      }
    >
      {tabs}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("Room number")}>
            <input
              autoFocus
              required
              className={inputClass}
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              placeholder={t("e.g. {example}", { example: "204" })}
            />
          </Field>
          <Field label={t("Floor")}>
            <input type="number" className={inputClass} value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          </Field>
          <Field label={t("Type")}>
            <Select value={form.type} onChange={(v) => setForm({ ...form, type: v as "Single" | "Double" })}>
              <option value="Single">{t("Single")}</option>
              <option value="Double">{t("Double")}</option>
            </Select>
          </Field>
          <Field label={t("Building")}>
            <input
              list="room-buildings"
              className={inputClass}
              value={form.building}
              onChange={(e) => setForm({ ...form, building: e.target.value })}
              placeholder={t("e.g. {example}", { example: "Bloc A" })}
            />
            <datalist id="room-buildings">
              {buildings.map((b) => (
                <option key={b} value={t(b)} />
              ))}
            </datalist>
          </Field>
        </div>
        {exists && <p className="text-[13px] text-danger">{t("Room {room} already exists.", { room: form.number.trim() })}</p>}
        {added.length > 0 && <p className="text-[13px] text-success">{t("Added: room {rooms}", { rooms: added.join(", ") })}</p>}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

/** Generates room numbers like 101–112, 201–212 for a building. */
export function planRooms(p: { building: string; floorFrom: number; floorTo: number; roomFrom: number; roomTo: number; type: "Single" | "Double" }) {
  const out: { number: string; floor: number; type: "Single" | "Double"; building: string }[] = [];
  if (p.floorTo < p.floorFrom || p.roomTo < p.roomFrom) return out;
  if ((p.floorTo - p.floorFrom + 1) * (p.roomTo - p.roomFrom + 1) > 500) return out;
  for (let f = p.floorFrom; f <= p.floorTo; f++) {
    for (let n = p.roomFrom; n <= p.roomTo; n++) {
      out.push({ number: `${f}${String(n).padStart(2, "0")}`, floor: f, type: p.type, building: p.building.trim() || "Staff residence" });
    }
  }
  return out;
}

export function BulkRoomsForm({ onSaved, footer }: { onSaved?: () => void; footer?: (save: React.ReactNode) => React.ReactNode }) {
  const { rooms, addRooms } = useStore();
  const { t, rich } = useI18n();
  const [f, setF] = useState({ building: "", floorFrom: "1", floorTo: "2", roomFrom: "1", roomTo: "10", type: "Single" as "Single" | "Double" });
  const [busy, setBusy] = useState(false);
  const plan = planRooms({
    building: f.building,
    floorFrom: Number(f.floorFrom),
    floorTo: Number(f.floorTo),
    roomFrom: Number(f.roomFrom),
    roomTo: Number(f.roomTo),
    type: f.type,
  });
  const existing = new Set(rooms.map((r) => r.id));
  const clashes = plan.filter((r) => existing.has(r.number)).length;
  const tooMany = (Number(f.floorTo) - Number(f.floorFrom) + 1) * (Number(f.roomTo) - Number(f.roomFrom) + 1) > 500;
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const save = (
    <Button
      variant="primary"
      disabled={busy || plan.length === 0 || plan.length === clashes}
      onClick={async () => {
        setBusy(true);
        const ok = await addRooms(plan);
        setBusy(false);
        if (ok) onSaved?.();
      }}
    >
      {busy ? t("Adding") : t("Add {n} rooms", { n: plan.length - clashes })}
    </Button>
  );

  return (
    <div className="space-y-4">
      <Field label={t("Building")}>
        <input
          className={inputClass}
          value={f.building}
          onChange={(e) => setF({ ...f, building: e.target.value })}
          placeholder={t("e.g. {example}", { example: "Bloc A" })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Field label={t("Floors from")}>
          <input type="number" min={0} className={inputClass} value={f.floorFrom} onChange={num("floorFrom")} />
        </Field>
        <Field label={t("to")}>
          <input type="number" min={0} className={inputClass} value={f.floorTo} onChange={num("floorTo")} />
        </Field>
        <Field label={t("Rooms per floor from")}>
          <input type="number" min={0} className={inputClass} value={f.roomFrom} onChange={num("roomFrom")} />
        </Field>
        <Field label={t("to")}>
          <input type="number" min={0} className={inputClass} value={f.roomTo} onChange={num("roomTo")} />
        </Field>
        <Field label={t("Type")}>
          <Select value={f.type} onChange={(v) => setF({ ...f, type: v as "Single" | "Double" })}>
            <option value="Single">{t("Single")}</option>
            <option value="Double">{t("Double")}</option>
          </Select>
        </Field>
      </div>
      <div className="rounded bg-sunken px-3 py-2.5 text-[13px] text-body">
        {tooMany ? (
          <span className="text-danger">{t("That is more than 500 rooms. Add one building at a time.")}</span>
        ) : plan.length === 0 ? (
          <span className="text-muted">{t("Check the floor and room ranges.")}</span>
        ) : (
          <>
            {rich("Creates {rooms}:", {
              rooms: <span className="font-semibold">{t("{n} rooms", { n: plan.length })}</span>,
            })}{" "}
            {Array.from(new Set(plan.map((r) => r.floor)))
              .map((fl) => {
                const onFloor = plan.filter((r) => r.floor === fl);
                return `${onFloor[0].number}–${onFloor[onFloor.length - 1].number}`;
              })
              .join(", ")}
            {clashes > 0 && (
              <span className="text-warning"> ({t("{n} already exist and will be skipped", { n: clashes })})</span>
            )}
          </>
        )}
      </div>
      {footer ? footer(save) : <div className="flex justify-end">{save}</div>}
    </div>
  );
}

export function AddRoomModal({ open, onClose, initialMode = "one" }: { open: boolean; onClose: () => void; initialMode?: "one" | "many" }) {
  const [mode, setMode] = useState<"one" | "many">(initialMode);
  const { t } = useI18n();
  const tabs = (
    <div className="mb-4 inline-flex rounded border border-line-strong p-0.5 text-[13px]">
      {(["one", "many"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          className={`rounded-[3px] px-3 py-1.5 font-medium ${mode === m ? "bg-navy text-white" : "text-body hover:bg-sunken"}`}
        >
          {m === "one" ? t("One room") : t("Several rooms")}
        </button>
      ))}
    </div>
  );
  if (mode === "one") return <SingleRoomModal open={open} onClose={onClose} tabs={tabs} />;
  return (
    <Modal open={open} onClose={onClose} title={t("Add rooms")} description={t("Create a whole floor or building at once.")} width={620}>
      {tabs}
      <BulkRoomsForm onSaved={onClose} />
    </Modal>
  );
}

/* ---------- Upload document ---------- */

const DOC_TYPES: DocType[] = [
  "Employment contract",
  "ID / passport",
  "Work and residence permit",
  "CASS registration",
  "Housing agreement",
  "Food handler certificate",
];

export function UploadDocumentModal({
  open,
  onClose,
  employeeId,
  type,
}: {
  open: boolean;
  onClose: () => void;
  employeeId?: string | null;
  type?: DocType | null;
}) {
  const { employees, documents, uploadDocument } = useStore();
  const { t } = useI18n();
  const [emp, setEmp] = useState(employeeId ?? employees[0]?.id ?? "");
  const [docType, setDocType] = useState<DocType>(type ?? "Employment contract");
  const [expiresInput, setExpires] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // Suggest an expiry date: the contract end for contracts, the checkout for housing, or the date already on file.
  const employee = employees.find((e) => e.id === emp);
  const existing = documents.find((d) => d.employeeId === emp && d.type === docType);
  const suggested =
    docType === "Employment contract"
      ? employee?.contract.end
      : docType === "Housing agreement"
        ? employee?.checkout
        : existing?.expires;
  const expires = expiresInput ?? suggested ?? "";
  const tooBig = !!file && file.size > 10 * 1024 * 1024;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Upload document")}
      footer={
        <>
          <Button onClick={onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            disabled={!emp || !file || tooBig || busy}
            onClick={async () => {
              setBusy(true);
              await uploadDocument(emp, docType, file, expires || null);
              setBusy(false);
              onClose();
            }}
          >
            {busy ? t("Uploading") : t("Upload")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("Employee")}>
          <Select value={emp} onChange={setEmp}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("Document type")}>
          <Select
            value={docType}
            onChange={(v) => {
              setDocType(v as DocType);
              setExpires(null);
            }}
          >
            {DOC_TYPES.map((d) => (
              <option key={d} value={d}>
                {t(d)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("Expiry date")} hint={t("Leave empty if the document does not expire.")}>
          <input type="date" className={inputClass} value={expires} onChange={(e) => setExpires(e.target.value)} />
        </Field>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-line-strong bg-sunken px-4 py-6 text-center hover:border-primary">
          <Upload size={20} className="text-muted" />
          <span className="mt-2 text-[13px] font-medium text-ink">{file?.name ?? t("Choose a file")}</span>
          <span className={tooBig ? "text-[12px] text-danger" : "text-[12px] text-muted"}>
            {tooBig ? t("This file is larger than 10 MB") : t("PDF, JPG or PNG up to 10 MB")}
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {docType === "Employment contract" && (
          <p className="text-[12px] text-muted">{t("Uploading the signed contract marks the contract as signed.")}</p>
        )}
      </div>
    </Modal>
  );
}

/* ---------- Add employee ---------- */

const DEPARTMENTS: Department[] = [
  "Reception", "Housekeeping", "Kitchen", "Restaurant", "Spa", "Facilities", "Guest services", "Administration",
];

export function AddEmployeeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addEmployee, rooms, employees } = useStore();
  const { t, fmt } = useI18n();
  const vacant = rooms.filter((r) => roomStatus(r, employees).status === "vacant");
  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "Housekeeping" as Department,
    email: "",
    phone: "",
    nationality: "",
    type: "Seasonal" as ContractType,
    start: toISO(TODAY),
    end: addMonths(toISO(TODAY), 4),
    hours: "40",
    signed: false,
    room: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const datesValid = form.type === "Indefinite" || (form.end > form.start);
  const valid = form.name.trim().length > 1 && form.role.trim().length > 1 && datesValid;
  const end = form.type === "Indefinite" ? null : form.end;

  const section = "col-span-full mt-1 border-t border-line pt-4 text-[13px] font-semibold text-ink first:mt-0 first:border-0 first:pt-0";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={600}
      title={t("Add employee")}
      description={t("Adds the person, their contract and, if they live on site, their room.")}
      footer={
        <>
          <Button onClick={onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            disabled={!valid || busy}
            onClick={async () => {
              setBusy(true);
              await addEmployee({
                name: form.name.trim(),
                role: form.role.trim(),
                department: form.department,
                email: form.email.trim(),
                phone: form.phone.trim(),
                nationality: form.nationality.trim() || "Not set",
                contract: {
                  type: form.type,
                  start: form.start,
                  end,
                  hoursPerWeek: Number(form.hours) || 0,
                  signed: form.signed,
                },
                roomId: form.room || null,
              });
              setBusy(false);
              onClose();
            }}
          >
            {t("Add employee")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={section}>{t("Person")}</div>
        <Field label={t("Full name")}>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder={t("e.g. {example}", { example: "Berta Camps" })}
          />
        </Field>
        <Field label={t("Job title")}>
          <input
            className={inputClass}
            value={form.role}
            onChange={(e) => set("role")(e.target.value)}
            placeholder={t("e.g. {example}", { example: t("Room attendant") })}
          />
        </Field>
        <Field label={t("Department")}>
          <Select value={form.department} onChange={set("department")}>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {t(d)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("Nationality")}>
          <input
            className={inputClass}
            value={form.nationality}
            onChange={(e) => set("nationality")(e.target.value)}
            placeholder={t("e.g. {example}", { example: t("Spanish") })}
          />
        </Field>
        <Field label={t("Email")}>
          <input className={inputClass} value={form.email} onChange={(e) => set("email")(e.target.value)} />
        </Field>
        <Field label={t("Phone")}>
          <input className={inputClass} value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
        </Field>

        <div className={section}>{t("Contract")}</div>
        <Field label={t("Contract type")}>
          <Select value={form.type} onChange={set("type")}>
            {(["Seasonal", "Part-time", "Fixed-term", "Indefinite"] as const).map((c) => (
              <option key={c} value={c}>
                {t(c)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("Hours per week")}>
          <input type="number" className={inputClass} value={form.hours} onChange={(e) => set("hours")(e.target.value)} />
        </Field>
        <Field label={t("Start date")}>
          <input type="date" className={inputClass} value={form.start} onChange={(e) => set("start")(e.target.value)} />
        </Field>
        {form.type !== "Indefinite" && (
          <Field label={t("End date")}>
            <input type="date" className={inputClass} value={form.end} onChange={(e) => set("end")(e.target.value)} />
          </Field>
        )}
        {!datesValid && (
          <p className="col-span-full -mt-2 text-[13px] text-danger">{t("The end date must be after the start date.")}</p>
        )}
        <label className="col-span-full flex items-center gap-2.5 text-[13px] text-body">
          <input
            type="checkbox"
            className="accent-[var(--color-primary)]"
            checked={form.signed}
            onChange={(e) => setForm((f) => ({ ...f, signed: e.target.checked }))}
          />
          {t("The contract is already signed by both parties")}
        </label>

        <div className={section}>{t("Staff housing")}</div>
        <Field
          label={t("Room")}
          hint={
            form.room
              ? end
                ? t("Checkout is set to the contract end ({date}).", { date: fmt(end) })
                : t("Checkout is set to the contract end.")
              : t("Leave empty if they live off site.")
          }
        >
          <Select value={form.room} onChange={set("room")}>
            <option value="">{t("No room")}</option>
            {vacant.map((r) => (
              <option key={r.id} value={r.id}>
                {t("Room {room}, {type}, floor {floor}", { room: r.id, type: t(r.type).toLowerCase(), floor: r.floor })}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
