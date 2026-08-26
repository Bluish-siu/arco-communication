import { useState } from 'react';
import Container from '../components/common/Container';
import BillingToggle from '../components/pricing/BillingToggle';
import PricingCard from '../components/pricing/PricingCard';
import PricingComparison from '../components/pricing/PricingComparison';
import PricingFAQ from '../components/pricing/PricingFAQ';
import PricingCTA from '../components/pricing/PricingCTA';
import { pricingPlans } from '../data/pricing';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true); // Default to Yearly billing

  return (
    <div className="py-14 sm:py-20 lg:py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Page Hero Header */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
            SIMPLE, TRANSPARENT PRICING
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Plans that grow with your business
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
            Start small, automate more, and scale your customer conversations as your business grows.
          </p>

          {/* Billing Toggle (Monthly / Yearly) */}
          <BillingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </div>

        {/* 4 Pricing Cards Grid (Desktop 4-col, Tablet 2x2, Mobile 1-col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-5 mt-8 items-stretch">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <PricingComparison />

        {/* FAQ Accordion Section */}
        <PricingFAQ />

        {/* Custom Pricing Final CTA */}
        <PricingCTA />
      </Container>
    </div>
  );
}
