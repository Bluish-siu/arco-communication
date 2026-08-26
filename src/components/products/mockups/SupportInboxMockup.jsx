import { Headphones, MessageSquare, Clock, CheckCircle2, User, Tag, Sparkles } from 'lucide-react';

export default function SupportInboxMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-5 text-slate-800 text-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Unified Team Inbox</h4>
            <p className="text-[10px] text-slate-400">WhatsApp · Instagram · RCS</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <div>Avg SLA: <strong className="text-emerald-600">48 sec</strong></div>
          <span className="text-slate-300">|</span>
          <div>CSAT: <strong className="text-red-600">94%</strong></div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Col 1: Queue (3 Cols) */}
        <div className="md:col-span-4 bg-slate-50/70 rounded-xl p-2 border border-slate-200/70 space-y-1.5">
          <div className="flex justify-between pb-1 border-b border-slate-200/60 font-bold text-[10px] text-slate-600 px-1">
            <span>Inbox (18)</span>
            <span className="text-red-600">3 Priority</span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-red-300 shadow-2xs">
            <div className="flex justify-between font-bold text-[11px] text-slate-900">
              <span>Sameer Verma</span>
              <span className="text-[9px] text-slate-400">1m ago</span>
            </div>
            <p className="text-[10px] text-slate-600 truncate mt-0.5">"Need help tracking order #AR84920"</p>
            <span className="inline-block mt-1 text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              VIP Customer
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
            <div className="flex justify-between font-bold text-[11px] text-slate-900">
              <span>Ananya Sen</span>
              <span className="text-[9px] text-slate-400">6m ago</span>
            </div>
            <p className="text-[10px] text-slate-600 truncate mt-0.5">"Can I exchange the size?"</p>
          </div>
        </div>

        {/* Col 2: Active Conversation (5 Cols) */}
        <div className="md:col-span-5 bg-slate-50/50 rounded-xl p-2.5 border border-slate-200/70 flex flex-col justify-between">
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 font-bold text-[10px]">
              <span>Sameer Verma</span>
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded text-[9px]">Assigned: Priya M.</span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-800 shadow-2xs max-w-[85%]">
              "Hi! I ordered the Velocity Sneakers yesterday. When will they arrive?"
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50/80 p-2 rounded-xl border border-red-200 text-slate-800 ml-auto max-w-[90%]">
              <div className="text-[8px] font-bold text-red-600 flex items-center gap-1 mb-0.5">
                <Sparkles className="w-2.5 h-2.5" /> ARCO Copilot Suggested
              </div>
              "Hi Sameer! Your order #AR84920 is out for delivery via BlueDart. Tracking: BDT948291."
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-400">
            <span>Collision detection active</span>
            <span className="text-emerald-600 font-bold">1-click Send</span>
          </div>
        </div>

        {/* Col 3: Customer Details & Order Context (3 Cols) */}
        <div className="md:col-span-3 bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 text-[10px] space-y-2">
          <div className="font-bold text-slate-900 border-b border-slate-200/60 pb-1">Customer Profile</div>
          
          <div>
            <span className="text-slate-400 block text-[9px]">Total Spend</span>
            <strong className="text-slate-900 text-[11px]">₹14,990 (3 Orders)</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[9px]">Active Order</span>
            <strong className="text-slate-900 text-[11px]">#AR84920 · ₹4,999</strong>
            <span className="text-[9px] text-emerald-600 block">Out for Delivery</span>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-400 block text-[9px]">Internal Note</span>
            <p className="text-[9px] text-slate-600 italic">"Sent discount coupon on last inquiry"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
