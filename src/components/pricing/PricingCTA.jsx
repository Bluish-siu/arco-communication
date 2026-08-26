import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function PricingCTA() {
  return (
    <div className="mt-20 sm:mt-28">
      <div className="relative rounded-3xl bg-slate-950 text-white overflow-hidden py-16 sm:py-20 px-6 sm:px-12 text-center shadow-2xl border border-slate-800/80">
        {/* Subtle Background Red Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-red-950/20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30 mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>INSTANT SETUP</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to grow with ARCO?
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
            Start turning conversations into customers today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              to="/contact"
              icon={ArrowRight}
              className="w-full sm:w-auto rounded-full px-8 py-3.5 text-sm sm:text-base shadow-xl shadow-red-600/30 hover:shadow-red-600/50"
            >
              Start Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              to="/contact"
              icon={Play}
              className="w-full sm:w-auto rounded-full px-7 py-3.5 text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md"
            >
              Book a Demo
            </Button>
          </div>

          <p className="mt-5 text-xs text-slate-400 font-medium">
            14-day free trial · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
