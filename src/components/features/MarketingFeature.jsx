import { Link } from 'react-router-dom';
import {
  Megaphone,
  Check,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  MousePointerClick,
  CheckCheck,
} from 'lucide-react';
import Container from '../common/Container';

export default function MarketingFeature() {
  const capabilities = [
    'Broadcast campaigns with 98% open rates',
    'Dynamic audience segmentation & tags',
    'Automated follow-ups & re-engagement',
    'Meta-approved template manager with quick buttons',
    'Click-to-WhatsApp ad attribution & tracking',
    'Real-time delivery, read & conversion analytics',
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="marketing">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <Megaphone className="w-3.5 h-3.5 text-red-600" />
              <span>WHATSAPP MARKETING & ADS</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Turn WhatsApp into your highest-converting marketing channel
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Broadcast personalized promotions, run seasonal sales events, and convert high-intent prospects straight from Click-to-WhatsApp social ads.
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
                <span>Explore WhatsApp Marketing</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Campaign Dashboard Mockup */}
          <div className="lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-5 sm:p-6 text-slate-800">
              
              {/* Campaign Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">Festive Mega Sale Broadcast</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Campaign
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Targeting: VIP Buyers & Cart Abandoners</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Ad Tracked</span>
                </div>
              </div>

              {/* 4 Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-medium text-slate-500 block">Audience</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">12,480</span>
                  <span className="text-[9px] text-slate-400">Total target</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-medium text-slate-500 block">Delivered</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">11,924</span>
                  <span className="text-[9px] font-bold text-emerald-600">95.5% rate</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-medium text-slate-500 block">Read</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">9,842</span>
                  <span className="text-[9px] font-bold text-emerald-600">82.5% rate</span>
                </div>
                <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                  <span className="text-[10px] font-medium text-red-700 block">Conversions</span>
                  <span className="text-base sm:text-lg font-bold text-red-600 mt-0.5 block">684</span>
                  <span className="text-[9px] font-bold text-red-600">+18.4% ROI</span>
                </div>
              </div>

              {/* Message Template Preview */}
              <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Template Preview (Meta Approved)
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs max-w-sm mx-auto text-xs space-y-1.5">
                  <div className="font-bold text-slate-900">Hey Rohan 👋 Exclusive 25% Off</div>
                  <p className="text-slate-600 leading-relaxed">
                    Your favorite items are back in stock! Use code <span className="font-bold text-red-600">FESTIVE25</span> before midnight.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button type="button" className="flex-1 py-1.5 bg-red-600 text-white rounded font-bold text-[11px] flex items-center justify-center gap-1">
                      Shop Collection
                    </button>
                    <button type="button" className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]">
                      Talk to Agent
                    </button>
                  </div>
                  <div className="flex justify-end gap-1 text-[9px] text-slate-400 pt-1">
                    <span>10:30 AM</span>
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
