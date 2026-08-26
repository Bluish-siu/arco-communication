import {
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  MessageSquare,
  Users,
  Percent,
  CheckCircle2,
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const kpis = [
    {
      title: 'Conversations',
      value: '24,892',
      change: '+18.4%',
      icon: MessageSquare,
    },
    {
      title: 'Leads',
      value: '3,482',
      change: '+24.7%',
      icon: Users,
    },
    {
      title: 'Conversion Rate',
      value: '14.8%',
      change: '+3.2%',
      icon: Percent,
      highlight: true,
    },
    {
      title: 'Revenue',
      value: '₹18.6L',
      change: '+21.3%',
      icon: TrendingUp,
    },
  ];

  const leadSources = [
    { source: 'WhatsApp', percentage: 48, color: 'bg-red-600' },
    { source: 'Website', percentage: 27, color: 'bg-slate-800' },
    { source: 'Instagram', percentage: 15, color: 'bg-rose-400' },
    { source: 'Other', percentage: 10, color: 'bg-slate-300' },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Ambient glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-amber-500/5 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      {/* Main Analytics Card */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800 text-xs font-sans">
        
        {/* Dashboard Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Overview</h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-600 font-semibold text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last 30 days</span>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {kpis.map((k, i) => (
            <div
              key={i}
              className={`p-2.5 sm:p-3 rounded-xl border ${
                k.highlight
                  ? 'bg-red-50/50 border-red-200/80'
                  : 'bg-slate-50/80 border-slate-100'
              }`}
            >
              <span className="text-[10px] font-medium text-slate-500 block truncate">{k.title}</span>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{k.value}</div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> {k.change}
              </span>
            </div>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-100 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-bold text-xs text-slate-900">Conversations & Conversions</span>
              <span className="text-[10px] text-slate-400 block">Weekly volume trend</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Conversations
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Conversions
              </span>
            </div>
          </div>

          {/* SVG Smooth Area Line Chart */}
          <div className="relative w-full h-36">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 450 140"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              <line x1="0" y1="20" x2="450" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="60" x2="450" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="100" x2="450" y2="100" stroke="#F1F5F9" strokeWidth="1" />

              {/* Filled Area */}
              <path
                d="M 0 95 Q 75 75 150 65 T 300 45 T 450 15 L 450 130 L 0 130 Z"
                fill="url(#redGradient)"
              />

              {/* Line Stroke */}
              <path
                d="M 0 95 Q 75 75 150 65 T 300 45 T 450 15"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Secondary conversions line */}
              <path
                d="M 0 115 Q 75 105 150 95 T 300 80 T 450 60"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Highlight Points */}
              <circle cx="0" cy="95" r="3.5" fill="#DC2626" />
              <circle cx="75" cy="78" r="3.5" fill="#DC2626" />
              <circle cx="150" cy="65" r="3.5" fill="#DC2626" />
              <circle cx="225" cy="55" r="3.5" fill="#DC2626" />
              <circle cx="300" cy="45" r="3.5" fill="#DC2626" />
              <circle cx="375" cy="28" r="3.5" fill="#DC2626" />
              <circle cx="450" cy="15" r="4.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          {/* Chart X-Axis Labels */}
          <div className="grid grid-cols-7 text-[10px] text-slate-400 text-center mt-1 pt-1 border-t border-slate-100">
            <span>Mon (2.1K)</span>
            <span>Tue (2.8K)</span>
            <span>Wed (3.1K)</span>
            <span>Thu (2.9K)</span>
            <span>Fri (3.8K)</span>
            <span>Sat (4.2K)</span>
            <span className="font-bold text-red-600">Sun (4.8K)</span>
          </div>
        </div>

        {/* Secondary Analytics: Lead Sources + Top Campaign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Lead Sources Horizontal Bars */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="font-bold text-xs text-slate-900 block mb-2">Lead Sources</span>
            <div className="space-y-2">
              {leadSources.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                    <span>{s.source}</span>
                    <span>{s.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`${s.color} h-full rounded-full`} style={{ width: `${s.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Campaign Card */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">Top Campaign</span>
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  Performing well
                </span>
              </div>
              <div className="font-bold text-[11px] text-red-600 truncate">Summer Sale Campaign</div>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200/60 text-center">
              <div>
                <span className="text-[9px] text-slate-400 block">Messages</span>
                <span className="font-bold text-[11px] text-slate-800">12,480</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Conversions</span>
                <span className="font-bold text-[11px] text-slate-800">684</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Conv. Rate</span>
                <span className="font-bold text-[11px] text-emerald-600">5.48%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
