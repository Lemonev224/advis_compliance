import { BarChart3, Users, CalendarClock, IdCard, HardHat, FileWarning } from "lucide-react";
import { PageHeader } from "@/compliance/components/ui";
import { getT } from "@/compliance/lib/i18n-server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Reports") };
}

const reports = [
  { icon: BarChart3, title: "Compliance over time", text: "Share of fully compliant workers per site, week by week." },
  { icon: CalendarClock, title: "Upcoming expiries", text: "Every contract, permit and document ending in the next 90 days." },
  { icon: HardHat, title: "Site access log", text: "Check-ins, blocks and overrides per site, with reasons." },
  { icon: Users, title: "Subcontractor scorecard", text: "Missing and late documents by employer." },
  { icon: IdCard, title: "Permits and quota", text: "Applications by stage and time to Govern decision." },
  { icon: FileWarning, title: "Unconfirmed dates", text: "Uploads whose dates were read automatically and still need a person to confirm." },
];

export default async function ReportsPage() {
  const t = await getT();
  return (
    <>
      <PageHeader section={t("Compliance")} title={t("Reports")} description={t("Exportable views for management, clients and inspectors")} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {reports.map((r) => (
          <div key={r.title} className="card flex flex-col items-start gap-2 p-5">
            <span className="inline-flex size-9 items-center justify-center rounded-ctl bg-accent-tint text-accent"><r.icon className="size-[18px]" aria-hidden /></span>
            <span className="text-[15px] font-semibold">{t(r.title)}</span>
            <span className="text-sm text-ink-muted">{t(r.text)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
