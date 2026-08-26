import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ShoppingBag,
  Megaphone,
  TrendingUp,
  Headphones,
  BarChart3,
  Bot,
  MessageCircle,
  Clock,
  Layers,
  ChevronDown,
  Lock,
  UserCheck,
} from 'lucide-react';
import Container from '../components/common/Container';
import SectionTitle from '../components/common/SectionTitle';

// Custom Contextual Instagram Icon
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Signup() {
  const [selectedChannel, setSelectedChannel] = useState('Both');
  const [hasShopify, setHasShopify] = useState('Yes');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [submitted, setSubmitted] = useState(false);

  // Form inputs
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('₹10L - ₹50L');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* 1. TOP HEADER */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center group">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                ARCO <span className="font-semibold text-slate-800">Communication</span>
              </span>
            </Link>

            {/* Right Action */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="text-slate-600 hidden sm:inline">Already a user?</span>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* 2. SIGNUP HERO SECTION (Dark Navy Background with Red Accent) */}
      <section className="bg-slate-950 text-white py-12 sm:py-20 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Marketing & Visual Preview (5.5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 pt-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 mb-4 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>14-Day Full Feature Free Trial</span>
                </div>

                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15]">
                  <span className="text-white">Grow your business</span>{' '}
                  <span className="text-white">on</span>{' '}
                  <span className="text-red-500">WhatsApp</span>{' '}
                  <span className="text-white">&</span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                    Instagram
                  </span>
                </h1>

                <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
                  Get a 14 day free trial | No Credit Card required
                </p>
              </div>

              {/* Original SaaS Visual Workflow Card */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3.5 text-xs text-slate-300">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold text-slate-200 text-xs">Customer Conversion Journey</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Funnel
                  </span>
                </div>

                {/* Step 1: Acquire */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">1. Acquire</span>
                      <strong className="text-slate-200 text-xs">Meta Click-to-WhatsApp Ads</strong>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">12.4K clicks</span>
                </div>

                {/* Step 2: Engage */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">2. Engage</span>
                      <strong className="text-slate-200 text-xs">Interactive WhatsApp Chatbot & Catalog</strong>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold font-mono">98% Open</span>
                </div>

                {/* Step 3: Convert */}
                <div className="bg-gradient-to-r from-red-950/40 to-slate-950 p-3 rounded-xl border border-red-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">3. Convert</span>
                      <strong className="text-white text-xs">1-Click WhatsApp UPI / Card Checkout</strong>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold font-mono">+38% GMV</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-3 text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Meta Official Business Partner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Instant Setup in 5 Mins</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Polished ARCO Signup Card (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-800">
                
                {/* Card Header */}
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Grow your business on WhatsApp & Instagram
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Start your 14-day free trial. No credit card required.
                  </p>
                </div>

                {/* Temporary feedback banner */}
                {submitted && (
                  <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your account setup has started! Check your email for next steps.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Channel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Channel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'WhatsApp', label: 'WhatsApp', icon: WhatsAppIcon, iconClass: 'text-emerald-600' },
                        { id: 'Instagram', label: 'Instagram', icon: InstagramIcon, iconClass: 'text-purple-600' },
                        { id: 'Both', label: 'Both', icon: Sparkles, iconClass: 'text-red-600' },
                      ].map((ch) => {
                        const Icon = ch.icon;
                        const isSelected = selectedChannel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setSelectedChannel(ch.id)}
                            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-red-50 border-red-600 text-red-700 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${ch.iconClass}`} />
                            <span>{ch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Grid (2 Columns on Desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Retail Inc."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all bg-white"
                      />
                    </div>

                    {/* Company Website */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://acmestore.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all bg-white"
                      />
                    </div>

                    {/* Company Location */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Company Location
                      </label>
                      <input
                        type="text"
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        placeholder="Mumbai, India"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all bg-white"
                      />
                    </div>

                    {/* Annual Revenue (INR) (Full width) */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Annual Revenue (INR)
                      </label>
                      <div className="relative">
                        <select
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all appearance-none cursor-pointer pr-10"
                        >
                          <option value="< ₹10L">&lt; ₹10 Lakhs</option>
                          <option value="₹10L - ₹50L">₹10 Lakhs - ₹50 Lakhs</option>
                          <option value="₹50L - ₹2Cr">₹50 Lakhs - ₹2 Crores</option>
                          <option value="₹2Cr - ₹10Cr">₹2 Crores - ₹10 Crores</option>
                          <option value="> ₹10Cr">&gt; ₹10 Crores</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Shopify Question */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Do you have a Shopify store?
                    </label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="shopify"
                            value={opt}
                            checked={hasShopify === opt}
                            onChange={() => setHasShopify(opt)}
                            className="accent-red-600 w-4 h-4 cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Updates Checkbox */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="waUpdates"
                      checked={whatsappUpdates}
                      onChange={(e) => setWhatsappUpdates(e.target.checked)}
                      className="accent-red-600 w-4 h-4 rounded mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="waUpdates" className="text-xs text-slate-600 leading-snug cursor-pointer flex items-center gap-1.5">
                      <span>Get updates regarding your ARCO account on WhatsApp</span>
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </label>
                  </div>

                  {/* Visual CAPTCHA Placeholder */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-300/80 flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={captchaChecked}
                        onChange={(e) => setCaptchaChecked(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 accent-red-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">I'm not a robot</span>
                    </label>
                    <div className="text-right text-[9px] text-slate-400 font-mono leading-tight">
                      <div>reCAPTCHA</div>
                      <span className="text-[8px]">Privacy · Terms</span>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-md shadow-red-600/25 hover:shadow-lg transition-all duration-150 cursor-pointer"
                  >
                    Create Account
                  </button>

                  {/* Legal Terms Disclaimer */}
                  <p className="text-[11px] text-slate-400 text-center leading-normal">
                    By clicking on “Create Account” you agree to our{' '}
                    <span className="text-red-600 hover:underline cursor-pointer">terms and services</span>{' '}
                    and{' '}
                    <span className="text-red-600 hover:underline cursor-pointer">privacy policy</span>.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 3. INTEGRATIONS SECTION */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <Container>
          <SectionTitle
            badge="ECOSYSTEM"
            title="15+ Seamless Integrations"
            description="Enjoy quick integrations with your favorite e-stores, CRMs and more"
            align="center"
          />

          <div className="mt-10 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Shopify', desc: 'Catalog & Orders', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { name: 'WooCommerce', desc: 'WordPress Store', color: 'text-purple-700 bg-purple-50 border-purple-200' },
              { name: 'Instamojo', desc: 'Payment Gateway', color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { name: 'PayU', desc: 'Checkout & UPI', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { name: 'Razorpay', desc: 'Instant Payments', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
              { name: 'Pabbly', desc: 'No-Code Webhooks', color: 'text-rose-700 bg-rose-50 border-rose-200' },
            ].map((integ, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-center hover:bg-white hover:border-red-400 hover:shadow-md transition-all duration-200"
              >
                <div className="font-extrabold text-sm text-slate-900">{integ.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{integ.desc}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. BUSINESS CAPABILITIES SECTION */}
      <section className="py-16 sm:py-24 bg-slate-50/60 border-b border-slate-100">
        <Container>
          <SectionTitle
            badge="CAPABILITIES"
            title="With ARCO, Business Owners can"
            description="All the tools you need to engage, sell, and support customers at scale."
            align="center"
          />

          <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Megaphone,
                title: 'Generate Qualified Leads for Retargeting',
                desc: 'Acquire new customers with strategically placed ads that click to WhatsApp on Facebook & Instagram.',
              },
              {
                icon: ShoppingBag,
                title: 'Share Product Catalogs at Scale',
                desc: 'Send product catalogs at scale to customers on WhatsApp as part of campaigns & auto-replies.',
              },
              {
                icon: Bot,
                title: 'Automate Business Communication',
                desc: 'Set automated replies for FAQs & alerts for COD confirmations, abandoned carts, & offers.',
              },
              {
                icon: Zap,
                title: 'Send Bulk Campaigns & Broadcast',
                desc: 'Set up one-time or recurring campaigns to engage your customers and sell more.',
              },
              {
                icon: Headphones,
                title: 'Collaborate using Team Inbox & Chat Widgets',
                desc: 'Add WhatsApp widgets to your e-store & collaborate with unlimited team members to offer customer support at scale.',
              },
              {
                icon: BarChart3,
                title: 'Monitor Chat & Campaign Analytics',
                desc: 'Monitor campaign performance, response & resolution times of your agents to improve your customer experience.',
              },
            ].map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-250 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 5. RESULTS SECTION (Dark Navy with Red Glow) */}
      <section className="py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-500 block mb-2">
              MEASURABLE ROI
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              With ARCO, You Achieve
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto text-center">
            {[
              { stat: '3x', label: 'Growth in Sales' },
              { stat: '60%', label: 'Increase in Cart Recoveries' },
              { stat: '80%', label: 'Reduction in CRM spends' },
              { stat: '90%', label: 'Boost in Customer Engagements' },
            ].map((res, idx) => (
              <div key={idx} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <div className="text-3xl sm:text-5xl font-black text-red-500 mb-1">
                  {res.stat}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  {res.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. PRICING PREVIEW */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 block mb-2">
              TRANSPARENT PLANS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pricing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Scale conversations as you grow. No hidden platform charges.
            </p>

            {/* Billing selector */}
            <div className="mt-6 inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              {['Monthly', 'Quarterly', 'Annual'].map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === cycle
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-extrabold text-lg text-slate-900">Starter</div>
                <div className="text-xs text-slate-500 mt-0.5">Essential WhatsApp Messaging</div>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900">₹999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Free WhatsApp Business onboarding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Basic auto-reply chat automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Shared team inbox</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Growth Plan (Recommended) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-red-600 shadow-xl shadow-red-600/10 flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-3 py-0.5 rounded-full shadow-xs">
                Recommended
              </span>

              <div>
                <div className="font-extrabold text-lg text-slate-900">Growth</div>
                <div className="text-xs text-slate-500 mt-0.5">High-Velocity Marketing & Sales</div>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900">₹2,499</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <strong>Everything in Starter, plus:</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Advanced campaign filters & analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>WhatsApp Commerce & cart checkout</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>AI Agent auto-qualification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Priority 24-hour SLA support</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="mt-6 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 transition-all cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Advanced Plan */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-extrabold text-lg text-slate-900">Advanced</div>
                <div className="text-xs text-slate-500 mt-0.5">Custom Integrations & High Volume</div>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900">₹3,499</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <strong>Everything in Growth, plus:</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Click-to-WhatsApp Meta Ads attribution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited external app integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Developer REST API & Webhooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none" />

        <Container className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Get Started with ARCO Today
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8">
            Drive Sales & Customer Experience • No Set-up Costs
          </p>

          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <span>Try ARCO For Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ARCO Communication. All rights reserved.
      </footer>
    </div>
  );
}
