import { BarChart3, TrendingUp, Users, DollarSign, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function AnalyticsMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-6 text-slate-800 text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Unified Analytics & Attribution</h4>
            <p className="text-[10px] text-slate-400">Real-Time Performance & ROI Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ArrowUpRight className="w-3 h-3" />
          <span>+24.8% vs last month</span>
        </div>
      </div>

      {/* 4 Core KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block">Conversations</span>
          <strong className="text-sm font-extrabold text-slate-900">24,892</strong>
          <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">+18% MoM</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block">Leads Generated</span>
          <strong className="text-sm font-extrabold text-blue-600">3,482</strong>
          <span className="text-[9px] text-blue-600 font-bold block mt-0.5">14.0% capture</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block">Conversion Rate</span>
          <strong className="text-sm font-extrabold text-purple-600">14.8%</strong>
          <span className="text-[9px] text-purple-600 font-bold block mt-0.5">3.2x industry avg</span>
        </div>
        <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-200/80">
          <span className="text-[10px] text-red-700 block">Attributed Revenue</span>
          <strong className="text-sm font-extrabold text-red-600">₹18.6L</strong>
          <span className="text-[9px] text-red-600 font-bold block mt-0.5">+32% Growth</span>
        </div>
      </div>

      {/* Visual Analytics Graphs (SVG/CSS) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left: Conversion Funnel (7 Cols) */}
        <div className="md:col-span-7 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2">
          <div className="font-bold text-[10px] text-slate-800 pb-1 border-b border-slate-200/60">
            Conversion Funnel Analysis
          </div>

          <div className="space-y-1.5 text-[9px]">
            <div>
              <div className="flex justify-between font-medium text-slate-600 mb-0.5">
                <span>Ad Impressions & Clicks</span>
                <span className="font-bold text-slate-900">48,200 (100%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-700 h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-600 mb-0.5">
                <span>WhatsApp Conversations Started</span>
                <span className="font-bold text-slate-900">24,892 (51.6%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[51.6%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-600 mb-0.5">
                <span>Qualified Leads</span>
                <span className="font-bold text-slate-900">3,482 (14.0%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full w-[28%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-600 mb-0.5">
                <span>Purchases & Closed Deals</span>
                <span className="font-bold text-emerald-600">684 (19.6%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full rounded-full w-[18%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Channel Breakdown (5 Cols) */}
        <div className="md:col-span-5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="font-bold text-[10px] text-slate-800 pb-1 border-b border-slate-200/60 mb-2">
              Lead Source Attribution
            </div>
            <div className="space-y-1.5 text-[9px]">
              <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-700">Click-to-WhatsApp Ads</span>
                <strong className="text-red-600">54%</strong>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-700">Instagram DMs & Comments</span>
                <strong className="text-purple-600">28%</strong>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-700">Website & QR Inbound</span>
                <strong className="text-slate-900">18%</strong>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-[8px] text-slate-400">
            <span>Synced with Google Analytics & Meta Pixel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
