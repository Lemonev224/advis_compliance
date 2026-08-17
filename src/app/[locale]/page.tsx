import { Navigation } from "@/components/Navigation";
import MaintenancePage from "@/components/MaintanacePage";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { DashboardSection } from "@/components/DashboardSection";
import { SolutionSection } from "@/components/ArchitectureSection";  
import { IndustriesSection } from "@/components/IndustriesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { IntegrationsSection } from "@/components/IntergrationsSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <IntegrationsSection />
      <IndustriesSection />
      <HowItWorksSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
    
  );
}
