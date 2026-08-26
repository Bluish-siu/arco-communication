import { Link } from 'react-router-dom';
import {
  BarChart3,
  Check,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Users,
  Percent,
  Calendar,
} from 'lucide-react';
import Container from '../common/Container';

export default function AnalyticsFeature() {
  const capabilities = [
    'Real-time message delivery, read & click-through metrics',
    'Full conversation-to-revenue funnel attribution',
    'Agent response time, CSAT & resolution benchmarking',
    'AI automation deflection & lead qualification accuracy',
    'Custom exportable CSV reports & automated scheduled emails',
    'Native Google Analytics & Meta Pixel conversion syncing',
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100" id="analytics">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column on Desktop (2nd on Mobile): Analytics Mockup */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800 text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Performance & ROI Intelligence</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                  Last 30 Days
                </span>
              </div>

              {/* 4 Core Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Conversations</span>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">24,892</div>
                  <span className="text-[9px] font-bold text-emerald-600">+18.4%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Leads</span>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">3,482</div>
                  <span className="text-[9px] font-bold text-emerald-600">+24.7%</span>
                </div>
                <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                  <span className="text-[10px] text-red-700 font-medium block">Conversion</span>
                  <div className="text-base sm:text-lg font-extrabold text-red-600 mt-0.5">14.8%</div>
                  <span className="text-[9px] font-bold text-red-600">+3.2%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Revenue</span>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">₹18.6L</div>
                  <span className="text-[9px] font-bold text-emerald-600">+21.3%</span>
                </div>
              </div>

              {/* Mini Visual Chart */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-2">
                  <span>Weekly Conversion Velocity</span>
                  <span className="text-emerald-600">Peak: 4.8K (Sunday)</span>
                </div>
                <div className="h-20 w-full flex items-end gap-1.5 pt-2">
                  {[40, 55, 65, 58, 78, 88, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          i === 6 ? 'bg-red-600' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[8px] text-slate-400">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column on Desktop (1st on Mobile): Content */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <BarChart3 className="w-3.5 h-3.5 text-red-600" />
              <span>ANALYTICS & ATTRIBUTION</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Know exactly what is driving growth
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Gain 360-degree clarity on broadcast delivery, lead conversions, agent performance, and direct revenue generated through conversations.
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
                <span>Explore Analytics</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
