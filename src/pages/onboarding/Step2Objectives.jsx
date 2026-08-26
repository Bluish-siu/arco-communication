import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Megaphone,
  TrendingUp,
  Bell,
  FileText,
  Headphones,
  Sparkles,
  ShoppingBag,
  Bot,
  HelpCircle,
} from 'lucide-react';
import Container from '../../components/common/Container';
import { useOnboarding } from '../../context/OnboardingContext';

const objectivesList = [
  {
    id: 'promote-updates',
    title: 'Promote New Releases & Updates',
    subtitle: 'WhatsApp Bulk Campaigns',
    icon: Megaphone,
    description: 'Broadcast personalized updates, promotions, and new product announcements to segmented customer lists.',
  },
  {
    id: 'generate-leads',
    title: 'Generate Community & Inbound Leads',
    subtitle: 'Click to WhatsApp Ads',
    icon: TrendingUp,
    description: 'Capture high-intent prospects directly from Meta ads and qualify them instantly with automated chat journeys.',
  },
  {
    id: 'automated-notifications',
    title: 'Send Automated Alerts & Notifications',
    subtitle: 'WhatsApp Automated Notifications',
    icon: Bell,
    description: 'Dispatch real-time booking reminders, order updates, invoices, and schedule alerts with 98% open rates.',
  },
  {
    id: 'collect-feedback',
    title: 'Collect Preferences & Feedback',
    subtitle: 'WhatsApp Native Forms',
    icon: FileText,
    description: 'Gather user details, survey responses, and feedback with frictionless in-chat interactive forms.',
  },
  {
    id: 'handle-support',
    title: 'Handle Customer Support Queries',
    subtitle: 'WhatsApp Chat Automation & Shared Inbox',
    icon: Headphones,
    description: 'Resolve customer questions 24/7 with multi-agent collaboration, collision detection, and automated routing.',
  },
  {
    id: 'other-reasons',
    title: 'Custom Workflows & Other Objectives',
    subtitle: 'If you wish to do something else',
    icon: Sparkles,
    description: 'Connect custom webhooks, REST APIs, or design domain-specific customer engagement flows.',
  },
];

export default function Step2Objectives() {
  const navigate = useNavigate();
  const { objectives, updateObjectives } = useOnboarding();

  const [selectedIds, setSelectedIds] = useState(objectives || []);
  const [error, setError] = useState('');

  const toggleObjective = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
      setError('');
    } else {
      if (selectedIds.length >= 3) {
        setError('You can select a maximum of 3 objectives.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
      setError('');
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError('Please select at least 1 objective to proceed.');
      return;
    }

    updateObjectives(selectedIds);
    navigate('/onboarding/integrations');
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
              <span className="text-xs font-bold text-slate-500">Step 2 of 4</span>
              <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full w-2/4 rounded-full transition-all duration-300" />
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
                STEP 2 OF 4
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                What would you like to use ARCO for?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Choose up to 3 objectives & we'll help you achieve those super-quick!
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center rounded-xl animate-in fade-in max-w-md mx-auto">
                {error}
              </div>
            )}

            {/* Selectable Objectives Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {objectivesList.map((obj) => {
                const Icon = obj.icon;
                const isSelected = selectedIds.includes(obj.id);

                return (
                  <div
                    key={obj.id}
                    onClick={() => toggleObjective(obj.id)}
                    className={`rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-50/70 border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isSelected
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors ${
                            isSelected
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4 fill-current" />}
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                        {obj.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-red-600 block mb-2">
                        {obj.subtitle}
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {obj.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/80 text-[11px] font-semibold flex items-center justify-between">
                      <span className={isSelected ? 'text-red-700 font-bold' : 'text-slate-400'}>
                        {isSelected ? 'Selected' : 'Click to select'}
                      </span>
                      <span className="text-slate-400 text-[10px]">Max 3</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <Link
                to="/onboarding/industry"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  {selectedIds.length} of 3 selected
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedIds.length === 0}
                  className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                    selectedIds.length > 0
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25 cursor-pointer hover:shadow-lg'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
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
