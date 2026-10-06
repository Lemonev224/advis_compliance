"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { Button, ConfirmModal, Modal } from "./ui";
import { useStore, type DocumentVersion } from "@/shiftcomply/lib/store";
import { useI18n } from "@/shiftcomply/lib/i18n";
import type { DocumentItem } from "@/shiftcomply/lib/mock-data";

function kind(name: string | null | undefined) {
  const n = (name ?? "").toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp)$/.test(n)) return "image";
  return "other";
}

/** Shows a document inside the app, with its earlier versions, download and delete. */
export function DocumentViewer({
  doc,
  employeeName,
  onClose,
  onReplace,
}: {
  doc: DocumentItem;
  employeeName: string;
  onClose: () => void;
  onReplace?: () => void;
}) {
  const { documentUrl, documentVersions, deleteDocumentFile, canEdit } = useStore();
  const { t, fmt } = useI18n();
  const versions = documentVersions.filter((v) => v.documentId === doc.id);
  const [version, setVersion] = useState<DocumentVersion | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const shownName = version?.fileName ?? doc.fileName;

  useEffect(() => {
    let cancelled = false;
    documentUrl(doc, { version: version ?? undefined }).then((u) => {
      if (cancelled) return;
      setUrl(u);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // Re-fetch only when a different file is chosen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id, version?.id]);

  const download = async () => {
    const u = await documentUrl(doc, { version: version ?? undefined, download: true });
    if (u) window.location.href = u;
  };

  return (
    <Modal open onClose={onClose} title={`${t(doc.type)}, ${employeeName}`} description={shownName ?? undefined} width={960}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
        <div className="flex h-[62vh] min-h-[320px] items-center justify-center overflow-hidden rounded border border-line bg-sunken">
          {loading || !url ? (
            <span className="text-[13px] text-muted">{loading ? t("Opening") : t("This file could not be opened.")}</span>
          ) : kind(shownName) === "pdf" ? (
            <iframe src={url} title={shownName ?? t("Document")} className="h-full w-full" />
          ) : kind(shownName) === "image" ? (
            // Signed, short-lived storage link; next/image cannot optimise it.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={shownName ?? t("Document")} className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[13px] text-muted">
              <FileText size={28} />
              {t("No preview for this file type.")}
              <Button size="sm" onClick={download}>
                {t("Download")}
              </Button>
            </div>
          )}
        </div>

        <aside className="space-y-4 text-[13px]">
          <div className="flex flex-col gap-2">
            <Button onClick={download}>
              <Download size={15} />
              {t("Download")}
            </Button>
            {canEdit && onReplace && (
              <Button
                onClick={() => {
                  onClose();
                  onReplace();
                }}
              >
                <Upload size={15} />
                {t("Upload new version")}
              </Button>
            )}
            {canEdit && (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={15} />
                {t("Delete file")}
              </Button>
            )}
          </div>

          <div>
            <div className="mb-1.5 font-semibold">{t("Versions")}</div>
            <ul className="divide-y divide-line rounded border border-line">
              <li>
                <button
                  onClick={() => setVersion(null)}
                  className={`w-full px-3 py-2 text-left hover:bg-sunken ${version === null ? "bg-primary-soft" : ""}`}
                >
                  <span className="block font-medium">{t("Current")}</span>
                  <span className="block text-[12px] text-muted">{t("Uploaded {date}", { date: fmt(doc.uploaded) })}</span>
                </button>
              </li>
              {versions.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => setVersion(v)}
                    className={`w-full px-3 py-2 text-left hover:bg-sunken ${version?.id === v.id ? "bg-primary-soft" : ""}`}
                  >
                    <span className="block truncate">{v.fileName}</span>
                    <span className="block text-[12px] text-muted">
                      {v.replacedBy
                        ? t("Replaced {date} by {person}", { date: fmt(v.replacedAt.slice(0, 10)), person: v.replacedBy.split("@")[0] })
                        : t("Replaced {date}", { date: fmt(v.replacedAt.slice(0, 10)) })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {versions.length === 0 && <p className="mt-1.5 text-[12px] text-muted">{t("No earlier versions.")}</p>}
          </div>
          <p className="text-[12px] text-muted">{t("Opening or downloading a document is recorded in the employee's history.")}</p>
        </aside>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (await deleteDocumentFile(doc)) onClose();
        }}
        title={t("Delete {doc}", { doc: t(doc.type).toLowerCase() })}
        confirmLabel={t("Delete file")}
      >
        <p>
          {versions.length === 0
            ? t("The file will be permanently deleted from storage.")
            : versions.length === 1
              ? t("The file and its earlier version will be permanently deleted from storage.")
              : t("The file and its {n} earlier versions will be permanently deleted from storage.", { n: versions.length })}
        </p>
        {doc.required && (
          <p>{t("The {doc} stays on {name}'s checklist as missing.", { doc: t(doc.type).toLowerCase(), name: employeeName })}</p>
        )}
      </ConfirmModal>
    </Modal>
  );
}
