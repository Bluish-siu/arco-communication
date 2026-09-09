import { useState } from 'react';
import {
  Sparkles,
  Bot,
  FileText,
  Workflow,
  LayoutTemplate,
  CheckCheck,
  ChevronRight,
  ArrowRight,
  Send,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  User,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Check,
} from 'lucide-react';
import Container from '../common/Container';

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.781-.878-2.057-.978-.276-.1-.476-.15-.676.15-.2.3-.777.978-.952 1.178-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.783-1.673-2.083-.175-.3-.019-.462.132-.612.136-.134.301-.35.451-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.632-.927-2.234-.244-.587-.493-.507-.677-.517-.175-.008-.375-.01-.576-.01-.2 0-.526.075-.802.375-.276.3-1.053 1.029-1.053 2.509 0 1.48 1.078 2.91 1.228 3.11.15.2 2.122 3.24 5.14 4.544.718.31 1.279.495 1.716.634.722.23 1.379.197 1.898.12.579-.087 1.781-.728 2.032-1.431.25-.703.25-1.306.175-1.431-.075-.125-.275-.2-.576-.35z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.408A9.948 9.948 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.63 0-3.153-.49-4.43-1.332l-.317-.208-2.955.836.83-2.88-.228-.337A8.132 8.132 0 0 1 3.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
  </svg>
);

