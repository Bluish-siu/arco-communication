import {
  Megaphone,
  Send,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Clock,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import ProductHero from '../../components/products/ProductHero';
import ProductStats from '../../components/products/ProductStats';
import ProductFeatureSection from '../../components/products/ProductFeatureSection';
import ProductWorkflow from '../../components/products/ProductWorkflow';
import ProductUseCases from '../../components/products/ProductUseCases';
import ProductBenefits from '../../components/products/ProductBenefits';
import ProductIntegrations from '../../components/products/ProductIntegrations';
import ProductFAQ from '../../components/products/ProductFAQ';
import RelatedProducts from '../../components/products/RelatedProducts';
import ProductCTA from '../../components/products/ProductCTA';
import MarketingMockup from '../../components/products/mockups/MarketingMockup';

export default function WhatsAppMarketing() {
  const stats = [
    { value: '98%', label: 'Message Open Rate', description: 'Within 5 minutes of delivery' },
    { value: '4.2x', label: 'Average Campaign ROI', description: 'Compared to traditional SMS & email' },
    { value: '45-60%', label: 'Click-Through Rate', description: 'On rich interactive CTWA buttons' },
    { value: '₹18.6L+', label: 'Monthly GMV Generated', description: 'By top-performing marketing teams' },
  ];

  const workflowSteps = [
    {
      title: 'Segment Audience',
      description: 'Filter customers by purchase history, tags, location, and previous engagement.',
      icon: Users,
    },
    {
      title: 'Craft Rich Campaign',
      description: 'Add personalized variables, images, videos, catalogs, and quick-reply CTA buttons.',
      icon: Megaphone,
    },
    {
      title: 'Schedule & Broadcast',
      description: 'Send broadcasts instantly or schedule by customer timezone with auto-retry logic.',
      icon: Clock,
    },
    {
      title: 'Track Conversions & ROI',
      description: 'Monitor live delivery, open rates, replies, link clicks, and revenue attribution.',
      icon: TrendingUp,
    },
  ];

  const useCases = [
    {
      title: 'Flash Sales & Promotional Broadcasts',
      description: 'Reach thousands of segmented buyers instantly with personalized promotional discounts.',
      industry: 'E-commerce & Retail',
      metric: '32% Conversion Lift',
    },
    {
      title: 'Click-to-WhatsApp Ad Conversions',
      description: 'Route Meta ads directly into high-intent WhatsApp conversations and qualify leads on the fly.',
      industry: 'Real Estate & D2C',
      metric: '2.8x Lower CAC',
    },
    {
      title: 'Back-in-Stock & Restock Alerts',
      description: 'Automatically alert interested shoppers when out-of-stock items become available.',
      industry: 'Fashion & Beauty',
      metric: '44% Recovery Rate',
    },
  ];

  const benefits = [
    {
      title: 'Instant 98% Delivery & Visibility',
      description: 'Skip noisy spam folders and reach customers where they actively spend their time every day.',
      icon: Zap,
      highlight: '98% Open Rate',
    },
    {
      title: 'Hyper-Personalized Dynamic Templates',
      description: 'Insert customer names, past orders, custom discounts, and unique links for maximum relevance.',
      icon: Sparkles,
      highlight: 'Dynamic Tags',
    },
    {
      title: 'Verified Meta Business API Safety',
      description: 'Protect your brand with official WhatsApp Business API compliance and high tier sending limits.',
      icon: ShieldCheck,
      highlight: 'Official Green Tick Ready',
    },
  ];

  const faqs = [
    {
      question: 'How do WhatsApp broadcast campaigns work in ARCO?',
      answer: 'ARCO utilizes the official Meta WhatsApp Business API to send pre-approved template messages to opted-in contact lists. You can segment contacts, schedule sends, and track delivery in real time.',
    },
    {
      question: 'Can I personalize broadcast messages for each recipient?',
      answer: 'Yes! You can use dynamic variables like {{1}}, {{2}} to automatically insert first names, coupon codes, product recommendations, order numbers, and custom links.',
    },
    {
      question: 'How does ARCO track conversions and revenue from broadcasts?',
      answer: 'ARCO tracks link clicks, replies, and integrates with Shopify and CRM systems to attribute orders and revenue directly to specific marketing campaigns.',
    },
    {
      question: 'Is there a risk of my WhatsApp number getting banned?',
      answer: 'No. Because ARCO operates exclusively on the official Meta WhatsApp Cloud API with verified templates and opt-in management, your phone number remains protected.',
    },
    {
      question: 'Can I run Click-to-WhatsApp (CTWA) ads with ARCO?',
      answer: 'Yes. ARCO captures lead parameters from Click-to-WhatsApp ads on Facebook and Instagram and triggers automated welcome flows immediately upon contact.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero */}
      <ProductHero
        badge="WHATSAPP MARKETING"
        badgeIcon={Megaphone}
        headline="Turn WhatsApp into your highest-converting marketing channel"
        description="Create personalized campaigns, reach customers at the right moment, and turn conversations into measurable revenue with 98% open rates."
        mockup={<MarketingMockup />}
      />

      {/* 2. Key Metrics */}
      <ProductStats stats={stats} />

      {/* 3. Deep Feature Breakdown Section 1 */}
      <ProductFeatureSection
        badge="TARGETED BROADCASTS"
        title="Send targeted campaigns that customers actually open and read"
        description="Deliver rich media messages with personalized text, product catalogs, and quick-reply action buttons to segmented customer lists."
        benefits={[
          'Dynamic variable personalization (names, discounts, products)',
          'High-speed broadcast delivery engine with auto-retry',
          'Rich media support (images, videos, PDFs, and interactive buttons)',
          'Audience segmentation based on tags, purchases, and behavior',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-center font-bold text-slate-800 pb-2 border-b border-slate-200">
              <span>Campaign Status: Live Broadcast</span>
              <span className="text-emerald-600">99.2% Sent</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">VIP Summer Flash Sale</div>
              <p className="text-slate-600 text-xs">"Hi Aarav! Your exclusive 30% discount is expiring in 4 hours."</p>
              <div className="flex gap-2 pt-1">
                <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 font-bold text-[10px]">Shop Collection →</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">Claim Offer</span>
              </div>
            </div>
          </div>
        }
      />

      {/* 4. Deep Feature Breakdown Section 2 (Reversed) */}
      <ProductFeatureSection
        badge="CLICK-TO-WHATSAPP ADS"
        title="Turn social ad clicks into instant qualified conversations"
        description="Connect your Meta and Instagram advertising campaigns directly to WhatsApp. Capture intent immediately and qualify prospects with zero drop-off."
        benefits={[
          'Instant ad source and UTM campaign attribution',
          'Automated AI welcome and qualification flows',
          '2.8x higher conversion rate than traditional web landing pages',
          'Seamless handoff to human sales representatives',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-center font-bold text-slate-800 pb-2 border-b border-slate-200">
              <span>CTWA Inbound Lead Pipeline</span>
              <span className="text-red-600 font-bold">Meta Ad Synced</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-medium">Source: Instagram Story Ad (Campaign #4829)</div>
              <div className="font-bold text-slate-900">Lead Captured: Priya Sharma</div>
              <div className="text-emerald-600 font-bold text-xs">Intent: Luxury 3BHK Apartment</div>
              <div className="text-slate-500 text-[11px] pt-1">Auto-assigned to South Mumbai Real Estate Team</div>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      {/* 5. How It Works Workflow */}
      <ProductWorkflow
        badge="CAMPAIGN WORKFLOW"
        title="From audience segment to closed sale in 4 steps"
        description="A streamlined process designed to maximize engagement, response speed, and customer lifetime value."
        steps={workflowSteps}
      />

      {/* 6. Use Cases */}
      <ProductUseCases
        badge="PRACTICAL USE CASES"
        title="How top brands drive revenue on WhatsApp"
        description="Explore how growth teams leverage ARCO WhatsApp Marketing to scale customer acquisition and retention."
        useCases={useCases}
      />

      {/* 7. Benefits */}
      <ProductBenefits
        badge="WHY ARCO MARKETING"
        title="Engineered for high delivery, speed, and ROI"
        description="Everything you need to run high-volume WhatsApp marketing campaigns with complete reliability."
        benefits={benefits}
      />

      {/* 8. Integrations */}
      <ProductIntegrations />

      {/* 9. Product FAQ */}
      <ProductFAQ faqs={faqs} />

      {/* 10. Related Products */}
      <RelatedProducts currentProductId="whatsapp-marketing" />

      {/* 11. Final CTA */}
      <ProductCTA
        badge="START MARKETING TODAY"
        title="Turn WhatsApp into your #1 revenue engine"
        description="Join thousands of growing companies using ARCO to scale customer conversations and marketing ROI."
      />
    </div>
  );
}
