import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  Users,
  ArrowRight,
} from 'lucide-react';

export default function WebinarModal({ isOpen, onClose, showToast }) {
  const [slot, setSlot] = useState('today_5pm');
  const [registered, setRegistered] = useState(false);

  if (!isOpen) return null;

  const handleRegister = (e) => {
    e.preventDefault();
    setRegistered(true);
    showToast('Seat reserved for ARCO Live Demo Webinar! Joining link sent to your email.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Daily Live Session
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                ARCO Masterclass & Demo
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {registered ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Your Spot is Confirmed!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                We've reserved your complimentary seat. The webinar calendar invite and Zoom joining link have been sent.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn how top D2C and SaaS brands scale customer acquisition and support using WhatsApp & Instagram automation with ARCO.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select a Session Time (Daily)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSlot('today_5pm')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      slot === 'today_5pm'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Today, 5:00 PM IST</div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Fast-filling</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlot('tomorrow_11am')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      slot === 'tomorrow_11am'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Tomorrow, 11:00 AM IST</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Morning Batch</div>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  What you will learn:
                </div>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  <li>Connecting Instagram Business & WhatsApp Cloud API</li>
                  <li>Instant auto-replies to PP & pricing queries</li>
                  <li>Setting up automated Giveaway & LeadGen flows</li>
                  <li>Shopify cart recovery & 2-way team inbox workflows</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0f4a3c] hover:bg-[#0c3c31] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Reserve Free Spot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
