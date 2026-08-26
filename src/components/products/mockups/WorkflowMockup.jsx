import { Workflow, ArrowDown, Clock, MessageCircle, UserCheck, Mail, GitBranch, Check } from 'lucide-react';

export default function WorkflowMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-6 text-slate-800 text-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Multi-Step Automation Builder</h4>
            <p className="text-[10px] text-slate-400">Trigger · Delay · Condition · Action Workflow</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            ● 1,420 Executions Today
          </span>
        </div>
      </div>

      {/* Visual Workflow Tree */}
      <div className="space-y-2 max-w-md mx-auto text-[10px]">
        {/* Step 1: Trigger */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              Trigger: New Lead Captured
            </span>
            <span className="text-[9px] text-slate-400">Source: CTWA Ad</span>
          </div>
        </div>

        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
        </div>

        {/* Step 2: Delay */}
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Delay: Wait 5 minutes</span>
          </div>
          <span className="text-[9px] text-slate-400">Human cadence</span>
        </div>

        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
        </div>

        {/* Step 3: Action */}
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Action: Send Personalized WhatsApp Intro</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-bold">Delivered</span>
        </div>

        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
        </div>

        {/* Step 4: Condition Branch */}
        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between font-bold text-amber-800 mb-1.5">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-amber-600" />
              <span>Condition: Lead Score &gt; 70?</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1 text-[9px]">
            <div className="bg-white p-2 rounded-lg border border-emerald-200">
              <span className="font-extrabold text-emerald-600 block">YES (Hot Lead)</span>
              <span className="text-slate-700">→ Assign to Senior Sales Rep & notify on Slack</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="font-extrabold text-slate-500 block">NO (Nurture)</span>
              <span className="text-slate-700">→ Add to 3-day WhatsApp educational drip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
