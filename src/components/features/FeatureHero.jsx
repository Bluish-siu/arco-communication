import {
  ArrowRight,
  Play,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Users,
  Bot,
  Zap,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function FeatureHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 bg-gradient-to-b from-red-50/40 via-white to-slate-50/50">
      {/* Background ambient red glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-red-500/10 blur-3xl rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>POWERFUL CUSTOMER ENGAGEMENT PLATFORM</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Everything you need to turn conversations into{' '}
            <span className="text-red-600 inline-block">growth</span>
          </h1>

          {/* Description */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
            Market, sell, support, and automate customer conversations from one powerful platform built for modern businesses.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              to="/contact"
              icon={ArrowRight}
              className="w-full sm:w-auto rounded-full px-8 py-3.5 text-base shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              to="/contact"
              icon={Play}
              className="w-full sm:w-auto rounded-full px-7 py-3.5 text-base bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400"
            >
              Book a Demo
            </Button>
          </div>

          {/* Microtext */}
          <p className="mt-4 text-xs sm:text-sm text-slate-500 font-medium">
            No credit card required · Get started in minutes
          </p>
        </div>

        {/* Original Platform Command Center Mockup */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-7 overflow-hidden text-slate-800 text-xs">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="font-extrabold text-slate-900 text-sm ml-2">
                  ARCO <span className="text-red-600 font-semibold">Command Center</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Meta Official API Connected
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Active Broadcasts</span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">14 Campaigns</span>
                <span className="text-[10px] text-emerald-600 font-bold">98.2% open rate</span>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">AI Automated Leads</span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">1,842 Deals</span>
                <span className="text-[10px] text-red-600 font-bold">+34% this week</span>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Team Resolution Time</span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">48 Seconds</span>
                <span className="text-[10px] text-emerald-600 font-bold">Industry leading</span>
              </div>
              <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                <span className="text-[11px] text-red-700 font-medium block">WhatsApp Revenue</span>
                <span className="text-lg sm:text-xl font-extrabold text-red-600 mt-0.5 block">₹28.4L</span>
                <span className="text-[10px] text-red-600 font-bold">4.2x ROI</span>
              </div>
            </div>

            {/* Live Interactive Split View */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Live Conversation Stream */}
              <div className="md:col-span-7 bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/70">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 font-bold text-xs text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                    <span>Live Omnichannel Stream</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Real-time sync</span>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                        WA
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Vikas Malhotra · ₹1.2L Order</div>
                        <div className="text-[10px] text-slate-500">"Payment completed via WhatsApp catalog link"</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center">
                        AI
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Neha Sen · AI Qualified Lead</div>
                        <div className="text-[10px] text-slate-500">"Booked site visit for Mulund 3BHK penthouse"</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      High Intent
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Workflow Automation Pipeline */}
              <div className="md:col-span-5 bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 font-bold text-xs text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-red-600" />
                      <span>Automated Flow Engine</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="font-medium text-slate-700">Trigger: Ad Click from Instagram</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="font-medium text-slate-700">Action: Send Personalized Catalog</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-700">Sync: Update Salesforce & Notify Rep</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>99.99% Uptime SLA</span>
                  <span className="font-bold text-slate-700">0.2s Execution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
