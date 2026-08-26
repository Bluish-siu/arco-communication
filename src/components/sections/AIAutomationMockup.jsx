import {
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  MessageSquareText,
} from 'lucide-react';

export default function AIAutomationMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Subtle red/purple ambient AI glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-indigo-500/10 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      {/* Main AI Container */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">ARCO AI Agent</h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Handling customer conversations automatically</p>
            </div>
          </div>

          <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
            <Cpu className="w-3.5 h-3.5" />
            <span>GPT-4o Engine</span>
          </span>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-3 bg-slate-50/60 rounded-xl p-3 sm:p-4 border border-slate-100 mb-4 text-xs">
          
          {/* Customer Message 1 */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
              C
            </div>
            <div className="flex-1">
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-2xs text-slate-800">
                Hi, I'm looking for a 2BHK apartment in Mumbai under ₹1.5 Cr.
              </div>
              <span className="text-[9px] text-slate-400 ml-1 mt-0.5 inline-block">11:15 AM</span>
            </div>
          </div>

          {/* AI Response 1 */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="bg-red-50/70 p-2.5 sm:p-3 rounded-2xl rounded-tl-xs border border-red-200/70 text-slate-800">
                Absolutely! I can help you find suitable properties. Could you tell me which areas you're considering?
              </div>
              <span className="text-[9px] text-red-600/70 font-medium ml-1 mt-0.5 inline-block">11:15 AM · AI Automated</span>
            </div>
          </div>

          {/* Customer Message 2 */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
              C
            </div>
            <div className="flex-1">
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-2xs text-slate-800">
                Bhandup or Mulund.
              </div>
              <span className="text-[9px] text-slate-400 ml-1 mt-0.5 inline-block">11:16 AM</span>
            </div>
          </div>

          {/* AI Response 2 */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="bg-red-50/70 p-2.5 sm:p-3 rounded-2xl rounded-tl-xs border border-red-200/70 text-slate-800">
                Great choice. I found 8 matching properties in those areas. Would you like me to share the top 3 options?
              </div>
              <span className="text-[9px] text-red-600/70 font-medium ml-1 mt-0.5 inline-block">11:16 AM · AI Automated</span>
            </div>
          </div>

          {/* AI is typing indicator */}
          <div className="flex items-center gap-2 pl-8 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className="italic text-[10px]">AI is typing recommendations...</span>
          </div>

        </div>

        {/* AI Action Card: Lead Qualified */}
        <div className="bg-gradient-to-r from-red-50/80 to-rose-50/60 rounded-xl p-3 sm:p-3.5 border border-red-200/80 mb-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-200/60 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-red-600" />
              <span>Lead Qualified by AI</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white">
              Intent: High
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Budget</span>
              <span className="font-bold text-slate-900">₹1.5 Cr</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Location</span>
              <span className="font-bold text-slate-900 truncate block">Bhandup, Mulund</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Property</span>
              <span className="font-bold text-slate-900">2BHK</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Status</span>
              <span className="font-bold text-emerald-600">Assigned Rep</span>
            </div>
          </div>
        </div>

        {/* AI Compact Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-slate-100">
          <div className="text-center bg-slate-50/80 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-medium">Conversations</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-0.5">1,248</span>
          </div>
          <div className="text-center bg-slate-50/80 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-medium">Resolved by AI</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 block mt-0.5">82%</span>
          </div>
          <div className="text-center bg-red-50/50 p-2 rounded-xl border border-red-100/80">
            <span className="text-[10px] text-red-700 block font-medium">Leads Qualified</span>
            <span className="text-sm sm:text-base font-extrabold text-red-600 block mt-0.5">186</span>
          </div>
        </div>

      </div>
    </div>
  );
}
