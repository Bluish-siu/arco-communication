import Hero from '../components/hero/Hero';
import TrustedBy from '../components/trust/TrustedBy';
import Features from '../components/features/Features';
import MarketingSection from '../components/sections/MarketingSection';
import SalesSection from '../components/sections/SalesSection';
import AISection from '../components/sections/AISection';
import TeamInboxSection from '../components/sections/TeamInboxSection';
import IntegrationsSection from '../components/sections/IntegrationsSection';
import AnalyticsSection from '../components/sections/AnalyticsSection';
import Testimonials from '../components/testimonials/Testimonials';
import FinalCTA from '../components/cta/FinalCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Features />
      <MarketingSection />
      <SalesSection />
      <AISection />
      <TeamInboxSection />
      <IntegrationsSection />
      <AnalyticsSection />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
