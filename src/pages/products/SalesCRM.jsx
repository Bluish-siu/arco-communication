import {
  TrendingUp,
  UserCheck,
  Flame,
  Clock,
  CheckCircle2,
  Filter,
  DollarSign,
  Kanban,
  Zap,
  ShieldCheck,
  Users,
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
import SalesCRMMockup from '../../components/products/mockups/SalesCRMMockup';

export default function SalesCRM() {
  const stats = [
    { value: '3.4x', label: 'Faster Lead Response', description: 'Under 60 seconds with instant WhatsApp routing' },
    { value: '42%', label: 'Higher Deal Win Rate', description: 'With context-rich conversational pipelines' },
    { value: '0', label: 'Dropped Inbound Leads', description: 'Automated CRM capture & agent reminders' },
    { value: '₹33.0L', label: 'Active Pipeline Managed', description: 'Per average high-performing sales team' },
  ];

  const workflowSteps = [
    {
      title: 'Lead Captured',
      description: 'Inbound prospect contacts via WhatsApp, Instagram ad, or website form.',
      icon: Users,
    },
    {
      title: 'AI Qualification',
      description: 'AI Bot collects budget, timeline, location, and requirement in real time.',
      icon: Zap,
    },
    {
      title: 'Pipeline Assignment',
      description: 'Lead score is calculated (Hot/Warm/Cold) and assigned to the right sales rep.',
      icon: UserCheck,
    },
    {
      title: 'Follow-up & Close',
      description: 'Automated reminders, custom proposal sent in chat, and deal marked as Won.',
      icon: TrendingUp,
    },
  ];

  const useCases = [
    {
      title: 'Real Estate Property Inquiries',
      description: 'Capture prospective buyers, qualify budget and area, and assign to site visit brokers instantly.',
      industry: 'Real Estate & Construction',
      metric: '68% Visit Booking Rate',
    },
    {
      title: 'B2B SaaS & Tech Sales',
      description: 'Book product demos, share one-pagers on WhatsApp, and follow up before proposals go cold.',
      industry: 'B2B & Enterprise',
      metric: '4.5x Pipeline Velocity',
    },
    {
      title: 'High-Value Education Admissions',
      description: 'Counsel prospective students and parents, track application stages, and automate reminder pings.',
      industry: 'Education & EdTech',
      metric: '35% Higher Enrollments',
    },
  ];

  const benefits = [
    {
      title: 'Conversational 5-Stage Kanban Pipeline',
      description: 'Drag and drop deals across custom stages without ever leaving the conversation workspace.',
      icon: Kanban,
      highlight: 'Visual Deal Board',
    },
    {
      title: 'Smart Hot/Warm/Cold Lead Scoring',
      description: 'Automatically score intent based on conversation speed, budget size, and engagement depth.',
      icon: Flame,
      highlight: 'AI Scoring Engine',
    },
    {
      title: 'Automated Follow-Up Reminders',
      description: 'Never let a prospective deal go cold with automated WhatsApp follow-ups and agent alerts.',
      icon: Clock,
      highlight: 'Zero Missed Deals',
    },
  ];

  const faqs = [
    {
      question: 'How does ARCO Sales CRM capture leads automatically?',
      answer: 'Whenever a prospect messages your WhatsApp number, clicks a Click-to-WhatsApp ad, or interacts on Instagram, ARCO automatically creates a lead profile with conversation history, contact details, and source tags.',
    },
    {
      question: 'Can I customize the sales pipeline stages for my business?',
      answer: 'Yes! You can create custom deal stages, define custom fields (like Budget, Property Type, or Company Size), and set up stage-specific automation rules.',
    },
    {
      question: 'How does lead assignment work?',
      answer: 'You can assign leads manually or set up automated round-robin, skill-based, or territory-based routing so incoming inquiries are instantly handed to the available sales agent.',
    },
    {
      question: 'Does ARCO integrate with existing CRMs like Salesforce or HubSpot?',
      answer: 'Yes. ARCO offers two-way synchronization with Salesforce, HubSpot, Zoho CRM, and Pipedrive, ensuring your central CRM stays updated with WhatsApp conversations.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="SALES CRM"
        badgeIcon={TrendingUp}
        headline="Turn conversations into qualified opportunities"
        description="Capture leads, automate follow-ups, manage your pipeline, and close deals without losing the context of every customer conversation."
        mockup={<SalesCRMMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="KANBAN PIPELINE"
        title="Manage your entire sales pipeline inside chat"
        description="Track every deal from discovery to closed-won. See deal value, lead score, customer history, and next action in one unified visual workspace."
        benefits={[
          '5-stage customizable Kanban pipeline (New, Qualified, Demo, Proposal, Won)',
          'Lead cards with deal value, lead score, and assigned sales rep',
          'Integrated 1-click WhatsApp messaging directly from each deal card',
          'Automatic stage progression based on customer responses',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Active Deal Card Detail</div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-900">Rohan Joshi (Tech Corp)</span>
                <span className="text-red-600 bg-red-50 font-bold px-2 py-0.5 rounded text-[10px]">Hot Lead (92/100)</span>
              </div>
              <div className="text-xs text-slate-600">Deal Value: <strong className="text-slate-900">₹4.5L Annual Plan</strong></div>
              <div className="text-xs text-slate-500">Stage: Proposal Sent · Assigned: Rajesh K.</div>
              <div className="pt-2 flex gap-2">
                <span className="px-2.5 py-1 bg-red-600 text-white rounded text-[10px] font-bold">Send WhatsApp Follow-up</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">View Timeline</span>
              </div>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="LEAD QUALIFICATION"
        title="Automatically score and prioritize high-intent buyers"
        description="Stop wasting sales reps' time on cold prospects. Let automated bots collect budget and requirement data, assigning high scores to ready-to-buy customers."
        benefits={[
          'Instant budget and requirement extraction',
          'Automatic Hot/Warm/Cold lead scoring',
          'Priority alerts sent to sales reps on WhatsApp and Slack',
          'Complete customer timeline with all touchpoints',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Lead Qualification Scoring</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-400 block">High Intent Score</span>
                <strong className="text-emerald-600 text-lg">94 / 100</strong>
                <p className="text-[10px] text-slate-600 mt-1">Budget &gt; ₹1.5 Cr · Buying in 30 days</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Nurture Intent Score</span>
                <strong className="text-slate-700 text-lg">48 / 100</strong>
                <p className="text-[10px] text-slate-600 mt-1">General enquiry · Looking next year</p>
              </div>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="SALES CYCLE"
        title="Accelerate deals from first touch to closed-won"
        description="How ARCO Sales CRM automates the high-conversion sales process."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="INDUSTRY ADOPTION"
        title="Trusted by fast-moving sales organizations"
        description="See how sales teams close more deals with conversational CRM."
        useCases={useCases}
      />

      <ProductBenefits
        badge="SALES ROI"
        title="Designed to maximize revenue and rep productivity"
        description="Built to eliminate manual data entry and keep reps focused on closing deals."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="sales-crm" />

      <ProductCTA
        badge="SCALE YOUR PIPELINE"
        title="Start closing more deals on WhatsApp today"
        description="Give your sales team the conversational CRM built for modern messaging."
      />
    </div>
  );
}
