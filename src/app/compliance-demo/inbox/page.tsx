import { PageHeader } from "@/compliance/components/ui";
import { ActionQueue } from "@/compliance/components/dashboard/ActionQueue";
import { CsvButton } from "@/compliance/components/CsvButton";
import { getDashboardData } from "@/compliance/lib/db/queries";

export const metadata = { title: "Action inbox" };

export default async function InboxPage() {
  const d = await getDashboardData();
  return (
    <>
      <PageHeader
        section="Overview"
        title="Action inbox"
        description="Everything that needs a decision, most urgent first. Items disappear once the underlying document or contract is fixed."
        actions={<CsvButton filename="action-inbox.csv" rows={d.queue.map((q) => ({ Worker: q.worker, Issue: q.issue, Type: q.kind, Site: q.site, Company: q.company, When: q.when, Severity: q.severity, "Next step": q.action }))} />}
      />
      <ActionQueue items={d.queue} showFooter={false} />
    </>
  );
}
