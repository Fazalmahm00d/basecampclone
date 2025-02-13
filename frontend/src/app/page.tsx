import FAQSection from "@/components/home-components/FAQ";
import FeaturesSection from "@/components/home-components/FeatureSection";
import HeroSection from "@/components/home-components/HeroSection";
import PricingSection from "@/components/home-components/Pricing";
import TeamSection from "@/components/home-components/TeamSection";
import TestimonialsSection from "@/components/home-components/Testimonials";
import Footer from "@/components/reused-components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <TeamSection />
      <FAQSection />
      <Footer />
    </main>
  );
}