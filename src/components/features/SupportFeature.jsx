import { Link } from 'react-router-dom';
import {
  Headphones,
  Check,
  ArrowRight,
  Inbox,
  UserCheck,
  Tag,
  Clock,
  MessageSquare,
} from 'lucide-react';
import Container from '../common/Container';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function SupportFeature() {
  const capabilities = [
    'One unified inbox for WhatsApp & Instagram DMs',
    'Intelligent multi-agent routing & auto-assignment',
    'Internal team notes & private @mentions',
    'Custom tags, contact attributes & purchase history',
    'Collision detection so agents never double-reply',
    'First-response time and resolution analytics',
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="support">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <Headphones className="w-3.5 h-3.5 text-red-600" />
              <span>CUSTOMER SUPPORT & TEAM INBOX</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Give your team one inbox for every conversation
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Unify WhatsApp and Instagram customer inquiries in a collaborative multi-agent workspace. Respond in seconds, share context, and delight customers.
            </p>

            {/* Capabilities Check Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 sm:mt-8 w-full max-w-xl">
              {capabilities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800">
                  <div className="w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200/80">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 pt-2">
              <Link
                to="/contact"
                className="group inline-flex items-center text-sm sm:text-base font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <span>Explore Customer Support</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Unified Team Inbox Mockup */}
          <div className="lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800 text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Unified Team Workspace</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    8 Online Agents
                  </span>
                </div>
              </div>

              {/* Omnichannel List + Chat View */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Left List: Inquiries */}
                <div className="sm:col-span-5 space-y-2">
                  <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 text-left cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Priya Shah
                      </div>
                      <span className="text-[9px] text-slate-400">11:40 AM</span>
                    </div>
                    <div className="text-[10px] text-slate-600 truncate mt-0.5">"Can you check tracking for order #AR48291?"</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="bg-red-100 text-red-700 px-1.5 py-0.2 rounded text-[8px] font-bold">WhatsApp</span>
                      <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[8px]">VIP</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                        <InstagramIcon className="w-3 h-3 text-rose-600" />
                        Tanvi Verma
                      </div>
                      <span className="text-[9px] text-slate-400">11:32 AM</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">"Loved your new post! Is this available in Mumbai?"</div>
                    <span className="inline-block mt-1.5 bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded text-[8px] font-bold">Instagram DM</span>
                  </div>
                </div>

                {/* Right Chat & Assignment */}
                <div className="sm:col-span-7 bg-slate-50/60 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 text-[10px]">
                      <span className="font-bold text-slate-700">Assigned: Ananya S.</span>
                      <span className="text-emerald-600 font-semibold">Response: 42s</span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] shadow-2xs">
                      <span className="font-semibold text-slate-900 block text-[10px] mb-0.5">Priya:</span>
                      Can you check tracking for order #AR48291?
                    </div>

                    <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-[11px] text-slate-800 ml-2">
                      <span className="font-semibold text-red-700 block text-[10px] mb-0.5">Ananya (Support Lead):</span>
                      Hi Priya! Your order is out for delivery with Bluedart. Expected by 4 PM today! 🚚
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Internal note attached</span>
                    <span className="font-bold text-slate-700">CSAT: 5.0 ⭐</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
