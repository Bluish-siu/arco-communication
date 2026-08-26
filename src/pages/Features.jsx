import FeatureHero from '../components/features/FeatureHero';
import FeatureOverview from '../components/features/FeatureOverview';
import MarketingFeature from '../components/features/MarketingFeature';
import SalesFeature from '../components/features/SalesFeature';
import SupportFeature from '../components/features/SupportFeature';
import InstagramFeature from '../components/features/InstagramFeature';
import AIFeature from '../components/features/AIFeature';
import ChatbotFeature from '../components/features/ChatbotFeature';
import CommerceFeature from '../components/features/CommerceFeature';
import AutomationFeature from '../components/features/AutomationFeature';
import AnalyticsFeature from '../components/features/AnalyticsFeature';
import DeveloperFeature from '../components/features/DeveloperFeature';
import FeatureGrid from '../components/features/FeatureGrid';
import FeatureCTA from '../components/features/FeatureCTA';

export default function FeaturesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <FeatureHero />

      {/* 2. Platform Overview ("ONE PLATFORM") */}
      <FeatureOverview />

      {/* 3. WhatsApp Marketing */}
      <MarketingFeature />

      {/* 4. Sales CRM */}
      <SalesFeature />

      {/* 5. Customer Support & Team Inbox */}
      <SupportFeature />

      {/* 6. Instagram Automation */}
      <InstagramFeature />

      {/* 7. AI Agents & Copilot */}
      <AIFeature />

      {/* 8. WhatsApp Chatbots & Native Forms */}
      <ChatbotFeature />

      {/* 9. WhatsApp Commerce */}
      <CommerceFeature />

      {/* 10. Workflow & Campaign Automation */}
      <AutomationFeature />

      {/* 11. Analytics & Attribution */}
      <AnalyticsFeature />

      {/* 12. APIs, Webhooks & Integrations */}
      <DeveloperFeature />

      {/* 13. Complete Feature Capability Grid */}
      <FeatureGrid />

      {/* 14. Final CTA */}
      <FeatureCTA />
    </div>
  );
}
