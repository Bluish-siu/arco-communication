import { Link } from 'react-router-dom';
import { FileText, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Container from '../../components/common/Container';

export default function TermsOfService() {
  const lastUpdated = 'August 20, 2026';

  return (
    <div className="py-12 sm:py-20 bg-slate-50/50 text-slate-800">
      <Container>
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Last Updated: <span className="font-semibold text-slate-700">{lastUpdated}</span>
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">1</span>
                Acceptance of Terms
              </h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you (whether individually or on behalf of an entity you represent) and <strong>[Registered Business Name]</strong> ("ARCO Communication", "we", "us", or "our") governing your access to and use of the ARCO SaaS platform, website, and related services (collectively, the "Services").
              </p>
              <p>
                By creating an account, accessing, or using the Services, you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use our Services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">2</span>
                Description of Services
              </h2>
              <p>
                ARCO Communication provides a customer engagement software platform that enables businesses to manage customer conversations, broadcast marketing and transactional messages, build automated workflows, and manage customer contacts primarily through the Meta WhatsApp Business Platform and Cloud API.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">3</span>
                Account Registration & Security
              </h2>
              <p>
                To access certain features of the Services, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Provide accurate, current, and complete business information during registration and onboarding.</li>
                <li>Maintain and promptly update your account information.</li>
                <li>Maintain the confidentiality of your login credentials.</li>
                <li>Notify us immediately of any unauthorized use of your account or security breach.</li>
                <li>Accept full responsibility for all activities that occur under your account.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">4</span>
                WhatsApp and Meta Platform Integration
              </h2>
              <p>
                Our Services integrate with Meta Platforms, Inc. via the WhatsApp Business Cloud API. By using our WhatsApp features, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You must maintain an active, verified Meta Business Account in good standing.</li>
                <li>You are solely responsible for complying with the <strong>WhatsApp Business Terms of Service</strong>, <strong>WhatsApp Business Policy</strong>, and <strong>Meta Commercial Terms</strong>.</li>
                <li>Meta reserves the right to review, approve, or reject message templates, phone numbers, and WhatsApp Business Accounts according to its policies.</li>
                <li>ARCO Communication is not responsible for any suspension, rate limiting, or restriction imposed on your WhatsApp account by Meta.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">5</span>
                Acceptable Use & Messaging Compliance
              </h2>
              <p>
                You agree not to use the Services for any unlawful or prohibited activity. Specifically, you agree that you will NOT:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Send unsolicited spam messages or bulk broadcasts to recipients who have not provided explicit, verifiable consent (opt-in).</li>
                <li>Send harassing, fraudulent, defamatory, obscene, or threatening content.</li>
                <li>Distribute malware, viruses, or malicious software.</li>
                <li>Impersonate any person, business, or entity.</li>
                <li>Violate any applicable local, national, or international privacy, consumer protection, or telecommunications laws.</li>
                <li>Attempt to reverse engineer, decompile, or compromise the integrity of our platform or APIs.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">6</span>
                Customer Data & Intellectual Property
              </h2>
              <p>
                <strong>Your Data:</strong> You retain all ownership rights to the customer data, contacts, and message content you upload or transmit through the Services. You grant ARCO a non-exclusive license to host, process, and transmit such data solely as necessary to provide the Services.
              </p>
              <p>
                <strong>ARCO IP:</strong> The ARCO Communication platform, website, software, branding, logos, and user interface designs are the proprietary intellectual property of <strong>[Registered Business Name]</strong> and are protected by applicable intellectual property laws.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">7</span>
                Third-Party Services & Dependencies
              </h2>
              <p>
                The Services rely on third-party service providers, including Meta Platforms, Inc. for WhatsApp delivery and cloud hosting providers. We do not control third-party infrastructure and are not liable for service interruptions, downtime, or policy changes originating from third-party networks.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">8</span>
                Service Availability & Modifications
              </h2>
              <p>
                We strive to maintain continuous platform availability. However, we may periodically perform maintenance, updates, or modifications. We reserve the right to modify, suspend, or discontinue any feature of the Services with reasonable advance notice where feasible.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">9</span>
                Account Suspension & Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or violate Meta's messaging policies. You may terminate your account at any time by contacting support or submitting a data deletion request.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">10</span>
                Disclaimers & Limitation of Liability
              </h2>
              <p>
                THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL [REGISTERED BUSINESS NAME] BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF THE SERVICES.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">11</span>
                Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of <strong>[Governing Jurisdiction / Applicable Law]</strong>, without regard to its conflict of law principles.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">12</span>
                Contact Information
              </h2>
              <p>
                If you have questions or notices regarding these Terms of Service, please contact us at:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p><strong>Entity:</strong> [Registered Business Name]</p>
                <p><strong>Email:</strong> <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">contact@arcocommunication.com</a></p>
                <p><strong>Address:</strong> [Registered Business Address]</p>
                <p><strong>Website:</strong> <a href="https://arcocommunication.com" className="text-slate-700 font-semibold hover:underline">https://arcocommunication.com</a></p>
              </div>
            </section>

          </div>

          {/* Quick links */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <Link to="/privacy-policy" className="hover:text-red-600 font-semibold flex items-center gap-1">
              <span>View Privacy Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/data-deletion" className="hover:text-red-600 font-semibold flex items-center gap-1">
              <span>Data Deletion Instructions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
}
