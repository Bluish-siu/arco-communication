import {
  Users,
  CheckCheck,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';

export default function MarketingDashboard() {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Ambient background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-amber-500/5 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      {/* Main Campaign Card */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-5 sm:p-6 text-slate-800">
        
        {/* Campaign Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-slate-900">Summer Sale Campaign</h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Broadcast ID: #BC-8924 · VIP & Returning Shoppers</p>
            </div>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 my-5">
          {/* Metric 1 */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Audience</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">12,480</span>
            <span className="text-[10px] text-slate-400">Total target</span>
          </div>

          {/* Metric 2 */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Delivered</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">11,924</span>
            <span className="text-[10px] font-semibold text-emerald-600">95.5% rate</span>
          </div>

          {/* Metric 3 */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Read</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">9,842</span>
            <span className="text-[10px] font-semibold text-emerald-600">82.5% rate</span>
          </div>

          {/* Metric 4 */}
          <div className="bg-red-50/50 rounded-xl p-3 border border-red-100/80">
            <span className="text-[11px] font-medium text-red-700 block">Conversions</span>
            <span className="text-lg sm:text-xl font-bold text-red-600 mt-0.5 block">684</span>
            <span className="text-[10px] font-semibold text-red-600">+14.2% ROI</span>
          </div>
        </div>

        {/* Campaign Progress Visual */}
        <div className="mb-5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Campaign Funnel Performance</span>
            <span className="text-emerald-600">95.5% Delivered</span>
          </div>
          {/* Segmented Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full w-[95.5%]" title="Delivered: 95.5%" />
            <div className="bg-slate-300 h-full w-[4.5%]" title="Pending" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Delivered (11,924)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Read (9,842)
            </span>
            <span className="flex items-center gap-1 font-semibold text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Conversions (684)
            </span>
          </div>
        </div>

        {/* WhatsApp Message Preview Card */}
        <div className="border border-slate-200/90 rounded-xl bg-slate-50/70 p-3.5 sm:p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>WhatsApp Message Preview</span>
            <span className="text-slate-400 font-normal">Template: Approved</span>
          </div>

          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs max-w-md mx-auto">
            {/* Header info */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                A
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">ARCO Official Store</div>
                <div className="text-[9px] text-slate-400">WhatsApp Verified Business</div>
              </div>
            </div>

            {/* Message Body */}
            <div className="text-xs sm:text-sm text-slate-800 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-900">Hi Rahul 👋</p>
              <p className="text-slate-600">
                We thought you'd love our latest collection. Get 20% off this week only.
              </p>
            </div>

            {/* Red CTA Button inside Mockup */}
            <div className="mt-3.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Now</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* Message metadata */}
            <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-2">
              <span>11:05 AM</span>
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
