import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Container from '../../components/common/Container';
import { useOnboarding } from '../../context/OnboardingContext';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Step4Configuration() {
  const navigate = useNavigate();
  const { configuration, updateConfiguration, completeOnboarding } = useOnboarding();

  const [hasFacebookBM, setHasFacebookBM] = useState(configuration.hasFacebookBM ?? 'Yes');
  const [hasUsedWhatsAppAPI, setHasUsedWhatsAppAPI] = useState(configuration.hasUsedWhatsAppAPI ?? 'No');

  const handleComplete = async (e) => {
    if (e) e.preventDefault();

    const finalConfig = {
      hasFacebookBM,
      hasUsedWhatsAppAPI,
    };

    updateConfiguration(finalConfig);
    await completeOnboarding({ configuration: finalConfig });
    navigate('/dashboard');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigate('/dashboard');
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
              <span className="text-xs font-bold text-slate-500">Step 4 of 4</span>
              <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full w-full rounded-full transition-all duration-300" />
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-16">
        <Container>
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Heading Block */}
            <div className="text-center space-y-2">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60 inline-block">
                FINAL STEP
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                A Few Quick Checks Before We Begin
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Help us understand your current setup to get you started faster.
              </p>
            </div>

            {/* Questions Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
              
              {/* Question 1 */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      1. Do you have a Facebook Business Manager account?
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Required for official Meta WhatsApp Business API phone number verification.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHasFacebookBM(opt)}
                      className={`py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                        hasFacebookBM === opt
                          ? 'bg-red-50 border-red-600 text-red-700 shadow-xs ring-1 ring-red-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          hasFacebookBM === opt ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {hasFacebookBM === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>2. Have you used a WhatsApp API number previously?</span>
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Helps us configure instant number migration or fresh Cloud API registration.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHasUsedWhatsAppAPI(opt)}
                      className={`py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                        hasUsedWhatsAppAPI === opt
                          ? 'bg-red-50 border-red-600 text-red-700 shadow-xs ring-1 ring-red-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          hasUsedWhatsAppAPI === opt ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {hasUsedWhatsAppAPI === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Callout */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Our onboarding engineers will guide you through Meta WhatsApp verification with zero downtime.</span>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="pt-4 flex items-center justify-between">
              <Link
                to="/onboarding/integrations"
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
                  Skip
                </button>

                <button
                  type="button"
                  onClick={handleComplete}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/25 transition-all cursor-pointer hover:shadow-lg"
                >
                  <span>Complete Setup</span>
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
