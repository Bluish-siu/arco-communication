import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Scale,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import Container from '../../components/common/Container';

export default function TermsOfService() {
  const effectiveDate = 'September 23, 2026';

  useEffect(() => {
    document.title = 'Terms of Service | ARCO Communication';
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Terms of Service for ARCO Communication and its WhatsApp-first customer engagement platform.'
    );
  }, []);

  return (
    <div className="py-12 sm:py-20 bg-slate-50/50 text-slate-800">
      <Container>
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
              <Scale className="w-4 h-4 text-red-600 shrink-0" />
              <span>Commercial Terms & User Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Terms and Conditions for ARCO Communication
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 justify-center sm:justify-start">
              <span>Effective Date: <strong className="text-slate-800 font-semibold">{effectiveDate}</strong></span>
              <span>•</span>
              <span>Status: <strong className="text-emerald-700 font-semibold">Active & Enforceable</strong></span>
            </div>
          </div>

          {/* Terms Document Body */}
          <div className="bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xs space-y-12 text-xs sm:text-sm leading-relaxed text-slate-600">

            {/* 1. Acceptance of Terms */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                Acceptance of Terms
              </h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you (whether individually or on behalf of an entity you represent) and <strong>Arco</strong>, operating as ARCO Communication ("Arco", "ARCO Communication", "we", "us", or "our") governing your access to and use of the ARCO SaaS platform, website, and related services (collectively, the "Services").
              </p>
              <p>
                By creating an account, accessing our website (
                <a href="https://arco-communication.vercel.app" className="text-red-600 hover:underline font-medium">
                  https://arco-communication.vercel.app
                </a>
                ), connecting your WhatsApp Business Account, integrating our APIs, or utilizing any of our software tools, team inboxes, or automation features (collectively, the "Services"), you acknowledge that you have read, understood, and agreed to be bound by these Terms.
              </p>
              <p>
                If you do not agree to these Terms in their entirety, you must not register for an account, connect third-party messaging channels, or access our Services. If you are entering into these Terms on behalf of a company or other legal entity, you represent and warrant that you have the full legal authority to bind that entity to these Terms.
              </p>
            </section>

            {/* 2. Service Overview */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                Service Overview & Platform Capabilities
              </h2>
              <p>
                ARCO Communication provides a comprehensive, multi-tenant software-as-a-service (SaaS) platform designed for business communication, customer engagement, and journey automation. Our platform includes the following capabilities:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-slate-800">Official WhatsApp Cloud API Integration:</strong> Direct connection to the Meta WhatsApp Business Platform for authorized transactional, promotional, and customer care messaging.
                </li>
                <li>
                  <strong className="text-slate-800">Multi-Agent Team Inbox:</strong> Unified collaborative inbox with live conversation assignment, tag management, chat filters, and response window indicators.
                </li>
                <li>
                  <strong className="text-slate-800">Contact Management & CRM Pipelines:</strong> Contact directories, custom trait tracking, deal stage pipelines, segment builders, and import/export capabilities.
                </li>
                <li>
                  <strong className="text-slate-800">Broadcast Campaigns & Template Sync:</strong> Authoring, Meta synchronization, scheduling, batch delivery, and delivery receipt monitoring for WhatsApp pre-approved templates.
                </li>
                <li>
                  <strong className="text-slate-800">Workflow Automation Engine:</strong> Visual workflow design, keyword trigger evaluation, automated auto-replies, and agent routing logic.
                </li>
                <li>
                  <strong className="text-slate-800">WhatsApp Flows & Interactive Forms:</strong> Publishing native WhatsApp interactive form flows, capturing customer submissions, and routing lead responses directly into CRM records.
                </li>
                <li>
                  <strong className="text-slate-800">E-Commerce Integrations:</strong> Connectors (such as Shopify) enabling automated order confirmation, shipment notifications, and customer sync.
                </li>
                <li>
                  <strong className="text-slate-800">Analytics & Audit Reporting:</strong> Message delivery metrics, read rates, response tracking, and system execution logs.
                </li>
              </ul>
            </section>

            {/* 3. Account Registration */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                Account Registration, Team Management & Security
              </h2>
              <p>
                To utilize ARCO Communication, you must create a registered business account. You agree to the following commitments:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Accurate Information:</strong> You must provide truthful, complete, and current information during registration, onboarding, and business profile configuration.
                </li>
                <li>
                  <strong>Credential Confidentiality:</strong> You are responsible for maintaining the confidentiality of your login passwords, authentication tokens, API keys, and session credentials. You may not share administrative credentials outside your authorized organization.
                </li>
                <li>
                  <strong>Authorized Team Members:</strong> Business accounts may invite staff members, agents, and managers. You remain solely and fully responsible for all actions, communications, dispatches, and configurations performed by authorized team members operating under your account.
                </li>
                <li>
                  <strong>Immediate Breach Notification:</strong> You must immediately notify ARCO Communication at{' '}
                  <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">
                    contact@arcocommunication.com
                  </a>{' '}
                  if you suspect or discover any unauthorized access, account compromise, or credential leakage.
                </li>
              </ul>
            </section>

            {/* 4. Acceptable Use */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                Acceptable Use Policy & Prohibited Conduct
              </h2>
              <p>
                You represent and warrant that you will use ARCO Communication strictly in compliance with all applicable laws, regulations, telecommunications standards, and industry guidelines. You agree that you will <strong>NOT</strong> under any circumstances:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-red-600 font-extrabold">✕</span> No Spam or Unsolicited Blasts
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sending unsolicited commercial communications, bulk promotional blasts, or messages to purchased or scraped contact lists without verifiable opt-in consent.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-red-600 font-extrabold">✕</span> No Deception or Fraud
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Engaging in deceptive practices, phishing, financial fraud, impersonation of third parties, or misleading representations of products, pricing, or identity.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-red-600 font-extrabold">✕</span> No Harmful Content
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Transmitting malware, viruses, malicious code, defamatory, obscene, harassing, threatening, hateful, or discriminatory materials.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="text-red-600 font-extrabold">✕</span> No System Tampering
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Reverse engineering, decompiling, circumventing rate limits, probing security vulnerabilities, or breaching tenant isolation controls.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. WhatsApp and Meta Compliance */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                WhatsApp and Meta Platform Compliance
              </h2>
              <p>
                ARCO Communication provides software tools that interface with the Meta WhatsApp Business Platform. In connecting and utilizing WhatsApp messaging features, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Mandatory Meta Terms Adherence:</strong> You must strictly comply with all Meta policies, including the 
                  <a href="https://www.whatsapp.com/legal/business-terms/" target="_blank" rel="noopener noreferrer" className="text-red-600 font-semibold hover:underline ml-1">
                    WhatsApp Business Terms of Service
                  </a>, the{' '}
                  <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" className="text-red-600 font-semibold hover:underline">
                    WhatsApp Business Policy
                  </a>, and Meta Platform Terms.
                </li>
                <li>
                  <strong>Opt-in Requirements:</strong> You must secure clear, affirmative, and verifiable opt-in consent from every recipient prior to initiating marketing, utility, or authentication template messages on WhatsApp.
                </li>
                <li>
                  <strong>Independent Meta Governance:</strong> Meta Platforms, Inc. independently reviews and governs all WhatsApp Business Accounts (WABAs), phone number display names, message template approvals, quality ratings, and messaging tier limits.
                </li>
                <li>
                  <strong>Meta Enforcement & Disclaimers:</strong> Meta reserves the exclusive right to approve, reject, rate-limit, suspend, or terminate WhatsApp phone numbers or accounts that violate its messaging policies. 
                  <strong className="text-slate-800">
                    {' '}ARCO Communication has no control over Meta's independent enforcement decisions and shall bear no liability for template rejections, quality rating downgrades, or account bans enforced by Meta.
                  </strong>
                </li>
              </ul>
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                <strong>Disclaimer of Affiliation:</strong> ARCO Communication is an independent software application and is not owned, operated, sponsored, or endorsed by Meta Platforms, Inc. WhatsApp is a registered trademark of Meta Platforms, Inc.
              </div>
            </section>

            {/* 6. Messaging Responsibility */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                Messaging Consent & Regulatory Responsibility
              </h2>
              <p>
                As a customer of ARCO Communication, you bear sole and exclusive responsibility for all communications transmitted through your connected accounts. Specifically, you are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Verifying the accuracy and legitimacy of all recipient phone numbers uploaded or targeted.</li>
                <li>Maintaining documented evidence of opt-in consent for every targeted contact.</li>
                <li>Providing clear, easily accessible opt-out instructions (such as honoring "STOP", "UNSUBSCRIBE", or opt-out button clicks immediately).</li>
                <li>The factual accuracy, legality, and appropriateness of all message templates, media, interactive links, and marketing offers.</li>
                <li>Complying with all applicable commercial communication, anti-spam, telecommunications, and consumer protection laws in the jurisdictions where you and your recipients operate.</li>
              </ul>
            </section>

            {/* 7. Campaigns and Automation */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  7
                </span>
                Campaigns, Automation & Workflow Configurations
              </h2>
              <p>
                ARCO Communication provides visual builders for campaigns, auto-replies, and workflow triggers. When you design, schedule, or activate automated campaigns, chatbot replies, or automated lead routing, you are solely responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Audience segmentation filters and recipient exclusions.</li>
                <li>The timing, frequency, and volume of automated dispatches to avoid triggering user spam reports or quality degradation.</li>
                <li>The logical design of branching chatbot decision trees, ensuring that bot responses are not misleading, false, or unauthorized.</li>
                <li>Ensuring automated messaging respects recipient opt-outs and WhatsApp 24-hour customer service window restrictions.</li>
              </ul>
            </section>

            {/* 8. Third-Party Services */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  8
                </span>
                Third-Party Services & Integrations
              </h2>
              <p>
                The Services may enable integration with third-party software, platforms, and application providers, including Meta Platforms, Inc. (WhatsApp Cloud API), Shopify (e-commerce catalog and order webhooks), Google OAuth, and cloud hosting infrastructure.
              </p>
              <p>
                You acknowledge that ARCO Communication does not control or operate these third-party platforms. Their availability, fee schedules, API versions, and terms of service are governed solely by the respective third-party providers. ARCO Communication shall not be liable for any downtime, service disruptions, deprecations, or modifications originating from third-party services.
              </p>
            </section>

            {/* 9. Service Availability */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  9
                </span>
                Service Availability & System Maintenance
              </h2>
              <p>
                We strive to maintain reliable platform operations with high availability. However, you acknowledge that our Services are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. We do not warrant that platform operations will be entirely uninterrupted, error-free, or continuously accessible.
              </p>
              <p>
                Platform access may occasionally be suspended, limited, or degraded due to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Scheduled software updates, feature releases, and system maintenance.</li>
                <li>Emergency security patches and vulnerability mitigations.</li>
                <li>External telecommunications network failures, internet backbone outages, or cloud infrastructure disruptions.</li>
                <li>Meta WhatsApp Cloud API latency, rate throttling, or service downtime.</li>
              </ul>
            </section>

            {/* 10. Payments and Billing */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  10
                </span>
                Subscriptions, Fees & Payment Terms
              </h2>
              <p>
                Access to certain features and usage tiers of ARCO Communication requires an active paid subscription plan:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Subscription Plans:</strong> Pricing, plan features, agent seat limits, and broadcast allowances are detailed on our public pricing page (
                  <Link to="/pricing" className="text-red-600 hover:underline font-semibold">
                    https://arco-communication.vercel.app/pricing
                  </Link>
                  ). Subscription fees are billed in advance on a recurring monthly or annual basis.
                </li>
                <li>
                  <strong>Meta Conversation Charges:</strong> Meta Platforms, Inc. charges separately for WhatsApp Business conversations (marketing, utility, authentication, and service categories) based on country-specific rate cards. Customers are responsible for funding their WhatsApp billing accounts or reimbursing conversation fees incurred through their connected numbers.
                </li>
                <li>
                  <strong>Taxes:</strong> All quoted subscription fees are exclusive of applicable taxes, value-added taxes (VAT), goods and services taxes (GST), or sales taxes, which will be billed as required by law.
                </li>
                <li>
                  <strong>Plan Adjustments & Cancellation:</strong> Customers may upgrade, downgrade, or cancel their subscription plan through the billing dashboard. Cancellations take effect at the conclusion of the current prepaid billing period.
                </li>
              </ul>
            </section>

            {/* 11. Intellectual Property */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  11
                </span>
                Intellectual Property & Customer Data Rights
              </h2>
              <p>
                <strong>Customer Data Ownership:</strong> As between you and ARCO Communication, you retain all right, title, and interest in and to all customer records, contact lists, custom attributes, message text, media assets, and business documentation you submit, upload, or process through the Services ("Customer Data"). You grant ARCO Communication a limited, non-exclusive, worldwide, royalty-free license to host, copy, process, and transmit Customer Data solely as necessary to provide, secure, and support the Services.
              </p>
              <p>
                <strong>ARCO Intellectual Property:</strong> The ARCO Communication platform, software code, user interface designs, logos, trademarks, documentation, workflow templates, algorithms, and documentation are the exclusive intellectual property of Arco and its licensors and are protected by applicable copyright, trademark, and trade secret laws. Nothing in these Terms grants you any ownership rights in our software or brand.
              </p>
            </section>

            {/* 12. Privacy */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  12
                </span>
                Privacy & Data Protection
              </h2>
              <p>
                Your privacy and data protection are paramount. Our collection, use, and disclosure of personal data in connection with the Services is governed by our{' '}
                <Link to="/privacy-policy" className="text-red-600 font-bold hover:underline">
                  Privacy Policy
                </Link>
                , which is hereby incorporated by reference into these Terms. By using the Services, you agree to our processing of personal data as described in the Privacy Policy.
              </p>
            </section>

            {/* 13. Account Suspension and Termination */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  13
                </span>
                Account Suspension and Termination
              </h2>
              <p>
                <strong>Termination by Customer:</strong> You may terminate your account at any time by accessing account settings or contacting support at{' '}
                <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">
                  contact@arcocommunication.com
                </a>.
              </p>
              <p>
                <strong>Suspension or Termination by ARCO:</strong> We reserve the right to immediately suspend or terminate your account, disconnect your WhatsApp integrations, or restrict access to the Services, with or without prior notice, if:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You breach any provision of these Terms or the Acceptable Use Policy.</li>
                <li>Your messaging activity generates elevated spam complaints, opt-out rates, or violates Meta WhatsApp policies.</li>
                <li>Meta restricts, flags, or terminates your connected WhatsApp Business Account.</li>
                <li>You fail to pay applicable subscription fees when due.</li>
                <li>Your account activity poses a security risk, liability threat, or operational hazard to our infrastructure or other tenants.</li>
                <li>Required by lawful court order, regulatory mandate, or telecommunications authority.</li>
              </ul>
              <p>
                Upon termination, your right to access and use the platform will immediately cease. Sections relating to intellectual property, limitation of liability, indemnification, dispute resolution, and payment obligations shall survive termination.
              </p>
            </section>

            {/* 14. Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  14
                </span>
                Disclaimer of Warranties & Limitation of Liability
              </h2>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-2">
                <p className="font-bold text-slate-900 uppercase tracking-wide">Warranty Disclaimer</p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. ARCO COMMUNICATION DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, ACCURATE, OR ERROR-FREE.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-2">
                <p className="font-bold text-slate-900 uppercase tracking-wide">Limitation of Consequential Damages</p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ARCO COMMUNICATION, ITS DIRECTORS, EMPLOYEES, PARTNERS, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE SERVICES.
                </p>
              </div>

              <p>
                <strong>Aggregate Liability Cap:</strong> In no event shall the total aggregate liability of ARCO Communication arising out of or related to these Terms or the Services exceed the total amount paid by you to ARCO Communication in the twelve (12) months immediately preceding the event giving rise to liability.
              </p>
            </section>

            {/* 15. Indemnification */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  15
                </span>
                Indemnification
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless ARCO Communication, its affiliates, directors, officers, employees, and licensors from and against any claims, liabilities, damages, judgments, awards, losses, costs, and expenses (including reasonable legal fees) arising out of or resulting from:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your use of the Services or any message dispatches initiated by your account.</li>
                <li>Your failure to obtain verifiable opt-in consent from message recipients or your violation of anti-spam and messaging regulations.</li>
                <li>The content, accuracy, or legality of Customer Data, message text, media, or offers transmitted through your account.</li>
                <li>Your breach of these Terms, the Acceptable Use Policy, or Meta Platform and WhatsApp Business Policies.</li>
                <li>Your infringement or violation of any third-party intellectual property, privacy, or proprietary rights.</li>
              </ul>
            </section>

            {/* 16. Modifications to Service and Terms */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  16
                </span>
                Modifications to Service & Changes to Terms
              </h2>
              <p>
                <strong>Service Updates:</strong> We continually improve our SaaS platform and reserve the right to modify, add, update, or discontinue features, tools, or functionalities with or without notice.
              </p>
              <p>
                <strong>Terms Revisions:</strong> We reserve the right to revise these Terms periodically. When changes are made, we will update the "Effective Date" at the top of this document. Continued use of ARCO Communication following the posting of revised Terms constitutes your full acceptance of the modifications.
              </p>
            </section>

            {/* 17. Governing Law */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  17
                </span>
                Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms and any dispute or claim arising out of or in connection with them or their subject matter shall be governed by and construed in accordance with applicable commercial laws, without giving effect to any choice or conflict of law principles.
              </p>
              <p>
                In the event of any controversy, claim, or dispute arising out of or relating to these Terms, the parties agree to first attempt in good faith to resolve the dispute informally through direct negotiation by contacting{' '}
                <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">
                  contact@arcocommunication.com
                </a>
                . If informal negotiation fails to resolve the dispute within thirty (30) days, either party may initiate formal legal proceedings before the competent courts of jurisdiction.
              </p>
            </section>

            {/* 18. Final Agreement */}
            <section className="space-y-4 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  18
                </span>
                Entire Agreement & Severability
              </h2>
              <p>
                These Terms of Service, together with our Privacy Policy and any applicable order form or subscription agreement, constitute the entire and exclusive agreement between you and Arco regarding the Services, superseding all prior oral or written agreements, negotiations, or understandings.
              </p>
              <p>
                If any provision of these Terms is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable, such provision shall be enforced to the maximum extent permissible, and the remaining provisions of these Terms shall remain in full force and effect.
              </p>
            </section>

          </div>

          {/* Bottom Navigation Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-semibold text-slate-500">
            <Link to="/privacy-policy" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
              <span>View Privacy Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/data-deletion" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
              <span>User Data Deletion Instructions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
}
