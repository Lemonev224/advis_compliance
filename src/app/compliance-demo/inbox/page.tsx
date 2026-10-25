import { PageHeader } from "@/compliance/components/ui";
import { ActionQueue } from "@/compliance/components/dashboard/ActionQueue";
import { CsvButton } from "@/compliance/components/CsvButton";
import { getDashboardData } from "@/compliance/lib/db/queries";
import { getT } from "@/compliance/lib/i18n-server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Action inbox") };
}

export default async function InboxPage() {
  const d = await getDashboardData();
  const t = await getT();
  return (
    <>
      <PageHeader
        section={t("Overview")}
        title={t("Action inbox")}
        description={t("Everything that needs a decision, most urgent first. Items disappear once the underlying document or contract is fixed.")}
        actions={<CsvButton filename="action-inbox.csv" rows={d.queue.map((q) => ({ [t("Worker")]: q.worker, [t("Issue")]: t(q.issue), [t("Type")]: t(q.kind), [t("Site")]: q.site, [t("Company")]: q.company, [t("When")]: t(q.when), [t("Severity")]: t(q.severity === "overdue" ? "Overdue" : "Due soon"), [t("Next step")]: t(q.action) }))} />}
      />
      <ActionQueue items={d.queue} showFooter={false} />
    </>
  );
}
