import { Sparkles } from 'lucide-react';

export default function BillingToggle({ isAnnual, onToggle }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 my-8">
      <div className="bg-slate-100/90 p-1.5 rounded-full flex items-center border border-slate-200 shadow-inner">
        {/* Monthly Button */}
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            !isAnnual
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Monthly
        </button>

        {/* Yearly Button */}
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            isAnnual
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Yearly</span>
        </button>
      </div>

      {/* Save up to 20% Badge */}
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/80 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-red-600" />
        <span>Save up to 20%</span>
      </span>
    </div>
  );
}
