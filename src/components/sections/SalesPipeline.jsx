import {
  TrendingUp,
  DollarSign,
  User,
  MoreVertical,
  Plus,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function SalesPipeline() {
  const columns = [
    {
      id: 'new',
      title: 'New Leads',
      count: 3,
      dotColor: 'bg-amber-500',
      leads: [
        {
          name: 'Rahul Sharma',
          value: '₹45,000',
          tag: 'WhatsApp Lead',
          avatarBg: 'bg-red-100 text-red-700',
          initials: 'RS',
        },
        {
          name: 'Priya Mehta',
          value: '₹62,000',
          tag: 'Inbound Chat',
          avatarBg: 'bg-emerald-100 text-emerald-700',
          initials: 'PM',
        },
        {
          name: 'Aman Patel',
          value: '₹38,000',
          tag: 'Catalog Inquiry',
          avatarBg: 'bg-blue-100 text-blue-700',
          initials: 'AP',
        },
      ],
    },
    {
      id: 'qualified',
      title: 'Qualified',
      count: 2,
      dotColor: 'bg-blue-500',
      leads: [
        {
          name: 'Neha Shah',
          value: '₹85,000',
          tag: 'Demo Scheduled',
          avatarBg: 'bg-purple-100 text-purple-700',
          initials: 'NS',
        },
        {
          name: 'Rohan Desai',
          value: '₹54,000',
          tag: 'AI Qualified',
          avatarBg: 'bg-rose-100 text-rose-700',
          initials: 'RD',
        },
      ],
    },
    {
      id: 'proposal',
      title: 'Proposal',
      count: 1,
      dotColor: 'bg-purple-500',
      leads: [
        {
          name: 'Karan Shah',
          value: '₹1,20,000',
          tag: 'Custom Quote',
          avatarBg: 'bg-indigo-100 text-indigo-700',
          initials: 'KS',
        },
      ],
    },
    {
      id: 'won',
      title: 'Won',
      count: 1,
      dotColor: 'bg-emerald-500',
      leads: [
        {
          name: 'Meera Joshi',
          value: '₹95,000',
          tag: 'Closed Won',
          avatarBg: 'bg-emerald-100 text-emerald-800',
          initials: 'MJ',
        },
      ],
    },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Ambient glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-indigo-500/5 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      {/* Main CRM Card */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">Sales Pipeline</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/80">
                  24 Active Leads
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Total pipeline value: <span className="font-semibold text-slate-700">₹4.99L</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Filter className="w-3 h-3" />
              <span>All Deals</span>
            </span>
          </div>
        </div>

        {/* 4 Pipeline Columns Grid / Scroll Container */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto pb-1">
          {columns.map((col) => (
            <div
              key={col.id}
              className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-200/70 flex flex-col justify-start min-w-[120px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-slate-800 truncate">{col.title}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600">
                  {col.count}
                </span>
              </div>

              {/* Lead Cards */}
              <div className="space-y-2">
                {col.leads.map((lead, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-2 sm:p-2.5 border border-slate-200 shadow-2xs hover:border-red-400/40 hover:shadow-xs transition-all duration-150"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-5 h-5 rounded-full ${lead.avatarBg} text-[9px] font-bold flex items-center justify-center shrink-0`}>
                        {lead.initials}
                      </div>
                      <span className="font-semibold text-xs text-slate-900 truncate">{lead.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-50">
                      <span className="font-bold text-slate-800">{lead.value}</span>
                      <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[70px]">
                        {lead.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mini Automation Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span className="text-[11px] font-medium text-slate-600">AI auto-assigning incoming WhatsApp conversations</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 hidden sm:inline">100% Synced</span>
        </div>

      </div>
    </div>
  );
}
