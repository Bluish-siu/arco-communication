import React, { useState } from 'react';
import { Play, Sparkles, Send, RefreshCw, CheckCircle2, Bot, Layers, MessageSquare, ArrowRight, X } from 'lucide-react';
import { automationService } from '../../services/automationService';

export default function AutomationSimulatorDrawer({ isOpen, onClose }) {
  const [channel, setChannel] = useState('whatsapp');
  const [testMessage, setTestMessage] = useState('Where is my order?');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSimulate = async (e) => {
    if (e) e.preventDefault();
    if (!testMessage.trim()) return;

    setIsRunning(true);
    setResult(null);

    try {
      const res = await automationService.executeEngine({
        message: testMessage.trim(),
        channel,
        contact_name: 'Simulated User',
        contact_phone: '+91 98765 00000',
        simulation: true,
      });

      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        error: err.message || 'Simulation encountered an error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const samplePrompts = [
    'Where is my order?',
    'What digital solutions do you provide?',
    'Pricing & Plans',
    'Speak with Human Agent',
    'START',
    'PRICE',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Automation Engine Simulator</h3>
              <p className="text-[11px] text-slate-400">Test live message resolution across all 9 modules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Channel selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Inbound Channel</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-50 border-emerald-500 text-[#0d3b30] shadow-2xs font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel('instagram')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  channel === 'instagram'
                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-2xs font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Instagram
              </button>
            </div>
          </div>

          {/* Prompt presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Sample Messages</label>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setTestMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Test Input Form */}
          <form onSubmit={handleSimulate} className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Customer Inbound Message</label>
            <div className="relative">
              <textarea
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type customer message to test..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] focus:border-transparent outline-hidden resize-none bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={isRunning || !testMessage.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Evaluating Automations in Real-Time...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run Live Engine Simulation
                </>
              )}
            </button>
          </form>

          {/* Simulation Output Card */}
          {result && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-200">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Automation
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-[#0d3b30] uppercase">
                    {result.type || 'Custom Reply'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400">Trigger Name</div>
                  <div className="text-xs font-bold text-slate-900">{result.name || 'Auto Reply Match'}</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400">Executed Response Action</div>
                  <div className="text-xs text-slate-800 leading-relaxed font-medium bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/60">
                    {result.response || 'Action executed successfully.'}
                  </div>
                </div>

                {/* Execution Trace Logs */}
                {result.executionLogs && result.executionLogs.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-500">Resolution Steps (Priority Order):</div>
                    <div className="space-y-1">
                      {result.executionLogs.map((log, idx) => (
                        <div key={idx} className="text-[11px] bg-slate-200/60 p-2 rounded-lg text-slate-700 font-mono">
                          <span className="font-bold text-slate-900">{log.step}:</span> {log.details}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-400">
            ARCO Automated Engine simulates real Meta Webhook processing with 0 external API cost.
          </p>
        </div>

      </div>
    </div>
  );
}
