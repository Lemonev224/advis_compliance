"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import * as sample from "./mock-data";
import type { ActivityItem, DocumentItem, Employee, Room } from "./mock-data";
import { addDays, TODAY, toISO } from "./dates";
import { useI18n, type TFunction } from "./i18n";
import { sitePath } from "./lang";
import {
  Ctx,
  requiredDocuments,
  ROLE_NAMES,
  TERMS_VERSION,
  type AccessLogEntry,
  type ArchivedEmployee,
  type DocumentVersion,
  type Hotel,
  type Invite,
  type Member,
  type MemberRole,
  type NewEmployee,
  type Store,
  type Toast,
} from "./store";

// The code-protected demo runs entirely in the browser on sample data.
// Nothing is sent to the database, and changes last until the tab is closed or the demo is reset.

const ME = "demo@shiftcomply.app";

function seed() {
  const hotel: Hotel = {
    id: "demo",
    name: sample.property.name,
    location: sample.property.location,
    reminderEmail: "m.soler@parkhotel.ad",
    seasonLabel: "Winter 2026/27",
    seasonStart: "2026-12-01",
    seasonEnd: "2027-04-15",
    isDemo: true,
    termsAcceptedAt: new Date().toISOString(),
    termsAcceptedBy: ME,
  };
  const roleFor = (r: string): MemberRole =>
    r.startsWith("Administrator") ? "admin" : r.includes("read only") ? "viewer" : "housing_manager";
  const members: Member[] = [
    { userId: "me", email: ME, role: "admin" },
    ...sample.users.map((u, i) => ({ userId: `u${i}`, email: u.email, role: roleFor(u.role) })),
  ];
  return {
    hotel,
    members,
    invites: [] as Invite[],
    employees: sample.employees.map((e) => ({ ...e, contract: { ...e.contract } })),
    archived: [] as { employee: Employee; archivedAt: string }[],
    rooms: sample.rooms.map((r) => ({ ...r })),
    documents: sample.documents.map((d) => ({ ...d })),
    versions: [] as DocumentVersion[],
    activity: sample.activity.map((a) => ({ ...a })),
    access: [] as (AccessLogEntry & { employeeId: string })[],
  };
}

type State = ReturnType<typeof seed>;

