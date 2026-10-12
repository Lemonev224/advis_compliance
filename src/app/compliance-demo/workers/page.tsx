import { getPeopleData } from "@/compliance/lib/db/queries";
import { PeopleView } from "@/compliance/components/workforce/PeopleView";

export const metadata = { title: "Workers" };

export default async function WorkersPage() {
  return <PeopleView data={await getPeopleData()} />;
}
