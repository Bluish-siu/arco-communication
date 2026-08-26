import { Link } from 'react-router-dom';
import {
  Workflow,
  Check,
  ArrowRight,
  Clock,
  Zap,
  GitFork,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import Container from '../common/Container';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function AutomationFeature() {
  const capabilities = [
    'Event-based multi-step journey triggers & webhooks',
    'Custom time delays & smart business-hours sending',
    'Conditional branching based on user replies & tag state',
    'Instagram Story mention & DM auto-response triggers',
    'Automated cart recovery & payment reminder sequences',
    'Live pipeline routing directly to assigned sales reps',
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="automation">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <Workflow className="w-3.5 h-3.5 text-red-600" />
              <span>WORKFLOW & INSTAGRAM AUTOMATION</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Automate the conversations that drive growth
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Design powerful automated customer journeys with visual triggers, custom time delays, intelligent condition checks, and automated lead routing.
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
                <span>Explore Automation Flows</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Workflow Builder Mockup */}
          <div className="lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800 text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Lead Nurture Workflow #WF-104</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Running (1,420 Enrolled)
                </span>
              </div>

              {/* Workflow Step Sequence Canvas */}
              <div className="space-y-2.5 bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200/80">
                
                {/* Step 1: Trigger */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Trigger: New Inbound Lead / Ad Click</div>
                      <div className="text-[10px] text-slate-400">Source: WhatsApp / Instagram DM</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">Trigger</span>
                </div>

                <div className="text-center text-slate-300 font-bold text-xs">↓</div>

                {/* Step 2: Action */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                      WA
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Send Personalized Welcome Message</div>
                      <div className="text-[10px] text-slate-400">Template: Welcome_With_Catalog_V2</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600">Sent Instantly</span>
                </div>

                <div className="text-center text-slate-300 font-bold text-xs">↓</div>

                {/* Step 3: Delay */}
                <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs">Wait 2 Hours for Reply</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-700">Condition Timer</span>
                </div>

                <div className="text-center text-slate-300 font-bold text-xs">↓</div>

                {/* Step 4: Branching */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 text-[10px]">
                    <span className="font-bold text-emerald-800 block">If Replied:</span>
                    <span className="text-slate-600">Assign to Sales Rep Ananya + Alert</span>
                  </div>
                  <div className="bg-rose-50/80 p-2 rounded-lg border border-rose-200 text-[10px]">
                    <span className="font-bold text-rose-800 block">If No Reply:</span>
                    <span className="text-slate-600">Send 20% Discount Follow-up</span>
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
