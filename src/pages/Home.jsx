import Hero from '../components/hero/Hero';
import TrustedBy from '../components/trust/TrustedBy';
import Features from '../components/features/Features';
import PowerfulCapabilities from '../components/sections/PowerfulCapabilities';
import ElevateCxSection from '../components/sections/ElevateCxSection';
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
      <PowerfulCapabilities />
      <ElevateCxSection />
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
