import { ShieldCheck, Download, FileArchive, Check } from "lucide-react";
import { PageHeader, Card } from "@/compliance/components/ui";
import { SITES } from "@/compliance/lib/data";
import { SoonButton } from "@/compliance/components/Toast";

export const metadata = { title: "Inspection packs" };

const packs = [
  { name: "Encamp · weekly pack", site: "Encamp", by: "Sandra Ruiz", date: "5 Oct 2026", workers: 12, size: "18.4 MB" },
  { name: "La Massana · labour inspection", site: "La Massana", by: "Demo admin", date: "22 Sep 2026", workers: 12, size: "16.1 MB" },
  { name: "All sites · Q3 audit", site: "All sites", by: "Sandra Ruiz", date: "30 Sep 2026", workers: 52, size: "71.9 MB" },
];

const contents = ["Worker list with roles and employers", "Valid contracts and subcontracts", "Immigration permits and posting forms", "PRL training and medical certificates", "Site check-in log for the period", "Audit trail of access overrides"];

export default function InspectionPacksPage() {
  return (
    <>
      <PageHeader
        section="Compliance"
        title="Inspection packs"
        description="One file with every document an inspector or main contractor asks for, per site and date"
        actions={<SoonButton feature="packs" className="btn-primary"><ShieldCheck className="size-4" aria-hidden />Generate pack</SoonButton>}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        <Card title="Recent packs" subtitle="Kept for 12 months">
          <div className="overflow-x-auto scroll-thin">
            <table className="tbl tbl-hover min-w-[640px]">
              <thead><tr><th>Pack</th><th>Generated</th><th>Workers</th><th>Size</th><th /></tr></thead>
              <tbody>
                {packs.map((p) => (
                  <tr key={p.name}>
                    <td><div className="flex items-center gap-2.5"><span className="inline-flex size-8 items-center justify-center rounded-ctl bg-accent-tint text-accent"><FileArchive className="size-4" aria-hidden /></span><div><div className="font-medium">{p.name}</div><div className="text-xs text-ink-muted">by {p.by}</div></div></div></td>
                    <td className="num text-xs">{p.date}</td>
                    <td className="num text-xs">{p.workers}</td>
                    <td className="num text-xs">{p.size}</td>
                    <td className="text-right"><SoonButton feature="packs" className="btn-secondary btn-row font-normal"><Download className="size-3.5" aria-hidden />Download</SoonButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="New pack" subtitle="Choose a site and period">
          <div className="flex flex-col gap-3 px-[18px] py-4">
            <div><label htmlFor="ip-site" className="label">Site</label><select id="ip-site" className="input w-full"><option>All sites</option>{SITES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="ip-from" className="label">From</label><input id="ip-from" className="input w-full num text-sm" defaultValue="1 Oct 2026" /></div>
              <div><label htmlFor="ip-to" className="label">To</label><input id="ip-to" className="input w-full num text-sm" defaultValue="8 Oct 2026" /></div>
            </div>
            <div>
              <span className="label">Includes</span>
              <ul className="flex flex-col gap-2 text-sm">
                {contents.map((c) => <li key={c} className="flex items-center gap-2"><Check className="size-4 text-ok-fg" aria-hidden />{c}</li>)}
              </ul>
            </div>
            <SoonButton feature="packs" className="btn-primary mt-1">Generate PDF pack</SoonButton>
          </div>
        </Card>
      </div>
    </>
  );
}
