// View models shared by server loaders and client components. No server-only imports here.
import type { Status } from "@/compliance/lib/data";

export type Option = { id: string; name: string };

export type PersonRow = {
  id: string;
  name: string;
  role: string;
  company: string;
  companyId: string;
  nat: string;
  site: string;
  siteId: string | null;
  ends: string;
  docs: string;
  status: Status;
  permit: string;
  note: string;
  foreignEmployer: boolean;
};

export type PeopleData = {
  live: boolean;
  canEdit: boolean;
  workers: PersonRow[];
  companies: Option[];
  sites: Option[];
};

export type CheckState = "valid" | "expiring" | "expired" | "missing" | "unconfirmed" | "awaiting_decision";

export type CheckRow = {
  name: string;
  note: string;
  exp: string;
  expiringSoon: boolean;
  state: CheckState;
  daysLeft: number | null;
  blocks: boolean;
  kind: "contract" | "permit" | "document";
};

export type ProfileData = {
  live: boolean;
  worker: PersonRow;
  facts: { permitType: string; permitValidUntil: string; socialSecurity: string; accessUntil: string; accessTone: "warn" | "bad" | null };
  ruleSets: string[];
  checklist: CheckRow[];
  validCount: number;
  requiredCount: number;
  contracts: { title: string; parties: string; range: string; progress: number }[];
  access: {
    items: { label: string; date: string; day: number; binding: boolean }[];
    horizon: number;
    endLabel: string;
    message: string | null;
  };
  history: { time: string; text: string; actor: string }[];
  employer: { name: string; contact: string; email: string | null };
  canEdit: boolean;
  options: { companies: Option[]; sites: Option[] };
  today: { allowed: boolean; site: string; lastCheckIn: string | null };
};

export type ContractRow = {
  id: string;
  worker: string;
  workerId: string | null;
  type: string;
  parties: string;
  start: string;
  end: string;
  status: Status;
  label: string;
};

export type ContractsData = {
  live: boolean;
  canEdit: boolean;
  contracts: ContractRow[];
  summary: { active: number; endingSoon: number; endedAssigned: number; subcontracts: number };
  workers: Option[];
};

export type RuleSetView = {
  name: string;
  when: string;
  nat: string;
  emp: string;
  docs: number;
  workers: number;
  items: { name: string; remind: string; blocks: boolean }[];
};

export type UserView = { name: string; email: string; role: string; sites: string; last: string };

export type AccessKeyView = { id: string; label: string; role: string; prefix: string; scope: string; created: string; lastUsed: string; revoked: boolean };

export type SettingsData = {
  live: boolean;
  ruleSets: RuleSetView[];
  users: UserView[];
  orgName: string;
  isAdmin: boolean;
  org: { name: string; register: string; country: string; language: string };
  keys: AccessKeyView[];
  sites: Option[];
  companies: Option[];
};

export type QueueItem = {
  id: string;
  worker: string;
  workerId: string | null;
  issue: string;
  site: string;
  company: string;
  when: string;
  severity: "overdue" | "soon";
  kind: "Contract" | "Document" | "Permit";
  action: string;
  href: string;
};

export type DashboardData = {
  live: boolean;
  subtitle: string;
  kpis: { label: string; value: string; meta: string; tone?: "warn" | "bad"; progress?: number; href: string }[];
  queue: QueueItem[];
  sites: { name: string; pct: number; detail: string }[];
  averagePct: number;
  weeks: { n: number; label: string }[];
  activity: { name: string; text: string; time: string; system: boolean }[];
};
