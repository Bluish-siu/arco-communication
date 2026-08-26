import {
  Headphones,
  MessageSquare,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  Tag,
  ArrowRight,
  TrendingUp,
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
import SupportInboxMockup from '../../components/products/mockups/SupportInboxMockup';

export default function CustomerSupport() {
  const stats = [
    { value: '48 sec', label: 'Average Response Time', description: 'Across all WhatsApp and Instagram inquiries' },
    { value: '92%', label: 'First Contact Resolution', description: 'With AI AnswerBot and rich customer context' },
    { value: '94%', label: 'Customer Satisfaction (CSAT)', description: 'Average rating from 45,000+ resolved tickets' },
    { value: '65%', label: 'Workload Reduction', description: 'Through automated FAQs and instant self-service' },
  ];

  const workflowSteps = [
    {
      title: 'Inbound Message',
      description: 'Customer reaches out on WhatsApp, Instagram DM, or RCS.',
      icon: MessageSquare,
    },
    {
      title: 'AI Instant Answer',
      description: 'AI AnswerBot resolves common FAQs, order status, and policy questions.',
      icon: Zap,
    },
    {
      title: 'Smart Agent Routing',
      description: 'Complex queries route automatically with full order and customer history.',
      icon: Users,
    },
    {
      title: 'Rapid Resolution',
      description: 'Agent replies with quick-canned responses, internal notes, and closes ticket.',
      icon: CheckCircle2,
    },
  ];

  const useCases = [
    {
      title: 'E-commerce Order & Delivery Support',
      description: 'Answer "Where is my order?" (WISMO) automatically and process return requests in seconds.',
      industry: 'D2C & Retail',
      metric: '75% Self-Service Rate',
    },
    {
      title: 'SaaS Technical & Account Support',
      description: 'Collaborate with engineers using internal notes and assign tickets by technical expertise.',
      industry: 'Software & Technology',
      metric: '4x Faster SLA',
    },
    {
      title: 'Healthcare Appointment Inquiries',
      description: 'Confirm appointments, send directions, and answer clinic hours with zero wait times.',
      industry: 'Clinics & Hospitals',
      metric: '98% On-Time Support',
    },
  ];

  const benefits = [
    {
      title: 'Unified Omnichannel Shared Inbox',
      description: 'Manage WhatsApp, Instagram DMs, and live chat in one single collaborative screen.',
      icon: Headphones,
      highlight: 'Zero App Switching',
    },
    {
      title: 'Real-Time Collision Detection',
      description: 'See when teammates are typing or viewing a ticket so agents never duplicate responses.',
      icon: ShieldCheck,
      highlight: 'Collision Prevention',
    },
    {
      title: 'AI AnswerBot & Agent Copilot',
      description: 'Suggest instant replies, summarize lengthy conversation histories, and auto-translate text.',
      icon: Sparkles,
      highlight: 'Sub-Minute Resolutions',
    },
  ];

  const faqs = [
    {
      question: 'How many agents can use the ARCO Customer Support inbox simultaneously?',
      answer: 'ARCO supports unlimited agents with role-based permissions, customizable agent groups (e.g. Sales, Support, VIP, Escalations), and automatic routing.',
    },
    {
      question: 'Can multiple agents accidentally reply to the same customer?',
      answer: 'No. ARCO has built-in agent collision detection. Whenever another agent is viewing or replying to a conversation, a real-time indicator warns other team members.',
    },
    {
      question: 'Can agents add private internal notes to a conversation?',
      answer: 'Yes! Agents can tag teammates, leave private internal notes, and discuss customer issues without the customer seeing those messages.',
    },
    {
      question: 'Does ARCO support automated routing outside of business hours?',
      answer: 'Yes. You can configure custom out-of-office automated messages, emergency escalation triggers, and queue tickets for when agents return.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="CUSTOMER SUPPORT"
        badgeIcon={Headphones}
        headline="Give your team one inbox for every customer conversation"
        description="Bring WhatsApp, Instagram, and customer conversations into one collaborative workspace so your team can respond faster and resolve issues better."
        mockup={<SupportInboxMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="SHARED TEAM INBOX"
        title="One unified workspace for WhatsApp, Instagram, and RCS"
        description="Eliminate scattered phones and fragmented chat windows. Give your entire support team a single, centralized multi-agent dashboard."
        benefits={[
          'Multi-agent shared inbox with live presence and collision detection',
          'Automated round-robin, skill-based, and workload-based routing',
          'Private internal notes and team @mentions inside tickets',
          'Custom tags, priority flags, and SLA breach countdown timers',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Multi-Agent Collaboration</div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <strong className="text-slate-900">Priya M. is typing a response...</strong>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px]">
                <strong>Internal Note:</strong> Customer requested size exchange for Order #AR84920. Logistics notified.
              </div>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="AI COPILOT & AUTOMATION"
        title="Empower human agents with instant AI recommendations"
        description="Let ARCO AI summarize long chat histories, draft perfect empathetic answers, and retrieve live order data from Shopify in milliseconds."
        benefits={[
          'AI-drafted response suggestions with 1-click approvals',
          'Instant customer conversation summarization',
          'Rich CRM and order context displayed in the side panel',
          'Automated CSAT satisfaction surveys upon ticket resolution',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">AI Copilot Answer Engine</div>
            <div className="bg-white p-3.5 rounded-xl border border-red-200 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-red-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 98% Match Confidence
                </span>
                <span className="text-slate-400">Knowledge Base Source: Return Policy</span>
              </div>
              <p className="text-slate-700 text-xs">"Your return pickup is scheduled for tomorrow between 10 AM – 1 PM."</p>
              <button type="button" className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold">
                Insert into Chat (Tab)
              </button>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="SUPPORT WORKFLOW"
        title="Resolve tickets 4x faster with intelligent automation"
        description="How ARCO unifies and streamlines support operations."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="SUPPORT AT SCALE"
        title="Proven across fast-growing support teams"
        description="See how customer support teams maintain 94%+ CSAT with ARCO."
        useCases={useCases}
      />

      <ProductBenefits
        badge="SUPPORT EFFICIENCY"
        title="Reduce resolution times and delight customers"
        description="Designed to eliminate agent burnout and deliver instant support across channels."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="customer-support" />

      <ProductCTA
        badge="UPGRADE YOUR SUPPORT"
        title="Deliver faster, friendlier support on WhatsApp"
        description="Unify your team inbox and start resolving customer conversations faster."
      />
    </div>
  );
}
