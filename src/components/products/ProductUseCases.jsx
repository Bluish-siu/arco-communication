import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

export default function ProductUseCases({
  badge = 'USE CASES',
  title = 'Built for high-growth teams across every industry',
  description = 'Discover how leading companies use this product to scale revenue and automate operations.',
  useCases = [],
}) {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <Container>
        <SectionTitle
          badge={badge}
          title={title}
          description={description}
          align="center"
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {useCases.map((uc, idx) => {
            const Icon = uc.icon || Sparkles;

            return (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:bg-white hover:border-red-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200/60 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    {uc.industry && (
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        {uc.industry}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {uc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {uc.description}
                  </p>
                </div>

                {uc.metric && (
                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{uc.metricLabel || 'Outcome:'}</span>
                    <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {uc.metric}
                    </span>
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
