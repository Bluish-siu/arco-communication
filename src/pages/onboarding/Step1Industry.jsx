import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Play,
  CheckCircle2,
  Building2,
  ChevronDown,
} from 'lucide-react';
import Container from '../../components/common/Container';
import { useOnboarding } from '../../context/OnboardingContext';

const industriesData = [
  {
    name: 'Marketing & Advertising',
    subCategories: ['Digital Agency', 'PR & Communications', 'Media Buying', 'Influencer Agency', 'Creative Studio'],
  },
  {
    name: 'Retail',
    subCategories: ['Apparel & Fashion', 'Electronics & Gadgets', 'Beauty & Cosmetics', 'Home & Furniture', 'Grocery & Supermarket', 'Jewellery & Watches'],
  },
  {
    name: 'Education',
    subCategories: ['K-12 School', 'Higher Education / College', 'EdTech & Online Courses', 'Coaching & Test Prep', 'Study Abroad & Language'],
  },
  {
    name: 'Entertainment, Social Media & Gaming',
    subCategories: [
      'Movies & TV Shows',
      'Events & Performing Arts',
      'Cinema Halls & Multiplexes',
      'Magazines & Publications',
      'Gaming',
      'Social Media Figures',
      'Gambling & Real Money Gaming',
    ],
  },
  {
    name: 'Finance',
    subCategories: ['Banking & NBFC', 'Insurance', 'FinTech & Lending', 'Wealth & Asset Management', 'Cryptocurrency & Forex'],
  },
  {
    name: 'Healthcare',
    subCategories: ['Hospitals & Multi-speciality', 'Clinics & Doctors', 'Diagnostics & Labs', 'Pharmacy & E-Pharmacy', 'Mental Health & Wellness'],
  },
  {
    name: 'Public Utilities & Non-Profits',
    subCategories: ['Government Services', 'NGO & Charities', 'Community Organizations', 'Public Transport'],
  },
  {
    name: 'Professional Services',
    subCategories: ['Legal & Law Firms', 'Accounting & Tax Advisory', 'Management Consulting', 'HR & Staffing'],
  },
  {
    name: 'Technology',
    subCategories: ['SaaS & B2B Software', 'Mobile Apps', 'IT & Managed Services', 'Cloud & Hosting', 'Cybersecurity'],
  },
  {
    name: 'Travel & Hospitality',
    subCategories: ['Hotels & Resorts', 'Travel Agency & Tours', 'Airlines & Logistics', 'Car Rentals & Cabs'],
  },
  {
    name: 'Automotive',
    subCategories: ['Car & Bike Dealerships', 'Auto Service & Repair', 'EV & Green Mobility', 'Spare Parts & Accessories'],
  },
  {
    name: 'Real Estate & Construction',
    subCategories: ['Residential Developers', 'Commercial Properties', 'Real Estate Brokers & Agents', 'Interior Design & Architecture'],
  },
  {
    name: 'Restaurants',
    subCategories: ['Fine Dining & Cafes', 'Cloud Kitchens & QSR', 'Bakeries & Confectionery', 'Bars & Pubs'],
  },
  {
    name: 'Manufacturing & Impex',
    subCategories: ['Textiles & Garments', 'Industrial Machinery', 'Export-Import Trading', 'Packaging & Materials'],
  },
  {
    name: 'Fitness & Wellness',
    subCategories: ['Gyms & Fitness Centers', 'Yoga & Pilates Studios', 'Spas & Salons', 'Diet & Nutrition Clinics'],
  },
];

export default function Step1Industry() {
  const navigate = useNavigate();
  const { industryData, updateIndustry } = useOnboarding();

  const [selectedIndustry, setSelectedIndustry] = useState(industryData.industry || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(industryData.subCategory || '');

  const currentIndustryObj = industriesData.find((i) => i.name === selectedIndustry);

  const handleIndustryChange = (e) => {
    const ind = e.target.value;
    setSelectedIndustry(ind);
    setSelectedSubCategory('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!selectedIndustry || !selectedSubCategory) return;

    updateIndustry({
      industry: selectedIndustry,
      subCategory: selectedSubCategory,
    });

    navigate('/onboarding/objectives');
  };

  const isFormValid = Boolean(selectedIndustry && selectedSubCategory);

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
              <span className="text-xs font-bold text-slate-500">Step 1 of 4</span>
              <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full w-1/4 rounded-full transition-all duration-300" />
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-16">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-6">
              <div>
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60 mb-2.5 inline-block">
                  STEP 1 OF 4
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Which industry does your business belong to?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  We'll accordingly personalise your experience.
                </p>
              </div>

              <form onSubmit={handleNext} className="space-y-5">
                {/* Industry Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Industry *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedIndustry}
                      onChange={handleIndustryChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all appearance-none cursor-pointer pr-10"
                    >
                      <option value="" disabled>Choose your industry...</option>
                      {industriesData.map((ind) => (
                        <option key={ind.name} value={ind.name}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Sub-category Dropdown (Visible when industry selected) */}
                {selectedIndustry && currentIndustryObj && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Sub-category *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="" disabled>Choose your sub-category...</option>
                        {currentIndustryObj.subCategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/onboarding"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    ← Back to Business Info
                  </Link>

                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                      isFormValid
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25 cursor-pointer hover:shadow-lg'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Welcome Video & Helper Panel (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-8 space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800 mb-3">
                  <Sparkles className="w-3 h-3 text-red-500" />
                  <span>Interactive Walkthrough</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Hey! Welcome to ARCO Communication
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Here's a short introduction video to get you up and running in minutes.
                </p>
              </div>

              {/* Video Player Placeholder */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center group cursor-pointer shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/60 to-red-950/20" />
                <div className="relative z-10 w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-200">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Getting Started with ARCO (01:45)</span>
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[10px]">HD</span>
                </div>
              </div>

              {/* Quick Perks */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Meta Official WhatsApp Cloud API onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Pre-configured templates for your industry</span>
                </div>
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
