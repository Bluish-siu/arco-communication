import {
  Inbox,
  UserCheck,
  CheckCircle2,
  PackageCheck,
  Tag,
  Clock,
  Send,
  Eye,
  ShieldCheck,
  MoreVertical,
  Paperclip,
  Users,
} from 'lucide-react';

export default function TeamInboxMockup() {
  const folders = [
    { name: 'All Conversations', count: 24, active: false },
    { name: 'Unassigned', count: 7, active: false },
    { name: 'My Conversations', count: 8, active: true },
    { name: 'Resolved', count: 32, active: false },
  ];

  const conversations = [
    {
      id: 1,
      name: 'Aarav Mehta',
      preview: 'Can you share the pricing sheet?',
      time: '11:42 AM',
      unread: true,
      avatar: 'AM',
      avatarBg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 2,
      name: 'Priya Shah',
      preview: 'Can you tell me when my order will...',
      time: '11:40 AM',
      unread: false,
      selected: true,
      avatar: 'PS',
      avatarBg: 'bg-red-100 text-red-700',
    },
    {
      id: 3,
      name: 'Rahul Sharma',
      preview: 'Thanks for the assistance!',
      time: '11:28 AM',
      unread: false,
      avatar: 'RS',
      avatarBg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 4,
      name: 'Neha Patel',
      preview: 'I have a quick question about...',
      time: '10:55 AM',
      unread: false,
      avatar: 'NP',
      avatarBg: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Ambient background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-rose-500/5 to-slate-900/5 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      {/* Main Team Inbox Card */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden text-slate-800 text-xs">
        
        {/* Top App Bar */}
        <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="ml-1.5 font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5 text-red-600" />
              <span>ARCO Team Inbox</span>
            </span>
          </div>

          {/* Collaboration Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
              <Eye className="w-3 h-3 text-red-600" />
              <span>2 team members viewing</span>
            </div>
          </div>
        </div>

        {/* 3-Column Layout: Folders + List + Active Thread with Details */}
        <div className="grid grid-cols-12 min-h-[380px] sm:min-h-[400px]">
          
          {/* Col 1: Folders / Left Navigation */}
          <div className="col-span-3 sm:col-span-3 bg-slate-50/70 border-r border-slate-200/70 p-2 sm:p-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-1 py-1 hidden sm:block">
                Folders
              </div>
              {folders.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-1.5 sm:p-2 rounded-lg text-[11px] font-medium transition-colors ${
                    f.active
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      f.active ? 'bg-red-600 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {f.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Agent Status Badge */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 px-1">
              <div className="w-5 h-5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                A
              </div>
              <div className="overflow-hidden hidden sm:block">
                <div className="text-[10px] font-bold text-slate-800 truncate">Ananya S.</div>
                <div className="text-[9px] text-emerald-600 font-medium">Active Agent</div>
              </div>
            </div>
          </div>

          {/* Col 2: Conversation List */}
          <div className="col-span-4 sm:col-span-4 bg-white border-r border-slate-200/70 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 transition-colors cursor-pointer ${
                    c.selected
                      ? 'bg-red-50/60 border-l-2 border-red-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className={`w-5 h-5 rounded-full ${c.avatarBg} text-[9px] font-bold flex items-center justify-center shrink-0`}>
                        {c.avatar}
                      </div>
                      <span className="font-bold text-slate-900 text-[11px] truncate">{c.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal pl-6">
                    {c.preview}
                  </p>
                  {c.unread && (
                    <div className="mt-1 flex justify-end">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Selected Chat & Customer Details */}
          <div className="col-span-5 sm:col-span-5 bg-white flex flex-col justify-between">
            
            {/* Header: Assigned Agent & Status */}
            <div className="p-2 sm:p-2.5 border-b border-slate-200/70 flex items-center justify-between bg-slate-50/40">
              <div>
                <div className="font-bold text-slate-900 text-xs">Priya Shah</div>
                <div className="text-[9px] text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-red-600" />
                  <span className="font-semibold text-slate-700">Assigned to Ananya</span>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/60">
                Open
              </span>
            </div>

            {/* Chat Messages */}
            <div className="p-2.5 sm:p-3 space-y-2.5 overflow-y-auto flex-1 bg-slate-50/20">
              
              {/* Customer message */}
              <div className="bg-white p-2 rounded-xl rounded-tl-xs border border-slate-200/80 shadow-2xs">
                <p className="text-[11px] text-slate-800">
                  Can you tell me when my order will arrive?
                </p>
                <span className="text-[8px] text-slate-400 mt-0.5 block text-right">11:40 AM</span>
              </div>

              {/* Agent response */}
              <div className="bg-red-50/80 p-2 rounded-xl rounded-tr-xs border border-red-200/70 text-slate-800 ml-3">
                <p className="text-[11px] text-slate-800">
                  Sure! Let me check that for you.
                </p>
                <span className="text-[8px] text-red-600/70 mt-0.5 block text-right">11:41 AM · Ananya</span>
              </div>

              {/* Order Card Preview */}
              <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-[10px] text-slate-900">Order #AR48291</div>
                  <div className="text-[9px] text-emerald-600 font-semibold">Expected delivery: Tomorrow</div>
                </div>
              </div>

            </div>

            {/* Customer Details Bottom Panel */}
            <div className="p-2 sm:p-2.5 bg-slate-50/90 border-t border-slate-200/70">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Customer Details</span>
                <span className="text-[9px] text-slate-400">+91 98XXXXXX21</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                <span className="bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded text-[8px] border border-red-200/60">
                  Returning Customer
                </span>
                <span className="bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded text-[8px]">
                  High Value
                </span>
              </div>
              <p className="text-[9px] text-slate-500 italic truncate">
                Note: Interested in premium products
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
