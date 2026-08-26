import {
  ShoppingBag,
  Cloud,
  Users,
  FileSpreadsheet,
  Layers,
  Hash,
  Zap,
  BarChart2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { integrationsData } from '../../data/integrations';

const iconMap = {
  ShoppingBag,
  Cloud,
  Users,
  FileSpreadsheet,
  Layers,
  Hash,
  Zap,
  BarChart2,
};

export default function IntegrationsShowcase() {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-8">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Connection Diagram (Visible on lg and above) */}
      <div className="hidden lg:block relative min-h-[460px] w-full">
        {/* SVG Connecting Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 900 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle animated connection lines from Center (450, 230) */}
          <path d="M 450 230 L 450 65" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 450 230 L 220 90" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 450 230 L 680 90" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 450 230 L 140 230" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 450 230 L 760 230" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 450 230 L 220 370" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 450 230 L 450 395" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 450 230 L 680 370" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />

          {/* Glowing Red Pulses */}
          <circle cx="450" cy="147" r="3" fill="#EF4444" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="335" cy="160" r="3" fill="#EF4444" className="animate-ping" style={{ animationDuration: '2.5s' }} />
          <circle cx="565" cy="160" r="3" fill="#EF4444" className="animate-ping" style={{ animationDuration: '2.8s' }} />
          <circle cx="295" cy="230" r="3" fill="#EF4444" className="animate-ping" style={{ animationDuration: '3.2s' }} />
          <circle cx="605" cy="230" r="3" fill="#EF4444" className="animate-ping" style={{ animationDuration: '2.7s' }} />
        </svg>

        {/* Central ARCO Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-red-500 shadow-2xl shadow-red-500/15 text-center min-w-[210px] animate-in fade-in zoom-in-95 duration-300">
            <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-black text-sm mb-2 shadow-sm">
              ARCO
            </div>
            <div className="font-extrabold text-base text-slate-900 leading-tight">
              ARCO <span className="text-red-600 font-semibold">Communication</span>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected Hub</span>
            </div>
          </div>
        </div>

        {/* 1. Top: Shopify */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <IntegrationBadge name="Shopify" category="E-Commerce" icon="ShoppingBag" />
        </div>

        {/* 2. Top Left: HubSpot */}
        <div className="absolute top-10 left-[16%] -translate-x-1/2 z-10">
          <IntegrationBadge name="HubSpot" category="CRM & Marketing" icon="Users" />
        </div>

        {/* 3. Top Right: Salesforce */}
        <div className="absolute top-10 left-[84%] -translate-x-1/2 z-10">
          <IntegrationBadge name="Salesforce" category="Enterprise CRM" icon="Cloud" />
        </div>

        {/* 4. Middle Left: Slack */}
        <div className="absolute top-1/2 left-[6%] -translate-x-1/2 -translate-y-1/2 z-10">
          <IntegrationBadge name="Slack" category="Team Alerts" icon="Hash" />
        </div>

        {/* 5. Middle Right: Zoho CRM */}
        <div className="absolute top-1/2 left-[94%] -translate-x-1/2 -translate-y-1/2 z-10">
          <IntegrationBadge name="Zoho CRM" category="Pipeline Sync" icon="Layers" />
        </div>

        {/* 6. Bottom Left: Zapier */}
        <div className="absolute bottom-10 left-[16%] -translate-x-1/2 z-10">
          <IntegrationBadge name="Zapier" category="5000+ Apps" icon="Zap" />
        </div>

        {/* 7. Bottom: Google Sheets */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
          <IntegrationBadge name="Google Sheets" category="Live Exports" icon="FileSpreadsheet" />
        </div>

        {/* 8. Bottom Right: Google Analytics */}
        <div className="absolute bottom-10 left-[84%] -translate-x-1/2 z-10">
          <IntegrationBadge name="Google Analytics" category="ROI Attribution" icon="BarChart2" />
        </div>
      </div>

      {/* Mobile / Tablet Responsive Grid (Visible below lg) */}
      <div className="block lg:hidden">
        {/* Central Badge on Mobile */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white rounded-2xl p-4 border-2 border-red-500 shadow-lg text-center">
            <div className="font-extrabold text-sm text-slate-900">
              ARCO <span className="text-red-600 font-semibold">Communication</span>
            </div>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected Ecosystem
            </span>
          </div>
        </div>

        {/* Grid of 8 Integrations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {integrationsData.map((item, idx) => {
            const Icon = iconMap[item.icon] || Sparkles;
            return (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center text-center hover:border-red-400/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">{item.name}</div>
                <span className="text-[10px] text-slate-500 mt-0.5">{item.category}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IntegrationBadge({ name, category, icon }) {
  const Icon = iconMap[icon] || Sparkles;

  return (
    <div className="bg-white rounded-xl px-4 py-2.5 border border-slate-200/90 shadow-md shadow-slate-900/5 flex items-center gap-3 min-w-[170px] hover:border-red-400/40 hover:-translate-y-0.5 transition-all duration-200">
      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold text-slate-900 leading-tight">{name}</div>
        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{category}</div>
      </div>
    </div>
  );
}
