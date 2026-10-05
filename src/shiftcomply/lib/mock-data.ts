// Shared types for the app, plus the demo dataset.
// The demo data below is only used to generate supabase/setup.sql (the "Load demo data" button).
// The app itself reads everything from Supabase.

export type ContractType = "Seasonal" | "Part-time" | "Fixed-term" | "Indefinite";
export type RenewalState = "none" | "pending" | "renewed";

export interface Contract {
  id: string;
  type: ContractType;
  start: string;
  end: string | null;
  hoursPerWeek: number;
  language: "Catalan" | "Spanish";
  signed: boolean;
  renewal: RenewalState;
  probationDays: number;
  /** Database id of the contract row */
  dbId?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: Department;
  email: string;
  phone: string;
  nationality: string;
  hiredOn: string;
  contract: Contract;
  roomId: string | null;
  /** Agreed checkout date for staff housing. Defaults to the contract end. */
  checkout: string | null;
  source: "Skello" | "CSV import" | "Manual";
  /** Database id of the active room stay, if any */
  assignmentId?: string | null;
}

export type Department =
  | "Reception"
  | "Housekeeping"
  | "Kitchen"
  | "Restaurant"
  | "Spa"
  | "Facilities"
  | "Guest services"
  | "Administration";

export interface Room {
  id: string;
  floor: number;
  type: "Single" | "Double";
  building: string;
  /** Database id of the room row */
  dbId?: string;
}

export type DocType =
  | "Employment contract"
  | "ID / passport"
  | "Work and residence permit"
  | "CASS registration"
  | "Housing agreement"
  | "Food handler certificate"
  | "Previous employment contract";

export interface DocumentItem {
  id: string;
  employeeId: string;
  type: DocType;
  fileName: string | null;
  uploaded: string | null;
  expires: string | null;
  required: boolean;
  /** Path in the private storage bucket. Demo records have a file name but no stored file. */
  filePath?: string | null;
}

export const property = {
  name: "Park Hotel Andorra",
  location: "Andorra la Vella",
  rooms: 20,
  plan: "Pilot",
};

