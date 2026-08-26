import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Container from '../components/common/Container';
import SectionTitle from '../components/common/SectionTitle';
import Button from '../components/common/Button';

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-20 bg-slate-50/50">
      <Container>
        <SectionTitle
          badge="Get in Touch"
          title="We'd Love to Hear From You"
          description="Have questions about features, pricing, or custom integrations? Our WhatsApp specialists are ready to help."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Chat with Sales</h4>
                <p className="text-xs text-slate-500 mt-0.5">Instant WhatsApp reply</p>
                <p className="text-sm font-semibold text-emerald-600 mt-2">+1 (800) 555-0199</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Email Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">Response within 2 hours</p>
                <p className="text-sm font-semibold text-red-600 mt-2">support@arcocommunication.io</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Headquarters</h4>
                <p className="text-xs text-slate-500 mt-0.5">San Francisco, CA</p>
                <p className="text-sm text-slate-700 mt-2">548 Market St, Suite 300</p>
              </div>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Send Us a Message</h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your business requirements..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <Button variant="primary" icon={Send} className="w-full sm:w-auto">
                Submit Inquiry
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
