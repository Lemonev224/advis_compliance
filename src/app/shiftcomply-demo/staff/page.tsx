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
import { daysUntil, fmt } from "@/shiftcomply/lib/dates";

type Filter = "all" | "expiring" | "expired" | "unsigned" | "upcoming" | "documents";
const FILTERS: Filter[] = ["all", "expiring", "expired", "unsigned", "upcoming", "documents"];

export default function StaffPage() {
  const { employees, documents, archivedEmployees, restoreEmployee, eraseEmployee, canEdit, myRole } = useStore();
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

  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))).sort(), [employees]);

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
      return !s || e.name.toLowerCase().includes(s) || e.role.toLowerCase().includes(s) || e.roomId?.includes(s);
    })
    .filter(({ e, s }) => matches(filter, e.id, s))
    .sort((a, b) => (a.e.contract.end ?? "9999").localeCompare(b.e.contract.end ?? "9999"));

  const exportCsv = () => {
    const header = ["Name", "Role", "Department", "Contract type", "Start", "End", "Status", "Room", "Checkout", "Documents to upload"];
    const lines = rows.map(({ e, s }) =>
      [
        e.name, e.role, e.department, e.contract.type, e.contract.start, e.contract.end ?? "",
        contractStatusLabel[s], e.roomId ?? "", e.checkout ?? "", String(docSummary.get(e.id)?.problems ?? 0),
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "staff-and-contracts.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeader
        title="Staff and contracts"
        description="Everyone you employ, sorted by contract end date"
        actions={
          <>
            <Button onClick={() => setShowArchived((v) => !v)}>
              <Archive size={16} />
              {showArchived ? "Current staff" : `Archived (${archivedEmployees.length})`}
            </Button>
            <Button onClick={exportCsv}>
              <Download size={16} />
              Export
            </Button>
            {canEdit && (
              <>
                <Button onClick={() => setImporting(true)}>
                  <FileSpreadsheet size={16} />
                  Import
                </Button>
                <Button variant="primary" onClick={() => setAdding(true)}>
                  <UserPlus size={16} />
                  Add employee
                </Button>
              </>
            )}
          </>
        }
      />

      {showArchived ? (
        <Card>
          <div className="border-b border-line px-5 py-3.5">
            <div className="text-[15px] font-semibold">Archived staff</div>
            <p className="text-[13px] text-muted">
              People who have left. Their records are kept until you delete them, so you can show them to an inspector.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <Th>Employee</Th>
                  <Th>Contract ended</Th>
                  <Th>Archived</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {archivedEmployees.map((a) => (
                  <tr key={a.id}>
                    <Td>
                      <div className="font-medium text-ink">{a.name}</div>
                      <div className="text-[12px] text-muted">
                        {a.role}
                        {a.department ? `, ${a.department}` : ""}
                      </div>
                    </Td>
                    <Td className="tabular text-body">{fmt(a.contractEnd)}</Td>
                    <Td className="tabular text-body">{fmt(a.archivedAt.slice(0, 10))}</Td>
                    <Td className="text-right whitespace-nowrap">
                      {canEdit && (
                        <button onClick={() => restoreEmployee(a.id)} className="text-[13px] font-medium text-primary hover:underline">
                          Restore
                        </button>
                      )}
                      {myRole === "admin" && (
                        <button
                          onClick={() => setErase({ id: a.id, name: a.name })}
                          className="ml-4 text-[13px] text-muted hover:text-danger"
                        >
                          Delete permanently
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {archivedEmployees.length === 0 && (
              <p className="px-4 py-10 text-center text-[13px] text-muted">
                Nobody is archived. Archive someone from their page when they leave.
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
            { value: "all", label: "All", count: count("all") },
            { value: "expiring", label: "Expiring", count: count("expiring") },
            { value: "expired", label: "Expired", count: count("expired") },
            { value: "unsigned", label: "Awaiting signature", count: count("unsigned") },
            { value: "upcoming", label: "Starts soon", count: count("upcoming") },
            { value: "documents", label: "Documents needed", count: count("documents") },
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
              placeholder="Search name, role or room"
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="w-52">
            <Select value={dept} onChange={setDept}>
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Contract</Th>
                <Th>Ends</Th>
                <Th>Room</Th>
                <Th>Documents</Th>
                <Th>Status</Th>
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
                            {e.role}, {e.department}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-body">
                      {e.contract.type}
                      <div className="text-[12px] text-muted">{e.contract.hoursPerWeek} h per week</div>
                    </Td>
                    <Td className="tabular">
                      <div className="text-ink">{e.contract.end ? fmt(e.contract.end) : "No end date"}</div>
                      {d !== null && (
                        <div className="text-[12px] text-muted">
                          {s === "upcoming"
                            ? `Starts ${fmt(e.contract.start, false)}`
                            : d >= 0
                              ? `${d} days left`
                              : `Ended ${Math.abs(d)} days ago`}
                        </div>
                      )}
                    </Td>
                    <Td className="tabular text-body">{e.roomId ?? "None"}</Td>
                    <Td>
                      {ds && ds.problems > 0 ? (
                        <span className="font-medium text-warning">{ds.problems} to upload</span>
                      ) : (
                        <span className="text-muted">Complete</span>
                      )}
                    </Td>
                    <Td>
                      {e.contract.renewal === "pending" && (s === "expiring" || s === "expired") ? (
                        <span className="text-[13px] font-medium text-primary">Renewal requested</span>
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
                          Renew
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-muted">No employees in this view.</p>}
        </div>
      </Card>
        </>
      )}

      <ConfirmModal
        open={!!erase}
        onClose={() => setErase(null)}
        onConfirm={() => (erase ? eraseEmployee(erase.id) : undefined)}
        title={`Permanently delete ${erase?.name}`}
        confirmLabel="Delete permanently"
        confirmText={erase?.name}
      >
        <p>
          This erases {erase?.name}&apos;s details, contracts, room history and every uploaded file, and removes their name from
          the history log.
        </p>
        <p className="font-medium text-danger">
          This cannot be undone. Only do this once you no longer have to keep the records.
        </p>
      </ConfirmModal>
      {importing && (
        <Modal open onClose={() => setImporting(false)} title="Import staff from a spreadsheet" width={880}>
          <ImportStaff onDone={() => setImporting(false)} />
        </Modal>
      )}

      {adding && <AddEmployeeModal open onClose={() => setAdding(false)} />}
      {renewId && <RenewContractModal open employeeId={renewId} onClose={() => setRenewId(null)} />}
    </>
  );
}
