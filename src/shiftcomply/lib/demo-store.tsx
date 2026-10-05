"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import * as sample from "./mock-data";
import type { ActivityItem, DocumentItem, Employee, Room } from "./mock-data";
import { addDays, TODAY, toISO } from "./dates";
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
function sampleFileUrl(doc: DocumentItem, employeeName: string) {
  const html = `<!doctype html><html><body style="font:15px system-ui,sans-serif;color:#1a2433;padding:48px;max-width:640px">
<p style="color:#8a5a0b;background:#fbf1dc;display:inline-block;padding:4px 10px;border-radius:3px;font-size:13px">Sample document, demo only</p>
<h1 style="font-size:24px;margin:20px 0 4px">${doc.type}</h1>
<p style="color:#5b6678;margin:0 0 24px">${employeeName}</p>
<p>In the real app, this is where the uploaded PDF or photo opens, through a private link that stops working after five minutes.</p>
<p style="color:#5b6678">File: ${doc.fileName ?? ""}</p></body></html>`;
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
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

  const logEntry = (text: string, employeeId?: string): ActivityItem => ({
    id: nextId("a"),
    when: "Just now",
    actor: "You",
    text,
    employeeId,
  });

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
        if (!e) return fail("Employee not found");
        if (e.contract.end && newEnd <= e.contract.end) return fail("The new end date must be after the current end date");
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
            activity: [logEntry(`renewed ${e.name}'s contract until ${newEnd.split("-").reverse().join("/")}`, id), ...st.activity],
          },
          message: `Contract renewed for ${e.name}. Upload the newly signed copy when you have it.`,
        }), s);
      },

      assignRoom: (id, roomId, checkout) => {
        const e = emp(id);
        if (!e || !s.rooms.some((r) => r.id === roomId)) return fail("Employee or room not found");
        if (s.employees.some((x) => x.roomId === roomId)) return fail(`Room ${roomId} is already taken`);
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
            activity: [logEntry(`assigned room ${roomId} to ${e.name}`, id), ...st.activity],
          },
          message: `Room ${roomId} assigned to ${e.name}`,
        }), s);
      },

      checkOut: (roomId) => {
        const e = s.employees.find((x) => x.roomId === roomId);
        if (!e) return fail("Nobody is in this room");
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.map((x) => (x.id === e.id ? { ...x, roomId: null, checkout: null } : x)),
            activity: [logEntry(`checked ${e.name} out of room ${roomId}`, e.id), ...st.activity],
          },
          message: `Room ${roomId} is now vacant`,
        }), s);
      },

      extendStay: (id, checkout) => {
        const e = emp(id);
        if (!e?.roomId) return fail("This employee has no room");
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.map((x) => (x.id === id ? { ...x, checkout } : x)),
            documents: st.documents.map((d) => (d.employeeId === id && d.type === "Housing agreement" ? { ...d, expires: checkout } : d)),
            activity: [logEntry(`changed ${e.name}'s checkout date to ${checkout.split("-").reverse().join("/")}`, id), ...st.activity],
          },
          message: `Checkout date updated for ${e.name}`,
        }), s);
      },

      uploadDocument: (id, type, file, expires) => {
        if (!file) return fail("Choose a file to upload");
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
              activity: [logEntry(`uploaded ${type.toLowerCase()} for ${e?.name}`, id), ...st.activity],
            },
            message: `${type} uploaded`,
          };
        }, s);
      },

      documentUrl: async (doc, opts) => {
        const e = emp(doc.employeeId);
        const path = opts?.version?.filePath ?? doc.filePath;
        const url = path?.startsWith("blob:") ? path : sampleFileUrl(doc, e?.name ?? "");
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
            activity: [logEntry(`deleted the ${doc.type.toLowerCase()} file for ${e?.name}`, doc.employeeId), ...st.activity],
          },
          message: `${doc.type} deleted`,
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
              logEntry(`added ${n.name} with a ${n.contract.type.toLowerCase()} contract${e.roomId ? ` and room ${e.roomId}` : ""}`, e.id),
              ...st.activity,
            ],
          },
          message: `${n.name} added`,
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
            activity: [logEntry(`imported ${built.length} employees from a spreadsheet`), ...st.activity],
          },
          message: `${built.length} employee${built.length === 1 ? "" : "s"} imported`,
        }), s);
        return { added: built.length, failed: [] };
      },

      archiveEmployee: (id) => {
        const e = emp(id);
        if (!e) return fail("Employee not found");
        return change((st) => ({
          next: {
            ...st,
            employees: st.employees.filter((x) => x.id !== id),
            archived: [{ employee: { ...e, roomId: null, checkout: null }, archivedAt: new Date().toISOString() }, ...st.archived],
            activity: [logEntry(`archived ${e.name}${e.roomId ? ` and checked them out of room ${e.roomId}` : ""}`, id), ...st.activity],
          },
          message: `${e.name} archived`,
        }), s);
      },

      restoreEmployee: (id) => {
        const a = s.archived.find((x) => x.employee.id === id);
        if (!a) return fail("Employee not found");
        return change((st) => ({
          next: {
            ...st,
            archived: st.archived.filter((x) => x.employee.id !== id),
            employees: [...st.employees, a.employee].sort((x, y) => x.name.localeCompare(y.name)),
            activity: [logEntry(`restored ${a.employee.name} from the archive`, id), ...st.activity],
          },
          message: `${a.employee.name} restored`,
        }), s);
      },

      eraseEmployee: (id) => {
        const name = emp(id)?.name ?? s.archived.find((x) => x.employee.id === id)?.employee.name;
        if (!name) return fail("Employee not found");
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
                a.employeeId === id || a.text.includes(name)
                  ? { ...a, employeeId: undefined, text: a.text.split(name).join("a deleted employee") }
                  : a,
              ),
            ],
          },
          message: `${name} permanently deleted`,
        }), s);
      },

      createHotel: () => fail("Creating a hotel is not available in the demo. Sign in to set up your own hotel."),
      createDemoHotel: async () => true,
      switchHotel: () => {},
      acceptTerms: () =>
        change((st) => ({
          next: { ...st, hotel: { ...st.hotel, termsAcceptedAt: new Date().toISOString(), termsAcceptedBy: ME } },
          message: `Agreements accepted (version ${TERMS_VERSION})`,
        }), s),
      updateHotel: (h) =>
        change((st) => ({ next: { ...st, hotel: { ...st.hotel, ...h } }, message: "Hotel details saved" }), s),
      deleteHotel: () =>
        change(() => ({ next: seed(), message: "The demo has been reset to its sample data" }), s),
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
          return fail("Every hotel needs at least one administrator. Make someone else an administrator first.");
        }
        return change((st) => ({
          next: { ...st, members: st.members.map((x) => (x.userId === userId ? { ...x, role } : x)) },
          message: `${m?.email} now has ${ROLE_NAMES[role].toLowerCase()} access`,
        }), s);
      },
      removeMember: (userId) => {
        const m = s.members.find((x) => x.userId === userId);
        return change((st) => ({
          next: { ...st, members: st.members.filter((x) => x.userId !== userId) },
          message: `${m?.email} no longer has access to this hotel`,
        }), s);
      },
      leaveHotel: () => fail("Leaving the hotel is not available in the demo"),
      deleteMyAccount: () => fail("There is no account to delete in the demo. Use Exit demo instead."),

      addRoom: (r) => {
        if (s.rooms.some((x) => x.id === r.number)) return fail(`Room ${r.number} already exists`);
        return change((st) => ({
          next: { ...st, rooms: [...st.rooms, { id: r.number, floor: r.floor, type: r.type, building: r.building }] },
          message: `Room ${r.number} added`,
        }), s);
      },
      addRooms: (list) => {
        const fresh = list.filter((r) => !s.rooms.some((x) => x.id === r.number));
        if (!fresh.length) return fail("All of these rooms already exist");
        return change((st) => ({
          next: {
            ...st,
            rooms: [...st.rooms, ...fresh.map((r): Room => ({ id: r.number, floor: r.floor, type: r.type, building: r.building }))],
          },
          message: `${fresh.length} rooms added${list.length > fresh.length ? `, ${list.length - fresh.length} already existed` : ""}`,
        }), s);
      },
      deleteRoom: (roomId) => {
        if (s.employees.some((e) => e.roomId === roomId)) return fail("Check the occupant out before removing this room");
        return change((st) => ({ next: { ...st, rooms: st.rooms.filter((r) => r.id !== roomId) }, message: `Room ${roomId} removed` }), s);
      },

      invite: (email, role) => {
        const e = email.trim().toLowerCase();
        if (s.invites.some((i) => i.email === e) || s.members.some((m) => m.email === e)) return fail(`${email} is already on the team`);
        return change((st) => ({
          next: { ...st, invites: [...st.invites, { email: e, role }] },
          message: `Invitation saved. In the real app, ${email} joins the first time they sign in.`,
        }), s);
      },
      cancelInvite: (email) =>
        change((st) => ({ next: { ...st, invites: st.invites.filter((i) => i.email !== email) }, message: "Invitation removed" }), s),
      loadDemoData: () => change(() => ({ next: seed(), message: "Sample data restored" }), s),

      signOut: async () => {
        await fetch("/api/shiftcomply-demo", { method: "DELETE" });
        window.location.href = "/shiftcomply";
      },
      notify,
      dismissToast,
    };
    return store;
    // nextId, logEntry and the helpers only read refs or the current state captured here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, toasts, change, notify, dismissToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
