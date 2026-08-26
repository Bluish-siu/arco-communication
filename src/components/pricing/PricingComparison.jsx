import React from 'react';
import { Check, Minus, Sparkles } from 'lucide-react';
import { comparisonFeatures } from '../../data/pricing';

export default function PricingComparison() {
  const plans = [
    { key: 'starter', name: 'Starter' },
    { key: 'growth', name: 'Growth', popular: true },
    { key: 'scale', name: 'Scale' },
    { key: 'enterprise', name: 'Enterprise' },
  ];

  const renderValue = (val) => {
    if (val === true) {
      return (
        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 border border-red-200/80">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      );
    }
    if (val === false) {
      return <Minus className="w-4 h-4 text-slate-300 mx-auto" />;
    }
    return <span className="text-xs font-semibold text-slate-800">{val}</span>;
  };

  return (
    <div className="mt-20 sm:mt-28">
      {/* Comparison Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-3 shadow-2xs">
          COMPARE PLANS
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Everything you need to scale conversations
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-3">
          Detailed breakdown of features and capabilities across all plans.
        </p>
      </div>

      {/* Comparison Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden max-w-5xl mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">
                  Features
                </th>
                {plans.map((p) => (
                  <th
                    key={p.key}
                    className={`p-4 sm:p-5 text-center text-xs font-bold uppercase tracking-wider w-1/6 ${
                      p.popular ? 'bg-red-50/50 text-red-700 border-x border-red-100' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{p.name}</span>
                      {p.popular && <Sparkles className="w-3 h-3 text-red-600" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body by Categories */}
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {comparisonFeatures.map((cat, cIdx) => (
                <React.Fragment key={cIdx}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-100/50">
                    <td
                      colSpan={5}
                      className="py-2.5 px-4 sm:px-5 font-bold text-xs text-slate-600 uppercase tracking-wider"
                    >
                      {cat.category}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {cat.features.map((feat, fIdx) => (
                    <tr key={fIdx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800">
                        {feat.name}
                      </td>
                      <td className="p-4 sm:p-5 text-center">
                        {renderValue(feat.starter)}
                      </td>
                      <td className="p-4 sm:p-5 text-center bg-red-50/20 border-x border-red-100/50">
                        {renderValue(feat.growth)}
                      </td>
                      <td className="p-4 sm:p-5 text-center">
                        {renderValue(feat.scale)}
                      </td>
                      <td className="p-4 sm:p-5 text-center">
                        {renderValue(feat.enterprise)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
