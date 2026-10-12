import { SearchX } from "lucide-react";
import { ComingSoon } from "@/compliance/components/ui";

export default function NotFound() {
  return <ComingSoon icon={SearchX} title="Page not found" text="That page doesn’t exist in the demo." href="/compliance-demo" cta="Back to dashboard" />;
}
