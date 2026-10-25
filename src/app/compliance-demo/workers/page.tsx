import { getT } from "@/compliance/lib/i18n-server";
import { getPeopleData } from "@/compliance/lib/db/queries";
import { PeopleView } from "@/compliance/components/workforce/PeopleView";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Workers") };
}

export default async function WorkersPage() {
  return <PeopleView data={await getPeopleData()} />;
}
