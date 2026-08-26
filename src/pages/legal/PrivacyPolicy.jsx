import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, Lock, FileText, CheckCircle2 } from 'lucide-react';
import Container from '../../components/common/Container';

export default function PrivacyPolicy() {
  const lastUpdated = 'August 20, 2026';

  return (
    <div className="py-12 sm:py-20 bg-slate-50/50 text-slate-800">
      <Container>
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Legal & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Last Updated: <span className="font-semibold text-slate-700">{lastUpdated}</span>
            </p>
          </div>

          {/* Policy Content */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">1</span>
                Introduction & Overview
              </h2>
              <p>
                This Privacy Policy describes how <strong>[Registered Business Name]</strong> ("ARCO Communication", "we", "us", or "our") collects, uses, stores, and protects your information when you visit our website, register for an account, or use our WhatsApp customer engagement SaaS platform (collectively, the "Services").
              </p>
              <p>
                By accessing or using our Services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our Services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">2</span>
                Information We Collect
              </h2>
              <p>
                We collect information necessary to provide, maintain, and secure our communication platform. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Account & Contact Information:</strong> Name, email address, company name, phone number, and encrypted authentication credentials when you register or log in.
                </li>
                <li>
                  <strong>Business Profile Information:</strong> Business website, industry classification, operating jurisdiction, and communication preferences provided during onboarding.
                </li>
                <li>
                  <strong>Meta & WhatsApp Business Data:</strong> Meta Business Portfolio IDs, WhatsApp Business Account (WABA) IDs, Phone Number IDs, verified display names, quality ratings, message templates, and conversation metadata required to connect with the Meta WhatsApp Cloud API.
                </li>
                <li>
                  <strong>Customer & Messaging Data:</strong> Contact lists, customer phone numbers, message content, delivery status, and timestamps processed through your connected WhatsApp channels.
                </li>
                <li>
                  <strong>Technical & Usage Information:</strong> IP addresses, browser types, device identifiers, interaction logs, and diagnostic data collected automatically during platform use.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">3</span>
                How We Use Your Information
              </h2>
              <p>We process collected data for legitimate business purposes, including:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Providing, operating, and maintaining the ARCO communication dashboard and services.</li>
                <li>Facilitating official integration with the Meta WhatsApp Business Platform and Cloud API.</li>
                <li>Enabling message broadcasting, automated replies, team inbox workflows, and contact management.</li>
                <li>Verifying account identity, preventing unauthorized access, and protecting platform security.</li>
                <li>Providing customer support, responding to inquiries, and sending essential system notices.</li>
                <li>Analyzing aggregate usage patterns to enhance system reliability and performance.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">4</span>
                WhatsApp and Meta Data Processing
              </h2>
              <p>
                ARCO Communication integrates with Meta Platforms, Inc. to provide official WhatsApp Cloud API functionality. When you connect your WhatsApp Business account:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Token Security:</strong> Meta OAuth access tokens are encrypted server-side using industry-standard AES-256-CBC encryption and are never exposed to the client browser or stored in browser local storage.
                </li>
                <li>
                  <strong>Message Routing:</strong> Inbound and outbound WhatsApp messages are transmitted through Meta's official Cloud API infrastructure in compliance with Meta's developer and commercial policies.
                </li>
                <li>
                  <strong>No Sale of Data:</strong> We do not sell, rent, or monetize your Meta Business information or your customers' WhatsApp message data to third parties or advertising networks.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">5</span>
                Data Storage and Security
              </h2>
              <p>
                We implement administrative, technical, and physical safeguards designed to protect your personal and business data against unauthorized access, loss, or alteration. These measures include encrypted database storage, secure HTTPS data transmission, role-based access restrictions, and periodic security evaluations.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">6</span>
                Data Retention
              </h2>
              <p>
                We retain your account and business data for as long as your ARCO account remains active, or as necessary to provide you with the Services, resolve disputes, enforce our agreements, and comply with applicable legal obligations. When data is no longer needed for these purposes, it is securely deleted or anonymized.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">7</span>
                Data Sharing & Third-Party Service Providers
              </h2>
              <p>We may share information only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Meta Platforms, Inc.:</strong> To authenticate your business, manage WABAs, and route WhatsApp communications.
                </li>
                <li>
                  <strong>Infrastructure Providers:</strong> Trusted cloud hosting and database service providers who process data strictly under our instructions and confidentiality agreements.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, subpoena, or regulatory authority to comply with a valid legal process or protect the safety and rights of ARCO, our users, or the public.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">8</span>
                Your Rights & Choices
              </h2>
              <p>Depending on your location, you may have rights regarding your personal data, including:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Accessing and reviewing the personal data we hold about you.</li>
                <li>Requesting correction of inaccurate or incomplete information.</li>
                <li>Requesting deletion of your account and associated data.</li>
                <li>Disconnecting your WhatsApp Business integration at any time through the dashboard.</li>
                <li>Opting out of non-essential communications.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">9</span>
                Account and Data Deletion
              </h2>
              <p>
                You can request the deletion of your ARCO account and associated stored data at any time. For detailed step-by-step instructions on how to request data deletion, please visit our dedicated{' '}
                <Link to="/data-deletion" className="text-red-600 hover:text-red-700 font-bold underline">
                  Data Deletion Instructions
                </Link>{' '}
                page.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">10</span>
                Children's Privacy
              </h2>
              <p>
                Our Services are intended strictly for commercial and business use by individuals aged 18 and older. We do not knowingly collect personal information from children under the age of 18.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">11</span>
                Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our operational, legal, or regulatory practices. We will notify you of any material changes by updating the "Last Updated" date at the top of this page.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">12</span>
                Contact Us
              </h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please contact us at:
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
            <Link to="/terms-of-service" className="hover:text-red-600 font-semibold flex items-center gap-1">
              <span>View Terms of Service</span>
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
