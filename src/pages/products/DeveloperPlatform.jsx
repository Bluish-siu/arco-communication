import {
  Code2,
  Terminal,
  Webhook,
  Key,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Zap,
  ArrowRight,
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
import DeveloperMockup from '../../components/products/mockups/DeveloperMockup';

export default function DeveloperPlatform() {
  const stats = [
    { value: '42ms', label: 'Average API Latency', description: 'Blazing-fast global edge infrastructure' },
    { value: '99.99%', label: 'API Gateway Uptime', description: 'Enterprise-grade reliability and scalability' },
    { value: '5,000+', label: 'Apps & Integrations', description: 'Via Webhooks, Zapier, Make, and SDKs' },
    { value: '50M+', label: 'Monthly API Calls', description: 'Processed seamlessly across global regions' },
  ];

  const workflowSteps = [
    {
      title: 'Generate API Key',
      description: 'Create secure scoped API tokens in your ARCO developer console.',
      icon: Key,
    },
    {
      title: 'Integrate Endpoints',
      description: 'Use REST APIs or Node/Python SDKs to send messages and manage contacts.',
      icon: Code2,
    },
    {
      title: 'Configure Webhooks',
      description: 'Subscribe to real-time events for message status, replies, and incoming leads.',
      icon: Webhook,
    },
    {
      title: 'Deploy to Production',
      description: 'Scale from hundreds to millions of messages with automatic rate limiting.',
      icon: Cpu,
    },
  ];

  const useCases = [
    {
      title: 'Transactional OTP & Notification Alerts',
      description: 'Send high-priority OTP verifications, invoice links, and password resets in under 2 seconds.',
      industry: 'FinTech & Banking',
      metric: '99.8% Sub-3s Delivery',
    },
    {
      title: 'Custom CRM & ERP Data Sync',
      description: 'Bi-directionally sync customer phone numbers, orders, and conversation transcripts.',
      industry: 'Enterprise ERP & Custom Tech',
      metric: 'Real-Time Sync',
    },
    {
      title: 'Automated IoT & Server Alerts',
      description: 'Receive critical server downtime or IoT threshold alerts directly on WhatsApp.',
      industry: 'DevOps & Infrastructure',
      metric: 'Instant Alerting',
    },
  ];

  const benefits = [
    {
      title: 'Modern REST & GraphQL APIs',
      description: 'Clean, predictable endpoints with comprehensive documentation and code samples.',
      icon: Code2,
      highlight: 'Dev-Friendly SDKs',
    },
    {
      title: 'Real-Time Webhook Event Stream',
      description: 'Receive instant webhook notifications for delivery, read receipts, and replies.',
      icon: Webhook,
      highlight: 'Sub-Second Event Delivery',
    },
    {
      title: 'Enterprise Security & Compliance',
      description: 'SOC2 Type II, ISO 27001, and GDPR compliant with encrypted webhook signatures.',
      icon: ShieldCheck,
      highlight: 'Enterprise Grade',
    },
  ];

  const faqs = [
    {
      question: 'What programming languages does the ARCO API support?',
      answer: 'ARCO offers official SDKs for Node.js, Python, PHP, Java, and Go, as well as a standard REST API that can be accessed with cURL or any HTTP client.',
    },
    {
      question: 'What events are available via Webhooks?',
      answer: 'Webhooks notify your application on message_sent, message_delivered, message_read, message_failed, inbound_message_received, lead_created, and deal_won.',
    },
    {
      question: 'What are the rate limits for the ARCO API?',
      answer: 'Standard plans start at 250 requests/second, with enterprise dedicated tiers supporting up to 5,000+ requests/second.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="DEVELOPER PLATFORM"
        badgeIcon={Code2}
        headline="Build ARCO into your own workflows"
        description="Connect ARCO with your applications using robust REST APIs, real-time webhooks, official SDKs, and enterprise integrations."
        mockup={<DeveloperMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="RESTFUL APIS & SDks"
        title="Everything you need to embed WhatsApp into your stack"
        description="Send single or bulk messages, manage contact lists, retrieve analytics, and trigger AI agent workflows programmatically."
        benefits={[
          'Send text, media, documents, templates, and interactive buttons',
          'Manage contacts, custom attributes, tags, and conversation history',
          'Official SDKs for Node.js, Python, PHP, and Go',
          'Interactive OpenAPI / Swagger documentation and Postman collections',
        ]}
        visual={
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-300 font-mono text-xs shadow-lg space-y-2">
            <div className="text-slate-500 text-[10px] pb-2 border-b border-slate-800 flex justify-between">
              <span>Node.js SDK Example</span>
              <span className="text-emerald-400">npm i @arco/sdk</span>
            </div>
            <pre className="text-slate-200 overflow-x-auto text-[11px]">
{`import { ArcoClient } from '@arco/sdk';

const arco = new ArcoClient(process.env.ARCO_API_KEY);

await arco.messages.send({
  to: '+919876543210',
  template: 'order_shipped',
  params: ['Aarav', '#AR48291', 'BlueDart']
});`}
            </pre>
          </div>
        }
      />

      <ProductFeatureSection
        badge="WEBHOOKS & EVENT STREAMING"
        title="Stay in sync with real-time event notifications"
        description="Subscribe to webhook event topics and receive JSON payloads instantly whenever a message is delivered, opened, or replied to."
        benefits={[
          'Signed HMAC-SHA256 headers for webhook authenticity',
          'Automatic retry logic with exponential backoff on server errors',
          'Live webhook inspector and payload replay tools in dashboard',
          'Zero-polling architecture for maximum efficiency',
        ]}
        visual={
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-300 font-mono text-xs shadow-lg space-y-2">
            <div className="text-slate-500 text-[10px] pb-2 border-b border-slate-800 flex justify-between">
              <span>Webhook Event Payload</span>
              <span className="text-emerald-400">event: message.received</span>
            </div>
            <pre className="text-emerald-300 overflow-x-auto text-[11px]">
{`{
  "event": "message.received",
  "from": "+919876543210",
  "message": {
    "type": "text",
    "text": "Yes, please book the demo for 3 PM"
  },
  "timestamp": 1724147200
}`}
            </pre>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="DEVELOPER JOURNEY"
        title="From API key to production in minutes"
        description="How developers integrate ARCO into custom business software."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="INTEGRATION EXAMPLES"
        title="What developers build with ARCO"
        description="See how engineering teams use ARCO APIs to power messaging infrastructure."
        useCases={useCases}
      />

      <ProductBenefits
        badge="ENGINEERING EXCELLENCE"
        title="Reliable, fast, and scalable messaging infrastructure"
        description="Built to handle high-volume enterprise traffic with rock-solid uptime."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="developer-platform" />

      <ProductCTA
        badge="START BUILDING"
        title="Get your API key and start building today"
        description="Read the documentation and send your first WhatsApp message in minutes."
      />
    </div>
  );
}
