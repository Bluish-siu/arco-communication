import { ArrowRight, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

export default function ProductWorkflow({
  badge = 'HOW IT WORKS',
  title = 'A simple, connected workflow from start to finish',
  description = 'See how ARCO automates every step of the process with zero friction.',
  steps = [],
}) {
  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 border-b border-slate-100">
      <Container>
        <SectionTitle
          badge={badge}
          title={title}
          description={description}
          align="center"
        />

        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => {
              const StepIcon = step.icon || Sparkles;
              const isLast = idx === steps.length - 1;

              return (
                <div key={idx} className="relative flex flex-col items-center text-center group">
                  {/* Step Card */}
                  <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:border-red-300 hover:shadow-md transition-all duration-200 flex flex-col items-center h-full">
                    {/* Step Number & Icon */}
                    <div className="relative mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-extrabold text-lg border border-red-200/60 shadow-2xs group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Desktop Connecting Arrow between steps */}
                  {!isLast && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 items-center justify-center shadow-2xs">
                      <ArrowRight className="w-3 h-3 text-red-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
