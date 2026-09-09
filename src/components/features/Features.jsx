import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Megaphone,
  TrendingUp,
  Headphones,
  Bot,
  Sparkles,
  CheckCheck,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';
import Container from '../common/Container';

const InstagramIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.781-.878-2.057-.978-.276-.1-.476-.15-.676.15-.2.3-.777.978-.952 1.178-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.783-1.673-2.083-.175-.3-.019-.462.132-.612.136-.134.301-.35.451-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.632-.927-2.234-.244-.587-.493-.507-.677-.517-.175-.008-.375-.01-.576-.01-.2 0-.526.075-.802.375-.276.3-1.053 1.029-1.053 2.509 0 1.48 1.078 2.91 1.228 3.11.15.2 2.122 3.24 5.14 4.544.718.31 1.279.495 1.716.634.722.23 1.379.197 1.898.12.579-.087 1.781-.728 2.032-1.431.25-.703.25-1.306.175-1.431-.075-.125-.275-.2-.576-.35z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.408A9.948 9.948 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.63 0-3.153-.49-4.43-1.332l-.317-.208-2.955.836.83-2.88-.228-.337A8.132 8.132 0 0 1 3.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
  </svg>
);

export default function Features() {
  const cards = [
    {
      id: 'marketing-hub',
      badge: 'Marketing Hub',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      title: 'Scale Marketing',
      description: 'Automate customer engagement on WhatsApp & Instagram to drive leads and conversions.',
      link: '/products/whatsapp-marketing',
      renderVisual: () => (
        <div className="relative w-full h-52 sm:h-56 bg-gradient-to-br from-rose-50/80 via-slate-50 to-orange-50/40 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-2 right-12 w-28 h-28 bg-rose-200/30 rounded-full blur-xl pointer-events-none" />

          {/* Top Bar with Channel Chips */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-700 border border-slate-200/90 shadow-2xs">
                <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                <span>WhatsApp Broadcast</span>
              </span>
              <span className="inline-flex items-center p-1 rounded-full bg-white text-pink-600 border border-slate-200/90 shadow-2xs" title="Instagram Integrated">
                <InstagramIcon className="w-3 h-3" />
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              98.5% Delivered
            </span>
          </div>

          {/* WhatsApp Broadcast Message Bubble */}
          <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs max-w-[92%] self-start relative">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold text-slate-400">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>ARCO Verified Broadcast</span>
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              🔥 <span className="font-bold">Festive Offer!</span> Enjoy 25% off on your next order. Tap below to claim your discount.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                Claim Offer 🎁
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <span>Just now</span>
                <CheckCheck className="w-3 h-3 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Metric Bottom Strip */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-white/90 backdrop-blur-xs py-1.5 px-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium">Audience</div>
              <div className="text-xs font-bold text-slate-900">12.5k</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs py-1.5 px-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium">Read Rate</div>
              <div className="text-xs font-bold text-emerald-600">82.4%</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs py-1.5 px-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium">ROI Growth</div>
              <div className="text-xs font-bold text-rose-600">+14.2%</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'support-hub',
      badge: 'Support Hub',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
      title: 'Delight Customers',
      description: 'Stay on top of every customer query with a unified team inbox built for WhatsApp and Instagram.',
      link: '/products/customer-support',
      renderVisual: () => (
        <div className="relative w-full h-52 sm:h-56 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/40 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-2 right-8 w-28 h-28 bg-blue-200/30 rounded-full blur-xl pointer-events-none" />

          {/* Top Team Inbox Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                PS
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Priya Shah</div>
                <div className="text-[9px] text-slate-500">Support Lead · Online</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              <Clock className="w-2.5 h-2.5" />
              &lt; 1m Avg Response
            </span>
          </div>

          {/* Chat Mini Thread */}
          <div className="space-y-2">
            {/* Customer Message */}
            <div className="bg-white rounded-xl rounded-tl-xs p-2.5 border border-slate-200/90 shadow-2xs max-w-[85%] self-start">
              <p className="text-[11px] text-slate-800 font-medium">
                Can you please update my delivery address to Mumbai?
              </p>
            </div>

            {/* Agent Reply */}
            <div className="bg-emerald-600 text-white rounded-xl rounded-tr-xs p-2.5 shadow-xs max-w-[88%] ml-auto">
              <p className="text-[11px] font-medium leading-relaxed">
                Done! Your package has been rerouted. Tracking updates will arrive here. 📦
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-100">
                <span>11:42 AM</span>
                <CheckCheck className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Inbox Assignment & Tag Strip */}
          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className="inline-flex items-center gap-1 text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80 font-medium">
              <User className="w-2.5 h-2.5 text-slate-400" />
              Auto-Assigned: Sales & Support
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 font-semibold">
              <ShieldCheck className="w-2.5 h-2.5" />
              Resolved
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'sales-crm',
      badge: 'Sales CRM',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      title: 'Win Deals',
      description: 'Capture leads, engage prospects, and close deals faster with WhatsApp-first Sales CRM.',
      link: '/products/sales-crm',
      renderVisual: () => (
        <div className="relative w-full h-52 sm:h-56 bg-gradient-to-br from-emerald-50/80 via-slate-50 to-teal-50/40 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-2 right-8 w-28 h-28 bg-emerald-200/30 rounded-full blur-xl pointer-events-none" />

          {/* Top Deal Pipeline Stage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Active Opportunity
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
              ₹85,000 Deal
            </span>
          </div>

          {/* Contact & Stage Card */}
          <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">Rahul Sharma</div>
                  <div className="text-[10px] text-slate-500">TechCorp Solutions · High Intent</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Hot Lead 🔥
              </span>
            </div>

            {/* Pipeline Stage Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                <span>Stage: Proposal Sent</span>
                <span className="text-emerald-600">80% Probability</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full w-4/5 rounded-full" />
              </div>
            </div>
          </div>

          {/* Bottom Action Indicator */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 flex items-center gap-1">
              <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
              WhatsApp Follow-up Scheduled
            </span>
            <span className="font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80">
              Today, 4:00 PM
            </span>
          </div>
        </div>
      ),
    },
  ];

  const suiteCategories = [
    {
      name: 'WhatsApp Marketing',
      icon: Megaphone,
      link: '/products/whatsapp-marketing',
      color: 'text-rose-600 group-hover:text-rose-700',
      bg: 'bg-rose-50 group-hover:bg-rose-100',
    },
    {
      name: 'Instagram Automation',
      icon: InstagramIcon,
      link: '/products/instagram-automation',
      color: 'text-pink-600 group-hover:text-pink-700',
      bg: 'bg-pink-50 group-hover:bg-pink-100',
    },
    {
      name: 'Sales CRM',
      icon: TrendingUp,
      link: '/products/sales-crm',
      color: 'text-emerald-600 group-hover:text-emerald-700',
      bg: 'bg-emerald-50 group-hover:bg-emerald-100',
    },
    {
      name: 'Customer Support',
      icon: Headphones,
      link: '/products/customer-support',
      color: 'text-blue-600 group-hover:text-blue-700',
      bg: 'bg-blue-50 group-hover:bg-blue-100',
    },
    {
      name: 'AI Agents',
      icon: Bot,
      link: '/products/ai-agents',
      color: 'text-purple-600 group-hover:text-purple-700',
      bg: 'bg-purple-50 group-hover:bg-purple-100',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="features">
      <Container>
        {/* 1. SECTION INTRO */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/80 mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>POWERFUL PLATFORM</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Everything You Need to Win on WhatsApp
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ARCO Communication is a full-stack growth engine for marketing, sales, and support.
          </p>
        </div>

        {/* 2. THREE LARGE FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card Visual Top Area */}
              <div className="relative border-b border-slate-100">
                {card.renderVisual()}

                {/* Floating Badge on Top-Right */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-2xs backdrop-blur-md ${card.badgeClass}`}
                  >
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Card Content Bottom Area */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-red-600 transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* CTA Link */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={card.link}
                    className="inline-flex items-center text-sm font-bold text-red-600 hover:text-red-700 transition-colors group/cta cursor-pointer"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover/cta:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. SECTION BELOW THE THREE CARDS: POWER-PACKED WHATSAPP SUITE */}
        <div className="mt-14 sm:mt-18 pt-10 border-t border-slate-100">
          <div className="text-center mb-6">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-400">
              Power-packed WhatsApp suite
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {suiteCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={cat.link}
                  className="group flex flex-col sm:flex-row items-center justify-center gap-2.5 p-3 sm:py-3.5 sm:px-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-red-200 hover:shadow-md hover:shadow-slate-900/5 transition-all duration-200 text-center sm:text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center shrink-0 transition-colors duration-200`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
