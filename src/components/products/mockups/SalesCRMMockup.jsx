import { TrendingUp, User, DollarSign, Flame, Clock, CheckCircle2 } from 'lucide-react';

export default function SalesCRMMockup() {
  const stages = [
    {
      name: 'New Lead',
      count: 14,
      deals: [
        { name: 'Kavita Roy', value: '₹1.8L', score: 'Hot', src: 'WhatsApp Ad', time: '10m ago' },
      ],
    },
    {
      name: 'Qualified',
      count: 9,
      deals: [
        { name: 'Rohan Joshi', value: '₹4.5L', score: 'Hot', src: 'CTWA Campaign', time: '25m ago' },
      ],
    },
    {
      name: 'Demo / Call',
      count: 6,
      deals: [
        { name: 'Aditi Nair', value: '₹8.2L', score: 'Warm', src: 'Website Chat', time: '1h ago' },
      ],
    },
    {
      name: 'Proposal',
      count: 4,
      deals: [
        { name: 'Siddharth Rao', value: '₹12.0L', score: 'Hot', src: 'Direct Inbound', time: '2h ago' },
      ],
    },
    {
      name: 'Won',
      count: 28,
      deals: [
        { name: 'Vikram Mehta', value: '₹6.5L', score: 'Won', src: 'Instagram DM', time: 'Today' },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-5 text-slate-800 text-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Conversational Sales CRM</h4>
            <p className="text-[10px] text-slate-400">Live Deal Pipeline & Lead Scoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-600">
            Pipeline: <strong>₹33.0L</strong>
          </span>
        </div>
      </div>

      {/* 5-Stage Kanban Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 overflow-x-auto">
        {stages.map((stg, idx) => (
          <div key={idx} className="bg-slate-50/80 rounded-xl p-2 border border-slate-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 text-[10px] font-extrabold text-slate-700">
                <span className="truncate">{stg.name}</span>
                <span className="text-[9px] bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 font-bold">
                  {stg.count}
                </span>
              </div>

              <div className="space-y-1.5">
                {stg.deals.map((deal, dIdx) => (
                  <div
                    key={dIdx}
                    className="bg-white p-2 rounded-lg border border-slate-200/90 shadow-2xs hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-900 truncate">{deal.name}</span>
                      {deal.score === 'Hot' && (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded border border-red-100">
                          <Flame className="w-2.5 h-2.5" /> Hot
                        </span>
                      )}
                      {deal.score === 'Warm' && (
                        <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-100">
                          Warm
                        </span>
                      )}
                      {deal.score === 'Won' && (
                        <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                          ✓ Won
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-800 mt-1">{deal.value}</div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-[8px] text-slate-400">
                      <span>{deal.src}</span>
                      <span>{deal.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