/** A sample "file" so demo documents open with something to look at. */
function sampleFileUrl(doc: DocumentItem, employeeName: string, t: TFunction) {
  const html = `<!doctype html><html><body style="font:15px system-ui,sans-serif;color:#1a2433;padding:48px;max-width:640px">
<p style="color:#8a5a0b;background:#fbf1dc;display:inline-block;padding:4px 10px;border-radius:3px;font-size:13px">${t("Sample document, demo only")}</p>
<h1 style="font-size:24px;margin:20px 0 4px">${t(doc.type)}</h1>
<p style="color:#5b6678;margin:0 0 24px">${employeeName}</p>
<p>${t("In the real app, this is where the uploaded PDF or photo opens, through a private link that stops working after five minutes.")}</p>
<p style="color:#5b6678">${t("File: {name}", { name: doc.fileName ?? "" })}</p></body></html>`;
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const { t, lang } = useI18n();
  const [s, setS] = useState<State>(seed);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(1);
  const nextId = (p: string) => `${p}${Date.now().toString(36)}${counter.current++}`;

  const notify = useCallback((text: string, tone: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 6000 : 3600);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // History entries keep the English text and its values, and are translated when shown.
  const logEntry = (text: string, vars?: Record<string, string>, employeeId?: string): ActivityItem => ({
    id: nextId("a"),
    when: "Just now",
    actor: "actor:You",
    text,
    vars,
    employeeId,
  });
  const ddmmyyyy = (iso: string) => iso.split("-").reverse().join("/");

  /** Applies a change to the demo data and shows a message. */
  const change = useCallback(
    async (fn: (st: State) => { next: State; message?: string }, current: State) => {
      const r = fn(current);
      setS(r.next);
      if (r.message) notify(r.message);
      return true;
    },
    [notify],
  );

  // Checks that can fail are done against the current state before calling change().
  const fail = (message: string) => {
    notify(message, "error");
    return Promise.resolve(false);
  };

  const emp = (id: string) => s.employees.find((e) => e.id === id);

  const buildEmployee = (n: NewEmployee, roomsFree: Set<string>): { e: Employee; docs: DocumentItem[] } => {
    const id = nextId("e");
    const roomId = n.roomId && roomsFree.has(n.roomId) ? n.roomId : null;
    const e: Employee = {
      id,
      name: n.name,
      role: n.role,
      department: n.department,
      email: n.email,
      phone: n.phone,
      nationality: n.nationality,
      hiredOn: n.contract.start,
      contract: {
        id: `C-${n.contract.start.slice(0, 4)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        type: n.contract.type,
        start: n.contract.start,
        end: n.contract.end,
        hoursPerWeek: n.contract.hoursPerWeek,
        language: "Catalan",
        signed: n.contract.signed,
        renewal: "none",
        probationDays: 15,
      },
      roomId,
      checkout: roomId ? n.contract.end : null,
      source: "Manual",
    };
    const docs = requiredDocuments({
      nationality: n.nationality,
      department: n.department,
      hasRoom: !!roomId,
      contractEnd: n.contract.end,
      checkout: n.contract.end,
    }).map((d) => ({
      id: nextId("d"),
      employeeId: id,
      type: d.type,
      fileName: null,
      uploaded: null,
      expires: d.expires,
      required: true,
    }));
    return { e, docs };
  };

  const freeRooms = () => new Set(s.rooms.filter((r) => !s.employees.some((e) => e.roomId === r.id)).map((r) => r.id));

  const value = useMemo<Store>(() => {
    const store: Store = {
      demoMode: true,
      status: "ready",
      errorMessage: null,
      hotel: s.hotel,
      myHotels: [{ id: s.hotel.id, name: s.hotel.name, isDemo: true, role: "admin" }],
      myUserId: "me",
      myRole: "admin",
      canEdit: true,
      userEmail: ME,
      members: s.members,
      invites: s.invites,
      employees: s.employees,
      archivedEmployees: s.archived.map(
        (a): ArchivedEmployee => ({
          id: a.employee.id,
          name: a.employee.name,
          role: a.employee.role,
          department: a.employee.department,
          archivedAt: a.archivedAt,
          contractEnd: a.employee.contract.end,
        }),
      ),
      rooms: s.rooms,
      documents: s.documents.filter((d) => s.employees.some((e) => e.id === d.employeeId)),
      documentVersions: s.versions,
      activity: s.activity,
      toasts,

      getEmployee: emp,

      renewContract: (id, newEnd, extendHousing) => {
        const e = emp(id);
        if (!e) return fail(t("Employee not found"));
        if (e.contract.end && newEnd <= e.contract.end) return fail(t("The new end date must be after the current end date"));
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.map((x) =>
              x.id !== id
                ? x
                : {
                    ...x,
                    contract: {
                      ...x.contract,
                      id: `${x.contract.id}-R`,
                      start: x.contract.end ? addDays(x.contract.end, 1) : toISO(TODAY),
                      end: newEnd,
                      signed: false,
                      renewal: "none",
                    },
                    checkout: extendHousing && x.roomId ? newEnd : x.checkout,
                  },
            ),
            documents: st.documents.map((d) =>
              d.employeeId === id && (d.type === "Employment contract" || (extendHousing && d.type === "Housing agreement"))
                ? { ...d, expires: newEnd, ...(d.type === "Employment contract" ? { fileName: null, uploaded: null, filePath: null } : {}) }
                : d,
            ),
            activity: [logEntry("renewed {name}'s contract until {date}", { name: e.name, date: ddmmyyyy(newEnd) }, id), ...st.activity],
          },
          message: t("Contract renewed for {name}. Upload the newly signed copy when you have it.", { name: e.name }),
        }), s);
      },

      assignRoom: (id, roomId, checkout) => {
        const e = emp(id);
        if (!e || !s.rooms.some((r) => r.id === roomId)) return fail(t("Employee or room not found"));
        if (s.employees.some((x) => x.roomId === roomId)) return fail(t("Room {room} is already taken", { room: roomId }));
        const date = checkout ?? e.contract.end;
        const hasAgreement = s.documents.some((d) => d.employeeId === id && d.type === "Housing agreement");
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.map((x) => (x.id === id ? { ...x, roomId, checkout: date } : x)),
            documents: hasAgreement
              ? st.documents
              : [
                  ...st.documents,
                  { id: nextId("d"), employeeId: id, type: "Housing agreement", fileName: null, uploaded: null, expires: date, required: true },
                ],
            activity: [logEntry("assigned room {room} to {name}", { room: roomId, name: e.name }, id), ...st.activity],
          },
          message: t("Room {room} assigned to {name}", { room: roomId, name: e.name }),
        }), s);
      },

      checkOut: (roomId) => {
        const e = s.employees.find((x) => x.roomId === roomId);
        if (!e) return fail(t("Nobody is in this room"));
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.map((x) => (x.id === e.id ? { ...x, roomId: null, checkout: null } : x)),
            activity: [logEntry("checked {name} out of room {room}", { name: e.name, room: roomId }, e.id), ...st.activity],
          },
          message: t("Room {room} is now vacant", { room: roomId }),
        }), s);
      },

      extendStay: (id, checkout) => {
        const e = emp(id);
        if (!e?.roomId) return fail(t("This employee has no room"));
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.map((x) => (x.id === id ? { ...x, checkout } : x)),
            documents: st.documents.map((d) => (d.employeeId === id && d.type === "Housing agreement" ? { ...d, expires: checkout } : d)),
            activity: [logEntry("changed {name}'s checkout date to {date}", { name: e.name, date: ddmmyyyy(checkout) }, id), ...st.activity],
          },
          message: t("Checkout date updated for {name}", { name: e.name }),
        }), s);
      },

      uploadDocument: (id, type, file, expires) => {
        if (!file) return fail(t("Choose a file to upload"));
        const e = emp(id);
        const url = URL.createObjectURL(file);
        const existing = s.documents.find((d) => d.employeeId === id && d.type === type);
        return change((st) => {
          const versions =
            existing?.fileName && existing.filePath
              ? [
                  {
                    id: nextId("v"),
                    documentId: existing.id,
                    fileName: existing.fileName,
                    filePath: existing.filePath,
                    uploaded: existing.uploaded,
                    replacedAt: new Date().toISOString(),
                    replacedBy: ME,
                  },
                  ...st.versions,
                ]
              : st.versions;
          const fields = { fileName: file.name, filePath: url, uploaded: toISO(TODAY), expires };
          const documents = existing
            ? st.documents.map((d) => (d.id === existing.id ? { ...d, ...fields } : d))
            : [...st.documents, { id: nextId("d"), employeeId: id, type, required: false, ...fields }];
          return {
            next: {
              ...st,
              versions,
              documents,
              employees:
                type === "Employment contract"
                  ? st.employees.map((x) => (x.id === id ? { ...x, contract: { ...x.contract, signed: true } } : x))
                  : st.employees,
              activity: [logEntry("uploaded {type} for {name}", { type: `~${type}`, name: e?.name ?? "" }, id), ...st.activity],
            },
            message: t("{type} uploaded", { type: t(type) }),
          };
        }, s);
      },

      documentUrl: async (doc, opts) => {
        const e = emp(doc.employeeId);
        const path = opts?.version?.filePath ?? doc.filePath;
        const url = path?.startsWith("blob:") ? path : sampleFileUrl(doc, e?.name ?? "", t);
        const entry = {
          id: nextId("x"),
          actor: ME,
          action: (opts?.download ? "downloaded" : "viewed") as "viewed" | "downloaded",
          fileName: opts?.version?.fileName ?? doc.fileName ?? "",
          documentType: doc.type,
          when: "Just now",
          employeeId: doc.employeeId,
        };
        setS((st) => ({ ...st, access: [entry, ...st.access] }));
        return url;
      },

      openDocument: async (doc) => {
        const url = await store.documentUrl(doc);
        if (url) window.open(url, "_blank", "noopener");
      },

      accessLog: async (id) => s.access.filter((a) => a.employeeId === id),

      deleteDocumentFile: (doc) => {
        const e = emp(doc.employeeId);
        return change((st) => ({
          next: {
            ...st,
            versions: st.versions.filter((v) => v.documentId !== doc.id),
            documents: doc.required
              ? st.documents.map((d) => (d.id === doc.id ? { ...d, fileName: null, filePath: null, uploaded: null } : d))
              : st.documents.filter((d) => d.id !== doc.id),
            activity: [logEntry("deleted the {type} file for {name}", { type: `~${doc.type}`, name: e?.name ?? "" }, doc.employeeId), ...st.activity],
          },
          message: t("{type} deleted", { type: t(doc.type) }),
        }), s);
      },

      addEmployee: (n) => {
        const { e, docs } = buildEmployee(n, freeRooms());
        return change((st) => ({
          next: {
            ...st,
            employees: [...st.employees, e].sort((a, b) => a.name.localeCompare(b.name)),
            documents: [...st.documents, ...docs],
            activity: [
              e.roomId
                ? logEntry("added {name} with a {type} contract and room {room}", { name: n.name, type: `~${n.contract.type}`, room: e.roomId }, e.id)
                : logEntry("added {name} with a {type} contract", { name: n.name, type: `~${n.contract.type}` }, e.id),
              ...st.activity,
            ],
          },
          message: t("{name} added", { name: n.name }),
        }), s);
      },

      importEmployees: async (list) => {
        const free = freeRooms();
        const built = list.map((n) => {
          const b = buildEmployee(n, free);
          if (b.e.roomId) free.delete(b.e.roomId);
          return b;
        });
        await change((st) => ({
          next: {
            ...st,
            employees: [...st.employees, ...built.map((b) => b.e)].sort((a, b) => a.name.localeCompare(b.name)),
            documents: [...st.documents, ...built.flatMap((b) => b.docs)],
            activity: [logEntry("imported {n} employees from a spreadsheet", { n: String(built.length) }), ...st.activity],
          },
          message: built.length === 1 ? t("1 employee imported") : t("{n} employees imported", { n: built.length }),
        }), s);
        return { added: built.length, failed: [] };
      },

      archiveEmployee: (id) => {
        const e = emp(id);
        if (!e) return fail(t("Employee not found"));
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.filter((x) => x.id !== id),
            archived: [{ employee: { ...e, roomId: null, checkout: null }, archivedAt: new Date().toISOString() }, ...st.archived],
            activity: [
              e.roomId
                ? logEntry("archived {name} and checked them out of room {room}", { name: e.name, room: e.roomId }, id)
                : logEntry("archived {name}", { name: e.name }, id),
              ...st.activity,
            ],
          },
          message: t("{name} archived", { name: e.name }),
        }), s);
      },

      restoreEmployee: (id) => {
        const a = s.archived.find((x) => x.employee.id === id);
        if (!a) return fail(t("Employee not found"));
        return change((st) => ({
          next: {
            ...st,
            archived: st.archived.filter((x) => x.employee.id !== id),
            employees: [...st.employees, a.employee].sort((x, y) => x.name.localeCompare(y.name)),
            activity: [logEntry("restored {name} from the archive", { name: a.employee.name }, id), ...st.activity],
          },
          message: t("{name} restored", { name: a.employee.name }),
        }), s);
      },

      eraseEmployee: (id) => {
        const name = emp(id)?.name ?? s.archived.find((x) => x.employee.id === id)?.employee.name;
        if (!name) return fail(t("Employee not found"));
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.filter((x) => x.id !== id),
            archived: st.archived.filter((x) => x.employee.id !== id),
            documents: st.documents.filter((d) => d.employeeId !== id),
            versions: st.versions.filter((v) => st.documents.some((d) => d.id === v.documentId && d.employeeId !== id)),
            access: st.access.filter((a) => a.employeeId !== id),
            activity: [
              logEntry("permanently deleted an employee record"),
              ...st.activity.map((a) =>
                a.employeeId === id || Object.values(a.vars ?? {}).includes(name)
                  ? {
                      ...a,
                      employeeId: undefined,
                      vars: Object.fromEntries(Object.entries(a.vars ?? {}).map(([k, v]) => [k, v === name ? "a deleted employee" : v])),
                    }
                  : a,
              ),
            ],
          },
          message: t("{name} permanently deleted", { name }),
        }), s);
      },

      createHotel: () => fail(t("Creating a hotel is not available in the demo. Sign in to set up your own hotel.")),
      createDemoHotel: async () => true,
      switchHotel: () => {},
      acceptTerms: () =>
        change((st) => ({
          next: { ...st, hotel: { ...st.hotel, termsAcceptedAt: new Date().toISOString(), termsAcceptedBy: ME } },
          message: t("Agreements accepted (version {version})", { version: TERMS_VERSION }),
        }), s),
      updateHotel: (h) =>
        change((st) => ({ next: { ...st, hotel: { ...st.hotel, ...h } }, message: t("Hotel details saved") }), s),
      deleteHotel: () =>
        change(() => ({ next: seed(), message: t("The demo has been reset to its sample data") }), s),
      exportHotelData: async () => {
        const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), demo: true, ...s }, null, 2)], {
          type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `demo-hotel-data-${toISO(TODAY)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      },

      updateMemberRole: (userId, role) => {
        const m = s.members.find((x) => x.userId === userId);
        if (m?.role === "admin" && role !== "admin" && s.members.filter((x) => x.role === "admin").length <= 1) {
          return fail(t("Every hotel needs at least one administrator. Make someone else an administrator first."));
        }
        return change((st) => ({
          next: { ...st, members: st.members.map((x) => (x.userId === userId ? { ...x, role } : x)) },
          message: t("{email} now has {role} access", { email: m?.email, role: t(ROLE_NAMES[role]).toLowerCase() }),
        }), s);
      },
      removeMember: (userId) => {
        const m = s.members.find((x) => x.userId === userId);
        return change((st) => ({
          next: { ...st, members: st.members.filter((x) => x.userId !== userId) },
          message: t("{email} no longer has access to this hotel", { email: m?.email }),
        }), s);
      },
      leaveHotel: () => fail(t("Leaving the hotel is not available in the demo")),
      deleteMyAccount: () => fail(t("There is no account to delete in the demo. Use Exit demo instead.")),

      addRoom: (r) => {
        if (s.rooms.some((x) => x.id === r.number)) return fail(t("Room {room} already exists", { room: r.number }));
        return change((st) => ({
          next: { ...st, rooms: [...st.rooms, { id: r.number, floor: r.floor, type: r.type, building: r.building }] },
          message: t("Room {room} added", { room: r.number }),
        }), s);
      },
      addRooms: (list) => {
        const fresh = list.filter((r) => !s.rooms.some((x) => x.id === r.number));
        if (!fresh.length) return fail(t("All of these rooms already exist"));
        return change((st) => ({
          next: {
            ...st,
            rooms: [...st.rooms, ...fresh.map((r): Room => ({ id: r.number, floor: r.floor, type: r.type, building: r.building }))],
          },
          message:
            list.length > fresh.length
              ? t("{n} rooms added, {m} already existed", { n: fresh.length, m: list.length - fresh.length })
              : t("{n} rooms added", { n: fresh.length }),
        }), s);
      },
      deleteRoom: (roomId) => {
        if (s.employees.some((e) => e.roomId === roomId)) return fail(t("Check the occupant out before removing this room"));
        return change((st) => ({ next: { ...st, rooms: st.rooms.filter((r) => r.id !== roomId) }, message: t("Room {room} removed", { room: roomId }) }), s);
      },

      invite: (email, role) => {
        const e = email.trim().toLowerCase();
        if (s.invites.some((i) => i.email === e) || s.members.some((m) => m.email === e)) return fail(t("{email} is already on the team", { email }));
        return change((st) => ({
          next: { ...st, invites: [...st.invites, { email: e, role }] },
          message: t("Invitation saved. In the real app, {email} joins the first time they sign in.", { email }),
        }), s);
      },
      cancelInvite: (email) =>
        change((st) => ({ next: { ...st, invites: st.invites.filter((i) => i.email !== email) }, message: t("Invitation removed") }), s),
      loadDemoData: () => change(() => ({ next: seed(), message: t("Sample data restored") }), s),

      signOut: async () => {
        await fetch("/api/shiftcomply-demo", { method: "DELETE" });
        window.location.href = sitePath(lang, "/shiftcomply");
      },
      notify,
      dismissToast,
    };
    return store;
    // nextId, logEntry and the helpers only read refs or the current state captured here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, toasts, change, notify, dismissToast, t, lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