export const employees: Employee[] = [
  {
    id: "e1", name: "Marta Puig", role: "Housekeeping supervisor", department: "Housekeeping",
    email: "m.puig@parkhotel.ad", phone: "+376 812 440", nationality: "Andorran", hiredOn: "2021-05-03",
    contract: { id: "C-2021-014", type: "Indefinite", start: "2021-05-03", end: null, hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 0 },
    roomId: null, checkout: null, source: "Skello",
  },
  {
    id: "e2", name: "Jordi Serra", role: "Front desk agent", department: "Reception",
    email: "j.serra@parkhotel.ad", phone: "+376 344 102", nationality: "Spanish", hiredOn: "2026-06-01",
    contract: { id: "C-2026-031", type: "Seasonal", start: "2026-06-01", end: "2026-10-21", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "pending", probationDays: 15 },
    roomId: "108", checkout: "2026-10-21", source: "Skello",
  },
  {
    id: "e3", name: "Anna Vila", role: "Waiter", department: "Restaurant",
    email: "a.vila@parkhotel.ad", phone: "+376 620 918", nationality: "Spanish", hiredOn: "2026-06-15",
    contract: { id: "C-2026-036", type: "Seasonal", start: "2026-06-15", end: "2027-01-03", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "211", checkout: "2027-01-03", source: "Skello",
  },
  {
    id: "e4", name: "Pol Casals", role: "Kitchen porter", department: "Kitchen",
    email: "p.casals@parkhotel.ad", phone: "+376 355 207", nationality: "Spanish", hiredOn: "2026-05-15",
    contract: { id: "C-2026-022", type: "Seasonal", start: "2026-05-15", end: "2026-09-09", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "208", checkout: "2026-09-09", source: "Skello",
  },
  {
    id: "e5", name: "Laia Roig", role: "Room attendant", department: "Housekeeping",
    email: "l.roig@parkhotel.ad", phone: "+376 633 451", nationality: "Andorran", hiredOn: "2026-04-01",
    contract: { id: "C-2026-011", type: "Part-time", start: "2026-04-01", end: "2026-11-20", hoursPerWeek: 24, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "205", checkout: "2026-11-20", source: "Skello",
  },
  {
    id: "e6", name: "Eric Font", role: "Bartender", department: "Restaurant",
    email: "e.font@parkhotel.ad", phone: "+376 618 330", nationality: "Spanish", hiredOn: "2026-06-01",
    contract: { id: "C-2026-029", type: "Seasonal", start: "2026-06-01", end: "2026-10-14", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "112", checkout: "2026-10-14", source: "Skello",
  },
  {
    id: "e7", name: "Núria Bosch", role: "Chef de partie", department: "Kitchen",
    email: "n.bosch@parkhotel.ad", phone: "+376 365 778", nationality: "Andorran", hiredOn: "2026-02-18",
    contract: { id: "C-2026-004", type: "Fixed-term", start: "2026-02-18", end: "2027-02-18", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 30 },
    roomId: "302", checkout: "2027-02-18", source: "Skello",
  },
  {
    id: "e8", name: "Marc Oliva", role: "Maintenance technician", department: "Facilities",
    email: "m.oliva@parkhotel.ad", phone: "+376 322 019", nationality: "Andorran", hiredOn: "2024-11-01",
    contract: { id: "C-2025-041", type: "Fixed-term", start: "2025-11-01", end: "2027-04-30", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "renewed", probationDays: 0 },
    roomId: "115", checkout: "2027-04-30", source: "Manual",
  },
  {
    id: "e9", name: "Sofia Mendes", role: "Spa therapist", department: "Spa",
    email: "s.mendes@parkhotel.ad", phone: "+376 655 893", nationality: "Portuguese", hiredOn: "2026-06-01",
    contract: { id: "C-2026-027", type: "Seasonal", start: "2026-06-01", end: "2026-09-26", hoursPerWeek: 35, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "103", checkout: "2026-09-26", source: "Skello",
  },
  {
    id: "e10", name: "Diego Herrera", role: "Commis chef", department: "Kitchen",
    email: "d.herrera@parkhotel.ad", phone: "+376 640 112", nationality: "Argentinian", hiredOn: "2026-07-01",
    contract: { id: "C-2026-044", type: "Seasonal", start: "2026-07-01", end: "2026-10-31", hoursPerWeek: 40, language: "Spanish", signed: true, renewal: "pending", probationDays: 15 },
    roomId: "106", checkout: "2026-10-31", source: "CSV import",
  },
  {
    id: "e11", name: "Clara Martí", role: "Receptionist", department: "Reception",
    email: "c.marti@parkhotel.ad", phone: "+376 391 650", nationality: "Andorran", hiredOn: "2026-09-01",
    contract: { id: "C-2026-052", type: "Part-time", start: "2026-09-01", end: "2027-03-31", hoursPerWeek: 20, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: null, checkout: null, source: "Skello",
  },
  {
    id: "e12", name: "Tomás Ferreira", role: "Night auditor", department: "Reception",
    email: "t.ferreira@parkhotel.ad", phone: "+376 677 245", nationality: "Portuguese", hiredOn: "2026-06-10",
    contract: { id: "C-2026-033", type: "Seasonal", start: "2026-06-10", end: "2026-10-09", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "107", checkout: "2026-10-09", source: "Skello",
  },
  {
    id: "e13", name: "Èlia Grau", role: "Room attendant", department: "Housekeeping",
    email: "e.grau@parkhotel.ad", phone: "+376 604 777", nationality: "Spanish", hiredOn: "2026-11-28",
    contract: { id: "C-2026-058", type: "Seasonal", start: "2026-11-28", end: "2027-04-12", hoursPerWeek: 40, language: "Catalan", signed: false, renewal: "none", probationDays: 15 },
    roomId: null, checkout: null, source: "Manual",
  },
  {
    id: "e14", name: "Lucas Bernard", role: "Activities host", department: "Guest services",
    email: "l.bernard@parkhotel.ad", phone: "+376 612 980", nationality: "French", hiredOn: "2026-12-01",
    contract: { id: "C-2026-057", type: "Seasonal", start: "2026-12-01", end: "2027-04-15", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: null, checkout: null, source: "Manual",
  },
  {
    id: "e15", name: "Ivan Petrov", role: "Sommelier", department: "Restaurant",
    email: "i.petrov@parkhotel.ad", phone: "+376 629 404", nationality: "Bulgarian", hiredOn: "2026-03-01",
    contract: { id: "C-2026-008", type: "Fixed-term", start: "2026-03-01", end: "2026-11-02", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 30 },
    roomId: "210", checkout: "2026-11-02", source: "Skello",
  },
  {
    id: "e16", name: "Mireia Soler", role: "HR coordinator", department: "Administration",
    email: "m.soler@parkhotel.ad", phone: "+376 808 120", nationality: "Andorran", hiredOn: "2019-09-15",
    contract: { id: "C-2019-006", type: "Indefinite", start: "2019-09-15", end: null, hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 0 },
    roomId: null, checkout: null, source: "Skello",
  },
  {
    id: "e17", name: "Joana Costa", role: "Laundry attendant", department: "Housekeeping",
    email: "j.costa@parkhotel.ad", phone: "+376 651 318", nationality: "Portuguese", hiredOn: "2026-06-01",
    contract: { id: "C-2026-030", type: "Seasonal", start: "2026-06-01", end: "2026-12-15", hoursPerWeek: 40, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "204", checkout: "2026-12-15", source: "Skello",
  },
  {
    id: "e18", name: "Hugo Blanc", role: "Maintenance assistant", department: "Facilities",
    email: "h.blanc@parkhotel.ad", phone: "+376 642 566", nationality: "French", hiredOn: "2026-05-01",
    contract: { id: "C-2026-018", type: "Part-time", start: "2026-05-01", end: "2026-10-27", hoursPerWeek: 25, language: "Catalan", signed: true, renewal: "none", probationDays: 15 },
    roomId: "110", checkout: "2026-10-27", source: "CSV import",
  },
];

export const rooms: Room[] = [
  { id: "101", floor: 1, type: "Single", building: "Staff residence" },
  { id: "102", floor: 1, type: "Single", building: "Staff residence" },
  { id: "103", floor: 1, type: "Single", building: "Staff residence" },
  { id: "104", floor: 1, type: "Single", building: "Staff residence" },
  { id: "106", floor: 1, type: "Single", building: "Staff residence" },
  { id: "107", floor: 1, type: "Single", building: "Staff residence" },
  { id: "108", floor: 1, type: "Single", building: "Staff residence" },
  { id: "110", floor: 1, type: "Single", building: "Staff residence" },
  { id: "112", floor: 1, type: "Single", building: "Staff residence" },
  { id: "115", floor: 1, type: "Single", building: "Staff residence" },
  { id: "201", floor: 2, type: "Double", building: "Staff residence" },
  { id: "204", floor: 2, type: "Single", building: "Staff residence" },
  { id: "205", floor: 2, type: "Single", building: "Staff residence" },
  { id: "208", floor: 2, type: "Single", building: "Staff residence" },
  { id: "209", floor: 2, type: "Single", building: "Staff residence" },
  { id: "210", floor: 2, type: "Double", building: "Staff residence" },
  { id: "211", floor: 2, type: "Double", building: "Staff residence" },
  { id: "301", floor: 3, type: "Single", building: "Main building" },
  { id: "302", floor: 3, type: "Single", building: "Main building" },
  { id: "303", floor: 3, type: "Single", building: "Main building" },
];

// ---------- Documents ----------

const NON_EU_OR_FOREIGN = (nat: string) => nat !== "Andorran";

function slug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

type DocOverride = Partial<Pick<DocumentItem, "fileName" | "uploaded" | "expires">> & { missing?: boolean };

const overrides: Record<string, Partial<Record<DocType, DocOverride>>> = {
  e3: { "Work and residence permit": { missing: true } },
  e10: { "Work and residence permit": { expires: "2026-10-20" } },
  e9: { "Housing agreement": { expires: "2026-09-26" } },
  e4: { "Housing agreement": { expires: "2026-09-09" } },
  e13: { "Employment contract": { missing: true }, "CASS registration": { missing: true } },
  e14: { "CASS registration": { missing: true } },
  e18: { "CASS registration": { missing: true } },
  e15: { "Work and residence permit": { expires: "2026-11-02" } },
  e7: { "Food handler certificate": { expires: "2026-10-30" } },
};

function buildDocuments(): DocumentItem[] {
  const docs: DocumentItem[] = [];
  let n = 1;
  for (const e of employees) {
    const types: DocType[] = ["Employment contract", "ID / passport", "CASS registration"];
    if (NON_EU_OR_FOREIGN(e.nationality)) types.push("Work and residence permit");
    if (e.roomId) types.push("Housing agreement");
    if (e.department === "Kitchen" || e.department === "Restaurant") types.push("Food handler certificate");

    for (const type of types) {
      const o = overrides[e.id]?.[type] ?? {};
      const uploadedDefault = e.contract.start < "2026-10-04" ? e.contract.start : "2026-09-22";
      let expires: string | null = null;
      if (type === "Employment contract") expires = e.contract.end;
      if (type === "Housing agreement") expires = e.checkout;
      if (type === "Work and residence permit") expires = "2027-09-30";
      if (type === "ID / passport") expires = "2030-06-30";
      if (type === "Food handler certificate") expires = "2027-05-31";

      const missing = !!o.missing;
      const ext = type === "ID / passport" ? "jpg" : "pdf";
      docs.push({
        id: `d${n++}`,
        employeeId: e.id,
        type,
        required: true,
        fileName: missing ? null : `${slug(e.name)}-${slug(type.replace(/[^a-zA-Z ]/g, ""))}.${ext}`,
        uploaded: missing ? null : o.uploaded ?? uploadedDefault,
        expires: missing ? null : o.expires ?? expires,
      });
    }
  }
  return docs;
}

export const documents: DocumentItem[] = buildDocuments();

// ---------- Activity ----------

export interface ActivityItem {
  id: string;
  when: string;
  actor: string;
  text: string;
  employeeId?: string;
}

export const activity: ActivityItem[] = [
  { id: "a1", when: "Today, 09:12", actor: "Mireia Soler", text: "requested renewal for Jordi Serra's contract", employeeId: "e2" },
  { id: "a2", when: "Today, 08:00", actor: "ShiftComply", text: "sent 3 contract expiry reminders" },
  { id: "a3", when: "Yesterday, 17:40", actor: "Mireia Soler", text: "uploaded a food handler certificate for Diego Herrera", employeeId: "e10" },
  { id: "a4", when: "Yesterday, 11:05", actor: "ShiftComply", text: "sent a checkout reminder to Sofia Mendes for room 103", employeeId: "e9" },
  { id: "a5", when: "2 Oct, 15:22", actor: "Marta Puig", text: "assigned room 204 to Joana Costa", employeeId: "e17" },
  { id: "a6", when: "1 Oct, 10:03", actor: "Mireia Soler", text: "created a draft contract for Èlia Grau", employeeId: "e13" },
  { id: "a7", when: "27 Sep, 09:30", actor: "ShiftComply", text: "flagged room 103 as overdue: Sofia Mendes's contract ended on 26 Sep", employeeId: "e9" },
  { id: "a8", when: "10 Sep, 09:30", actor: "ShiftComply", text: "flagged room 208 as overdue: Pol Casals's contract ended on 9 Sep", employeeId: "e4" },
  { id: "a9", when: "2 Sep, 16:12", actor: "Marta Puig", text: "sent Pol Casals a checkout reminder for room 208", employeeId: "e4" },
  { id: "a10", when: "15 Jun, 11:00", actor: "Mireia Soler", text: "added Anna Vila with a seasonal contract and room 211", employeeId: "e3" },
  { id: "a11", when: "15 Jun, 11:04", actor: "Mireia Soler", text: "requested a work and residence permit from Anna Vila", employeeId: "e3" },
  { id: "a12", when: "1 Jun, 10:20", actor: "Mireia Soler", text: "added Jordi Serra with a seasonal contract and room 108", employeeId: "e2" },
  { id: "a13", when: "1 Jun, 10:31", actor: "Mireia Soler", text: "added Sofia Mendes with a seasonal contract and room 103", employeeId: "e9" },
  { id: "a14", when: "15 May, 09:45", actor: "Mireia Soler", text: "added Pol Casals with a seasonal contract and room 208", employeeId: "e4" },
];

// ---------- Users ----------

export const users = [
  { name: "Mireia Soler", email: "m.soler@parkhotel.ad", role: "Administrator", lastActive: "Now" },
  { name: "Marta Puig", email: "m.puig@parkhotel.ad", role: "Housing manager", lastActive: "2 hours ago" },
  { name: "Albert Riba", email: "a.riba@parkhotel.ad", role: "General manager", lastActive: "Yesterday" },
  { name: "Carme Pons", email: "gestoria@pons.ad", role: "External advisor (read only)", lastActive: "28 Sep 2026" },
];
