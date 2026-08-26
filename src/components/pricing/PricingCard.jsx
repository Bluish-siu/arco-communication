import { Check, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../common/Button';

export default function PricingCard({ plan, isAnnual }) {
  const currentPrice = isAnnual ? plan.price.yearly : plan.price.monthly;
  const isEnterprise = plan.id === 'enterprise';

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 bg-white border flex flex-col justify-between transition-all duration-300 relative ${
        plan.popular
          ? 'border-red-500 ring-2 ring-red-500/20 shadow-xl shadow-red-500/10 hover:-translate-y-1'
          : 'border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Most Popular Badge on Growth */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md shadow-red-600/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>MOST POPULAR</span>
        </div>
      )}

      <div>
        {/* Plan Title & Audience */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.forText}</p>

        {/* Pricing Block */}
        <div className="my-5 pb-5 border-b border-slate-100">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentPrice}
            </span>
            {plan.period && (
              <span className="text-xs font-semibold text-slate-500">{plan.period}</span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {isEnterprise ? 'Custom volume & SLAs' : isAnnual ? 'billed annually' : 'billed monthly'}
          </span>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5 mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            What's included:
          </span>
          <ul className="space-y-2.5">
            {plan.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <div className="w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200/60">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Button
          variant={plan.popular ? 'primary' : 'outline'}
          to={plan.ctaLink}
          icon={ArrowRight}
          className={`w-full justify-center text-sm py-3 rounded-xl transition-all duration-200 ${
            plan.popular
              ? 'shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-600/40'
              : 'border-slate-300 text-slate-800 hover:border-slate-400 hover:text-slate-950'
          }`}
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  );
}
