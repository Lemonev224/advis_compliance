import { getWorkerProfileData } from "@/compliance/lib/db/queries";
import { WorkerProfile } from "@/compliance/components/worker/WorkerProfile";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkerProfile data={await getWorkerProfileData(id)} />;
}
