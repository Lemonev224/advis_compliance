"use client";

import { Download } from "lucide-react";
import { useToast } from "@/compliance/components/Toast";

export function toCsv(rows: Record<string, string | number | null | undefined>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\r\n");
}

export function downloadCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" }); // BOM so Excel reads accents
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CsvButton({ rows, filename, label = "Export", className = "btn-secondary" }: { rows: Record<string, string | number | null | undefined>[]; filename: string; label?: string; className?: string }) {
  const notify = useToast();
  return (
    <button type="button" className={className} onClick={() => {
      if (!rows.length) return notify({ title: "Nothing to export" });
      downloadCsv(filename, rows);
      notify({ title: `Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`, body: filename, tone: "success" });
    }}>
      <Download className="size-4" aria-hidden />{label}
    </button>
  );
}
