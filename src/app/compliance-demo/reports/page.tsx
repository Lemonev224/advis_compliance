import { BarChart3, Users, CalendarClock, IdCard, HardHat, FileWarning, ArrowRight } from "lucide-react";
import { PageHeader } from "@/compliance/components/ui";
import { SoonButton } from "@/compliance/components/Toast";

export const metadata = { title: "Reports" };

const reports = [
  { icon: BarChart3, title: "Compliance over time", text: "Share of fully compliant workers per site, week by week." },
  { icon: CalendarClock, title: "Upcoming expiries", text: "Every contract, permit and document ending in the next 90 days." },
  { icon: HardHat, title: "Site access log", text: "Check-ins, blocks and overrides per site, with reasons." },
  { icon: Users, title: "Subcontractor scorecard", text: "Missing and late documents by employer." },
  { icon: IdCard, title: "Permits and quota", text: "Applications by stage and time to Govern decision." },
  { icon: FileWarning, title: "Unconfirmed dates", text: "Uploads whose dates were read automatically and still need a person to confirm." },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeader section="Compliance" title="Reports" description="Exportable views for management, clients and inspectors" actions={<SoonButton feature="reports" className="btn-secondary">Schedule a report</SoonButton>} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {reports.map((r) => (
          <SoonButton key={r.title} feature="reports" title={r.title} className="card group flex flex-col items-start gap-2 p-5 text-left transition-colors hover:border-line-strong">
            <span className="inline-flex size-9 items-center justify-center rounded-ctl bg-accent-tint text-accent"><r.icon className="size-[18px]" aria-hidden /></span>
            <span className="text-[15px] font-semibold">{r.title}</span>
            <span className="text-sm text-ink-muted">{r.text}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent">Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
          </SoonButton>
        ))}
      </div>
    </>
  );
}
