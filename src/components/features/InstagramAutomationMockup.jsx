import { useState } from 'react';
import {
  MessageSquare,
  MessageCircle,
  Zap,
  Users,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bot,
  Flame,
  Check,
} from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function InstagramAutomationMockup() {
  const [activeTab, setActiveTab] = useState('inbox');

  const conversations = [
    {
      id: 1,
      name: 'Aarav Mehta',
      handle: '@aarav.m',
      lastMsg: "Hi, what's the price of this?",
      time: 'Just now',
      unread: true,
      tag: 'Ad Lead',
    },
    {
      id: 2,
      name: 'Priya Shah',
      handle: '@priya_s',
      lastMsg: 'Is this available in Mumbai?',
      time: '8m ago',
      unread: false,
      tag: 'Post Comment',
    },
    {
      id: 3,
      name: 'Rahul Sharma',
      handle: '@rahul_real',
      lastMsg: 'Can you send me the details?',
      time: '24m ago',
      unread: false,
      tag: 'Story Reply',
    },
    {
      id: 4,
      name: 'Neha Patel',
      handle: '@neha.patel',
      lastMsg: 'I came from your Instagram ad',
      time: '1h ago',
      unread: false,
      tag: 'Instagram Ad',
    },
  ];

  return (
    <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-6 text-slate-800 text-xs overflow-hidden">
      
      {/* Top App Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
            <InstagramIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">ARCO Instagram Automation</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Bot Connected
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Direct Message & Comment Automation Engine</p>
          </div>
        </div>

        {/* Mini KPI Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] text-slate-500 font-medium">Auto-Reply Rate:</span>
          <span className="text-xs font-extrabold text-emerald-600">99.4%</span>
        </div>
      </div>

      {/* Main Multi-Pane Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        
        {/* 1. Left Mini Sidebar (3 Cols) */}
        <div className="md:col-span-3 bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 mb-2 text-[11px] font-extrabold text-slate-900 border-b border-slate-200/60 pb-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>Instagram Hub</span>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'inbox'
                    ? 'bg-white text-red-600 shadow-2xs border border-red-200/60'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Inbox</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-100 text-red-700">18</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'comments'
                    ? 'bg-white text-red-600 shadow-2xs border border-red-200/60'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">7</span>
              </button>

              <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Automations</span>
                </div>
                <span className="text-[9px] text-emerald-600 font-bold">Active</span>
              </div>

              <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Leads</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">12</span>
              </div>

              <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                  <span>Analytics</span>
                </div>
                <span className="text-[9px] text-slate-400">1.8K</span>
              </div>
            </div>
          </div>

          {/* Quick status */}
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[9px] text-slate-400">
            <span>Synced with Meta API</span>
          </div>
        </div>

        {/* 2. Conversation List (4 Cols) */}
        <div className="md:col-span-4 bg-slate-50/50 rounded-xl p-2.5 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 text-[10px] font-bold text-slate-700 px-1">
            <span>Recent Instagram DMs</span>
            <span className="text-red-600 font-semibold">Unread: 7</span>
          </div>

          <div className="space-y-1.5">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`p-2 rounded-lg border text-left transition-all ${
                  c.id === 1
                    ? 'bg-white border-red-300 shadow-2xs ring-1 ring-red-500/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {c.unread && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    <span className="font-bold text-slate-900 text-[11px]">{c.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400">{c.time}</span>
                </div>
                <p className="text-[10px] text-slate-600 truncate mt-0.5 font-medium">{c.lastMsg}</p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                  <span className="text-[8px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                    {c.tag}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">{c.handle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Live Instagram Chat & AI Qualification (5 Cols) */}
        <div className="md:col-span-5 bg-slate-50/60 rounded-xl p-3 border border-slate-200/70 flex flex-col justify-between">
          <div>
            {/* Active Contact Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                  A
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">Aarav Mehta</span>
                  <span className="text-[8px] text-slate-400">@aarav.m · Active now</span>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded">
                AI Handled
              </span>
            </div>

            {/* Chat Thread */}
            <div className="space-y-2 text-[10px]">
              {/* Customer Msg 1 */}
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-800 shadow-2xs max-w-[85%]">
                <span className="text-[8px] font-bold text-slate-400 block mb-0.5">Aarav (Customer)</span>
                "Hey! I saw your post about the 2BHK apartments."
              </div>

              {/* ARCO AI Msg 1 */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50/80 p-2 rounded-xl border border-red-200/80 text-slate-800 ml-auto max-w-[90%]">
                <div className="flex items-center gap-1 text-[8px] font-bold text-red-600 mb-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>ARCO AI Assistant</span>
                </div>
                "Hi Aarav! 👋 I'd be happy to help. Are you looking to buy or rent?"
              </div>

              {/* Customer Msg 2 */}
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-800 shadow-2xs max-w-[85%]">
                "Buy. My budget is around ₹1.5 Cr in Bhandup or Mulund."
              </div>
            </div>

            {/* AI Action Card: Lead Qualified */}
            <div className="mt-2.5 p-2 bg-gradient-to-br from-red-50/90 to-rose-50/70 rounded-xl border border-red-200/80 text-[10px]">
              <div className="flex items-center justify-between pb-1 border-b border-red-200/60 font-bold text-red-700">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-600" />
                  <span>LEAD QUALIFIED</span>
                </span>
                <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[8px]">High Intent</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[9px] text-slate-700">
                <div>Budget: <strong className="text-slate-900">₹1.5 Cr</strong></div>
                <div>Location: <strong className="text-slate-900">Bhandup/Mulund</strong></div>
                <div>Requirement: <strong className="text-slate-900">2BHK</strong></div>
                <div>Source: <strong className="text-rose-600">Instagram</strong></div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500">
            <span>Auto-synced to CRM</span>
            <span className="text-emerald-600 font-bold">Ready for WhatsApp Rep</span>
          </div>
        </div>

      </div>

      {/* Bottom Dual Panels: Comment Automation & Workflow Sequence */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3.5">
        
        {/* Comment Automation Panel (7 Cols) */}
        <div className="md:col-span-7 bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200/60 text-[10px] font-bold text-slate-800">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
              <span>Instagram Post & Comment Automation</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
              Active Trigger
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Post & Inbound Comments */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="font-bold text-[10px] text-slate-900">Post: "2BHK homes from ₹1.25 Cr 🏠"</div>
              <div className="space-y-1 text-[9px]">
                <div className="p-1 bg-slate-50 rounded flex justify-between">
                  <span className="text-slate-700"><strong>@rahul:</strong> "Price?"</span>
                  <span className="text-emerald-600 font-bold">Replied</span>
                </div>
                <div className="p-1 bg-slate-50 rounded flex justify-between">
                  <span className="text-slate-700"><strong>@priya:</strong> "Location?"</span>
                  <span className="text-emerald-600 font-bold">Replied</span>
                </div>
                <div className="p-1 bg-slate-50 rounded flex justify-between">
                  <span className="text-slate-700"><strong>@neha:</strong> "Send details"</span>
                  <span className="text-emerald-600 font-bold">Replied</span>
                </div>
              </div>
            </div>

            {/* Auto Reply & Workflow State */}
            <div className="bg-gradient-to-br from-red-50/70 to-rose-50/50 p-2.5 rounded-lg border border-red-200/80 flex flex-col justify-between">
              <div>
                <div className="font-bold text-[9px] text-red-700 uppercase tracking-wider mb-1">
                  Instant Auto-Reply
                </div>
                <p className="text-[9px] text-slate-700 leading-snug">
                  "Thanks for your interest! 👋 We've sent you the details in DM."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1 mt-2 text-[8px] font-semibold text-slate-700">
                <div className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-emerald-600" /> Comment detected</div>
                <div className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-emerald-600" /> Reply sent</div>
                <div className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-emerald-600" /> DM started</div>
                <div className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-emerald-600" /> Lead created</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow & Analytics KPIs (5 Cols) */}
        <div className="md:col-span-5 bg-slate-50/70 rounded-xl p-3 border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200/60 text-[10px] font-bold text-slate-800">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                <span>Instagram → WhatsApp Funnel</span>
              </div>
              <span className="text-[9px] font-bold text-red-600">17.6% CVR</span>
            </div>

            {/* Workflow Linear Diagram */}
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mb-2">
              <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">Comment</span>
              <span>→</span>
              <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">DM</span>
              <span>→</span>
              <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">AI Qual</span>
              <span>→</span>
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">WhatsApp</span>
            </div>

            {/* 4 Mini KPI Cards */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-[8px] text-slate-400 block">Conversations</span>
                <strong className="text-[11px] text-slate-900">1,842</strong>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-[8px] text-slate-400 block">Leads</span>
                <strong className="text-[11px] text-red-600">326</strong>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-[8px] text-slate-400 block">Reply Rate</span>
                <strong className="text-[11px] text-emerald-600">94%</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[8px] text-slate-400">
            <span>218 Qualified Leads</span>
            <span className="font-bold text-slate-700">Direct Sales Routing</span>
          </div>
        </div>

      </div>

    </div>
  );
}
