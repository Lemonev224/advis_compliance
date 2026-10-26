import Link from "next/link";
import { BarChart3, Users, CalendarClock, IdCard, HardHat, FileWarning, ArrowRight, ShieldCheck } from "lucide-react";
import { REPORTS } from "@/compliance/lib/reports";
import { PageHeader } from "@/compliance/components/ui";
import { getT } from "@/compliance/lib/i18n-server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Reports") };
}

const ICONS = { compliance: BarChart3, expiries: CalendarClock, access: HardHat, subcontractors: Users, permits: IdCard, unconfirmed: FileWarning };

export default async function ReportsPage() {
  const t = await getT();
  return (
    <>
      <PageHeader section={t("Compliance")} title={t("Reports")} description={t("Exportable views for management, clients and inspectors")} />
      <Link href="/compliance-demo/inspection-packs" className="card group flex flex-wrap items-center gap-4 border-accent/40 bg-accent-tint p-5 text-ink no-underline transition-colors hover:border-accent hover:text-ink">
        <span className="inline-flex size-11 flex-none items-center justify-center rounded-ctl bg-accent text-white"><ShieldCheck className="size-6" aria-hidden /></span>
        <span className="flex min-w-[240px] flex-1 flex-col gap-0.5">
          <span className="text-[16px] font-semibold">{t("Labour inspection pack")}</span>
          <span className="text-sm text-ink-muted">{t("One site, ready for the inspector: worker register, employers, every worker's documents, access log and a signed declaration.")}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">{t("Build pack")} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
      </Link>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {REPORTS.map((r) => {
          const Icon = ICONS[r.id];
          return (
            <Link key={r.id} href={`/compliance-demo/reports/${r.id}`} className="card group flex flex-col items-start gap-2 p-5 text-ink no-underline transition-colors hover:border-line-strong hover:text-ink">
              <span className="inline-flex size-9 items-center justify-center rounded-ctl bg-accent-tint text-accent"><Icon className="size-[18px]" aria-hidden /></span>
              <span className="text-[15px] font-semibold">{t(r.title)}</span>
              <span className="text-sm text-ink-muted">{t(r.text)}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent">{t("Open report")} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
