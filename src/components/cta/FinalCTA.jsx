import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-slate-950 text-white relative overflow-hidden" id="final-cta">
      {/* Background Subtle Red Ambient Gradients & Glow */}
      <div className="absolute -top-24 right-1/4 w-[500px] h-[350px] bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-[500px] h-[350px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950 to-red-950/25 pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30 backdrop-blur-md mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            <span>READY TO GROW?</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Turn conversations into your next growth channel
          </h2>

          {/* Description */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Start engaging customers, automating conversations, and growing your business with ARCO Communication.
          </p>

          {/* Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              to="/contact"
              icon={ArrowRight}
              className="rounded-full px-8 py-3.5 text-base shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              to="/contact"
              icon={Play}
              className="rounded-full px-7 py-3.5 text-base bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md"
            >
              Book a Demo
            </Button>
          </div>

          {/* Supporting Micro Text */}
          <p className="mt-6 text-xs sm:text-sm text-slate-400 font-medium">
            No credit card required · Setup takes minutes
          </p>

        </div>
      </Container>
    </section>
  );
}
