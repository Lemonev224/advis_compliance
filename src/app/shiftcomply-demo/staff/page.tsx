"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Download, FileSpreadsheet, Search, UserPlus } from "lucide-react";
import { Avatar, Button, Card, ConfirmModal, inputClass, Modal, PageHeader, Segmented, Select, Td, Th } from "@/shiftcomply/components/ui";
import { ImportStaff } from "@/shiftcomply/components/import-staff";
import { ContractBadge } from "@/shiftcomply/components/status";
import { AddEmployeeModal, RenewContractModal } from "@/shiftcomply/components/actions";
import { useStore } from "@/shiftcomply/lib/store";
import { contractStatus, contractStatusLabel, docStatus } from "@/shiftcomply/lib/derive";
import { daysUntil } from "@/shiftcomply/lib/dates";
import { useI18n } from "@/shiftcomply/lib/i18n";

type Filter = "all" | "expiring" | "expired" | "unsigned" | "upcoming" | "documents";
const FILTERS: Filter[] = ["all", "expiring", "expired", "unsigned", "upcoming", "documents"];

export default function StaffPage() {
  const { employees, documents, archivedEmployees, restoreEmployee, eraseEmployee, canEdit, myRole } = useStore();
  const { t, fmt } = useI18n();
  const [showArchived, setShowArchived] = useState(false);
  const [importing, setImporting] = useState(false);
  const [erase, setErase] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [renewId, setRenewId] = useState<string | null>(null);

  // Allows links like /staff?filter=expiring
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("filter") as Filter | null;
    if (f && FILTERS.includes(f)) setFilter(f);
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort((a, b) => t(a).localeCompare(t(b))),
    [employees, t],
  );

  const docSummary = useMemo(() => {
    const map = new Map<string, { problems: number; expiring: number }>();
    for (const d of documents) {
      const s = docStatus(d);
      const cur = map.get(d.employeeId) ?? { problems: 0, expiring: 0 };
      if (s === "missing" || s === "expired") cur.problems++;
      if (s === "expiring") cur.expiring++;
      map.set(d.employeeId, cur);
    }
    return map;
  }, [documents]);

  const matches = (f: Filter, id: string, status: ReturnType<typeof contractStatus>) => {
    if (f === "all") return true;
    if (f === "documents") return (docSummary.get(id)?.problems ?? 0) > 0;
    return status === f;
  };

  const withStatus = useMemo(() => employees.map((e) => ({ e, s: contractStatus(e) })), [employees]);
  const count = (f: Filter) => withStatus.filter(({ e, s }) => matches(f, e.id, s)).length;

  const rows = withStatus
    .filter(({ e }) => dept === "all" || e.department === dept)
    .filter(({ e }) => {
      const s = q.trim().toLowerCase();
      return (
        !s ||
        e.name.toLowerCase().includes(s) ||
        e.role.toLowerCase().includes(s) ||
        t(e.role).toLowerCase().includes(s) ||
        e.roomId?.includes(s)
      );
    })
    .filter(({ e, s }) => matches(filter, e.id, s))
    .sort((a, b) => (a.e.contract.end ?? "9999").localeCompare(b.e.contract.end ?? "9999"));

  const exportCsv = () => {
    const header = ["Name", "Role", "Department", "Contract type", "Start", "End", "Status", "Room", "Checkout", "Documents to upload"].map(
      (h) => t(h),
    );
    const lines = rows.map(({ e, s }) =>
      [
        e.name, t(e.role), t(e.department), t(e.contract.type), e.contract.start, e.contract.end ?? "",
        t(contractStatusLabel[s]), e.roomId ?? "", e.checkout ?? "", String(docSummary.get(e.id)?.problems ?? 0),
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob(["\uFEFF" + [header.map((h) => `"${h}"`).join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${t("staff-and-contracts")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeader
        title={t("Staff and contracts")}
        description={t("Everyone you employ, sorted by contract end date")}
        actions={
          <>
            <Button onClick={() => setShowArchived((v) => !v)}>
              <Archive size={16} />
              {showArchived ? t("Current staff") : t("Archived ({n})", { n: archivedEmployees.length })}
            </Button>
            <Button onClick={exportCsv}>
              <Download size={16} />
              {t("Export")}
            </Button>
            {canEdit && (
              <>
                <Button onClick={() => setImporting(true)}>
                  <FileSpreadsheet size={16} />
                  {t("Import")}
                </Button>
                <Button variant="primary" onClick={() => setAdding(true)}>
                  <UserPlus size={16} />
                  {t("Add employee")}
                </Button>
              </>
            )}
          </>
        }
      />

      {showArchived ? (
        <Card>
          <div className="border-b border-line px-5 py-3.5">
            <div className="text-[15px] font-semibold">{t("Archived staff")}</div>
            <p className="text-[13px] text-muted">
              {t("People who have left. Their records are kept until you delete them, so you can show them to an inspector.")}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <Th>{t("Employee")}</Th>
                  <Th>{t("Contract ended")}</Th>
                  <Th>{t("Archived")}</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {archivedEmployees.map((a) => (
                  <tr key={a.id}>
                    <Td>
                      <div className="font-medium text-ink">{a.name}</div>
                      <div className="text-[12px] text-muted">
                        {t(a.role)}
                        {a.department ? `, ${t(a.department)}` : ""}
                      </div>
                    </Td>
                    <Td className="tabular text-body">{fmt(a.contractEnd)}</Td>
                    <Td className="tabular text-body">{fmt(a.archivedAt.slice(0, 10))}</Td>
                    <Td className="text-right whitespace-nowrap">
                      {canEdit && (
                        <button onClick={() => restoreEmployee(a.id)} className="text-[13px] font-medium text-primary hover:underline">
                          {t("Restore")}
                        </button>
                      )}
                      {myRole === "admin" && (
                        <button
                          onClick={() => setErase({ id: a.id, name: a.name })}
                          className="ml-4 text-[13px] text-muted hover:text-danger"
                        >
                          {t("Delete permanently")}
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {archivedEmployees.length === 0 && (
              <p className="px-4 py-10 text-center text-[13px] text-muted">
                {t("Nobody is archived. Archive someone from their page when they leave.")}
              </p>
            )}
          </div>
        </Card>
      ) : (
        <>
      <div className="mb-4">
        <Segmented
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: t("All"), count: count("all") },
            { value: "expiring", label: t("Expiring"), count: count("expiring") },
            { value: "expired", label: t("Expired"), count: count("expired") },
            { value: "unsigned", label: t("Awaiting signature"), count: count("unsigned") },
            { value: "upcoming", label: t("Starts soon"), count: count("upcoming") },
            { value: "documents", label: t("Documents needed"), count: count("documents") },
          ]}
        />
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search name, role or room")}
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="w-52">
            <Select value={dept} onChange={setDept}>
              <option value="all">{t("All departments")}</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {t(d)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr>
                <Th>{t("Employee")}</Th>
                <Th>{t("Contract")}</Th>
                <Th>{t("Ends")}</Th>
                <Th>{t("Room")}</Th>
                <Th>{t("Documents")}</Th>
                <Th>{t("Status")}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ e, s }) => {
                const ds = docSummary.get(e.id);
                const d = daysUntil(e.contract.end);
                return (
                  <tr key={e.id} onClick={() => router.push(`/shiftcomply-demo/staff/${e.id}`)} className="cursor-pointer hover:bg-sunken">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={e.name} size={32} />
                        <div>
                          <div className="font-medium text-ink">{e.name}</div>
                          <div className="text-[12px] text-muted">
                            {t(e.role)}, {t(e.department)}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-body">
                      {t(e.contract.type)}
                      <div className="text-[12px] text-muted">{t("{n} h per week", { n: e.contract.hoursPerWeek })}</div>
                    </Td>
                    <Td className="tabular">
                      <div className="text-ink">{e.contract.end ? fmt(e.contract.end) : t("No end date")}</div>
                      {d !== null && (
                        <div className="text-[12px] text-muted">
                          {s === "upcoming"
                            ? t("Starts {date}", { date: fmt(e.contract.start, false) })
                            : d === 1
                              ? t("1 day left")
                              : d >= 0
                                ? t("{n} days left", { n: d })
                                : d === -1
                                  ? t("Ended 1 day ago")
                                  : t("Ended {n} days ago", { n: Math.abs(d) })}
                        </div>
                      )}
                    </Td>
                    <Td className="tabular text-body">{e.roomId ?? t("None")}</Td>
                    <Td>
                      {ds && ds.problems > 0 ? (
                        <span className="font-medium text-warning">{t("{n} to upload", { n: ds.problems })}</span>
                      ) : (
                        <span className="text-muted">{t("Complete")}</span>
                      )}
                    </Td>
                    <Td>
                      {e.contract.renewal === "pending" && (s === "expiring" || s === "expired") ? (
                        <span className="text-[13px] font-medium text-primary">{t("Renewal requested")}</span>
                      ) : (
                        <ContractBadge status={s} />
                      )}
                    </Td>
                    <Td className="text-right">
                      {(s === "expiring" || s === "expired") && (
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setRenewId(e.id);
                          }}
                          className="text-[13px] font-medium text-primary hover:underline"
                        >
                          {t("Renew")}
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-muted">{t("No employees in this view.")}</p>}
        </div>
      </Card>
        </>
      )}

      <ConfirmModal
        open={!!erase}
        onClose={() => setErase(null)}
        onConfirm={() => (erase ? eraseEmployee(erase.id) : undefined)}
        title={t("Permanently delete {name}", { name: erase?.name })}
        confirmLabel={t("Delete permanently")}
        confirmText={erase?.name}
      >
        <p>
          {t(
            "This erases {name}'s details, contracts, room history and every uploaded file, and removes their name from the history log.",
            { name: erase?.name },
          )}
        </p>
        <p className="font-medium text-danger">
          {t("This cannot be undone. Only do this once you no longer have to keep the records.")}
        </p>
      </ConfirmModal>
      {importing && (
        <Modal open onClose={() => setImporting(false)} title={t("Import staff from a spreadsheet")} width={880}>
          <ImportStaff onDone={() => setImporting(false)} />
        </Modal>
      )}

      {adding && <AddEmployeeModal open onClose={() => setAdding(false)} />}
      {renewId && <RenewContractModal open employeeId={renewId} onClose={() => setRenewId(null)} />}
    </>
  );
}
