import {
  MessageSquare,
  MessageCircle,
  Zap,
  Users,
  Flame,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
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
import InstagramMockup from '../../components/products/mockups/InstagramMockup';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function InstagramAutomation() {
  const stats = [
    { value: '94%', label: 'Comment Auto-Reply Rate', description: 'Replies sent in under 3 seconds' },
    { value: '3.8x', label: 'More Leads from Posts', description: 'Converting comments directly to DMs' },
    { value: '17.6%', label: 'DM-to-Lead Conversion', description: 'Average across social marketing campaigns' },
    { value: '100%', label: 'Official Meta Compliant', description: 'Fully approved Instagram Messaging API' },
  ];

  const workflowSteps = [
    {
      title: 'User Comments on Post',
      description: 'Customer types "Price?" or "Location?" on your Instagram reel or post.',
      icon: MessageSquare,
    },
    {
      title: 'Instant Public Reply',
      description: 'ARCO automatically replies publicly: "Thanks! We\'ve sent details to your DM 📩".',
      icon: Zap,
    },
    {
      title: 'Private DM Started',
      description: 'ARCO initiates a private DM with product photos, catalog link, and questions.',
      icon: MessageCircle,
    },
    {
      title: 'CRM Lead Created',
      description: 'Prospect phone number and preferences are qualified and synced to CRM.',
      icon: Users,
    },
  ];

  const useCases = [
    {
      title: 'Reel & Post Comment-to-DM Growth',
      description: 'Turn viral reels into sales by automating DMs whenever viewers comment keyword triggers.',
      industry: 'D2C Brands & Creators',
      metric: '5.2x Engagement Surge',
    },
    {
      title: 'Story Reply & Mention Auto-Replies',
      description: 'Engage fans whenever they tag your brand in Instagram stories with instant coupon codes.',
      industry: 'Fashion, Food & Hospitality',
      metric: '88% Story Reply Rate',
    },
    {
      title: 'Instagram Ad Lead Capture',
      description: 'Drive traffic from Instagram Feed and Story ads straight into automated DM qualification.',
      industry: 'Real Estate & Financial Services',
      metric: '40% Lower Cost Per Lead',
    },
  ];

  const benefits = [
    {
      title: 'Automated 24/7 Comment-to-DM Engine',
      description: 'Never miss a buyer asking "Price?" on your posts. Send instant automated DMs immediately.',
      icon: MessageSquare,
      highlight: 'Sub-Second Triggers',
    },
    {
      title: 'Social Lead Capture & Qualification',
      description: 'Extract customer phone numbers, emails, and preferences and sync directly into your CRM.',
      icon: Flame,
      highlight: 'Automatic Lead Creation',
    },
    {
      title: 'Instagram → WhatsApp Omnichannel Flow',
      description: 'Smoothly transfer high-intent Instagram prospects to WhatsApp for final sales closing.',
      icon: TrendingUp,
      highlight: 'Cross-Channel Closing',
    },
  ];

  const faqs = [
    {
      question: 'How does Instagram Comment-to-DM automation work?',
      answer: 'When a user leaves a comment on your Instagram post or reel containing specific keywords (or any comment), ARCO instantly posts a public reply and sends a direct message to their inbox with product details.',
    },
    {
      question: 'Is this compliant with Instagram terms of service?',
      answer: 'Yes! ARCO uses the official Instagram Messaging API provided by Meta. It is 100% compliant and does not risk account shadowbanning.',
    },
    {
      question: 'Can I trigger automations from Instagram Story mentions?',
      answer: 'Yes. Whenever a customer mentions your brand in their Instagram story, ARCO can send an automated thank you message with an exclusive discount code.',
    },
    {
      question: 'Can my human agents reply to Instagram DMs from the ARCO shared inbox?',
      answer: 'Yes. Instagram DMs appear right alongside WhatsApp conversations in the unified ARCO shared inbox.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="INSTAGRAM AUTOMATION"
        badgeIcon={InstagramIcon}
        headline="Turn Instagram conversations into customers"
        description="Automatically engage customers through Instagram DMs, comments, and story interactions while turning high-intent social conversations into qualified leads."
        mockup={<InstagramMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="COMMENT-TO-DM AUTOMATION"
        title="Turn viral comments into private sales conversations"
        description="When followers comment on your reels or posts, automatically reply publicly and send a personalized DM with full catalog links in seconds."
        benefits={[
          'Keyword-specific triggers (e.g. "Price", "Link", "Details", "Buy")',
          'Randomized human-like public comment reply variations',
          'Instant private DM initiation with product cards and media',
          'Automatic tracking of comment-to-DM conversion rates',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Live Comment Trigger Preview</div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="text-[10px] text-slate-400">Post: "New Summer Collection Drop 👗"</div>
              <div className="bg-slate-50 p-2 rounded-lg text-slate-700">
                <strong>@ananya:</strong> "Price and size chart please?"
              </div>
              <div className="bg-rose-50 p-2 rounded-lg border border-rose-200 text-rose-800 text-[11px]">
                <strong>ARCO Auto-Reply:</strong> "Hey Ananya! Sent you the complete catalog & sizes in DM 📩"
              </div>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="STORY & AD CONVERSIONS"
        title="Capture high-intent leads from Instagram ads and story mentions"
        description="Turn social engagement into structured sales opportunities. Capture phone numbers and sync prospects into your WhatsApp sales pipeline."
        benefits={[
          'Automated responses to Instagram Story mentions and replies',
          'Direct integration with Meta Click-to-Instagram Direct ads',
          'Automated phone number collection with WhatsApp opt-in',
          'Seamless handoff to human sales agents',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Instagram → WhatsApp Funnel</div>
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-purple-700">Lead Phone Number Verified</span>
                <span className="text-emerald-600 font-bold">WhatsApp Opt-in ✓</span>
              </div>
              <div className="text-slate-800 font-bold text-xs">Aarav Mehta (+91 98201 48291)</div>
              <p className="text-[10px] text-slate-500">Transferred to WhatsApp Sales Agent for quotation & closing.</p>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="AUTOMATION WORKFLOW"
        title="How Instagram comment-to-DM automation works"
        description="From post engagement to qualified CRM lead in seconds."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="SOCIAL COMMERCE"
        title="How modern brands scale on Instagram"
        description="See how creators, D2C brands, and real estate developers generate leads with Instagram Automation."
        useCases={useCases}
      />

      <ProductBenefits
        badge="SOCIAL ROI"
        title="Maximize your Instagram engagement and revenue"
        description="Convert passive social media followers into active buyers."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="instagram-automation" />

      <ProductCTA
        badge="AUTOMATE YOUR INSTAGRAM"
        title="Start turning Instagram comments into sales"
        description="Join leading brands using ARCO to automate Instagram DMs and social lead capture."
      />
    </div>
  );
}
