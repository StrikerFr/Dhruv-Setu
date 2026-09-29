import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { ProblemSection, PromiseSection } from "@/components/site/StorySections";
import { OfflineFirstSection } from "@/components/site/OfflineFirst";
import { CargoSection, PeopleSection, ReadinessSection } from "@/components/site/CargoAndReadiness";
import { EmergencySection, OneRecordSection } from "@/components/site/EmergencyAndRecord";
import {
  CommandCenterSection,
  LifecycleSection,
  StatesSection,
} from "@/components/site/CommandCenter";
import { ProductPreviewSection } from "@/components/site/ProductPreview";
import {
  ArchitectureSection,
  FinalCTA,
  Footer,
  RealitySection,
  SecuritySection,
} from "@/components/site/Closing";

const title = "DhruvSetu: One operational record for polar expeditions";
const description =
  "DhruvSetu is an offline-first operations platform connecting expedition planning, readiness, cargo custody, station operations, field sorties and emergency response into one auditable record.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <PromiseSection />
        <OfflineFirstSection />
        <CargoSection />
        <ReadinessSection />
        <PeopleSection />
        <EmergencySection />
        <OneRecordSection />
        <CommandCenterSection />
        <StatesSection />
        <ProductPreviewSection />
        <LifecycleSection />
        <SecuritySection />
        <ArchitectureSection />
        <RealitySection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
