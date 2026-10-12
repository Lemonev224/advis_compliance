import { getSettingsData } from "@/compliance/lib/db/queries";
import { SettingsView } from "@/compliance/components/settings/SettingsView";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  return <SettingsView data={await getSettingsData()} />;
}
