import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Zap,
  MessageSquare,
  Layers,
  Sparkles,
  Bot,
  PhoneCall,
  FileCheck,
  ListFilter,
  Sliders,
} from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function AutomationSubNav() {
  const location = useLocation();

  const mainAutomationLinks = [
    { label: 'Basic Automations', path: '/automation/inbox-setting', icon: Zap },
    { label: 'Custom Auto Reply', path: '/automation/custom-reply', icon: MessageSquare },
    { label: 'Workflows', path: '/automation/workflows', icon: Layers },
    { label: 'AI Intent Matching', path: '/automation/ai-intent-matching', icon: Sparkles },
    { label: 'WhatsApp AI Agent', path: '/automation/whatsapp-ai-agent', icon: Bot },
    { label: 'Instagram Quickflows', path: '/automation/quick-flows', icon: InstagramIcon },
    { label: 'Voice AI - Inbound Calls', path: '/automation/my-call-genie', icon: PhoneCall },
  ];

  const utilityLinks = [
    { label: 'WhatsApp Forms', path: '/automation/whatsapp-forms/view', icon: FileCheck },
    { label: 'Interaktive List', path: '/automation/interactive-list', icon: ListFilter },
  ];

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] p-3 space-y-6 select-none hidden md:block">
      
      {/* Automation Section */}
      <div className="space-y-1">
        <div className="px-3 text-[11px] font-semibold text-slate-400 tracking-tight">
          Automation
        </div>
        <div className="space-y-0.5 pt-1">
          {mainAutomationLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/automation/whatsapp-forms/view' && location.pathname.includes('/automation/whatsapp-forms'));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#e8f6f0] text-[#0d3b30] font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0d3b30]' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Utilities Section */}
      <div className="space-y-1 pt-2 border-t border-slate-100">
        <div className="px-3 text-[11px] font-semibold text-slate-400 tracking-tight">
          Utilities
        </div>
        <div className="space-y-0.5 pt-1">
          {utilityLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path.includes('/automation/whatsapp-forms') && location.pathname.includes('/automation/whatsapp-forms')) ||
              (item.path === '/automation/interactive-list' && location.pathname.includes('/automation/interactive-list'));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#e8f6f0] text-[#0d3b30] font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0d3b30]' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

    </aside>
  );
}
