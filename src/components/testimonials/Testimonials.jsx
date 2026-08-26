import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import TestimonialCard from './TestimonialCard';
import { testimonialsData, fictionalSocialProofCompanies } from '../../data/testimonials';

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white border-b border-slate-100" id="testimonials">
      <Container>
        {/* Section Header */}
        <SectionTitle
          badge="CUSTOMER STORIES"
          title="Businesses are growing faster with ARCO"
          description="See how teams use ARCO Communication to turn everyday conversations into meaningful business results."
          align="center"
        />

        {/* 3 Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {testimonialsData.map((item) => (
            <TestimonialCard
              key={item.id}
              name={item.name}
              role={item.role}
              company={item.company}
              quote={item.quote}
              result={item.result}
              initials={item.initials}
              avatarBg={item.avatarBg}
            />
          ))}
        </div>

        {/* Supporting Social Proof Strip */}
        <div className="mt-14 sm:mt-18 pt-10 border-t border-slate-100 text-center max-w-4xl mx-auto">
          <p className="text-xs sm:text-sm font-medium text-slate-500 mb-6">
            Trusted by teams that believe conversations drive growth.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-400">
            {fictionalSocialProofCompanies.map((company, idx) => (
              <span
                key={idx}
                className={`text-sm sm:text-base tracking-tight select-none opacity-60 hover:opacity-100 hover:text-slate-800 transition-opacity duration-150 ${company.font}`}
              >
                {company.name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
