import { getContractsData } from "@/compliance/lib/db/queries";
import { ContractsView } from "@/compliance/components/workforce/ContractsView";

export const metadata = { title: "Contracts · Workers" };

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const { new: renewFor } = await searchParams;
  return <ContractsView data={await getContractsData()} renewFor={renewFor ?? null} />;
}
