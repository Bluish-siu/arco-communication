import { Check } from 'lucide-react';
import Container from '../common/Container';

export default function ProductFeatureSection({
  badge,
  title,
  description,
  benefits = [],
  visual,
  reversed = false,
  bgColor = 'bg-white',
}) {
  return (
    <section className={`py-16 sm:py-24 ${bgColor} border-b border-slate-100`}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Content Column */}
          <div
            className={`lg:col-span-6 flex flex-col items-start ${
              reversed ? 'order-1 lg:order-2' : 'order-1'
            }`}
          >
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
                {badge}
              </span>
            )}

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              {title}
            </h2>

            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
              {description}
            </p>

            {benefits && benefits.length > 0 && (
              <ul className="mt-6 space-y-3 w-full max-w-md">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-800">
                    <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200/80">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Visual Column */}
          <div
            className={`lg:col-span-6 w-full ${
              reversed ? 'order-2 lg:order-1' : 'order-2'
            }`}
          >
            {visual}
          </div>
        </div>
      </Container>
    </section>
  );
}
