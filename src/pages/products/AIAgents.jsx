import {
  Bot,
  Sparkles,
  Database,
  UserCheck,
  Flame,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Calendar,
  ShoppingBag,
  Package,
  Layers,
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
import AIAgentsMockup from '../../components/products/mockups/AIAgentsMockup';
import Container from '../../components/common/Container';
import SectionTitle from '../../components/common/SectionTitle';

export default function AIAgents() {
  const stats = [
    { value: '82%', label: 'Autonomous Resolution', description: 'Handled 24/7 without human intervention' },
    { value: '0 sec', label: 'First Response Time', description: 'Instant intelligent answers day and night' },
    { value: '45+', label: 'Languages Supported', description: 'Native multilingual conversations' },
    { value: '18%', label: 'Clean Human Handoff', description: 'Context-rich escalation when required' },
  ];

  const agentTypes = [
    {
      name: 'FAQ & Support Agent',
      tag: 'Customer Support',
      icon: Bot,
      description: 'Answers complex customer questions instantly using your uploaded knowledge base, PDFs, and website docs.',
    },
    {
      name: 'Lead Qualification Agent',
      tag: 'Sales & Growth',
      icon: Flame,
      description: 'Engages inbound prospects, collects budget, timeline, and requirements, and assigns hot leads to reps.',
    },
    {
      name: 'Booking & Appointment Agent',
      tag: 'Scheduling',
      icon: Calendar,
      description: 'Checks real-time calendar availability, schedules site visits or demos, and sends WhatsApp reminders.',
    },
    {
      name: 'Product Recommendation Agent',
      tag: 'E-commerce',
      icon: ShoppingBag,
      description: 'Understands customer preferences, suggests matching items from your catalog, and builds custom carts.',
    },
    {
      name: 'Order Management Agent',
      tag: 'Post-Purchase',
      icon: Package,
      description: 'Fetches live tracking numbers from Shopify, answers return inquiries, and handles exchange requests.',
    },
    {
      name: 'Custom AI Agent',
      tag: 'Custom Logic',
      icon: Sparkles,
      description: 'Define your own system prompts, tone of voice, API action triggers, and domain-specific conversation logic.',
    },
  ];

  const workflowSteps = [
    {
      title: 'Knowledge Base Ingestion',
      description: 'Upload your website URL, FAQs, PDFs, and product catalogs to train your custom AI agent.',
      icon: Database,
    },
    {
      title: 'Context-Aware Engagement',
      description: 'AI understands nuance, intent, and customer history across WhatsApp, Instagram, and web chat.',
      icon: Bot,
    },
    {
      title: 'Action & Qualification',
      description: 'AI executes actions like checking inventory, qualifying leads, or scheduling appointments.',
      icon: Zap,
    },
    {
      title: 'Intelligent Human Handoff',
      description: 'When complex human judgment is needed, AI hands off with an instant conversation summary.',
      icon: UserCheck,
    },
  ];

  const useCases = [
    {
      title: '24/7 Real Estate Discovery & Qualification',
      description: 'Capture prospective home buyers at midnight, qualify budget and area, and book weekend site visits.',
      industry: 'Real Estate',
      metric: '78% After-Hours Leads Saved',
    },
    {
      title: 'Automated Post-Purchase E-commerce Care',
      description: 'Handle WISMO (Where Is My Order), return policies, and size guides automatically.',
      industry: 'D2C Brands',
      metric: '60% Ticket Reduction',
    },
    {
      title: 'Healthcare Patient Inquiries & Booking',
      description: 'Provide doctor availability, treatment FAQs, and book clinic appointments automatically.',
      industry: 'Healthcare & Clinics',
      metric: '92% Instant Booking Rate',
    },
  ];

  const benefits = [
    {
      title: 'Context-Aware Generative Intelligence',
      description: 'Unlike rigid button trees, ARCO AI agents understand natural human language, slang, and intent.',
      icon: Sparkles,
      highlight: 'Zero Rigid Bot Fallbacks',
    },
    {
      title: 'Enterprise Knowledge Grounding',
      description: 'Strict guardrails ensure AI agents only answer based on your verified business documents and policies.',
      icon: ShieldCheck,
      highlight: 'Zero Hallucinations',
    },
    {
      title: 'Seamless Human Escalation',
      description: 'AI recognizes frustration or complex requests and routes the conversation with an instant bulleted summary.',
      icon: UserCheck,
      highlight: 'Context Preserved',
    },
  ];

  const faqs = [
    {
      question: 'How do I train an ARCO AI Agent for my business?',
      answer: 'You can train ARCO AI by providing your website link, uploading PDF guides, importing Shopify catalogs, or pasting FAQs. The AI indexes your documents and is ready in under 5 minutes.',
    },
    {
      question: 'Will the AI hallucinate or make up false pricing?',
      answer: 'No. ARCO utilizes strict RAG (Retrieval-Augmented Generation) guardrails that restrict the AI to only verified information in your uploaded knowledge base.',
    },
    {
      question: 'What happens when the AI agent does not know an answer?',
      answer: 'If the AI encounters an unanswerable question or detects high customer frustration, it politely explains that a team member will assist and notifies your human agents with a summary.',
    },
    {
      question: 'Can the AI Agent speak multiple languages?',
      answer: 'Yes! ARCO AI agents natively understand and respond in over 45 languages including English, Hindi, Hinglish, Spanish, Arabic, and more.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="AI AGENTS & COPILOT"
        badgeIcon={Bot}
        headline="Let AI handle conversations around the clock"
        description="Deploy autonomous AI agents that answer questions, qualify leads, recommend products, manage customer requests, and hand conversations to your team when human support is needed."
        mockup={<AIAgentsMockup />}
      />

      <ProductStats stats={stats} />

      {/* Meet the AI Agents Section */}
      <section className="py-16 sm:py-24 bg-slate-50/60 border-b border-slate-100">
        <Container>
          <SectionTitle
            badge="AGENT SUITE"
            title="Meet the specialized ARCO AI Agents"
            description="Deploy purpose-built AI agents tailored for sales, customer support, booking, and e-commerce."
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {agentTypes.map((ag, idx) => {
              const Icon = ag.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                        {ag.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                      {ag.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {ag.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-bold text-purple-600 flex items-center gap-1">
                    <span>Deploy in 1 Click</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Feature 1: Knowledge Base Training */}
      <ProductFeatureSection
        badge="KNOWLEDGE BASE TRAINING"
        title="Train AI on your website, PDFs, FAQs, and catalogs"
        description="Connect your business knowledge in minutes. ARCO automatically syncs your help docs, product inventory, and operational guidelines."
        benefits={[
          'Instant crawling of website URLs and help center documentation',
          'Support for PDF, DOCX, CSV, and text document uploads',
          'Automatic daily synchronization with Shopify and inventory catalogs',
          'Custom prompt engineering and tone-of-voice customization',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Knowledge Base Sync Status</div>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Website Documentation (https://yourcompany.com)</span>
                <span className="text-emerald-600 font-bold text-[10px]">128 Pages Indexed</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Product Pricing & Catalog (Shopify)</span>
                <span className="text-emerald-600 font-bold text-[10px]">480 SKUs Synced</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Return & Shipping Policy (PDF)</span>
                <span className="text-emerald-600 font-bold text-[10px]">Active</span>
              </div>
            </div>
          </div>
        }
      />

      {/* Feature 2: Automation vs AI Agent Comparison */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <Container>
          <SectionTitle
            badge="COMPARISON"
            title="Traditional Chatbots vs. ARCO Autonomous AI Agents"
            description="See why modern customer engagement teams are upgrading from rigid decision trees to intelligent AI agents."
            align="center"
          />

          <div className="mt-12 max-w-4xl mx-auto bg-slate-50/70 rounded-2xl p-6 sm:p-8 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Traditional Rules-Based Bot</span>
                <h4 className="font-bold text-base text-slate-800">Rigid Decision Trees</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2 text-rose-600">✕ Breaks if user types something unexpected</li>
                  <li className="flex items-center gap-2 text-rose-600">✕ Requires manual branching for every question</li>
                  <li className="flex items-center gap-2 text-rose-600">✕ Frustrating robotic menus and buttons</li>
                </ul>
              </div>

              {/* ARCO AI */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50/70 p-5 rounded-xl border border-purple-300 space-y-3">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">ARCO AI Agent</span>
                <h4 className="font-bold text-base text-slate-900">Context-Aware Generative AI</h4>
                <ul className="space-y-2 text-xs text-slate-800 font-medium">
                  <li className="flex items-center gap-2 text-purple-700">✓ Understands natural language, typos & context</li>
                  <li className="flex items-center gap-2 text-purple-700">✓ Answers from your complete knowledge base</li>
                  <li className="flex items-center gap-2 text-purple-700">✓ Clean human escalation with conversation summary</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ProductWorkflow
        badge="AI LIFECYCLE"
        title="How ARCO AI delivers 24/7 customer satisfaction"
        description="From document ingestion to continuous learning and resolution."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="DEPLOYMENT EXAMPLES"
        title="How companies use ARCO AI Agents"
        description="Explore real-world applications of autonomous conversational AI."
        useCases={useCases}
      />

      <ProductBenefits
        badge="BUSINESS IMPACT"
        title="Lower support costs, higher customer happiness"
        description="Discover the ROI of deploying 24/7 AI agents across your channels."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="ai-agents" />

      <ProductCTA
        badge="DEPLOY AI TODAY"
        title="Put your customer engagement on autopilot"
        description="Train your first ARCO AI Agent in under 5 minutes with zero coding required."
      />
    </div>
  );
}
