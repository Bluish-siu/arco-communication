import { MessageSquareCode, GitFork, ArrowDown, Plus, CheckCircle2, UserPlus, FileText } from 'lucide-react';

export default function ChatbotBuilderMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-6 text-slate-800 text-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Visual Flow Builder</h4>
            <p className="text-[10px] text-slate-400">Drag & Drop No-Code Chatbot Canvas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            ● Flow Active
          </span>
        </div>
      </div>

      {/* Visual Workflow Canvas Nodes */}
      <div className="space-y-2.5 max-w-md mx-auto">
        {/* Node 1: Welcome */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              1. Welcome Message & Menu
            </span>
            <span className="text-[9px] text-slate-400">Trigger: Any Inbound</span>
          </div>
          <p className="text-[10px] text-slate-600">"Welcome to ARCO! How can we assist you today?"</p>
          <div className="flex gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-700">Explore Catalog</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-700">Talk to Sales</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-700">Track Order</span>
          </div>
        </div>

        {/* Connecting Arrow */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-3.5 h-3.5 text-red-500" />
        </div>

        {/* Node 2: WhatsApp Native Form */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-1">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-purple-600" />
              2. WhatsApp Interactive Form
            </span>
            <span className="text-[9px] text-purple-600 font-bold">1-Click Fill</span>
          </div>
          <p className="text-[10px] text-slate-600">Collect: Budget, City, Project Preference</p>
        </div>

        {/* Connecting Arrow */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-3.5 h-3.5 text-red-500" />
        </div>

        {/* Node 3: Conditional Branching */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200 text-[10px]">
            <span className="font-bold text-emerald-800 block text-[9px]">Budget &gt; ₹1 Cr (Hot Lead)</span>
            <span className="text-emerald-700 text-[9px]">→ Instant Senior Agent Call</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[10px]">
            <span className="font-bold text-slate-700 block text-[9px]">Budget &lt; ₹1 Cr</span>
            <span className="text-slate-600 text-[9px]">→ Send WhatsApp Brochure PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
