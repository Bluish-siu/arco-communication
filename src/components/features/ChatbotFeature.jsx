import { Link } from 'react-router-dom';
import {
  MessageSquareCode,
  Check,
  ArrowRight,
  GitBranch,
  Layers,
  FileText,
  MousePointer,
  Sparkles,
} from 'lucide-react';
import Container from '../common/Container';

export default function ChatbotFeature() {
  const capabilities = [
    'Visual drag-and-drop no-code conversation builder',
    'Interactive WhatsApp List Menus & Quick-Reply Buttons',
    'WhatsApp Native Forms for instant zero-dropoff lead capture',
    'Multi-branch conditional logic and keyword triggers',
    'Automated lead data extraction directly into CRM',
    'Instant fallback and round-robin agent handoff',
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="chatbots">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <MessageSquareCode className="w-3.5 h-3.5 text-red-600" />
              <span>CHATBOTS & NATIVE FORMS</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Build conversations that guide customers automatically
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Create interactive WhatsApp chatbot flows and native in-chat forms with buttons, list menus, and smart branching logic to qualify customers without friction.
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
                <span>Build a Chatbot</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Chatbot & Form Builder Mockup */}
          <div className="lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800 text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Visual Flow & Form Canvas</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active in Production
                </span>
              </div>

              {/* Node Flow Representation */}
              <div className="space-y-2.5 bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200/80 mb-3.5">
                {/* Node 1: Welcome */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">1</span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Welcome Greeting</div>
                      <div className="text-[10px] text-slate-500">Trigger: Inbound Message / QR Code</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">Trigger Node</span>
                </div>

                <div className="text-center text-slate-300 font-bold">↓</div>

                {/* Node 2: Multi-Option Menu */}
                <div className="bg-white p-2.5 rounded-lg border border-red-200 shadow-2xs flex items-center justify-between bg-red-50/20">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center">2</span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Choose Requirement (List Menu)</div>
                      <div className="text-[10px] text-slate-500">Options: Product Catalog | Book Demo | Support</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Interactive</span>
                </div>

                <div className="text-center text-slate-300 font-bold">↓</div>

                {/* Node 3: Native WhatsApp Form */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">3</span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">WhatsApp Native Form</div>
                      <div className="text-[10px] text-slate-500">Collects Name, Company, City & Team Size</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Native Form</span>
                </div>

                <div className="text-center text-slate-300 font-bold">↓</div>

                {/* Node 4: Assign Agent */}
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs flex items-center justify-between bg-emerald-50/20">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">4</span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Assign to Sales Team & Sync CRM</div>
                      <div className="text-[10px] text-slate-500">Action: Round-robin route to online agent</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600">Auto Route</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
