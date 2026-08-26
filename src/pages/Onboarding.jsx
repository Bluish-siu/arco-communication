import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Megaphone,
  ChevronDown,
} from 'lucide-react';
import Container from '../components/common/Container';
import { useOnboarding } from '../context/OnboardingContext';

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

export default function Onboarding() {
  const navigate = useNavigate();
  const { businessSetup, updateBusinessSetup, isCompleted } = useOnboarding();

  const [selectedChannel, setSelectedChannel] = useState(businessSetup.channel || 'Both');
  const [hasShopify, setHasShopify] = useState(businessSetup.hasShopify || 'Yes');
  const [whatsappUpdates, setWhatsappUpdates] = useState(businessSetup.whatsappUpdates ?? true);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [error, setError] = useState('');

  // Form inputs
  const [phone, setPhone] = useState(businessSetup.phone || '');
  const [companyName, setCompanyName] = useState(businessSetup.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState(businessSetup.companyWebsite || '');
  const [companyLocation, setCompanyLocation] = useState(businessSetup.companyLocation || '');
  const [annualRevenue, setAnnualRevenue] = useState(businessSetup.annualRevenue || '₹10L - ₹50L');

  useEffect(() => {
    if (isCompleted) {
      navigate('/dashboard');
    }
  }, [isCompleted, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim() || !companyName.trim() || !companyLocation.trim()) {
      setError('Please fill in all required business details.');
      return;
    }
    setError('');

    // Save business setup information
    updateBusinessSetup({
      channel: selectedChannel,
      phone,
      companyName,
      companyWebsite,
      companyLocation,
      annualRevenue,
      hasShopify,
      whatsappUpdates,
    });

    // Navigate to Step 1: Industry
    navigate('/onboarding/industry');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center group">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                ARCO <span className="font-semibold text-slate-800">Communication</span>
              </span>
            </Link>

            {/* Right Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Business Profile Setup</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero & Setup Section (Dark Navy Background with Red Accent) */}
      <main className="flex-1 bg-slate-950 text-white py-10 sm:py-16 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Marketing & Conversion Funnel Visual (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 pt-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 mb-4 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Welcome to ARCO Communication</span>
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

              {/* Conversion Journey Visual Card */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3.5 text-xs text-slate-300">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold text-slate-200 text-xs">Connected Conversion Journey</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active Setup
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
                  <span className="text-[11px] text-slate-400 font-mono">Instant Lead</span>
                </div>

                {/* Step 2: Engage */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">2. Engage</span>
                      <strong className="text-slate-200 text-xs">AI Chatbots & Native Catalog</strong>
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
                      <strong className="text-white text-xs">1-Click UPI / Card Checkout</strong>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold font-mono">+38% GMV</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Meta Official Tech Provider</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>256-Bit Data Encryption</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Business Setup Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-800">
                
                {/* Form Heading */}
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Grow your business on WhatsApp & Instagram
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Complete your business profile to configure your channels and dashboard.
                  </p>
                </div>

                {/* Validation Error Banner */}
                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold animate-in fade-in">
                    {error}
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
                        Phone Number *
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
                        Company Name *
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all bg-white"
                      />
                    </div>

                    {/* Company Location */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Company Location *
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
                            name="onboardingShopify"
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
                      id="onboardingWaUpdates"
                      checked={whatsappUpdates}
                      onChange={(e) => setWhatsappUpdates(e.target.checked)}
                      className="accent-red-600 w-4 h-4 rounded mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="onboardingWaUpdates" className="text-xs text-slate-600 leading-snug cursor-pointer flex items-center gap-1.5">
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
                    className="w-full py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-md shadow-red-600/25 hover:shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Complete Business Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Legal Terms Disclaimer */}
                  <p className="text-[11px] text-slate-400 text-center leading-normal">
                    By clicking on “Complete Business Setup” you agree to our{' '}
                    <span className="text-red-600 hover:underline cursor-pointer">terms and services</span>{' '}
                    and{' '}
                    <span className="text-red-600 hover:underline cursor-pointer">privacy policy</span>.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ARCO Communication. All rights reserved.
      </footer>
    </div>
  );
}
