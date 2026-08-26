import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function ProductCTA({
  badge = 'READY TO GROW?',
  title = 'Start turning conversations into revenue today',
  description = 'Join thousands of fast-growing businesses using ARCO to automate customer engagement and scale faster.',
  primaryCtaText = 'Get Started Free',
  primaryCtaLink = '/contact',
  secondaryCtaText = 'Book a Demo',
  secondaryCtaLink = '/contact',
  benefits = ['14-day free trial', 'No credit card required', 'Setup in under 5 minutes'],
}) {
  return (
    <section className="relative py-20 sm:py-28 bg-slate-950 text-white overflow-hidden">
      {/* Red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/20 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
            {title}
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            {description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              to={primaryCtaLink}
              icon={ArrowRight}
              className="rounded-xl shadow-lg shadow-red-600/30 w-full sm:w-auto justify-center"
            >
              {primaryCtaText}
            </Button>
            <Button
              variant="outline"
              size="lg"
              to={secondaryCtaLink}
              className="rounded-xl border-slate-700 text-white hover:bg-slate-900 w-full sm:w-auto justify-center"
            >
              {secondaryCtaText}
            </Button>
          </div>

          {benefits && benefits.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
