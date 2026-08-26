import { Send, Users, CheckCircle2, TrendingUp, Sparkles, MessageCircle, BarChart3 } from 'lucide-react';

export default function MarketingMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-5 sm:p-6 text-slate-800 text-xs overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">Broadcast Command Center</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Campaign: Summer Flash Sale 2026</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Total Revenue</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900">₹18.6L</span>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block">Audience</span>
          <strong className="text-sm font-extrabold text-slate-900">12,480</strong>
          <span className="text-[9px] text-slate-400 block mt-0.5">Target segment</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block">Delivered</span>
          <strong className="text-sm font-extrabold text-emerald-600">11,924</strong>
          <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">95.5% rate</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] text-slate-500 block">Read Rate</span>
          <strong className="text-sm font-extrabold text-blue-600">9,842</strong>
          <span className="text-[9px] text-blue-600 font-bold block mt-0.5">82.5% opened</span>
        </div>
        <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-200/80">
          <span className="text-[10px] text-red-700 block">Conversions</span>
          <strong className="text-sm font-extrabold text-red-600">684</strong>
          <span className="text-[9px] text-red-600 font-bold block mt-0.5">5.5% CVR</span>
        </div>
      </div>

      {/* Message Preview & Realtime Audience Flow */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-200/70">
        {/* Left: Message Bubble Preview */}
        <div className="md:col-span-7 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[10px] pb-1 border-b border-slate-100">
            <span className="font-bold text-slate-700">WhatsApp Template Preview</span>
            <span className="text-emerald-600 font-semibold">Meta Approved ✓</span>
          </div>
          <p className="text-[11px] text-slate-800 leading-snug">
            "Hey <strong>{"{{1}}"}</strong>! ☀️ Our VIP Summer Sale is live. Get <strong>30% OFF</strong> on all new arrivals with code <strong>SUMMER30</strong>."
          </p>
          <div className="flex gap-1.5 pt-1">
            <span className="px-2 py-1 rounded bg-slate-100 text-[9px] font-bold text-slate-700">Shop Now →</span>
            <span className="px-2 py-1 rounded bg-slate-100 text-[9px] font-bold text-slate-700">Talk to Stylist</span>
          </div>
        </div>

        {/* Right: Quick Performance Meter */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-2 text-[10px]">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Delivery Progress</span>
              <span className="text-emerald-600">95.5%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[95.5%]" />
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Conversion Goal</span>
              <span className="text-red-600">114% of Target</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
