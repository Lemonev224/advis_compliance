"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DemoStoreProvider } from "./demo-store";
import type {
  ActivityItem,
  ContractType,
  Department,
  DocType,
  DocumentItem,
  Employee,
  RenewalState,
  Room,
} from "./mock-data";

// Website copy of the ShiftComply app's data layer, used only for the public demo.
// The full app (with Supabase, sign-in and real hotels) lives in the shiftcomply-ui project.

export type MemberRole = "admin" | "housing_manager" | "viewer";

export interface Hotel {
  id: string;
  name: string;
  location: string;
  reminderEmail: string;
  seasonLabel: string;
  seasonStart: string | null;
  seasonEnd: string | null;
  isDemo: boolean;
  termsAcceptedAt: string | null;
  termsAcceptedBy: string | null;
}

/** A hotel this person belongs to, for the hotel switcher. */
export interface HotelMembership {
  id: string;
  name: string;
  isDemo: boolean;
  role: MemberRole;
}

export interface ArchivedEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  archivedAt: string;
  contractEnd: string | null;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  fileName: string;
  filePath: string;
  uploaded: string | null;
  replacedAt: string;
  replacedBy: string;
}

export interface AccessLogEntry {
  id: string;
  actor: string;
  action: "viewed" | "downloaded";
  fileName: string;
  documentType: string;
  when: string;
}

export interface NewHotel {
  name: string;
  location: string;
  seasonLabel: string;
  seasonStart: string | null;
  seasonEnd: string | null;
  reminderEmail: string;
}

/** Version of the terms and data processing agreement that hotels accept during setup. */
export const TERMS_VERSION = "2026-10";

export interface Member {
  userId: string;
  email: string;
  role: MemberRole;
}

export interface Invite {
  email: string;
  role: MemberRole;
}

export interface Toast {
  id: number;
  text: string;
  tone: "success" | "error";
}

export type Status = "loading" | "signed-out" | "no-hotel" | "ready" | "error";

export interface NewEmployee {
  name: string;
  role: string;
  department: Department;
  email: string;
  phone: string;
  nationality: string;
  contract: {
    type: ContractType;
    start: string;
    end: string | null;
    hoursPerWeek: number;
    signed: boolean;
  };
  roomId: string | null;
}

export interface Store {
  status: Status;
  /** True when someone is using the code-protected demo, which runs on sample data in the browser. */
  demoMode: boolean;
  errorMessage: string | null;
  hotel: Hotel | null;
  myHotels: HotelMembership[];
  myUserId: string;
  archivedEmployees: ArchivedEmployee[];
  documentVersions: DocumentVersion[];
  myRole: MemberRole;
  canEdit: boolean;
  userEmail: string;
  members: Member[];
  invites: Invite[];
  employees: Employee[];
  rooms: Room[];
  documents: DocumentItem[];
  activity: ActivityItem[];
  toasts: Toast[];
  getEmployee: (id: string) => Employee | undefined;
  renewContract: (employeeId: string, newEnd: string, extendHousing: boolean) => Promise<boolean>;
  assignRoom: (employeeId: string, roomId: string, checkout: string | null) => Promise<boolean>;
  checkOut: (roomId: string) => Promise<boolean>;
  extendStay: (employeeId: string, checkout: string) => Promise<boolean>;
  uploadDocument: (employeeId: string, type: DocType, file: File | null, expires: string | null) => Promise<boolean>;
  openDocument: (doc: DocumentItem) => Promise<void>;
  /** A link to the file that works for 5 minutes. Opening a file is recorded in the access log. */
  documentUrl: (
    doc: DocumentItem,
    opts?: { version?: DocumentVersion; download?: boolean },
  ) => Promise<string | null>;
  accessLog: (employeeId: string) => Promise<AccessLogEntry[]>;
  deleteDocumentFile: (doc: DocumentItem) => Promise<boolean>;
  addEmployee: (e: NewEmployee) => Promise<boolean>;
  importEmployees: (list: NewEmployee[]) => Promise<{ added: number; failed: { name: string; reason: string }[] }>;
  archiveEmployee: (employeeId: string) => Promise<boolean>;
  restoreEmployee: (employeeId: string) => Promise<boolean>;
  eraseEmployee: (employeeId: string) => Promise<boolean>;
  createHotel: (h: NewHotel) => Promise<boolean>;
  createDemoHotel: () => Promise<boolean>;
  switchHotel: (hotelId: string) => void;
  acceptTerms: () => Promise<boolean>;
  updateHotel: (h: Pick<Hotel, "name" | "location" | "reminderEmail" | "seasonLabel" | "seasonStart" | "seasonEnd">) => Promise<boolean>;
  deleteHotel: () => Promise<boolean>;
  exportHotelData: () => Promise<void>;
  updateMemberRole: (userId: string, role: MemberRole) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
  leaveHotel: () => Promise<boolean>;
  deleteMyAccount: () => Promise<boolean>;
  addRooms: (list: { number: string; floor: number; type: "Single" | "Double"; building: string }[]) => Promise<boolean>;
  /** Resolves to true when the room was saved. */
  addRoom: (r: { number: string; floor: number; type: "Single" | "Double"; building: string }) => Promise<boolean>;
  deleteRoom: (roomNumber: string) => Promise<boolean>;
  invite: (email: string, role: MemberRole) => Promise<boolean>;
  cancelInvite: (email: string) => Promise<boolean>;
  loadDemoData: () => Promise<boolean>;
  signOut: () => Promise<void>;
  notify: (text: string, tone?: "success" | "error") => void;
  dismissToast: (id: number) => void;
}

export const Ctx = createContext<Store | null>(null);

export const ROLE_NAMES: Record<MemberRole, string> = {
  admin: "Administrator",
  housing_manager: "Housing manager",
  viewer: "Read only",
};

// ---------- helpers ----------

/** Documents every employee needs, based on their situation. */
export function requiredDocuments(e: {
  nationality: string;
  department: string;
  hasRoom: boolean;
  contractEnd: string | null;
  checkout: string | null;
}): { type: DocType; expires: string | null }[] {
  const docs: { type: DocType; expires: string | null }[] = [
    { type: "Employment contract", expires: e.contractEnd },
    { type: "ID / passport", expires: null },
    { type: "CASS registration", expires: null },
  ];
  if (e.nationality.trim().toLowerCase() !== "andorran") docs.push({ type: "Work and residence permit", expires: null });
  if (e.hasRoom) docs.push({ type: "Housing agreement", expires: e.checkout });
  if (e.department === "Kitchen" || e.department === "Restaurant") docs.push({ type: "Food handler certificate", expires: null });
  return docs;
}

// ---------- provider ----------

/** On the website, ShiftComply only runs as the demo, on sample data in the browser. */
export function StoreProvider({ children }: { children: ReactNode }) {
  return <DemoStoreProvider>{children}</DemoStoreProvider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