export default function ElevateCxSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [
    {
      id: 'ai-copilot',
      title: 'Write, Launch, and Optimize with AI Copilot',
      description:
        'Create better WhatsApp campaign content faster with your built-in AI assistant.',
      icon: Sparkles,
    },
    {
      id: 'ai-chatbots',
      title: 'AI Chatbots That Drive Conversions',
      description:
        'Automate customer support, lead qualification, and business processes on WhatsApp with intelligent, customizable workflows.',
      icon: Bot,
    },
    {
      id: 'whatsapp-forms',
      title: 'Forms That Convert Conversations into Leads',
      description:
        'Capture leads and collect customer information seamlessly with AI-generated forms built into your workflows.',
      icon: FileText,
    },
    {
      id: 'intent-automation',
      title: 'Go Beyond Keywords with Intent-Based Automation',
      description:
        'Trigger workflows based on customer intent, not keywords, for smarter and more accurate automation.',
      icon: Workflow,
    },
    {
      id: 'ai-templates',
      title: 'Ready-to-Send Templates, Powered by AI',
      description:
        'Send ready-to-use, high-converting WhatsApp templates tailored to your business in seconds.',
      icon: LayoutTemplate,
    },
  ];

  // Visual Renderer for the active state
  const renderActiveVisual = () => {
    switch (activeIndex) {
      case 0:
        // 1. AI Copilot / Campaign Generator
        return (
          <div className="space-y-4 animate-in fade-in duration-250">
            {/* Top Workspace Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">ARCO AI Copilot</h4>
                  <p className="text-[10px] text-slate-500">Campaign Content Generator · Smart Optimizer</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Auto-Optimized
              </span>
            </div>

            {/* AI Prompt Input Bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-sm space-y-1.5">
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                AI Prompt
              </div>
              <p className="text-xs text-slate-200">
                "Draft an engaging weekend flash sale broadcast for VIP customers offering 20% off."
              </p>
            </div>

            {/* Generated WhatsApp Message Preview */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Verified Broadcast Preview</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  High Engagement Score
                </span>
              </div>

              {/* Message Bubble */}
              <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100/90 space-y-2">
                <p className="text-xs text-slate-800 leading-relaxed">
                  🎉 Hey <span className="font-semibold text-emerald-900">{"{{first_name}}"}</span>! As a VIP member, enjoy an exclusive <span className="font-bold text-slate-900">20% OFF</span> on all new arrivals this weekend with code <span className="font-mono font-bold text-emerald-700">VIP20</span>.
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                  <span>10:30 AM</span>
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                </div>
              </div>

              {/* Interactive Quick Reply Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-slate-200 hover:border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shop Collection</span>
                </button>
                <button
                  type="button"
                  className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-slate-200 hover:border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ask a Stylist</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 1:
        // 2. AI Chatbots That Drive Conversions
        return (
          <div className="space-y-4 animate-in fade-in duration-250">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Intelligent Sales Chatbot</h4>
                  <p className="text-[10px] text-slate-500">Autonomous Workflow · 24/7 Active</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100/70 px-2.5 py-1 rounded-full border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Live Conversation
              </span>
            </div>

            {/* Chatbot Simulation Conversation */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2.5">
              {/* Bot Message 1 */}
              <div className="bg-slate-100/80 rounded-2xl rounded-tl-xs p-3 max-w-[88%] text-xs text-slate-800 space-y-1.5">
                <p className="font-medium">
                  👋 Hi there! Welcome to ARCO. How can we help your business today?
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                    1. Book Demo
                  </span>
                  <span className="bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                    2. Pricing Details
                  </span>
                  <span className="bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                    3. Talk to Sales
                  </span>
                </div>
              </div>

              {/* User Selection */}
              <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-xs p-2.5 max-w-[75%] ml-auto text-xs font-medium">
                <p>1. Book Demo for my team</p>
              </div>

              {/* Bot Qualification Response */}
              <div className="bg-slate-100/80 rounded-2xl rounded-tl-xs p-3 max-w-[88%] text-xs text-slate-800 space-y-1">
                <p className="font-medium">
                  Great! What is your team size and primary use case?
                </p>
              </div>

              {/* User Reply */}
              <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-xs p-2.5 max-w-[80%] ml-auto text-xs font-medium">
                <p>25+ team members, WhatsApp marketing & Support.</p>
              </div>

              {/* Bot Confirmation */}
              <div className="bg-emerald-50 rounded-2xl rounded-tl-xs p-3 max-w-[90%] text-xs text-emerald-900 border border-emerald-200 font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lead qualified! Connecting you to our Enterprise Specialist.</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        // 3. Forms That Convert Conversations into Leads
        return (
          <div className="space-y-4 animate-in fade-in duration-250">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">WhatsApp In-Chat Forms</h4>
                  <p className="text-[10px] text-slate-500">Native Data Collection · Zero App Switching</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-100/70 px-2.5 py-1 rounded-full border border-purple-200">
                Auto-Synced to CRM
              </span>
            </div>

            {/* In-Chat Form UI Mockup */}
            <div className="bg-white rounded-2xl p-4.5 border border-purple-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Lead Registration Form</span>
                <span className="text-[10px] font-mono text-slate-400">Step 1 of 1</span>
              </div>

              {/* Form Fields */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Full Name</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium">
                    Aarav Mehta
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Work Email</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium">
                    aarav@techcorp.in
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Preferred Time</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium">
                    Tomorrow, 3:30 PM IST
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Submit Form in WhatsApp</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 3:
        // 4. Go Beyond Keywords with Intent-Based Automation
        return (
          <div className="space-y-4 animate-in fade-in duration-250">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">AI Intent Matching Engine</h4>
                  <p className="text-[10px] text-slate-500">Semantic Natural Language Understanding</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-full border border-teal-200">
                98.4% Accuracy
              </span>
            </div>

            {/* Intent Analysis Breakdown Card */}
            <div className="bg-white rounded-2xl p-4 border border-teal-200/80 shadow-sm space-y-3">
              {/* Customer Input Message */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Incoming Customer Message</span>
                <p className="text-xs text-slate-800 font-medium italic">
                  "I ordered yesterday and haven't received my tracking details yet. Can someone look into this?"
                </p>
              </div>

              {/* AI Understanding Output */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-200/80">
                  <span className="text-[10px] text-teal-700 font-bold block">Detected Intent</span>
                  <span className="text-xs font-bold text-slate-900">Order Tracking & Status</span>
                </div>
                <div className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-200/80">
                  <span className="text-[10px] text-teal-700 font-bold block">Context / Urgency</span>
                  <span className="text-xs font-bold text-slate-900">High / Shipping Delay</span>
                </div>
              </div>

              {/* Automated Next Action */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span className="font-semibold">⚡ Action: Auto-fetched order #8924 & sent tracking link</span>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>
          </div>
        );

      case 4:
        // 5. Ready-to-Send Templates, Powered by AI
        return (
          <div className="space-y-4 animate-in fade-in duration-250">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Meta-Approved AI Template Library</h4>
                  <p className="text-[10px] text-slate-500">Ready-to-Send · Conversion Optimized</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-100/70 px-2.5 py-1 rounded-full border border-indigo-200">
                1-Click Deployment
              </span>
            </div>

            {/* Template List Cards */}
            <div className="space-y-2.5">
              {/* Template Card 1 */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">Abandoned Cart Recovery</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Meta Approved
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    "Hi {"{{1}}"}, you left items in your cart. Complete purchase now with 10% off."
                  </p>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                >
                  Use Template
                </button>
              </div>

              {/* Template Card 2 */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">Order Confirmation & Tracking</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Meta Approved
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    "Your order {"{{1}}"} has shipped! Click below to track live delivery status."
                  </p>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                >
                  Use Template
                </button>
              </div>

              {/* Template Card 3 */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">Feedback & CSAT Survey</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Meta Approved
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    "How was your recent experience with our team? Rate us with 1-click."
                  </p>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="elevate-cx">
      <Container>
        {/* SECTION TITLE */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Elevate your CX with an<br className="hidden sm:inline" /> AI-powered WhatsApp platform
          </h2>
        </div>

        {/* 2-COLUMN INTERACTIVE SHOWCASE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 max-w-5xl mx-auto items-center">
          
          {/* LEFT: 5 Clickable Questionnaire Items (~45%) */}
          <div className="lg:col-span-5 space-y-2">
            {items.map((item, idx) => {
              const isActive = activeIndex === idx;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left p-4 sm:p-4.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-[#E8FBE8] border-emerald-300/90 shadow-xs'
                      : 'bg-white border-slate-100/90 hover:bg-slate-50/70 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-sm sm:text-base font-bold leading-snug ${
                            isActive ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isActive ? 'rotate-90 text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                      </div>

                      {isActive && (
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Large Interactive Visual Preview (~55%) */}
          <div className="lg:col-span-7">
            <div className="relative bg-slate-50/80 rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm min-h-[380px] sm:min-h-[420px] flex flex-col justify-center">
              {renderActiveVisual()}
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
