import { Link } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Container from '../common/Container';
import InstagramAutomationMockup from './InstagramAutomationMockup';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function InstagramFeature() {
  const benefits = [
    'Automatically reply to Instagram DMs',
    'Turn comments into conversations',
    'Capture and qualify leads automatically',
    'Move Instagram leads into your CRM',
    'Hand conversations to your team when needed',
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100" id="instagram">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column on Desktop (2nd on Mobile): Instagram Automation Mockup */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full">
            <InstagramAutomationMockup />
          </div>

          {/* Right Column on Desktop (1st on Mobile): Content */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <InstagramIcon className="w-3.5 h-3.5 text-red-600" />
              <span>INSTAGRAM AUTOMATION</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Turn Instagram conversations into customers
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Connect Instagram DMs, comments, and customer conversations with ARCO to automatically engage prospects, qualify leads, and move them into your sales pipeline.
            </p>

            {/* Benefits Check List */}
            <ul className="mt-6 sm:mt-8 space-y-3.5 w-full max-w-md">
              {benefits.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm sm:text-base font-medium text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200/80">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Text CTA */}
            <div className="mt-8 pt-2">
              <Link
                to="/contact"
                className="group inline-flex items-center text-sm sm:text-base font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <span>Explore Instagram Automation</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
