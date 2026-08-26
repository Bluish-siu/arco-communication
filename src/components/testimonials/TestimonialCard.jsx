import { Quote, TrendingUp } from 'lucide-react';

export default function TestimonialCard({
  name,
  role,
  company,
  quote,
  result,
  initials,
  avatarBg = 'bg-red-100 text-red-700',
}) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-red-300/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Quote Icon & Result Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Quote className="w-4 h-4 fill-red-600/20 stroke-red-600" />
          </div>
          {result && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/70 shadow-2xs">
              <TrendingUp className="w-3 h-3 text-red-600" />
              <span>{result}</span>
            </span>
          )}
        </div>

        {/* Testimonial Quote */}
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
          "{quote}"
        </p>
      </div>

      {/* Customer Info Footer */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3.5">
        <div
          className={`w-10 h-10 rounded-full ${avatarBg} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
        >
          {initials}
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 leading-tight">{name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {role}, <span className="font-semibold text-slate-700">{company}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
