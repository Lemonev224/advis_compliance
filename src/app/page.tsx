import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { DashboardSection } from "@/components/DashboardSection";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { IndustriesSection } from "@/components/IndustriesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <ProblemSection />
      <ArchitectureSection />
      <IndustriesSection />
      <HowItWorksSection />
      <ContactSection />
      <Footer />
    </main>
  );
}