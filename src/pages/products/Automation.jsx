import {
  Workflow,
  Clock,
  GitBranch,
  Zap,
  CheckCircle2,
  Bell,
  Database,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
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
import WorkflowMockup from '../../components/products/mockups/WorkflowMockup';

export default function Automation() {
  const stats = [
    { value: '10M+', label: 'Monthly Automated Steps', description: 'Executed reliably with sub-second latency' },
    { value: '85%', label: 'Manual Effort Saved', description: 'Eliminating routine follow-up tasks' },
    { value: '99.9%', label: 'Workflow Execution Uptime', description: 'Built on robust event-driven architecture' },
    { value: '500+', label: 'Pre-Built Automation Recipes', description: 'Ready to deploy with single-click activation' },
  ];

  const workflowSteps = [
    {
      title: 'Define Trigger',
      description: 'Trigger on new leads, tag additions, form submissions, or webhook events.',
      icon: Zap,
    },
    {
      title: 'Set Delays & Conditions',
      description: 'Add humanized waiting periods (e.g. 5 mins) and evaluate user lead scores.',
      icon: Clock,
    },
    {
      title: 'Execute Multi-Actions',
      description: 'Send WhatsApp message, assign CRM owner, send email, or ping Slack.',
      icon: Workflow,
    },
    {
      title: 'Monitor & Optimize',
      description: 'Track branch completion rates, drop-offs, and conversion milestones.',
      icon: TrendingUp,
    },
  ];

  const useCases = [
    {
      title: 'Automated Lead Nurturing & Follow-ups',
      description: 'Send a multi-day drip of case studies and testimonials until the lead books a demo.',
      industry: 'B2B & Enterprise',
      metric: '3.4x Higher Meeting Rate',
    },
    {
      title: 'Payment & Renewal Reminders',
      description: 'Automatically remind subscribers 3 days before payment due dates with 1-click UPI links.',
      industry: 'SaaS, Gyms & Memberships',
      metric: '92% On-Time Collections',
    },
    {
      title: 'Post-Purchase Engagement & Reviews',
      description: 'Request Google or Trustpilot reviews 2 days after confirmed courier delivery.',
      industry: 'E-commerce & Local Business',
      metric: '5x More 5-Star Reviews',
    },
  ];

  const benefits = [
    {
      title: 'Event-Driven Trigger Architecture',
      description: 'React instantly to customer actions across ads, websites, Shopify, and WhatsApp.',
      icon: Zap,
      highlight: 'Instant Event Triggers',
    },
    {
      title: 'Complex Conditional Branching',
      description: 'Route users down different paths based on budget, purchase status, tags, or location.',
      icon: GitBranch,
      highlight: 'Smart Logic & Filters',
    },
    {
      title: 'Multi-Channel Action Execution',
      description: 'Trigger WhatsApp messages, SMS fallbacks, internal Slack pings, and CRM updates in sync.',
      icon: Bell,
      highlight: 'Omnichannel Sync',
    },
  ];

  const faqs = [
    {
      question: 'What triggers can start an automation workflow in ARCO?',
      answer: 'Workflows can be triggered by new inbound messages, keyword matches, tag additions, stage changes in CRM, webhook events from external systems, or time-based schedules.',
    },
    {
      question: 'Can I add conditional logic (IF/THEN) to workflows?',
      answer: 'Yes! ARCO supports multi-condition branching based on custom contact fields, lead scores, past purchase amounts, time of day, and customer responses.',
    },
    {
      question: 'Can ARCO workflows update external CRMs?',
      answer: 'Yes. ARCO workflows can trigger webhook requests to update Salesforce, HubSpot, Zoho, Google Sheets, or any custom backend endpoint.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="WORKFLOW AUTOMATION"
        badgeIcon={Workflow}
        headline="Automate every step of the customer journey"
        description="Build powerful workflows that trigger actions, send messages, qualify leads, update CRM records, and keep customers engaged automatically."
        mockup={<WorkflowMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="TRIGGER-BASED WORKFLOWS"
        title="Put routine customer communications on autopilot"
        description="Design intelligent journeys with custom delays, condition filters, and multi-step actions that guide leads to conversion without manual intervention."
        benefits={[
          'Event-based triggers (lead captured, order placed, tag added)',
          'Configurable delays (minutes, hours, days, or specific time of day)',
          'Smart condition filters based on lead scores and user attributes',
          'Automatic re-engagement sequences for dormant prospects',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Active Automation Workflow</div>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <span>⚡ Trigger: New Inbound Lead via Meta Ad</span>
                <span className="text-emerald-600 font-bold">Instant</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <span>⏳ Delay: Wait 5 minutes</span>
                <span className="text-amber-600 font-bold">Timed</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <span>📩 Action: Send Personalized Intro Message</span>
                <span className="text-blue-600 font-bold">Sent</span>
              </div>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="CRM & WEBHOOK ACTIONS"
        title="Sync data and trigger actions across your entire stack"
        description="Update contact stages, assign salespeople, trigger external webhooks, and send team alerts whenever an automation event occurs."
        benefits={[
          'Automated stage updates in ARCO and connected CRMs',
          'Custom webhook post payloads to internal servers and Zapier',
          'Internal Slack and email notifications for high-priority events',
          'Detailed execution logs and error monitoring',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Webhook Action Execution</div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-800">Payload Dispatched: update_lead_status</span>
                <span className="text-emerald-600 font-bold">HTTP 200 OK</span>
              </div>
              <p className="text-slate-600 text-xs font-mono bg-slate-50 p-2 rounded">
                {"{ \"lead_id\": \"LD_8492\", \"stage\": \"Demo Booked\", \"score\": 94 }"}
              </p>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="WORKFLOW EXECUTION"
        title="How journey automation works"
        description="From trigger event to conversion outcome."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="AUTOMATION SCENARIOS"
        title="Proven workflows for growth teams"
        description="See how companies automate onboarding, follow-ups, and renewals."
        useCases={useCases}
      />

      <ProductBenefits
        badge="AUTOMATION ROI"
        title="Scale customer engagement without scaling headcount"
        description="Let ARCO handle routine messaging so your team can focus on closing high-value deals."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="automation" />

      <ProductCTA
        badge="AUTOMATE YOUR WORKFLOWS"
        title="Start automating customer journeys today"
        description="Deploy proven automation recipes in minutes with ARCO."
      />
    </div>
  );
}
