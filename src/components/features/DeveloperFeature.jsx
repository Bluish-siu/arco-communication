import { Link } from 'react-router-dom';
import {
  Code2,
  Check,
  ArrowRight,
  Terminal,
  Layers,
  Webhook,
  Database,
  Copy,
} from 'lucide-react';
import Container from '../common/Container';

export default function DeveloperFeature() {
  const capabilities = [
    'Robust REST APIs for sending WhatsApp messages & templates',
    'Real-time Webhooks for delivery, reads, and inbound replies',
    'Bi-directional contact & deal syncing with CRM tools',
    'Pre-built native integrations for Shopify, HubSpot, Zoho & Salesforce',
    'Zapier & Make.com connectors for 5,000+ cloud platforms',
    'Enterprise SDKs, sandboxes & 99.99% uptime SLA',
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="developer">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <Code2 className="w-3.5 h-3.5 text-red-600" />
              <span>APIS, WEBHOOKS & INTEGRATIONS</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Build ARCO into your own workflows
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Connect your existing business tech stack with powerful REST APIs, instant webhooks, and pre-built integrations for Shopify, Salesforce, HubSpot, and Zoho.
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
                <span>Explore Developer Tools</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Code Terminal & Integrations Mockup */}
          <div className="lg:col-span-6 w-full">
            <div className="relative bg-slate-950 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 text-slate-300 text-xs font-mono">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-400 font-sans font-bold ml-1.5">
                    POST /v1/messages/send
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-sans font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  HTTP 200 OK
                </span>
              </div>

              {/* Code Snippet */}
              <pre className="text-[11px] sm:text-xs leading-relaxed text-slate-200 overflow-x-auto py-2 font-mono">
                <code>{`// Send Automated WhatsApp Message via ARCO REST API
curl -X POST "https://api.arcocommunication.com/v1/messages" \\
  -H "Authorization: Bearer arco_live_key_9841" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "template": "order_dispatch_alert",
    "variables": {
      "customer_name": "Rohan",
      "tracking_link": "https://arco.to/track/48291"
    }
  }'`}</code>
              </pre>

              {/* Response Footer */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-sans text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Webhook Dispatched (0.12s)</span>
                </div>
                <span className="text-slate-500">JSON Payload</span>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
