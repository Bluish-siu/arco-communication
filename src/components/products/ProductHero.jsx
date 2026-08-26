import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Star } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function ProductHero({
  breadcrumb = 'Products',
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  headline,
  description,
  primaryCtaText = 'Get Started Free',
  primaryCtaLink = '/contact',
  secondaryCtaText = 'Book a Demo',
  secondaryCtaLink = '/contact',
  trustText = 'No credit card required · 14-day free trial · Instant Meta API setup',
  ratingText = 'Rated 4.9/5 by 1,200+ customer engagement teams',
  mockup,
}) {
  return (
    <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100 overflow-hidden">
      {/* Subtle ambient red background blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/features" className="hover:text-slate-900 transition-colors">{breadcrumb}</Link>
          <span>/</span>
          <span className="text-red-600 font-semibold">{badge}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Product Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-5 shadow-2xs">
              <BadgeIcon className="w-3.5 h-3.5 text-red-600" />
              <span>{badge}</span>
            </span>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {headline}
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {description}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                to={primaryCtaLink}
                icon={ArrowRight}
                className="rounded-xl shadow-md shadow-red-600/25 justify-center"
              >
                {primaryCtaText}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                to={secondaryCtaLink}
                className="rounded-xl justify-center"
              >
                {secondaryCtaText}
              </Button>
            </div>

            {/* Trust & Social Proof */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
                <span className="font-semibold text-slate-700 ml-1.5">{ratingText}</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span>{trustText}</span>
            </div>
          </div>

          {/* Right Column: Interactive Product UI Mockup */}
          <div className="lg:col-span-6 w-full">
            {mockup}
          </div>
        </div>
      </Container>
    </section>
  );
}
