import { Sparkles, TrendingUp, Zap, Clock, ShieldCheck, Smile, DollarSign } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

export default function ProductBenefits({
  badge = 'BUSINESS IMPACT',
  title = 'Why leading brands choose ARCO',
  description = 'Measurable results that drive bottom-line revenue and operational efficiency.',
  benefits = [],
}) {
  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100">
      <Container>
        <SectionTitle
          badge={badge}
          title={title}
          description={description}
          align="center"
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, idx) => {
            const Icon = b.icon || Zap;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:border-red-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200/60 mb-5 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {b.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {b.highlight && (
                  <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-extrabold text-red-600">
                    {b.highlight}
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
