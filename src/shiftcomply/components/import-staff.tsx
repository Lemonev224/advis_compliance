"use client";

import { useMemo, useState } from "react";
import { CircleAlert, Download, FileSpreadsheet } from "lucide-react";
import { Button, cx } from "./ui";
import { useStore, type NewEmployee } from "@/shiftcomply/lib/store";
import { roomStatus } from "@/shiftcomply/lib/derive";
import type { ContractType, Department } from "@/shiftcomply/lib/mock-data";

const DEPARTMENTS: Department[] = [
  "Reception", "Housekeeping", "Kitchen", "Restaurant", "Spa", "Facilities", "Guest services", "Administration",
];

const HEADERS = [
  "Name", "Job title", "Department", "Email", "Phone", "Nationality",
  "Contract type", "Start date", "End date", "Hours per week", "Contract signed", "Room",
];

// Column names we recognise, after lower-casing and removing spaces and punctuation.
const ALIASES: Record<string, string[]> = {
  name: ["name", "fullname", "employee", "nom", "nombre"],
  role: ["jobtitle", "role", "position", "title", "carrec", "puesto"],
  department: ["department", "dept", "departament", "departamento"],
  email: ["email", "mail", "correu", "correo"],
  phone: ["phone", "telephone", "mobile", "telefon", "telefono"],
  nationality: ["nationality", "nacionalitat", "nacionalidad"],
  type: ["contracttype", "contract", "type", "tipuscontracte", "tipocontrato"],
  start: ["startdate", "start", "datainici", "inici", "fechainicio", "inicio"],
  end: ["enddate", "end", "datafi", "fi", "fechafin", "fin"],
  hours: ["hoursperweek", "hours", "hores", "horas"],
  signed: ["contractsigned", "signed", "signat", "firmado"],
  room: ["room", "habitacio", "habitacion"],
};

const DEPT_ALIASES: Record<string, Department> = {
  recepcio: "Reception", recepcion: "Reception", frontdesk: "Reception",
  pisos: "Housekeeping", neteja: "Housekeeping", limpieza: "Housekeeping",
  cuina: "Kitchen", cocina: "Kitchen",
  restaurante: "Restaurant", sala: "Restaurant", bar: "Restaurant",
  manteniment: "Facilities", mantenimiento: "Facilities", maintenance: "Facilities",
  administracio: "Administration", administracion: "Administration", admin: "Administration",
  animacio: "Guest services", animacion: "Guest services",
};

const TYPE_ALIASES: Record<string, ContractType> = {
  seasonal: "Seasonal", temporada: "Seasonal", temporal: "Seasonal",
  parttime: "Part-time", tempsparcial: "Part-time", parcial: "Part-time",
  fixedterm: "Fixed-term", determinat: "Fixed-term", obraiservei: "Fixed-term",
  indefinite: "Indefinite", indefinit: "Indefinite", indefinido: "Indefinite", permanent: "Indefinite",
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Parses CSV text, detecting comma or semicolon separators (Excel in Europe saves with semicolons). */
function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) {
      row.push(cell.trim());
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}

/** Accepts 2026-12-01, 01/12/2026, 1-12-26, 01.12.2026. Returns YYYY-MM-DD or null. */
function parseDate(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  let y: number, m: number, d: number;
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  else if ((match = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/))) {
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (y < 100) y += 2000;
  } else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface Row {
  line: number;
  data: NewEmployee | null;
  name: string;
  errors: string[];
  warnings: string[];
}

