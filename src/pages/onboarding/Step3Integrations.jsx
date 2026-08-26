import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Code2,
  ShoppingBag,
  CreditCard,
  Target,
  Send,
  Users,
  Headphones,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Star,
  Search,
} from 'lucide-react';
import Container from '../../components/common/Container';
import { useOnboarding } from '../../context/OnboardingContext';

const integrationCategories = [
  {
    category: 'CUSTOM INTEGRATION',
    items: [
      { id: 'arco-api', name: 'ARCO APIs & Webhooks', desc: 'REST API, Webhooks & SDKs', icon: Code2 },
    ],
  },
  {
    category: 'POPULAR TOOLS',
    items: [
      { id: 'shopify-popular', name: 'Shopify', desc: 'E-commerce & Store Sync', icon: ShoppingBag },
      { id: 'google-sheets', name: 'Google Sheets', desc: 'Real-time Lead Export', icon: FileSpreadsheet },
      { id: 'facebook-lead-ads', name: 'Facebook Lead Form', desc: 'Instant Meta Ad Sync', icon: Target },
    ],
  },
  {
    category: 'PAYMENT PROVIDER',
    items: [
      { id: 'whatsapp-pay', name: 'WhatsApp Pay', desc: 'Native In-Chat UPI', icon: CreditCard },
      { id: 'razorpay', name: 'Razorpay', desc: 'Payment Links & Webhooks', icon: CreditCard },
      { id: 'payu', name: 'PayU', desc: 'Checkout Gateway', icon: CreditCard },
    ],
  },
  {
    category: 'E-COMMERCE PLATFORM',
    items: [
      { id: 'shopify-sales', name: 'Shopify Sales Channel', desc: 'Native Storefront', icon: ShoppingBag },
      { id: 'shopify-marketing', name: 'Shopify Marketing', desc: 'Abandoned Cart Drips', icon: ShoppingBag },
      { id: 'woocommerce', name: 'WooCommerce', desc: 'WordPress Storefront', icon: ShoppingBag },
      { id: 'yampi', name: 'Yampi', desc: 'Transparent Checkout', icon: ShoppingBag },
      { id: 'amazon-smartbiz', name: 'Amazon Smartbiz', desc: 'Catalog & Orders', icon: ShoppingBag },
    ],
  },
  {
    category: 'MARKETING AUTOMATION',
    items: [
      { id: 'webengage', name: 'Webengage', desc: 'Customer Journey Sync', icon: Send },
      { id: 'moengage', name: 'Moengage', desc: 'Customer Engagement', icon: Send },
      { id: 'clevertap', name: 'Clevertap', desc: 'Behavioral Analytics', icon: Send },
    ],
  },
  {
    category: 'CRM PLATFORM',
    items: [
      { id: 'zoho-crm', name: 'Zoho CRM', desc: 'Contact & Deal Pipeline', icon: Users },
      { id: 'hubspot', name: 'HubSpot', desc: 'Inbound CRM & Deals', icon: Users },
      { id: 'salesforce', name: 'Salesforce', desc: 'Enterprise Cloud CRM', icon: Users },
      { id: 'zoho-bigin', name: 'Zoho Bigin CRM', desc: 'Small Business Pipeline', icon: Users },
      { id: 'freshworks-crm', name: 'Freshworks CRM', desc: 'Sales & Marketing Cloud', icon: Users },
    ],
  },
  {
    category: 'HELPDESK & SUPPORT',
    items: [
      { id: 'freshdesk-v2', name: 'Freshdesk v2', desc: 'Ticketing & Omnichannel', icon: Headphones },
    ],
  },
  {
    category: 'BILLING & ACCOUNTING',
    items: [
      { id: 'zoho-billing', name: 'Zoho Billing', desc: 'Subscription Invoicing', icon: DollarSign },
      { id: 'zoho-books', name: 'Zoho Books', desc: 'GST Invoicing & Ledger', icon: DollarSign },
      { id: 'wave', name: 'Wave', desc: 'Small Business Accounting', icon: DollarSign },
    ],
  },
  {
    category: 'REVIEWS & SCHEDULING',
    items: [
      { id: 'judge-me', name: 'Judge.me', desc: 'Product Reviews on WhatsApp', icon: Star },
      { id: 'calendly', name: 'Calendly', desc: 'Meeting & Demo Scheduling', icon: Calendar },
    ],
  },
];

export default function Step3Integrations() {
  const navigate = useNavigate();
  const { integrations, updateIntegrations } = useOnboarding();

  const [selectedIntegrations, setSelectedIntegrations] = useState(integrations || []);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleIntegration = (id) => {
    if (selectedIntegrations.includes(id)) {
      setSelectedIntegrations(selectedIntegrations.filter((item) => item !== id));
    } else {
      setSelectedIntegrations([...selectedIntegrations, id]);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    updateIntegrations(selectedIntegrations);
    navigate('/onboarding/configuration');
  };

  const handleSkip = () => {
    navigate('/onboarding/configuration');
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

            {/* Step Counter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Step 3 of 4</span>
              <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full w-3/4 rounded-full transition-all duration-300" />
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-16">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Heading Block */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60 inline-block">
                STEP 3 OF 4
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Looking to integrate with a software tool?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                You can connect ARCO to tools used by your team. Select now or configure later in settings.
              </p>

              {/* Search Bar */}
              <div className="pt-3 max-w-md mx-auto relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search integrations (e.g., Shopify, Zoho, Sheets)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categorized Integration Groups */}
            <div className="space-y-8">
              {integrationCategories.map((group) => {
                const filteredItems = group.items.filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.desc.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredItems.length === 0) return null;

                return (
                  <div key={group.category} className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
                      {group.category}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedIntegrations.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleIntegration(item.id)}
                            className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-red-50/70 border-red-600 shadow-sm ring-1 ring-red-600'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {item.desc}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-2 transition-colors ${
                                isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <Link
                to="/onboarding/objectives"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/25 transition-all cursor-pointer hover:shadow-lg"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
