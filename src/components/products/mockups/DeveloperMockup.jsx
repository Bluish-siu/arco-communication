import { Code2, Terminal, Copy, Check, Play, Zap, Webhook } from 'lucide-react';
import { useState } from 'react';

export default function DeveloperMockup() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl shadow-slate-900/50 p-4 sm:p-6 text-slate-300 text-xs overflow-hidden font-mono">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-400 font-bold ml-2">ARCO REST API Console</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            HTTP 200 OK
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Request Block */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">POST</span>
          <span className="text-slate-200">https://api.arcocommunication.com/v1/messages/send</span>
        </div>

        {/* JSON Request */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-300">
          <div className="text-slate-500 text-[10px] pb-1 border-b border-slate-800 mb-1 flex justify-between">
            <span>Request Body (JSON)</span>
            <span className="text-slate-400">Bearer arc_live_sec_8942</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto">
{`{
  "to": "+919876543210",
  "channel": "whatsapp",
  "template": {
    "name": "order_dispatch_update",
    "language": "en",
    "components": [
      { "type": "body", "parameters": [{ "type": "text", "text": "Aarav" }] }
    ]
  }
}`}
          </pre>
        </div>

        {/* JSON Response */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px]">
          <div className="text-slate-500 text-[10px] pb-1 border-b border-slate-800 mb-1 flex justify-between">
            <span>Response Body</span>
            <span className="text-emerald-400">latency: 42ms</span>
          </div>
          <pre className="text-emerald-300 overflow-x-auto">
{`{
  "status": "success",
  "message_id": "wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSMzEyQzY",
  "delivery_status": "dispatched",
  "timestamp": 1724147200
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