function downloadTemplate() {
  const example = [
    "Laia Puig", "Receptionist", "Reception", "laia@example.com", "+376 600 000", "Spanish",
    "Seasonal", "01/12/2026", "15/04/2027", "40", "no", "204",
  ];
  const csv = "﻿" + [HEADERS, example].map((r) => r.map((v) => `"${v}"`).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "shiftcomply-staff-template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Upload a CSV of employees, check every row, then import the valid ones. */
export function ImportStaff({ onDone }: { onDone?: () => void }) {
  const { rooms, employees, importEmployees } = useStore();
  const [fileName, setFileName] = useState<string | null>(null);
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ added: number; failed: { name: string; reason: string }[] } | null>(null);

  const rows = useMemo<Row[]>(() => {
    if (!grid || grid.length < 2) return [];
    const header = grid[0].map(norm);
    const col = (key: string) => header.findIndex((h) => ALIASES[key].includes(h));
    const idx = Object.fromEntries(Object.keys(ALIASES).map((k) => [k, col(k)])) as Record<string, number>;
    const vacant = new Set(rooms.filter((r) => roomStatus(r, employees).status === "vacant").map((r) => r.id));
    const claimed = new Set<string>();

    return grid.slice(1).map((cells, i) => {
      const get = (k: string) => (idx[k] >= 0 ? (cells[idx[k]] ?? "").trim() : "");
      const errors: string[] = [];
      const warnings: string[] = [];
      const name = get("name");
      if (!name) errors.push("Name is missing");

      const deptRaw = get("department");
      let department: Department | undefined =
        DEPARTMENTS.find((d) => norm(d) === norm(deptRaw)) ?? DEPT_ALIASES[norm(deptRaw)];
      if (!department) {
        if (deptRaw) warnings.push(`Unknown department "${deptRaw}", saved as Administration`);
        else warnings.push("No department, saved as Administration");
        department = "Administration";
      }

      const typeRaw = get("type");
      const type: ContractType | undefined = typeRaw ? TYPE_ALIASES[norm(typeRaw)] : "Seasonal";
      if (!type) errors.push(`Unknown contract type "${typeRaw}"`);

      const start = parseDate(get("start"));
      if (!get("start")) errors.push("Start date is missing");
      else if (!start) errors.push(`Start date "${get("start")}" is not a date`);
      const end = parseDate(get("end"));
      if (get("end") && !end) errors.push(`End date "${get("end")}" is not a date`);
      if (start && end && end < start) errors.push("End date is before the start date");
      if (type && type !== "Indefinite" && !end && !errors.length) warnings.push("No end date");

      const hoursRaw = get("hours").replace(",", ".");
      const hours = hoursRaw ? Number(hoursRaw) : 40;
      if (Number.isNaN(hours) || hours <= 0 || hours > 80) errors.push(`Hours per week "${get("hours")}" is not valid`);

      const signed = ["yes", "y", "si", "true", "1", "x", "signed", "signat", "firmado"].includes(norm(get("signed")));

      let roomId: string | null = get("room") || null;
      if (roomId) {
        if (!rooms.some((r) => r.id === roomId)) {
          warnings.push(`Room ${roomId} does not exist, no room assigned`);
          roomId = null;
        } else if (!vacant.has(roomId) || claimed.has(roomId)) {
          warnings.push(`Room ${roomId} is already taken, no room assigned`);
          roomId = null;
        } else claimed.add(roomId);
      }

      if (name && employees.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
        warnings.push("Someone with this name already exists");
      }

      const data: NewEmployee | null =
        errors.length === 0
          ? {
              name,
              role: get("role"),
              department,
              email: get("email"),
              phone: get("phone"),
              nationality: get("nationality"),
              contract: { type: type!, start: start!, end, hoursPerWeek: hours, signed },
              roomId,
            }
          : null;
      return { line: i + 2, data, name: name || `Row ${i + 2}`, errors, warnings };
    });
  }, [grid, rooms, employees]);

  const missingName = grid && grid.length > 0 && !grid[0].map(norm).some((h) => ALIASES.name.includes(h));
  const valid = rows.filter((r) => r.data);

  if (result) {
    return (
      <div className="space-y-3 text-[14px]">
        <p>
          <span className="font-semibold">{result.added}</span> employee{result.added === 1 ? "" : "s"} imported, each with a
          contract and a document checklist.
        </p>
        {result.failed.length > 0 && (
          <div className="rounded bg-danger-soft px-3 py-2 text-[13px] text-danger">
            <div className="font-medium">Not imported:</div>
            <ul className="mt-1 list-disc pl-5">
              {result.failed.map((f) => (
                <li key={f.name}>
                  {f.name}: {f.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setResult(null);
              setGrid(null);
              setFileName(null);
            }}
          >
            Import another file
          </Button>
          {onDone && (
            <Button variant="primary" onClick={onDone}>
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
        <span>
          Use a CSV file, with one row per employee. In Excel or Google Sheets, choose <i>Save as / Download → CSV</i>.
        </span>
        <Button size="sm" onClick={downloadTemplate}>
          <Download size={14} />
          Download template
        </Button>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded border border-dashed border-line-strong bg-sunken px-4 py-6 text-center hover:border-primary">
        <FileSpreadsheet size={22} className="text-muted" />
        <span className="mt-2 text-[13px] font-medium text-ink">{fileName ?? "Choose a CSV file"}</span>
        <span className="text-[12px] text-muted">
          Columns: name, job title, department, email, phone, nationality, contract type, start date, end date, hours, signed, room
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setFileName(f.name);
            setGrid(parseCsv(await f.text()));
          }}
        />
      </label>

      {missingName && (
        <p className="flex items-center gap-2 rounded bg-danger-soft px-3 py-2 text-[13px] text-danger">
          <CircleAlert size={15} /> The first row must be column names, including a &quot;Name&quot; column. Start from the
          template if unsure.
        </p>
      )}

      {rows.length > 0 && !missingName && (
        <>
          <div className="text-[13px]">
            <span className="font-medium">{valid.length}</span> of {rows.length} rows ready to import
            {rows.length - valid.length > 0 && <span className="text-danger">, {rows.length - valid.length} with problems</span>}
          </div>
          <div className="max-h-[320px] overflow-auto rounded border border-line">
            <table className="w-full border-collapse text-[13px]">
              <thead className="sticky top-0 bg-sunken text-left text-[12px] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Contract</th>
                  <th className="px-3 py-2 font-medium">Room</th>
                  <th className="px-3 py-2 font-medium">Check</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={cx("border-t border-line", !r.data && "bg-danger-soft/50")}>
                    <td className="px-3 py-2 text-muted tabular">{r.line}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.name}</div>
                      {r.data && <div className="text-[12px] text-muted">{[r.data.role, r.data.department].filter(Boolean).join(", ")}</div>}
                    </td>
                    <td className="px-3 py-2 text-body tabular">
                      {r.data ? `${r.data.contract.type}, ${r.data.contract.start} → ${r.data.contract.end ?? "no end"}` : ""}
                    </td>
                    <td className="px-3 py-2 tabular">{r.data?.roomId ?? "—"}</td>
                    <td className="px-3 py-2">
                      {r.errors.map((e) => (
                        <div key={e} className="text-danger">
                          {e}
                        </div>
                      ))}
                      {r.warnings.map((w) => (
                        <div key={w} className="text-warning">
                          {w}
                        </div>
                      ))}
                      {!r.errors.length && !r.warnings.length && <span className="text-success">Ready</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              disabled={!valid.length || busy}
              onClick={async () => {
                setBusy(true);
                setResult(await importEmployees(valid.map((r) => r.data!)));
                setBusy(false);
              }}
            >
              {busy ? `Importing ${valid.length}` : `Import ${valid.length} employee${valid.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
