import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { pricingFAQs } from '../../data/pricing';

export default function PricingFAQ() {
  const [openId, setOpenId] = useState(1); // First item open by default

  const toggleFAQ = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mt-20 sm:mt-28 max-w-3xl mx-auto">
      {/* FAQ Header */}
      <div className="text-center mb-10 sm:mb-12">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-3 shadow-2xs">
          FAQ
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Questions? We've got answers.
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-3">
          Everything you need to know about ARCO Communication plans and billing.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {pricingFAQs.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white border-red-200 shadow-md shadow-red-500/5'
                  : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(faq.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {faq.question}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'bg-red-50 text-red-600 rotate-180'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Collapsible Answer */}
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
