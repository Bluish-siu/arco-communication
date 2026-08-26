import {
  PhoneCall,
  PhoneForwarded,
  Sparkles,
  User,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  ShieldCheck,
  Headphones,
  Calendar,
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
import VoiceAIMockup from '../../components/products/mockups/VoiceAIMockup';

export default function VoiceAI() {
  const stats = [
    { value: '100%', label: 'Inbound Calls Answered', description: 'Zero missed calls 24 hours a day, 7 days a week' },
    { value: '&lt; 1 sec', label: 'Call Pickup Latency', description: 'Instant natural voice conversation response' },
    { value: '88%', label: 'Accurate Intent Capture', description: 'Automatic extraction of budget, location & timing' },
    { value: '100%', label: 'Post-Call WhatsApp Sync', description: 'Instant bulleted summary sent to caller & team' },
  ];

  const workflowSteps = [
    {
      title: 'Inbound Call Received',
      description: 'Customer dials your business number; ARCO Voice AI picks up instantly.',
      icon: PhoneCall,
    },
    {
      title: 'Natural AI Dialogue',
      description: 'AI understands caller intent, answers FAQs, and asks qualifying questions.',
      icon: Sparkles,
    },
    {
      title: 'Real-Time Intent Capture',
      description: 'AI extracts requirements, budget, appointment times, and contact details.',
      icon: Flame,
    },
    {
      title: 'Instant Action & Handoff',
      description: 'Creates CRM lead, routes urgent calls to humans, and sends WhatsApp summaries.',
      icon: PhoneForwarded,
    },
  ];

  const useCases = [
    {
      title: 'Real Estate Inbound Buyer Inquiries',
      description: 'Answer property inquiries after hours, qualify buyer budgets, and schedule site visits.',
      industry: 'Real Estate & Developers',
      metric: '0 Missed Buyer Leads',
    },
    {
      title: 'Clinic & Hospital Appointment Desk',
      description: 'Handle patient inquiries, doctor availability, and book appointments over the phone.',
      industry: 'Healthcare & Wellness',
      metric: '92% Instant Phone Bookings',
    },
    {
      title: 'Automotive & Dealership Test Drives',
      description: 'Answer test drive requests, provide service center quotes, and route calls to sales reps.',
      industry: 'Automotive & Dealerships',
      metric: '3.8x Faster Callback',
    },
  ];

  const benefits = [
    {
      title: '24/7 Autonomous Voice Receptionist',
      description: 'Ensure every phone call is answered with natural, human-like voice intelligence.',
      icon: PhoneCall,
      highlight: 'Zero Missed Calls',
    },
    {
      title: 'Automated Post-Call WhatsApp Summaries',
      description: 'Instantly send meeting links, brochures, and call confirmations to callers on WhatsApp.',
      icon: Zap,
      highlight: 'Voice-to-WhatsApp Flow',
    },
    {
      title: 'Intelligent Human Call Escalation',
      description: 'Seamlessly transfer high-intent or urgent callers to available team members with live context.',
      icon: PhoneForwarded,
      highlight: 'Context-Preserved Transfer',
    },
  ];

  const faqs = [
    {
      question: 'What is ARCO Voice AI?',
      answer: 'ARCO Voice AI is an intelligent virtual receptionist that answers inbound phone calls, speaks naturally with callers, answers business questions, captures lead requirements, and triggers automated follow-ups.',
    },
    {
      question: 'Does the caller need an app to use Voice AI?',
      answer: 'No. Callers simply dial your regular business phone number from any mobile or landline phone.',
    },
    {
      question: 'How does Voice AI send summaries to my sales team?',
      answer: 'Immediately after the call concludes, ARCO generates a concise bulleted summary of the caller’s requirements, budget, and contact info, sending it to your CRM and your team’s WhatsApp.',
    },
    {
      question: 'Can Voice AI transfer calls to human staff in real time?',
      answer: 'Yes! If a caller requests a human or meets specific priority criteria (e.g. VIP client or urgent booking), the AI smoothly transfers the call to your designated team members.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="VOICE AI / RECEPTIONIST"
        badgeIcon={PhoneCall}
        headline="Never miss an important customer call"
        description="Let ARCO's AI receptionist answer calls, understand customer intent, capture lead information, book appointments, and send concise summaries to your team."
        mockup={<VoiceAIMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="NATURAL VOICE DIALOGUE"
        title="Human-like voice conversations that understand context"
        description="Deliver a natural, conversational phone experience. ARCO Voice AI understands accents, handles interruptions, and answers complex questions using your knowledge base."
        benefits={[
          'Ultra-low latency conversational voice engine (under 800ms)',
          'Natural voice synthesis with realistic pacing and tone',
          'Trained on your business FAQs, operating hours, and service menus',
          'Multi-language understanding with native accent adaptation',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Live Voice AI Call Session</div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-800">Caller: Rahul Sharma (+91 98201 48291)</span>
                <span className="text-emerald-600 font-bold">Call Connected (01:14)</span>
              </div>
              <p className="text-slate-600 text-xs italic">
                "AI: I can definitely arrange a site visit for you this Saturday at 11 AM in Mulund. Should I confirm your appointment?"
              </p>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="VOICE-TO-WHATSAPP HANDOFF"
        title="Turn spoken conversations into structured WhatsApp leads"
        description="Never write down notes manually again. ARCO Voice AI transcribes calls, extracts key action items, and sends a WhatsApp confirmation to both the caller and your team."
        benefits={[
          'Instant post-call transcript and bulleted AI summary',
          'Automatic lead creation and stage assignment in ARCO CRM',
          'Instant WhatsApp brochure and confirmation sent to caller',
          'Alerts sent to sales reps on WhatsApp and Slack for high-value leads',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Post-Call Summary & Action</div>
            <div className="bg-white p-3.5 rounded-xl border border-red-200 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-red-600">AI Call Summary Generated</span>
                <span className="text-slate-400">10s after hangup</span>
              </div>
              <p className="text-slate-800 font-medium text-xs">
                "Caller is looking for a 2BHK in Mulund under ₹1.5 Cr. Site visit booked for Sat 11 AM."
              </p>
              <div className="text-emerald-600 font-bold text-[10px]">
                ✓ WhatsApp Confirmation & Location Pin Sent
              </div>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="CALL WORKFLOW"
        title="How ARCO Voice AI handles inbound calls"
        description="From incoming ring to confirmed lead follow-up."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="VOICE USE CASES"
        title="How businesses deploy Voice AI"
        description="Explore how sales and support teams eliminate missed calls."
        useCases={useCases}
      />

      <ProductBenefits
        badge="VOICE AI ROI"
        title="Capture 100% of phone revenue opportunities"
        description="Deliver instant phone support and qualification without 24/7 staffing costs."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="voice-ai" />

      <ProductCTA
        badge="TRY VOICE AI"
        title="Never miss another customer phone call"
        description="Experience ARCO Voice AI and automate your inbound call desk."
      />
    </div>
  );
}
