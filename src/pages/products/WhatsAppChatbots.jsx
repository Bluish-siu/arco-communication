import {
  MessageSquareCode,
  GitFork,
  CheckCircle2,
  FileText,
  Zap,
  Bot,
  Layers,
  ArrowRight,
  TrendingUp,
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
import ChatbotBuilderMockup from '../../components/products/mockups/ChatbotBuilderMockup';

export default function WhatsAppChatbots() {
  const stats = [
    { value: '0 Code', label: 'Required to Build', description: 'Visual drag-and-drop workflow canvas' },
    { value: '72%', label: 'Lead Form Completion', description: 'With native WhatsApp 1-click forms' },
    { value: '24/7', label: 'Uptime & Availability', description: 'Instant responses with zero server maintenance' },
    { value: '10x', label: 'Faster Flow Creation', description: 'Pre-built industry templates ready to launch' },
  ];

  const workflowSteps = [
    {
      title: 'Welcome Trigger',
      description: 'Trigger flow on first message, keyword, or Click-to-WhatsApp ad click.',
      icon: MessageSquareCode,
    },
    {
      title: 'Menu & Form Collection',
      description: 'Present interactive button menus, list pickers, and native WhatsApp forms.',
      icon: FileText,
    },
    {
      title: 'Logic & Branching',
      description: 'Filter based on budget, user attributes, location, or CRM data lookup.',
      icon: GitFork,
    },
    {
      title: 'Action & Agent Assignment',
      description: 'Send brochure, update CRM record, or hand off to human sales rep.',
      icon: CheckCircle2,
    },
  ];

  const useCases = [
    {
      title: 'Real Estate Property Inquiries & Forms',
      description: 'Guide buyers through budget selection, property configurations, and collect contact details.',
      industry: 'Real Estate',
      metric: '3.6x More Form Fills',
    },
    {
      title: 'Course Enrollment & Admissions',
      description: 'Present course lists, eligibility requirements, and schedule counseling calls.',
      industry: 'EdTech & Universities',
      metric: '55% Higher Completion',
    },
    {
      title: 'Service Booking & Quote Calculator',
      description: 'Calculate instant quotes based on user inputs and book home inspection visits.',
      industry: 'Home Services & Auto',
      metric: '82% Instant Quotes',
    },
  ];

  const benefits = [
    {
      title: 'Visual Drag-and-Drop Canvas',
      description: 'Build sophisticated multi-branch flows in minutes without writing a single line of code.',
      icon: Layers,
      highlight: 'Intuitive Visual Canvas',
    },
    {
      title: 'WhatsApp Native Forms & Lists',
      description: 'Deliver seamless in-chat forms with single-tap selections and zero external webpage redirects.',
      icon: FileText,
      highlight: '72% Higher Conversion',
    },
    {
      title: 'Dynamic Variables & Webhook Actions',
      description: 'Fetch real-time data from external APIs, check stock, and update your CRM database.',
      icon: Zap,
      highlight: 'API Connected',
    },
  ];

  const faqs = [
    {
      question: 'Do I need developer skills to create WhatsApp chatbots in ARCO?',
      answer: 'Not at all! ARCO features an intuitive visual drag-and-drop flow builder that lets anyone design, test, and deploy multi-step conversation flows in minutes.',
    },
    {
      question: 'What are WhatsApp Native Forms?',
      answer: 'WhatsApp Native Forms (WhatsApp Flows) allow customers to complete multi-step forms, book appointments, and submit details directly inside the WhatsApp chat without opening external browsers.',
    },
    {
      question: 'Can the chatbot hand over conversations to human agents?',
      answer: 'Yes. You can add an "Assign to Agent" action node at any point in the flow, notifying your team and transferring the conversation with full context.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="WHATSAPP CHATBOTS"
        badgeIcon={MessageSquareCode}
        headline="Build automated conversations without writing code"
        description="Create visual conversation flows that capture leads, answer questions, collect information, and route customers automatically."
        mockup={<ChatbotBuilderMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="NO-CODE FLOW BUILDER"
        title="Design intuitive conversation journeys visually"
        description="Drag and drop message nodes, buttons, condition checks, and delay timers on an infinite canvas."
        benefits={[
          'Interactive buttons, list menus, and rich media cards',
          'Conditional branching based on user inputs and tags',
          'Dynamic variable storage (e.g. {{budget}}, {{city}})',
          'Instant 1-click test simulation inside the builder',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Canvas Node Library</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-medium text-slate-800">
                🔘 <strong>Buttons Menu</strong> (Quick tap choices)
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-medium text-slate-800">
                📋 <strong>List Picker</strong> (Up to 10 options)
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-medium text-slate-800">
                📝 <strong>WhatsApp Form</strong> (Native multi-field)
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-medium text-slate-800">
                🔀 <strong>Condition Branch</strong> (Custom logic)
              </div>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="WHATSAPP NATIVE FORMS"
        title="Collect lead data with zero friction using native forms"
        description="Replace clunky external website forms. Allow users to submit multi-field forms directly within WhatsApp in seconds."
        benefits={[
          'In-chat modal forms with dropdowns, text inputs, and date pickers',
          'Instant validation and auto-populated phone number fields',
          'Data instantly written to ARCO CRM and external webhooks',
          '72% higher submission rate compared to external web forms',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Native WhatsApp Form Preview</div>
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-2">
              <div className="font-bold text-slate-900 text-xs">Book Property Site Visit</div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">Name: Aarav Mehta</div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">Preferred Date: Saturday, 24th Aug</div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">Configuration: 2BHK Luxury</div>
              </div>
              <button type="button" className="w-full py-1.5 bg-purple-600 text-white font-bold rounded-lg text-[10px]">
                Submit Details (Native)
              </button>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="BOT LIFECYCLE"
        title="How no-code conversation automation works"
        description="From inbound trigger to seamless lead generation."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="BOT SOLUTIONS"
        title="How businesses automate conversations"
        description="Discover how leading companies use ARCO Chatbots to automate workflows."
        useCases={useCases}
      />

      <ProductBenefits
        badge="WHY ARCO BOTS"
        title="Built for speed, simplicity, and conversion"
        description="Deploy reliable conversation automation that customers love interacting with."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="whatsapp-chatbots" />

      <ProductCTA
        badge="BUILD YOUR FIRST BOT"
        title="Start automating WhatsApp conversations today"
        description="Launch your first no-code chatbot in under 10 minutes with ARCO."
      />
    </div>
  );
}
