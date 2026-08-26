import { Bot, Sparkles, Database, UserCheck, Flame, FileText, CheckCircle2, Shield } from 'lucide-react';

export default function AIAgentsMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-6 text-slate-800 text-xs overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">ARCO AI Agent Command Center</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Autonomous
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Context-Aware AI Knowledge Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700">
            Resolved: <strong className="text-purple-600">82%</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Live Thread & Knowledge Sync */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Left: Live Conversation & Action Card (7 Cols) */}
        <div className="md:col-span-7 bg-slate-50/60 rounded-xl p-3 border border-slate-200/70 space-y-2 text-[10px]">
          <div className="flex justify-between pb-1 border-b border-slate-200/60 font-bold text-slate-700">
            <span>Live Conversation — Real Estate AI Agent</span>
            <span className="text-emerald-600">Active</span>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 max-w-[85%]">
            <span className="text-[8px] font-bold text-slate-400 block mb-0.5">Rohan (Prospect)</span>
            "I'm looking for a 2BHK in Mumbai under ₹1.5 Cr."
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/80 p-2 rounded-xl border border-purple-200 ml-auto max-w-[90%]">
            <div className="flex items-center gap-1 text-[8px] font-bold text-purple-700 mb-0.5">
              <Sparkles className="w-2.5 h-2.5" /> ARCO AI Agent
            </div>
            "Great! Which areas in Mumbai are you considering?"
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 max-w-[85%]">
            "Bhandup or Mulund."
          </div>

          {/* AI Action Card */}
          <div className="p-2.5 bg-gradient-to-br from-purple-50/90 to-indigo-50/70 rounded-xl border border-purple-200/80 text-[10px]">
            <div className="flex items-center justify-between pb-1 border-b border-purple-200/60 font-bold text-purple-800">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-600" />
                <span>LEAD QUALIFIED & ROUTED</span>
              </span>
              <span className="bg-purple-600 text-white px-1.5 py-0.2 rounded text-[8px]">High Intent</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[9px] text-slate-700">
              <div>Budget: <strong className="text-slate-900">₹1.5 Cr</strong></div>
              <div>Location: <strong className="text-slate-900">Bhandup / Mulund</strong></div>
              <div>Property: <strong className="text-slate-900">2BHK</strong></div>
              <div>Handoff: <strong className="text-purple-700">Senior Broker</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Knowledge Base & Multi-Agent Matrix (5 Cols) */}
        <div className="md:col-span-5 bg-slate-50/70 rounded-xl p-3 border border-slate-200/70 flex flex-col justify-between space-y-2">
          <div>
            <div className="font-bold text-[10px] text-slate-800 border-b border-slate-200/60 pb-1 mb-2 flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-600" />
              <span>Knowledge Base Sources</span>
            </div>

            <div className="space-y-1.5 text-[9px]">
              <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Website & Product Catalog</span>
                <span className="text-emerald-600 font-bold">Synced</span>
              </div>
              <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">PDFs & Business Policies</span>
                <span className="text-emerald-600 font-bold">14 Docs</span>
              </div>
              <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">FAQs & Pricing Guides</span>
                <span className="text-emerald-600 font-bold">84 Answers</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-center text-[9px]">
            <div className="bg-white p-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block">AI Resolution</span>
              <strong className="text-purple-600 text-[11px]">82%</strong>
            </div>
            <div className="bg-white p-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block">Human Handoff</span>
              <strong className="text-slate-700 text-[11px]">18%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
