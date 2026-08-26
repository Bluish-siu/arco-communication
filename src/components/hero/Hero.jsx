import { ArrowRight, Play } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';
import HeroBackgroundVideo from './HeroBackgroundVideo';

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[640px] sm:min-h-[700px] lg:min-h-[760px] flex items-center bg-slate-950">
      {/* Full-Width Background Video & Dark Overlay */}
      <HeroBackgroundVideo />

      {/* Hero Content Over Video */}
      <Container className="relative z-10 w-full py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl text-left flex flex-col items-start">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/35 backdrop-blur-md mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            <span>WhatsApp-first customer engagement</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            Turn WhatsApp Conversations Into{' '}
            <span className="text-red-500 inline-block">
              Business Growth
            </span>
          </h1>

          {/* Description Subtext */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-200/90 leading-relaxed max-w-xl">
            Engage customers, generate leads, automate conversations, and grow your business with one powerful WhatsApp-first platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              to="/contact"
              icon={ArrowRight}
              className="rounded-full px-8 py-3.5 text-base shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              to="/contact"
              icon={Play}
              className="rounded-full px-7 py-3.5 text-base bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md shadow-sm"
            >
              Book a Demo
            </Button>
          </div>

          {/* Micro Trust Text */}
          <p className="mt-4 text-xs sm:text-sm text-slate-300/80 font-medium">
            No credit card required · Get started in minutes
          </p>

        </div>
      </Container>
    </section>
  );
}


