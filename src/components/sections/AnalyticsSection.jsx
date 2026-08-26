import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Container from '../common/Container';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function AnalyticsSection() {
  const benefits = [
    'Track campaign performance',
    'Measure customer engagement',
    'Understand conversion rates',
    'Monitor revenue generated through conversations',
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-slate-50/50 border-b border-slate-100" id="analytics-section">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column (1st on Desktop & Mobile): Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Small red badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              ANALYTICS
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              See what is driving your business growth
            </h2>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Track conversations, campaigns, leads, conversions, and revenue from one powerful analytics dashboard.
            </p>

            {/* 4 Benefit Points */}
            <ul className="mt-6 sm:mt-8 space-y-3.5 w-full max-w-md">
              {benefits.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base font-medium text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200/80 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Text CTA */}
            <div className="mt-8 pt-2">
              <Link
                to="/features"
                className="group inline-flex items-center text-sm sm:text-base font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <span>Explore Analytics</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column (2nd on Desktop & Mobile): Analytics Dashboard Mockup */}
          <div className="lg:col-span-6 w-full">
            <AnalyticsDashboard />
          </div>

        </div>
      </Container>
    </section>
  );
}
