import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  PieChart,
  Activity,
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
import AnalyticsMockup from '../../components/products/mockups/AnalyticsMockup';

export default function Analytics() {
  const stats = [
    { value: '24,892', label: 'Conversations Tracked', description: 'Real-time message volume and SLA analytics' },
    { value: '14.8%', label: 'Average Conversion Rate', description: 'Measured from first touch to closed sale' },
    { value: '₹18.6L', label: 'Attributed Revenue', description: 'Directly linked to WhatsApp & Instagram campaigns' },
    { value: '100%', label: 'First-Party Attribution', description: 'Zero reliance on third-party cookie tracking' },
  ];

  const workflowSteps = [
    {
      title: 'Campaign & Ad Tracking',
      description: 'Capture UTM parameters and Meta ad IDs on every inbound message.',
      icon: Target,
    },
    {
      title: 'Funnel Milestone Tracking',
      description: 'Monitor lead qualification, cart additions, and agent conversations in real time.',
      icon: Activity,
    },
    {
      title: 'Revenue Attribution',
      description: 'Match Shopify and CRM closed-won deals back to the original messaging campaign.',
      icon: DollarSign,
    },
    {
      title: 'Actionable Insights',
      description: 'Optimize message templates, ad spend, and agent staffing based on hard data.',
      icon: TrendingUp,
    },
  ];

  const useCases = [
    {
      title: 'ROAS & Marketing Attribution',
      description: 'Know exactly which WhatsApp broadcasts and Click-to-WhatsApp ads generate the highest ROI.',
      industry: 'E-commerce & D2C',
      metric: '4.8x ROAS Visibility',
    },
    {
      title: 'Sales Team Performance & Velocity',
      description: 'Track rep response times, active deal values, and win rates across team members.',
      industry: 'B2B & Real Estate',
      metric: '28% Faster Deal Cycles',
    },
    {
      title: 'Support SLA & CSAT Monitoring',
      description: 'Measure first-response times, resolution rates, and customer satisfaction scores.',
      industry: 'Customer Support',
      metric: '94% Target CSAT',
    },
  ];

  const benefits = [
    {
      title: 'Full-Funnel Conversion Analytics',
      description: 'See every step from initial ad click to final purchase with zero data blind spots.',
      icon: TrendingUp,
      highlight: 'Full-Funnel Visibility',
    },
    {
      title: 'Direct Revenue Attribution',
      description: 'Connect messaging campaigns to actual dollar revenue in Shopify, Stripe, or your CRM.',
      icon: DollarSign,
      highlight: 'Accurate ROI Reports',
    },
    {
      title: 'Real-Time Agent Productivity Metrics',
      description: 'Identify top-performing agents, response bottlenecks, and peak conversation hours.',
      icon: Users,
      highlight: 'Team Optimization',
    },
  ];

  const faqs = [
    {
      question: 'How does ARCO attribute revenue to WhatsApp campaigns?',
      answer: 'ARCO uses unique link parameters, coupon codes, and customer phone matching with Shopify or your CRM to track purchases back to the exact broadcast campaign.',
    },
    {
      question: 'Can I export analytics data from ARCO?',
      answer: 'Yes! You can export reports in CSV/Excel formats, schedule automated email summaries, or stream data directly via Webhooks and REST APIs into Google BigQuery or Looker.',
    },
    {
      question: 'Does ARCO track agent response time and SLA metrics?',
      answer: 'Yes. ARCO records first-response times, resolution durations, total message volume per agent, and customer satisfaction (CSAT) ratings.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="ANALYTICS & ATTRIBUTION"
        badgeIcon={BarChart3}
        headline="See exactly what is driving your growth"
        description="Track conversations, campaigns, leads, conversions, team performance, and revenue from one powerful analytics platform."
        mockup={<AnalyticsMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="REVENUE ATTRIBUTION"
        title="Measure the exact financial ROI of every conversation"
        description="Stop guessing which marketing messages work. Connect customer conversations directly to Shopify orders, payment links, and closed CRM deals."
        benefits={[
          'First-party revenue attribution for WhatsApp and Instagram',
          'Campaign-level ROAS, conversion rate, and revenue reporting',
          'Tracking of abandoned cart recovery and broadcast order value',
          'Integration with Google Analytics 4 and Meta Conversions API',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Campaign Revenue Breakdown</div>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Summer Flash Sale Broadcast</span>
                <strong className="text-emerald-600">₹18.6L Revenue (5.5% CVR)</strong>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Abandoned Cart Recovery</span>
                <strong className="text-emerald-600">₹4.8L Revenue (38% Rec.)</strong>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Click-to-WhatsApp Meta Ads</span>
                <strong className="text-emerald-600">₹12.2L Revenue (4.2x ROAS)</strong>
              </div>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="TEAM PERFORMANCE"
        title="Optimize agent response speed and customer satisfaction"
        description="Track agent workloads, average handle times, resolution percentages, and CSAT scores to maintain high-quality customer experiences."
        benefits={[
          'Live agent status and ticket queue monitoring',
          'Average first response time and total resolution SLA tracking',
          'Automated CSAT survey feedback aggregation',
          'Peak volume heatmaps for intelligent shift staffing',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Agent Performance Metrics</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Avg First Response</span>
                <strong className="text-slate-900 text-base">48 sec</strong>
                <span className="text-emerald-600 font-bold block text-[9px] mt-0.5">Top 5% SLA</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Customer CSAT</span>
                <strong className="text-red-600 text-base">94%</strong>
                <span className="text-slate-500 block text-[9px] mt-0.5">Based on 1,480 ratings</span>
              </div>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="DATA PIPELINE"
        title="How ARCO processes conversation data"
        description="From raw message logs to actionable business intelligence."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="ANALYTICS USE CASES"
        title="How data-driven teams scale with ARCO"
        description="See how marketers, sales leaders, and support heads use ARCO analytics."
        useCases={useCases}
      />

      <ProductBenefits
        badge="DATA ADVANTAGE"
        title="Turn conversation data into competitive advantage"
        description="Make confident decisions with real-time customer and campaign insights."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="analytics" />

      <ProductCTA
        badge="GET FULL VISIBILITY"
        title="Start tracking conversations and revenue today"
        description="Unlock deep analytics and revenue attribution with ARCO."
      />
    </div>
  );
}
