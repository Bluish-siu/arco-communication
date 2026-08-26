import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Container from '../common/Container';
import TeamInboxMockup from './TeamInboxMockup';

export default function TeamInboxSection() {
  const benefits = [
    'One shared inbox for your entire team',
    'Assign conversations to the right agent',
    'Add tags and notes to customer conversations',
    'Track response status and team performance',
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-slate-50/50 border-b border-slate-100" id="team-inbox-section">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column on Desktop (2nd on Mobile): Team Inbox Mockup */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full">
            <TeamInboxMockup />
          </div>

          {/* Right Column on Desktop (1st on Mobile): Content */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-start">
            {/* Small red badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              CUSTOMER SUPPORT
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Give your team one inbox for every conversation
            </h2>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Bring your customer conversations into one organized workspace so your team can respond faster, collaborate better, and never miss an important message.
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
                <span>Explore Customer Support</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
