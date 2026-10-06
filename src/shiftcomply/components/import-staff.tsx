"use client";

import { useMemo, useState } from "react";
import { CircleAlert, Download, FileSpreadsheet } from "lucide-react";
import { Button, cx } from "./ui";
import { useStore, type NewEmployee } from "@/shiftcomply/lib/store";
import { roomStatus } from "@/shiftcomply/lib/derive";
import type { ContractType, Department } from "@/shiftcomply/lib/mock-data";
import { useI18n, type TFunction } from "@/shiftcomply/lib/i18n";

const DEPARTMENTS: Department[] = [
  "Reception", "Housekeeping", "Kitchen", "Restaurant", "Spa", "Facilities", "Guest services", "Administration",
];

const HEADERS = [
  "Name", "Job title", "Department", "Email", "Phone", "Nationality",
  "Contract type", "Start date", "End date", "Hours per week", "Contract signed", "Room",
];

// Column names we recognise, after lower-casing and removing spaces and punctuation.
// Includes the Catalan and Spanish template headers.
const ALIASES: Record<string, string[]> = {
  name: ["name", "fullname", "employee", "nom", "nombre"],
  role: ["jobtitle", "role", "position", "title", "carrec", "puesto"],
  department: ["department", "dept", "departament", "departamento"],
  email: ["email", "mail", "correu", "correo", "correuelectronic", "correoelectronico"],
  phone: ["phone", "telephone", "mobile", "telefon", "telefono"],
  nationality: ["nationality", "nacionalitat", "nacionalidad"],
  type: ["contracttype", "contract", "type", "tipuscontracte", "tipocontrato", "tipusdecontracte", "tipodecontrato"],
  start: ["startdate", "start", "datainici", "inici", "fechainicio", "inicio", "datadinici", "fechadeinicio"],
  end: ["enddate", "end", "datafi", "fi", "fechafin", "fin", "datadefi", "fechadefin"],
  hours: ["hoursperweek", "hours", "hores", "horas", "horessetmanals", "horassemanales"],
  signed: ["contractsigned", "signed", "signat", "firmado", "contractesignat", "contratofirmado"],
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
  atencioalclient: "Guest services", atencionalcliente: "Guest services",
};

