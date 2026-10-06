"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Card, CardHeader, cx, PageHeader } from "@/shiftcomply/components/ui";
import { RenewContractModal } from "@/shiftcomply/components/actions";
import { useStore } from "@/shiftcomply/lib/store";
import { buildAlerts } from "@/shiftcomply/lib/derive";
import { useI18n } from "@/shiftcomply/lib/i18n";

const DEFAULT_RULES = [
  { id: "contract", label: "Contract ending", detail: "30, 14 and 7 days before the end date", on: true },
  { id: "checkout", label: "Room checkout", detail: "7 days and 1 day before checkout", on: true },
  { id: "overdue", label: "Overdue room", detail: "Every day until the room is vacated", on: true },
  { id: "document", label: "Document expiring", detail: "30 days before a permit or certificate expires", on: true },
  { id: "missing", label: "Missing document", detail: "Weekly summary every Monday", on: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={cx("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-primary" : "bg-line-strong")}
    >
      <span
        className={cx(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          on && "translate-x-4",
        )}
      />
    </button>
  );
}

export default function RemindersPage() {
  const { employees, rooms, documents, notify } = useStore();
  const { t } = useI18n();
  const alerts = useMemo(() => buildAlerts(employees, rooms, documents, t), [employees, rooms, documents, t]);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [renewId, setRenewId] = useState<string | null>(null);
  const [handled, setHandled] = useState<string[]>([]);
  const open = alerts.filter((a) => !handled.includes(a.id));

  return (
    <>
      <PageHeader title={t("Reminders")} description={t("What needs action, and when you get notified")} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title={t("Open reminders")}
            description={open.length === 1 ? t("1 item") : t("{n} items", { n: open.length })}
            action={
              handled.length > 0 && (
                <button onClick={() => setHandled([])} className="text-[13px] font-medium text-primary hover:underline">
                  {t("Show {n} handled", { n: handled.length })}
                </button>
              )
            }
          />
          <ul>
            {open.map((a) => (
              <li key={a.id} className="flex items-center gap-4 border-t border-line px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium text-ink">{a.title}</span>
                    {a.severity === "critical" && <Badge tone="danger">{t("Urgent")}</Badge>}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted">{a.detail}</div>
                </div>
                {a.kind === "contract-expiring" ? (
                  <button
                    onClick={() => setRenewId(a.employeeId)}
                    className="shrink-0 text-[13px] font-medium text-primary hover:underline"
                  >
                    {a.action}
                  </button>
                ) : (
                  <Link href={a.href} className="shrink-0 text-[13px] font-medium text-primary hover:underline">
                    {a.action}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setHandled((h) => [...h, a.id]);
                    notify(t("Marked as handled"));
                  }}
                  className="shrink-0 text-[13px] text-muted hover:text-ink"
                  title={t("Use this when the issue was resolved outside ShiftComply")}
                >
                  {t("Mark handled")}
                </button>
              </li>
            ))}
          </ul>
          {open.length === 0 && <p className="border-t border-line px-5 py-8 text-[13px] text-muted">{t("Nothing needs action.")}</p>}
        </Card>

        <Card className="h-fit">
          <CardHeader title={t("Notification rules")} description={t("Sent by email to administrators")} />
          <ul>
            {rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 border-t border-line px-5 py-3.5">
                <div>
                  <div className="text-[14px] font-medium text-ink">{t(r.label)}</div>
                  <div className="text-[13px] text-muted">{t(r.detail)}</div>
                </div>
                <Toggle
                  on={r.on}
                  onChange={() => {
                    setRules((list) => list.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)));
                    notify(t(r.on ? "{rule} reminders turned off" : "{rule} reminders turned on", { rule: t(r.label) }));
                  }}
                />
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-[12px] text-muted">
            {t("Reminders help you stay organised but are not legal advice. You remain responsible for meeting deadlines.")}
          </p>
        </Card>
      </div>

      {renewId && <RenewContractModal open employeeId={renewId} onClose={() => setRenewId(null)} />}
    </>
  );
}
