"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { Archive, Check, Ellipsis, Mail, Phone, Trash2, Upload, X } from "lucide-react";
import { Avatar, Button, Card, CardHeader, ConfirmModal, KeyValue, Tabs, Td, Th } from "@/shiftcomply/components/ui";
import { DocumentViewer } from "@/shiftcomply/components/document-viewer";
import { ContractBadge, DocBadge, RoomBadge } from "@/shiftcomply/components/status";
import { AssignRoomModal, RenewContractModal, UploadDocumentModal } from "@/shiftcomply/components/actions";
import { useStore, type AccessLogEntry } from "@/shiftcomply/lib/store";
import { complianceChecks, contractStatus, docStatus, roomStatus } from "@/shiftcomply/lib/derive";
import { daysUntil, fmt } from "@/shiftcomply/lib/dates";
import type { DocType, DocumentItem } from "@/shiftcomply/lib/mock-data";

type Tab = "overview" | "documents" | "history";

export default function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    getEmployee, rooms, employees, documents, documentVersions, activity, checkOut, canEdit, myRole,
    archiveEmployee, eraseEmployee, accessLog,
  } = useStore();
  const router = useRouter();
  const e = getEmployee(id);
  const [tab, setTab] = useState<Tab>("overview");
  const [modal, setModal] = useState<null | "renew" | "room" | "archive" | "erase">(null);
  const [upload, setUpload] = useState<{ type: DocType | null } | null>(null);
  const [viewing, setViewing] = useState<DocumentItem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [access, setAccess] = useState<AccessLogEntry[] | null>(null);
  const isAdmin = myRole === "admin";

  useEffect(() => {
    if (!menuOpen) return;
    const h = (ev: MouseEvent) => menuRef.current && !menuRef.current.contains(ev.target as Node) && setMenuOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  // The document access log is only readable by administrators.
  useEffect(() => {
    if (tab !== "history" || !isAdmin) return;
    let cancelled = false;
    accessLog(id).then((rows) => !cancelled && setAccess(rows));
    return () => {
      cancelled = true;
    };
  }, [tab, isAdmin, id, accessLog]);

  // Allows links like /staff/e3?tab=documents
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "documents" || t === "history") setTab(t);
  }, []);

  if (!e) {
    return (
      <Card className="p-10 text-center">
        <p className="font-medium">Employee not found</p>
        <Link href="/shiftcomply-demo/staff" className="mt-2 inline-block text-[13px] text-primary">
          Back to staff
        </Link>
      </Card>
    );
  }

  const status = contractStatus(e);
  const room = rooms.find((r) => r.id === e.roomId);
  const rs = room ? roomStatus(room, employees).status : null;
  const docs = documents.filter((d) => d.employeeId === e.id);
  const docsNeeded = docs.filter((d) => ["missing", "expired"].includes(docStatus(d))).length;
  const checks = complianceChecks(e);
  const daysLeft = daysUntil(e.contract.end);
  const history = activity.filter((a) => a.employeeId === e.id);

  return (
    <>
      <Link href="/shiftcomply-demo/staff" className="mb-3 inline-block text-[13px] text-muted hover:text-primary">
        ← Staff
      </Link>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-5 pb-4">
          <div className="flex items-center gap-4">
            <Avatar name={e.name} size={52} />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[20px] font-semibold">{e.name}</h1>
                <ContractBadge status={status} />
              </div>
              <p className="mt-0.5 text-[14px] text-muted">
                {e.role}, {e.department}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-body">
                {e.email && (
                  <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-primary">
                    <Mail size={14} className="text-subtle" />
                    {e.email}
                  </a>
                )}
                {e.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-subtle" />
                    {e.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!e.roomId && <Button onClick={() => setModal("room")}>Assign room</Button>}
            {e.contract.end && (
              <Button variant="primary" onClick={() => setModal("renew")}>
                Renew contract
              </Button>
            )}
            {canEdit && (
              <div ref={menuRef} className="relative">
                <Button aria-label="More actions" onClick={() => setMenuOpen((o) => !o)} className="px-2.5">
                  <Ellipsis size={16} />
                </Button>
                {menuOpen && (
                  <div className="absolute top-10 right-0 z-30 w-64 rounded-md border border-line bg-surface py-1 shadow-pop">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setModal("archive");
                      }}
                      className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-sunken"
                    >
                      <Archive size={16} className="mt-0.5 text-muted" />
                      <span>
                        <span className="block text-[13px] font-medium">Archive</span>
                        <span className="block text-[12px] text-muted">For people who have left. Records are kept.</span>
                      </span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setModal("erase");
                        }}
                        className="flex w-full items-start gap-2.5 px-3 py-2 text-left text-danger hover:bg-danger-soft"
                      >
                        <Trash2 size={16} className="mt-0.5" />
                        <span>
                          <span className="block text-[13px] font-medium">Delete permanently</span>
                          <span className="block text-[12px] opacity-80">Erases all records and files.</span>
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="px-5">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "overview", label: "Overview" },
              { value: "documents", label: "Documents", count: docsNeeded || undefined },
              { value: "history", label: "History" },
            ]}
          />
        </div>
      </Card>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader title="Contract" />
            <div className="px-5 pb-4">
              <KeyValue label="Type">{e.contract.type}</KeyValue>
              <KeyValue label="Start">{fmt(e.contract.start)}</KeyValue>
              <KeyValue label="End">{fmt(e.contract.end)}</KeyValue>
              {daysLeft !== null && (
                <KeyValue label={daysLeft >= 0 ? "Days left" : "Ended"}>
                  {daysLeft >= 0 ? daysLeft : `${Math.abs(daysLeft)} days ago`}
                </KeyValue>
              )}
              <KeyValue label="Hours per week">{e.contract.hoursPerWeek}</KeyValue>
              <KeyValue label="Signed">{e.contract.signed ? "Yes" : "Not yet"}</KeyValue>
              <KeyValue label="Renewal">
                {e.contract.renewal === "pending" ? "Requested" : e.contract.renewal === "renewed" ? "Renewed" : "Not started"}
              </KeyValue>
              <KeyValue label="Reference">{e.contract.id}</KeyValue>
            </div>
          </Card>

          <Card>
            <CardHeader title="Housing" action={rs && <RoomBadge status={rs} />} />
            <div className="px-5 pb-4">
              {room ? (
                <>
                  <KeyValue label="Room">{room.id}</KeyValue>
                  <KeyValue label="Type">
                    {room.type}, floor {room.floor}
                  </KeyValue>
                  <KeyValue label="Checkout">{fmt(e.checkout)}</KeyValue>
                  <KeyValue label="Matches contract end">{e.checkout === e.contract.end ? "Yes" : "No"}</KeyValue>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/shiftcomply-demo/housing?room=${room.id}`}
                      className="inline-flex h-8 items-center rounded-md border border-line-strong px-2.5 text-[13px] font-medium hover:bg-sunken"
                    >
                      Open room
                    </Link>
                    <Button size="sm" onClick={() => checkOut(room.id)}>
                      Check out
                    </Button>
                  </div>
                </>
              ) : (
                <p className="py-2 text-[13px] text-muted">No staff room assigned.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Compliance" description="Andorran labour law" />
            <ul className="px-5 pb-4">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 py-1.5 text-[13px]">
                  {c.ok ? <Check size={16} className="text-success" /> : <X size={16} className="text-warning" />}
                  <span className={c.ok ? "text-body" : "font-medium text-ink"}>{c.label}</span>
                </li>
              ))}
              <li className="mt-2 border-t border-line pt-2.5 text-[13px]">
                <KeyValue label="Nationality">{e.nationality}</KeyValue>
                <KeyValue label="Employed since">{fmt(e.hiredOn)}</KeyValue>
              </li>
            </ul>
            <p className="border-t border-line px-5 py-3 text-[12px] text-muted">
              These checks are guidance to help you stay organised, not legal advice. Confirm anything unclear with your
              gestoria.
            </p>
          </Card>
        </div>
      )}

      {tab === "documents" && (
        <Card>
          <CardHeader
            title="Documents"
            description={`${docs.filter((d) => d.fileName).length} of ${docs.length} on file`}
            action={
              <Button onClick={() => setUpload({ type: null })}>
                <Upload size={15} />
                Upload
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <Th>Document</Th>
                  <Th>Uploaded</Th>
                  <Th>Expires</Th>
                  <Th>Status</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const st = docStatus(d);
                  return (
                    <tr key={d.id}>
                      <Td>
                        <div className="font-medium text-ink">{d.type}</div>
                        <div className="text-[12px] text-muted">
                          {d.fileName ?? "Not uploaded yet"}
                          {(() => {
                            const n = documentVersions.filter((v) => v.documentId === d.id).length;
                            return n ? `, ${n} earlier version${n === 1 ? "" : "s"}` : "";
                          })()}
                        </div>
                      </Td>
                      <Td className="tabular text-body">{fmt(d.uploaded)}</Td>
                      <Td className="tabular text-body">{fmt(d.expires)}</Td>
                      <Td>
                        <DocBadge status={st} />
                      </Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-4">
                          {d.fileName && (
                            <button onClick={() => setViewing(d)} className="text-[13px] font-medium text-primary hover:underline">
                              View
                            </button>
                          )}
                          {canEdit && d.type !== "Previous employment contract" && (
                            <button
                              onClick={() => setUpload({ type: d.type })}
                              className="text-[13px] font-medium text-primary hover:underline"
                            >
                              {st === "missing" ? "Upload" : "Replace"}
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "history" && (
        <Card>
          <CardHeader title="History" description="Changes made to this employee's contract, room and documents" />
          {history.length === 0 ? (
            <p className="border-t border-line px-5 py-8 text-[13px] text-muted">No changes recorded yet.</p>
          ) : (
            <ul>
              {history.map((a) => (
                <li key={a.id} className="flex items-baseline justify-between gap-4 border-t border-line px-5 py-3 text-[13px]">
                  <span className="text-body">
                    <span className="font-medium text-ink">{a.actor}</span> {a.text}
                  </span>
                  <span className="shrink-0 text-muted">{a.when}</span>
                </li>
              ))}
            </ul>
          )}
          {isAdmin && (
            <>
              <div className="border-t border-line px-5 pt-4 pb-2">
                <h3 className="text-[14px] font-semibold">Document access</h3>
                <p className="text-[12px] text-muted">Who opened or downloaded this person&apos;s documents. Only administrators see this.</p>
              </div>
              {access === null ? (
                <p className="px-5 pb-4 text-[13px] text-muted">Loading</p>
              ) : access.length === 0 ? (
                <p className="px-5 pb-4 text-[13px] text-muted">No documents have been opened yet.</p>
              ) : (
                <ul>
                  {access.map((a) => (
                    <li key={a.id} className="flex items-baseline justify-between gap-4 border-t border-line px-5 py-2.5 text-[13px]">
                      <span className="text-body">
                        <span className="font-medium text-ink">{a.actor}</span> {a.action} {a.documentType.toLowerCase()}
                        <span className="text-muted"> ({a.fileName})</span>
                      </span>
                      <span className="shrink-0 text-muted">{a.when}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Card>
      )}

      {viewing && (
        <DocumentViewer
          doc={viewing}
          employeeName={e.name}
          onClose={() => setViewing(null)}
          onReplace={() => setUpload({ type: viewing.type })}
        />
      )}
      <ConfirmModal
        open={modal === "archive"}
        onClose={() => setModal(null)}
        onConfirm={async () => {
          if (await archiveEmployee(e.id)) router.push("/shiftcomply-demo/staff");
        }}
        title={`Archive ${e.name}`}
        confirmLabel="Archive"
        danger={false}
      >
        <p>
          {e.name} will be hidden from staff lists, reminders and the dashboard.
          {e.roomId && ` They will be checked out of room ${e.roomId}.`}
        </p>
        <p>Contracts and documents are kept, so you can still show them to an inspector. You can restore {e.name} from Staff → Archived at any time.</p>
      </ConfirmModal>
      <ConfirmModal
        open={modal === "erase"}
        onClose={() => setModal(null)}
        onConfirm={async () => {
          if (await eraseEmployee(e.id)) router.push("/shiftcomply-demo/staff");
        }}
        title={`Permanently delete ${e.name}`}
        confirmLabel="Delete permanently"
        confirmText={e.name}
      >
        <p>
          This erases {e.name}&apos;s details, contracts, room history and every uploaded file, and removes their name from the
          history log.
        </p>
        <p className="font-medium text-danger">
          This cannot be undone. Only do this when you no longer have to keep the records, for example after the legal
          retention period or when the person asks for erasure and no law requires you to keep them.
        </p>
      </ConfirmModal>

      {modal === "renew" && <RenewContractModal open employeeId={e.id} onClose={() => setModal(null)} />}
      {modal === "room" && <AssignRoomModal open employeeId={e.id} onClose={() => setModal(null)} />}
      {upload && <UploadDocumentModal open employeeId={e.id} type={upload.type} onClose={() => setUpload(null)} />}
    </>
  );
}
