import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Check,
  ArrowRight,
  Filter,
  DollarSign,
  UserCheck,
  Flame,
} from 'lucide-react';
import Container from '../common/Container';

export default function SalesFeature() {
  const capabilities = [
    'Automated lead capture from WhatsApp & Ads',
    'AI-powered lead qualification & intent score',
    'Visual 5-stage CRM Kanban deal pipeline',
    'Smart round-robin agent assignment',
    'Comprehensive customer conversation history',
    'Instant CRM sync with Salesforce, HubSpot & Zoho',
  ];

  const stages = [
    { name: 'New Lead', count: 4, lead: 'Aman Patel', val: '₹45,000', tag: 'WhatsApp Ad', dot: 'bg-amber-500' },
    { name: 'Qualified', count: 3, lead: 'Neha Shah', val: '₹85,000', tag: 'AI Qualified', dot: 'bg-blue-500' },
    { name: 'Demo', count: 2, lead: 'Rohan Desai', val: '₹1,20,000', tag: 'Demo Set', dot: 'bg-purple-500' },
    { name: 'Proposal', count: 2, lead: 'Karan Shah', val: '₹2,50,000', tag: 'Quote Sent', dot: 'bg-rose-500' },
    { name: 'Won', count: 5, lead: 'Meera Joshi', val: '₹1,80,000', tag: 'Closed Won', dot: 'bg-emerald-500' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100" id="sales">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column on Desktop (2nd on Mobile): CRM Pipeline Mockup */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800">
              
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">ARCO Sales Pipeline</h4>
                    <span className="text-[10px] text-slate-400">Total Active Pipeline: <strong className="text-slate-700">₹6.80L</strong></span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/80">
                  16 Active Deals
                </span>
              </div>

              {/* 5 Pipeline Stages Horizontal Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 overflow-x-auto pb-1">
                {stages.map((st, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-2 border border-slate-200/70 flex flex-col justify-between min-w-[95px]">
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/50">
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        <span className="text-[10px] font-bold text-slate-800 truncate">{st.name}</span>
                      </div>
                      <span className="text-[9px] font-bold px-1 rounded-full bg-slate-200/80 text-slate-600">
                        {st.count}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs mt-1">
                      <div className="text-[10px] font-bold text-slate-900 truncate">{st.lead}</div>
                      <div className="text-[10px] font-extrabold text-red-600 mt-0.5">{st.val}</div>
                      <span className="inline-block mt-1 text-[8px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded truncate">
                        {st.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick AI Activity Alert */}
              <div className="mt-4 p-2.5 bg-gradient-to-r from-red-50/80 to-rose-50/60 rounded-xl border border-red-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-700">High-intent lead detected: Rohan Desai requested custom quote</span>
                </div>
                <span className="text-[10px] font-bold text-red-600 bg-white px-2 py-0.5 rounded shadow-2xs">
                  Auto-Assigned
                </span>
              </div>

            </div>
          </div>

          {/* Right Column on Desktop (1st on Mobile): Content */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-red-600" />
              <span>SALES CRM & PIPELINE</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Turn conversations into qualified opportunities
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Track prospects through every stage of your sales funnel. Qualify inbound chats with AI, assign high-ticket leads to top reps, and close deals faster.
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
                <span>Explore Sales CRM</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
