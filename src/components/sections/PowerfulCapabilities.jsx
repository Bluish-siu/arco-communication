import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  CheckCheck,
  Bot,
  MessageSquare,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Layers,
  ChevronRight,
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

export default function PowerfulCapabilities() {
  const cards = [
    // 1. MARKETING - RCS & WhatsApp Delivery
    {
      id: 'rcs-delivery',
      category: 'MARKETING',
      categoryColor: 'text-amber-700',
      bgClass: 'bg-[#FEFCE8] border-amber-200/80',
      title: 'Maximize Message Delivery with RCS',
      description: 'Deliver engaging customer messages across WhatsApp and other business channels with powerful campaign automation.',
      link: '/products/whatsapp-marketing',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-amber-200/60 flex items-center justify-center">
          <div className="w-full bg-white/95 rounded-2xl p-3.5 border border-amber-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800">Multi-Channel Failover</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                RCS + WhatsApp
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp Card */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <div className="flex items-center justify-between mb-1.5">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[9px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">Channel 1</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-800 truncate">Summer Sale Promo</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                  <span>Status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <CheckCheck className="w-3 h-3 text-emerald-600" /> Delivered
                  </span>
                </div>
              </div>

              {/* RCS Card */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-blue-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">RCS</span>
                  <span className="text-[9px] font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">Channel 2</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-800 truncate">Verified Rich Card</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                  <span>Failover</span>
                  <span className="text-blue-700 font-bold">Auto-routed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 2. AI / AUTOMATION - Conversational AI Agents
    {
      id: 'ai-agents',
      category: 'AI / AUTOMATION',
      categoryColor: 'text-rose-700',
      bgClass: 'bg-[#FFF1F2] border-rose-200/80',
      title: 'Turn Conversations Into Sales with AI Agents',
      description: 'Use AI-powered conversations to answer questions, qualify leads, recommend products, and move customers toward conversion.',
      link: '/products/ai-agents',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-rose-200/60 space-y-2">
          {/* User message */}
          <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-2xl rounded-tr-xs max-w-[85%] ml-auto shadow-2xs">
            <p>Hi, I want to order a birthday cake for tomorrow.</p>
          </div>

          {/* AI Response */}
          <div className="bg-white text-slate-800 text-xs p-3 rounded-2xl rounded-tl-xs max-w-[90%] border border-rose-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
              <Bot className="w-3.5 h-3.5" />
              <span>ARCO AI Copilot</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              Hi Jenny! We would love to help. Here is our featured <span className="font-bold text-slate-900">Birthday Cakes Catalog 🎂</span> with same-day express delivery.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
                <span>Explore Catalog</span>
                <ChevronRight className="w-3 h-3" />
              </span>
              <span className="text-[10px] text-slate-400 font-mono">AI Response: Instant</span>
            </div>
          </div>
        </div>
      ),
    },

    // 3. SUPPORT - Chatbots in Minutes
    {
      id: 'chatbots',
      category: 'SUPPORT',
      categoryColor: 'text-emerald-700',
      bgClass: 'bg-[#F0FDF4] border-emerald-200/80',
      title: 'Launch WhatsApp Chatbots in Minutes',
      description: 'Build automated WhatsApp experiences with conversational flows, buttons, quick replies, and smart routing.',
      link: '/products/whatsapp-chatbots',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-emerald-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-emerald-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Visual Flow Builder Canvas</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                No-Code
              </span>
            </div>

            {/* Visual Node Flow Preview */}
            <div className="flex items-center gap-1.5 text-[10px] overflow-x-auto py-1">
              <div className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg font-bold shrink-0 shadow-2xs">
                ⚡ Trigger: New Query
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold shrink-0">
                🔘 Interactive Menu
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="px-2.5 py-1.5 bg-blue-50 text-blue-800 border border-blue-300 rounded-lg font-bold shrink-0">
                👤 Route to Agent
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 4. MARKETING - Leads & Sales Optimization
    {
      id: 'ctwa-leads',
      category: 'MARKETING',
      categoryColor: 'text-sky-700',
      bgClass: 'bg-[#F0F9FF] border-sky-200/80',
      title: 'Maximize Leads, Optimize Sales',
      description: 'Run targeted WhatsApp campaigns to engage customers and turn conversations into qualified leads.',
      link: '/products/whatsapp-marketing',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-sky-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-sky-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900">Click-to-WhatsApp Ad Lead</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Direct Lead</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                "Hey! Saw your Instagram Ad. Need more details on the Growth Plan."
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span className="text-sky-700 font-semibold">Lead Source: Meta Ads</span>
                <span>•</span>
                <span>Auto-tagged in CRM</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 5. MARKETING - Instagram Automation
    {
      id: 'instagram-automation',
      category: 'MARKETING',
      categoryColor: 'text-purple-700',
      bgClass: 'bg-[#FAF5FF] border-purple-200/80',
      title: 'Automate Instagram, Win Customers',
      description: 'Automate Instagram conversations, comments, lead capture, and customer engagement from one platform.',
      link: '/products/instagram-automation',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-purple-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-purple-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-900">Auto-DM on Story & Comments</span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                24/7 Active
              </span>
            </div>

            <div className="bg-purple-50/60 p-2 rounded-xl text-[11px] text-slate-700 flex items-center justify-between">
              <span>User commented: <span className="font-bold">"Price Please?"</span></span>
              <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                Auto-replied with Discount Link
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // 6. SALES CRM - Organize Leads & Pipeline
    {
      id: 'sales-crm-card',
      category: 'SALES CRM',
      categoryColor: 'text-orange-700',
      bgClass: 'bg-[#FFF7ED] border-orange-200/80',
      title: 'Organize Leads, Track Success',
      description: 'Centralize leads, contacts, conversations, and sales activity in one WhatsApp-first CRM.',
      link: '/products/sales-crm',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-orange-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-orange-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                  AB
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Alex Bennett</div>
                  <div className="text-[9px] text-slate-500">Enterprise Lead · TechCorp</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                Stage: Negotiation
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block">Owner</span>
                <span className="font-bold text-slate-700">Sales Rep 1</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block">Next Action</span>
                <span className="font-bold text-slate-700">Send Contract</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 7. SUPPORT - Streamline Queries
    {
      id: 'streamline-queries',
      category: 'SUPPORT',
      categoryColor: 'text-teal-700',
      bgClass: 'bg-[#F0FDFA] border-teal-200/80',
      title: 'Streamline Queries, Boost Efficiency',
      description: 'Manage customer conversations from a unified inbox and help your team respond faster.',
      link: '/products/customer-support',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-teal-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-teal-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                <span>Unified Team Inbox</span>
              </div>
              <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Zero Missed Chats
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px]">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-700">Pooja Verma</span>
              </div>
              <span className="text-slate-400 font-mono">Assigned to Support Lead</span>
            </div>
          </div>
        </div>
      ),
    },

    // 8. COMMERCE - WhatsApp Store & Payments
    {
      id: 'commerce-store',
      category: 'COMMERCE',
      categoryColor: 'text-blue-700',
      bgClass: 'bg-[#EFF6FF] border-blue-200/80',
      title: 'Launch WhatsApp Store & Payments',
      description: 'Showcase products, help customers discover items, and guide them through purchases directly in chat.',
      link: '/products/whatsapp-commerce',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-blue-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-blue-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">Interactive Catalog Order</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">In-Chat</span>
              </div>
              <p className="text-[10px] text-slate-500">Customer added 2 items to cart · Native Checkout</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                <span>WhatsApp Pay & UPI Ready</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // 9. MARKETING - Broadcast WhatsApp Messages
    {
      id: 'broadcast-scale',
      category: 'MARKETING',
      categoryColor: 'text-emerald-700',
      bgClass: 'bg-[#F2FAF6] border-emerald-200/80',
      title: 'Broadcast WhatsApp Messages at Scale',
      description: 'Create targeted campaigns for opted-in customers and manage personalized WhatsApp communication.',
      link: '/products/whatsapp-marketing',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-emerald-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-emerald-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-900">Targeted Segment Broadcast</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Opt-in Compliant
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 text-[10px] text-slate-700 font-medium">
              <span>Recipient Queue: <span className="font-bold">VIP & Repeat Customers</span></span>
              <span className="text-emerald-700 font-bold">High Delivery Rate</span>
            </div>
          </div>
        </div>
      ),
    },

    // 10. ANALYTICS - Campaign & Team Analytics
    {
      id: 'campaign-analytics',
      category: 'ANALYTICS',
      categoryColor: 'text-slate-700',
      bgClass: 'bg-[#F8FAFC] border-slate-200/80',
      title: 'Campaign & Team Analytics',
      description: 'Track campaign performance, customer engagement, conversions, and team activity from one place.',
      link: '/products/analytics',
      renderVisual: () => (
        <div className="mt-5 pt-3 border-t border-slate-200/60">
          <div className="bg-white/95 rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
                <span>Live Analytics Dashboard</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Real-Time Insights
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-slate-50 p-1 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[9px]">Delivery Rate</span>
                <span className="font-bold text-emerald-600">98%</span>
              </div>
              <div className="bg-slate-50 p-1 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[9px]">Avg Response</span>
                <span className="font-bold text-slate-800">&lt; 45s</span>
              </div>
              <div className="bg-slate-50 p-1 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[9px]">Team Velocity</span>
                <span className="font-bold text-blue-600">High</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="capabilities">
      <Container>
        {/* SECTION TITLE */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Powerful Capabilities That Maximize<br className="hidden sm:inline" /> Your Reach
          </h2>
        </div>

        {/* 2-COLUMN FEATURE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`group rounded-3xl border p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 flex flex-col justify-between ${card.bgClass}`}
            >
              <div>
                {/* Category Label */}
                <span className={`text-[11px] font-extrabold tracking-wider uppercase block mb-2.5 ${card.categoryColor}`}>
                  {card.category}
                </span>

                {/* Feature Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-red-600 transition-colors duration-200">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {card.description}
                </p>

                {/* CTA Link */}
                <div className="mt-3.5">
                  <Link
                    to={card.link}
                    className="inline-flex items-center text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 transition-colors group/cta cursor-pointer"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-200 group-hover/cta:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Rich Visual Component */}
              {card.renderVisual()}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
