import { PhoneCall, PhoneForwarded, Sparkles, User, Flame, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export default function VoiceAIMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-6 text-slate-800 text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">ARCO Voice AI Receptionist</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                Live Call In Progress
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Autonomous Inbound Call Handler & Lead Qualifier</p>
          </div>
        </div>

        <div className="text-right text-[10px]">
          <span className="text-slate-400 block">Call Duration</span>
          <span className="font-mono font-bold text-slate-900">01:42</span>
        </div>
      </div>

      {/* 2-Column Call Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Left: Live Audio Dialogue (7 Cols) */}
        <div className="md:col-span-7 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2 text-[10px]">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60 font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Caller: Rahul Sharma (+91 98201 48291)</span>
            </div>
            <span className="text-emerald-600 font-bold">Verified</span>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs max-w-[85%]">
            <span className="text-[8px] font-bold text-slate-400 block mb-0.5">Rahul (Caller)</span>
            "Hi, I'm looking for a 2BHK in Mumbai under ₹1.5 Cr."
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50/80 p-2 rounded-xl border border-red-200 ml-auto max-w-[90%]">
            <div className="flex items-center gap-1 text-[8px] font-bold text-red-600 mb-0.5">
              <Sparkles className="w-2.5 h-2.5" /> ARCO AI Voice Agent
            </div>
            "Understood, Rahul! Which specific localities in Mumbai are you looking at, and do you need ready possession?"
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs max-w-[85%]">
            "Bhandup or Mulund. Ready to move in by next month."
          </div>
        </div>

        {/* Right: Live Intent & Summary Actions (5 Cols) */}
        <div className="md:col-span-5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 font-bold text-[10px] text-slate-800">
              <span>Live Extracted Intent</span>
              <span className="flex items-center gap-0.5 text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-100 font-bold text-[8px]">
                <Flame className="w-2.5 h-2.5" /> Hot Lead
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[9px] mt-2">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Requirement</span>
                <strong className="text-slate-900">2BHK Ready</strong>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Budget</span>
                <strong className="text-slate-900">₹1.5 Cr</strong>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 block">Location Preference</span>
                <strong className="text-slate-900">Bhandup / Mulund, Mumbai</strong>
              </div>
            </div>
          </div>

          {/* Post-call automated actions */}
          <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[8px] font-semibold text-slate-700">
            <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> CRM Lead Created</div>
            <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Assigned to Senior Broker</div>
            <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> WhatsApp Call Summary Sent</div>
          </div>
        </div>
      </div>
    </div>
  );
}
