import { notFound } from "next/navigation";

// Unknown addresses inside the demo show the demo's own "Page not found" screen instead of the website's.
export default function Missing() {
  notFound();
}
