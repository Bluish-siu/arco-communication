import { Link } from 'react-router-dom';
import {
  Bot,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Cpu,
  BrainCircuit,
  MessageSquareCode,
  CheckCircle2,
} from 'lucide-react';
import Container from '../common/Container';

export default function AIFeature() {
  const capabilities = [
    'Autonomous 24/7 AI agents trained on your business data',
    'Automated lead qualification & multi-criteria scoring',
    'AI Copilot providing real-time reply suggestions to agents',
    'Instant catalog search & intelligent product recommendations',
    'Sentiment analysis, intent detection & auto-summaries',
    'Seamless escalation and handoff to human support reps',
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100" id="ai">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column on Desktop (2nd on Mobile): AI Mockup */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800 text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">ARCO AI Agent & Copilot</h4>
                    <span className="text-[10px] text-slate-400">Autonomous Property Concierge</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  ⚡ 0.4s AI Latency
                </span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200/70 mb-3.5">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-[11px]">
                  <span className="font-bold text-slate-800 block text-[9px] mb-0.5">Prospect:</span>
                  "Hi! Looking for a 2BHK apartment in Mumbai under ₹1.5 Cr."
                </div>

                <div className="bg-red-50/80 p-2.5 rounded-xl border border-red-200/80 text-[11px] text-slate-800">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-600 mb-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>ARCO AI:</span>
                  </div>
                  "I found 8 verified 2BHK listings in Bhandup and Mulund within ₹1.5 Cr. Would you like a brochure or site visit slot for this Saturday?"
                </div>
              </div>

              {/* Real-time Extracted Data & Copilot Suggestion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Extracted Qualification Data */}
                <div className="bg-gradient-to-br from-red-50/70 to-rose-50/60 p-2.5 rounded-xl border border-red-200/80 text-[10px]">
                  <div className="flex items-center justify-between font-bold text-red-700 mb-1.5">
                    <span>Lead Criteria Extracted</span>
                    <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[8px]">High Intent</span>
                  </div>
                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between"><span>Budget:</span><strong>₹1.5 Cr</strong></div>
                    <div className="flex justify-between"><span>Location:</span><strong>Mumbai (Bhandup)</strong></div>
                    <div className="flex justify-between"><span>Property:</span><strong>2BHK</strong></div>
                  </div>
                </div>

                {/* Copilot Suggested Action */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">AI Copilot Recommendation</span>
                    <p className="text-slate-500 text-[9px]">"Send Brochure PDF & connect with Senior Realtor Rahul Sharma"</p>
                  </div>
                  <button type="button" className="mt-2 w-full py-1 bg-slate-900 text-white font-bold rounded text-[9px] flex items-center justify-center gap-1">
                    Apply 1-Click Action
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column on Desktop (1st on Mobile): Content */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <Bot className="w-3.5 h-3.5 text-red-600" />
              <span>AI AGENTS & COPILOT</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Let AI handle conversations around the clock
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Deploy custom AI conversational agents that understand customer context, qualify leads instantly, and empower human agents with real-time AI copilot assistance.
            </p>

            {/* Capabilities Check Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 sm:mt-8 w-full max-w-xl">
              {capabilities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800">
                  <div className="w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200/80">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 pt-2">
              <Link
                to="/contact"
                className="group inline-flex items-center text-sm sm:text-base font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <span>Explore AI Agents</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
