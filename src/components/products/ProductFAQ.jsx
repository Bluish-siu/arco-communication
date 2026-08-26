import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

export default function ProductFAQ({
  badge = 'FREQUENTLY ASKED QUESTIONS',
  title = 'Got questions? We have answers.',
  description = 'Everything you need to know about setting up and using this ARCO product.',
  faqs = [],
}) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 border-b border-slate-100">
      <Container>
        <SectionTitle
          badge={badge}
          title={title}
          description={description}
          align="center"
        />

        <div className="mt-12 max-w-3xl mx-auto space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-red-300 shadow-md ring-1 ring-red-500/20'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-red-50 text-red-600 rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1 pt-3 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