const TYPE_ALIASES: Record<string, ContractType> = {
  seasonal: "Seasonal", temporada: "Seasonal", temporal: "Seasonal",
  parttime: "Part-time", tempsparcial: "Part-time", parcial: "Part-time",
  fixedterm: "Fixed-term", determinat: "Fixed-term", obraiservei: "Fixed-term",
  indefinite: "Indefinite", indefinit: "Indefinite", indefinido: "Indefinite", permanent: "Indefinite",
  detemporada: "Seasonal", atempsparcial: "Part-time", atiempoparcial: "Part-time",
  deduradadeterminada: "Fixed-term", deduraciondeterminada: "Fixed-term",
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

/** The template in the app's language. Headers and values are recognised again on import. */
function downloadTemplate(t: TFunction) {
  const example = [
    "Laia Puig", t("Receptionist"), t("Reception"), "laia@example.com", "+376 600 000", t("Spanish"),
    t("Seasonal"), "01/12/2026", "15/04/2027", "40", "no", "204",
  ];
  const csv = "﻿" + [HEADERS.map((h) => t(h)), example].map((r) => r.map((v) => `"${v}"`).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "shiftcomply-staff-template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Upload a CSV of employees, check every row, then import the valid ones. */
export function ImportStaff({ onDone }: { onDone?: () => void }) {
  const { rooms, employees, importEmployees } = useStore();
  const { t, rich } = useI18n();
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
      if (!name) errors.push(t("Name is missing"));

      const deptRaw = get("department");
      let department: Department | undefined =
        DEPARTMENTS.find((d) => norm(d) === norm(deptRaw)) ?? DEPT_ALIASES[norm(deptRaw)];
      if (!department) {
        if (deptRaw) warnings.push(t('Unknown department "{value}", saved as Administration', { value: deptRaw }));
        else warnings.push(t("No department, saved as Administration"));
        department = "Administration";
      }

      const typeRaw = get("type");
      const type: ContractType | undefined = typeRaw ? TYPE_ALIASES[norm(typeRaw)] : "Seasonal";
      if (!type) errors.push(t('Unknown contract type "{value}"', { value: typeRaw }));

      const start = parseDate(get("start"));
      if (!get("start")) errors.push(t("Start date is missing"));
      else if (!start) errors.push(t('Start date "{value}" is not a date', { value: get("start") }));
      const end = parseDate(get("end"));
      if (get("end") && !end) errors.push(t('End date "{value}" is not a date', { value: get("end") }));
      if (start && end && end < start) errors.push(t("End date is before the start date"));
      if (type && type !== "Indefinite" && !end && !errors.length) warnings.push(t("No end date"));

      const hoursRaw = get("hours").replace(",", ".");
      const hours = hoursRaw ? Number(hoursRaw) : 40;
      if (Number.isNaN(hours) || hours <= 0 || hours > 80) errors.push(t('Hours per week "{value}" is not valid', { value: get("hours") }));

      const signed = ["yes", "y", "si", "true", "1", "x", "signed", "signat", "firmado"].includes(norm(get("signed")));

      let roomId: string | null = get("room") || null;
      if (roomId) {
        if (!rooms.some((r) => r.id === roomId)) {
          warnings.push(t("Room {room} does not exist, no room assigned", { room: roomId }));
          roomId = null;
        } else if (!vacant.has(roomId) || claimed.has(roomId)) {
          warnings.push(t("Room {room} is already taken, no room assigned", { room: roomId }));
          roomId = null;
        } else claimed.add(roomId);
      }

      if (name && employees.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
        warnings.push(t("Someone with this name already exists"));
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
      return { line: i + 2, data, name: name || t("Row {n}", { n: i + 2 }), errors, warnings };
    });
  }, [grid, rooms, employees, t]);

  const missingName = grid && grid.length > 0 && !grid[0].map(norm).some((h) => ALIASES.name.includes(h));
  const valid = rows.filter((r) => r.data);

  if (result) {
    return (
      <div className="space-y-3 text-[14px]">
        <p>
          {result.added === 1
            ? t("1 employee imported, with a contract and a document checklist.")
            : t("{n} employees imported, each with a contract and a document checklist.", { n: result.added })}
        </p>
        {result.failed.length > 0 && (
          <div className="rounded bg-danger-soft px-3 py-2 text-[13px] text-danger">
            <div className="font-medium">{t("Not imported:")}</div>
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
            {t("Import another file")}
          </Button>
          {onDone && (
            <Button variant="primary" onClick={onDone}>
              {t("Done")}
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
          {rich("Use a CSV file, with one row per employee. In Excel or Google Sheets, choose {menu}.", {
            menu: <i>{t("Save as / Download → CSV")}</i>,
          })}
        </span>
        <Button size="sm" onClick={() => downloadTemplate(t)}>
          <Download size={14} />
          {t("Download template")}
        </Button>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded border border-dashed border-line-strong bg-sunken px-4 py-6 text-center hover:border-primary">
        <FileSpreadsheet size={22} className="text-muted" />
        <span className="mt-2 text-[13px] font-medium text-ink">{fileName ?? t("Choose a CSV file")}</span>
        <span className="text-[12px] text-muted">
          {t("Columns: name, job title, department, email, phone, nationality, contract type, start date, end date, hours, signed, room")}
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
          <CircleAlert size={15} />{" "}
          {t('The first row must be column names, including a "Name" column. Start from the template if unsure.')}
        </p>
      )}

      {rows.length > 0 && !missingName && (
        <>
          <div className="text-[13px]">
            {rich("{ready} of {total} rows ready to import", {
              ready: <span className="font-medium">{valid.length}</span>,
              total: rows.length,
            })}
            {rows.length - valid.length > 0 && (
              <span className="text-danger">, {t("{n} with problems", { n: rows.length - valid.length })}</span>
            )}
          </div>
          <div className="max-h-[320px] overflow-auto rounded border border-line">
            <table className="w-full border-collapse text-[13px]">
              <thead className="sticky top-0 bg-sunken text-left text-[12px] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("Row")}</th>
                  <th className="px-3 py-2 font-medium">{t("Name")}</th>
                  <th className="px-3 py-2 font-medium">{t("Contract")}</th>
                  <th className="px-3 py-2 font-medium">{t("Room")}</th>
                  <th className="px-3 py-2 font-medium">{t("Check")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={cx("border-t border-line", !r.data && "bg-danger-soft/50")}>
                    <td className="px-3 py-2 text-muted tabular">{r.line}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.name}</div>
                      {r.data && (
                        <div className="text-[12px] text-muted">
                          {[r.data.role, t(r.data.department)].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-body tabular">
                      {r.data ? `${t(r.data.contract.type)}, ${r.data.contract.start} → ${r.data.contract.end ?? t("no end")}` : ""}
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
                      {!r.errors.length && !r.warnings.length && <span className="text-success">{t("Ready")}</span>}
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
              {busy
                ? t("Importing {n}", { n: valid.length })
                : valid.length === 1
                  ? t("Import 1 employee")
                  : t("Import {n} employees", { n: valid.length })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
