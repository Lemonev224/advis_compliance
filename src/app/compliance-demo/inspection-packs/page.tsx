import { FileArchive, Check } from "lucide-react";
import { PageHeader, Card } from "@/compliance/components/ui";
import { getT } from "@/compliance/lib/i18n-server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Inspection packs") };
}

const packs = [
  { name: "Encamp · weekly pack", site: "Encamp", by: "Sandra Ruiz", date: "5 Oct 2026", workers: 12, size: "18.4 MB" },
  { name: "La Massana · labour inspection", site: "La Massana", by: "Demo admin", date: "22 Sep 2026", workers: 12, size: "16.1 MB" },
  { name: "All sites · Q3 audit", site: "All sites", by: "Sandra Ruiz", date: "30 Sep 2026", workers: 52, size: "71.9 MB" },
];

const contents = ["Worker list with roles and employers", "Valid contracts and subcontracts", "Immigration permits and posting forms", "PRL training and medical certificates", "Site check-in log for the period", "Audit trail of access overrides"];

export default async function InspectionPacksPage() {
  const t = await getT();
  return (
    <>
      <PageHeader
        section={t("Compliance")}
        title={t("Inspection packs")}
        description={t("One file with every document an inspector or main contractor asks for, per site and date")}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        <Card title={t("Recent packs")} subtitle={t("Kept for 12 months")}>
          <div className="overflow-x-auto scroll-thin">
            <table className="tbl tbl-hover min-w-[640px]">
              <thead><tr><th>{t("Pack")}</th><th>{t("Generated")}</th><th>{t("Workers")}</th><th>{t("Size")}</th></tr></thead>
              <tbody>
                {packs.map((p) => (
                  <tr key={p.name}>
                    <td><div className="flex items-center gap-2.5"><span className="inline-flex size-8 items-center justify-center rounded-ctl bg-accent-tint text-accent"><FileArchive className="size-4" aria-hidden /></span><div><div className="font-medium">{t(p.name)}</div><div className="text-xs text-ink-muted">{t("by {name}", { name: t(p.by) })}</div></div></div></td>
                    <td className="num text-xs">{t(p.date)}</td>
                    <td className="num text-xs">{p.workers}</td>
                    <td className="num text-xs">{p.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title={t("What a pack contains")} subtitle={t("Generated per site and period, as one PDF")}>
          <div className="flex flex-col gap-3 px-[18px] py-4">
            <div>
              <ul className="flex flex-col gap-2 text-sm">
                {contents.map((c) => <li key={c} className="flex items-center gap-2"><Check className="size-4 text-ok-fg" aria-hidden />{t(c)}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
