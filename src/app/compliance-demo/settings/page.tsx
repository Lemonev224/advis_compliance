import { getT } from "@/compliance/lib/i18n-server";
import { getSettingsData } from "@/compliance/lib/db/queries";
import { SettingsView } from "@/compliance/components/settings/SettingsView";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("Settings") };
}

export default async function SettingsPage() {
  return <SettingsView data={await getSettingsData()} />;
}
