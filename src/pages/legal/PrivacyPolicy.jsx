import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  Lock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  Trash2,
  Layers,
  Cpu,
  Cookie,
  ExternalLink,
} from 'lucide-react';
import Container from '../../components/common/Container';

export default function PrivacyPolicy() {
  const lastUpdated = 'September 23, 2026';

  useEffect(() => {
    document.title = 'Privacy Policy | ARCO Communication';
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Privacy Policy for ARCO Communication, a WhatsApp-first customer engagement and business communication platform.'
    );
  }, []);

  return (
    <div className="py-12 sm:py-20 bg-slate-50/50 text-slate-800">
      <Container>
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span>Legal Documentation & Transparency</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Privacy Policy for ARCO Communication
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 justify-center sm:justify-start">
              <span>Last Updated: <strong className="text-slate-800 font-semibold">{lastUpdated}</strong></span>
              <span>•</span>
              <span>Effective Date: <strong className="text-slate-800 font-semibold">September 23, 2026</strong></span>
            </div>
          </div>

          {/* Policy Document Body */}
          <div className="bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xs space-y-12 text-xs sm:text-sm leading-relaxed text-slate-600">

            {/* 1. Introduction */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                Introduction & Overview
              </h2>
              <p>
                Welcome to <strong>ARCO Communication</strong> ("ARCO", "we", "us", or "our"). ARCO Communication is a modern, WhatsApp-first customer engagement, business communication, and workflow automation platform designed to help businesses communicate efficiently, manage multi-agent team inboxes, broadcast verified campaigns, automate customer journeys, and orchestrate interactive messaging via official application programming interfaces (APIs).
              </p>
              <p>
                This Privacy Policy explains how ARCO Communication collects, uses, processes, stores, shares, and protects information when you visit our website (
                <a href="https://arco-communication.vercel.app" className="text-red-600 hover:underline font-medium">
                  https://arco-communication.vercel.app
                </a>
                ), create an account, connect messaging channels, integrate third-party business services, or access any associated tools, APIs, software, and dashboards (collectively, the "Services").
              </p>
              <p>
                We are committed to operating with complete transparency, preserving the confidentiality of business data, and adhering to strict technical and operational safeguards. Please read this Privacy Policy carefully to understand our data practices.
              </p>
            </section>

            {/* 2. Scope */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                Scope of This Policy
              </h2>
              <p>This Privacy Policy applies to all individuals and entities who interact with ARCO Communication, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-800">Website Visitors:</strong> Individuals who browse our public marketing website, documentation, feature overviews, or resources.
                </li>
                <li>
                  <strong className="text-slate-800">Registered Users & Account Administrators:</strong> Individuals who register for an ARCO account, configure tenant settings, or manage organizational subscriptions.
                </li>
                <li>
                  <strong className="text-slate-800">Business Customers:</strong> Commercial entities, brands, e-commerce merchants, and agencies subscribing to the platform.
                </li>
                <li>
                  <strong className="text-slate-800">Authorized Team Members:</strong> Agents, team managers, and staff members provisioned under an organization's account to handle customer chats or campaigns.
                </li>
                <li>
                  <strong className="text-slate-800">API & Integration Users:</strong> Developers, merchants, and system integrators utilizing ARCO webhook endpoints, client software development kits, or platform connectors (such as our Shopify integration).
                </li>
                <li>
                  <strong className="text-slate-800">Customers' End-Contacts:</strong> Consumers, patients, or clients whose contact details, inbound inquiries, and interaction records are processed through ARCO on behalf of our business clients.
                </li>
              </ul>
            </section>

            {/* 3. Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                Information We Collect
              </h2>
              <p>
                We collect information necessary to provide reliable, multi-tenant software services. We organize the information we collect into the following categories:
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">3.1 Account & Identity Information</h3>
                  <p>
                    When you register an account, complete business onboarding, or invite team members, we collect personal and business profile details including your name, business email address, mobile phone number, cryptographically hashed passwords, company name, industry classification, operating jurisdiction, and assigned role permissions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">3.2 Business and Customer Data</h3>
                  <p>
                    In operating your customer engagement pipeline, you may upload or synchronize customer contact records. This includes recipient full names, phone numbers with country codes, email addresses, custom attributes, segment categorizations, tags, estimated deal values, interaction history, and internal agent notes.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">3.3 WhatsApp Communication Data</h3>
                  <p>
                    When your WhatsApp Business Account (WABA) is connected through Meta's Cloud API, ARCO processes messaging data required to operate your live inbox and automation workflows:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Sender and recipient WhatsApp phone numbers and sender profile display names.</li>
                    <li>Message content across supported formats: plain text, quick-reply buttons, interactive list selections, media attachments, and documents.</li>
                    <li>Technical message metadata, including Meta message IDs (WAMIDs), timestamps, conversation categories, response window timers (24-hour customer service window status), and message delivery receipts (sent, delivered, read, failed).</li>
                    <li>Pre-approved message template IDs, parameters, and variable substitutions.</li>
                    <li>Interactive WhatsApp Flows data, including flow tokens, screen identifiers, and structured form responses submitted by end-users.</li>
                    <li>Real-time webhook notification payloads dispatched by the Meta WhatsApp Business Platform.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">3.4 Campaign and Automation Data</h3>
                  <p>
                    We store broadcast campaign records, recipient batch distributions, delivery schedules, execution logs, workflow graph definitions, keyword trigger rules, auto-reply configurations, and aggregated performance metrics (open rates, read rates, response rates).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">3.5 Technical, Device, and Usage Information</h3>
                  <p>
                    When you access the ARCO dashboard, our servers automatically log technical parameters: IP addresses, browser types, operating system details, device characteristics, session tokens, page navigation paths, system error logs, diagnostic performance traces, and feature interaction timestamps.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">3.6 Payment and Billing Information</h3>
                  <p>
                    For paid subscription tiers, we record selected plan tiers (Starter, Growth, Scale, Enterprise), billing contact names, business invoice records, and payment status indicators. 
                    <strong className="text-slate-800">
                      {' '}ARCO Communication does not collect, process, or store raw credit or debit card numbers on its servers.
                    </strong>
                    {' '}All payment card transactions are handled directly by certified, PCI-compliant third-party payment processing gateways.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. How We Use Information */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                How We Use Information
              </h2>
              <p>ARCO Communication processes information only for lawful and operational business purposes, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Account Provisioning & Authentication:</strong> Verifying identity, maintaining session security, managing role permissions, and securing access to organizational dashboards.
                </li>
                <li>
                  <strong>Service Delivery & Messaging Execution:</strong> Connecting with Meta's WhatsApp Cloud API, dispatching approved templates, managing multi-agent team inboxes, routing chats to designated agents, and displaying conversation timelines.
                </li>
                <li>
                  <strong>Campaign & Broadcast Orchestration:</strong> Processing customer audience files, executing scheduled bulk messaging, verifying opt-in statuses, tracking delivery receipts, and calculating delivery analytics.
                </li>
                <li>
                  <strong>Workflow Automation & Bot Logic:</strong> Evaluating inbound messages against customer-defined keyword triggers, executing automated branching workflows, and recording form responses from WhatsApp Flows.
                </li>
                <li>
                  <strong>Customer Relationship Management (CRM):</strong> Organizing contacts, managing lead stages, recording custom attributes, and providing customer interaction histories.
                </li>
                <li>
                  <strong>Platform Reliability & Security:</strong> Detecting, diagnosing, and mitigating system errors, software bugs, server anomalies, brute-force attempts, and unauthorized access.
                </li>
                <li>
                  <strong>Customer Support & Technical Assistance:</strong> Investigating user-reported technical issues, addressing configuration requests, and issuing administrative service alerts.
                </li>
                <li>
                  <strong>Legal & Regulatory Compliance:</strong> Satisfying mandatory recordkeeping, telecommunications guidelines, tax obligations, and enforcing platform agreements.
                </li>
              </ul>
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-red-950 font-medium">
                <strong>No Advertising Use of Customer Communications:</strong> ARCO Communication does not sell, rent, or monetize your customer data or contact lists to third parties. We do not use the confidential contents of your customer communications to train public artificial intelligence models or serve third-party targeted advertisements.
              </div>
            </section>

            {/* 5. WhatsApp and Meta */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                WhatsApp and Meta Platform Integration
              </h2>
              <p>
                ARCO Communication integrates with the Meta WhatsApp Business Platform (operated by Meta Platforms, Inc.) via the official WhatsApp Business Cloud API. When you link your WhatsApp Business Account to ARCO:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Meta Account Connection:</strong> ARCO processes your Meta Business Portfolio ID, WhatsApp Business Account (WABA) ID, Phone Number ID, and API credentials to establish authorized connectivity.
                </li>
                <li>
                  <strong>Token Handling:</strong> Meta OAuth access tokens and Graph API credentials are encrypted server-side using industry-standard AES-256-CBC encryption. They are strictly isolated in secure server environments and never exposed to client-side browser storage.
                </li>
                <li>
                  <strong>Message Dispatch & Ingestion:</strong> Outbound messages created on ARCO are transmitted through Meta's Cloud API endpoints to reach end-user devices. Inbound messages, customer replies, and delivery receipts are delivered to ARCO via verified Meta webhook endpoints.
                </li>
                <li>
                  <strong>Interactive Flows & Forms:</strong> WhatsApp Flows metadata and form submissions pass through Meta's secure infrastructure to ARCO for presentation in your dashboard.
                </li>
              </ul>

              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
                  Independent Platform Disclaimer
                </p>
                <p className="text-xs leading-relaxed">
                  ARCO Communication is an independent software application and is not owned, operated, sponsored, or endorsed by Meta Platforms, Inc. WhatsApp is a registered trademark of Meta Platforms, Inc. Your use of WhatsApp services is subject to Meta's own terms and policies, including the 
                  <a href="https://www.whatsapp.com/legal/business-terms/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-semibold ml-1">
                    WhatsApp Business Terms of Service
                  </a>
                  {' '}and the{' '}
                  <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-semibold">
                    WhatsApp Business Policy
                  </a>.
                </p>
              </div>
            </section>

            {/* 6. Data Ownership and Processing */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                Data Ownership and Processing Relationships
              </h2>
              <p>
                We believe firmly in transparent data ownership. Our business customers generally retain full ownership, proprietary rights, and operational custody of all customer records, contact lists, custom variables, and message content submitted or imported into the ARCO platform.
              </p>
              <p>
                Depending on the applicable law and the relationship between ARCO Communication and the customer, ARCO processes customer data strictly in accordance with documented customer instructions and for the explicit purpose of providing the SaaS services. Customers are responsible for ensuring that they possess valid legal grounds, notices, and verifiable consent to collect, upload, and communicate with their end-customers through ARCO.
              </p>
            </section>

            {/* 7. Third-Party Services */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  7
                </span>
                Third-Party Infrastructure and Services
              </h2>
              <p>
                To provide high-availability cloud infrastructure and platform functionality, ARCO Communication relies on reputable cloud hosting and technology providers:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-800">Cloud Computing & Database Infrastructure:</strong> We host backend computing services and managed PostgreSQL databases on Render, and frontend content delivery on Vercel.
                </li>
                <li>
                  <strong className="text-slate-800">Meta WhatsApp Cloud API:</strong> For enterprise message routing, template verification, and delivery reporting.
                </li>
                <li>
                  <strong className="text-slate-800">Authentication Services:</strong> Google OAuth and Firebase Authentication for secure identity verification and one-time password (OTP) delivery where enabled.
                </li>
                <li>
                  <strong className="text-slate-800">E-Commerce Platforms:</strong> Shopify App Bridge and Shopify Webhook infrastructure for merchants connecting their Shopify store catalog, order sync, and customer notifications.
                </li>
              </ul>
              <p>
                We do not transfer data to third parties for marketing, advertising, or unrelated commercial exploitation. Third-party infrastructure providers are restricted to processing data solely to perform their contracted hosting, routing, or processing tasks.
              </p>
            </section>

            {/* 8. Data Security */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  8
                </span>
                Data Security Safeguards
              </h2>
              <p>
                We maintain robust technical, physical, and administrative measures designed to protect information from accidental loss, unauthorized access, disclosure, and alteration. These safeguards include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Encryption in Transit:</strong> All data transmitted between user browsers, our backend servers, and external APIs is encrypted using Transport Layer Security (TLS 1.2 and TLS 1.3 over HTTPS).
                </li>
                <li>
                  <strong>Sensitive Credential Encryption:</strong> Meta Graph API tokens, app secrets, and external integration keys are encrypted server-side using AES-256-CBC cryptography.
                </li>
                <li>
                  <strong>Strict Tenant Isolation:</strong> Database access queries enforce tenant boundary validation (`user_id` / organizational scoping) to prevent unauthorized cross-tenant data access.
                </li>
                <li>
                  <strong>Session Security:</strong> Access to protected API endpoints requires cryptographically signed JSON Web Tokens (JWT) with strict expiration policies.
                </li>
                <li>
                  <strong>Network & Rate Limiting Controls:</strong> Reverse proxy rate limiters, CORS origin restrictions, and security headers safeguard against automated brute-force attacks and abuse.
                </li>
                <li>
                  <strong>Controlled Staff Access:</strong> Internal access to production infrastructure is restricted to authorized engineers on a strict need-to-know basis.
                </li>
              </ul>
            </section>

            {/* 9. Data Storage and Retention */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  9
                </span>
                Data Storage and Retention
              </h2>
              <p>
                We retain account details, communication records, contact lists, and campaign history for as long as your account remains active and in good standing, or as necessary to provide uninterrupted platform functionality.
              </p>
              <p>
                When a business account is cancelled or terminated, we retain associated records only for the duration necessary to satisfy statutory tax, accounting, audit, and dispute resolution obligations, after which data is queued for secure deletion or permanent irreversible anonymization.
              </p>
            </section>

            {/* 10. Data Deletion */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  10
                </span>
                User Data Deletion Rights & Procedures
              </h2>
              <p>
                We believe in providing straightforward, accessible mechanisms for users to manage, disconnect, or permanently delete their personal and business data from ARCO Communication.
              </p>
              <p>
                Customers and registered users may submit a formal data deletion request at any time. For detailed step-by-step instructions on deleting your account, disconnecting WhatsApp credentials, or clearing customer contacts, please visit our dedicated compliance page:
              </p>
              <div className="pt-2">
                <Link
                  to="/data-deletion"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-50 text-red-700 font-bold hover:bg-red-100/80 transition-colors border border-red-200 text-xs sm:text-sm"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>View User Data Deletion Instructions</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                You may also initiate deletion requests by emailing our privacy team directly at{' '}
                <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">
                  contact@arcocommunication.com
                </a>.
              </p>
            </section>

            {/* 11. Cookies and Similar Technologies */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  11
                </span>
                Cookies and Local Storage
              </h2>
              <p>
                ARCO Communication uses cookies and browser local storage strictly for operational, functional, and security purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Authentication Tokens:</strong> Secure session identifiers stored to keep you securely signed in to your dashboard.
                </li>
                <li>
                  <strong>Interface Preferences:</strong> Local settings such as active sidebar navigation states, filter settings, and display modes.
                </li>
                <li>
                  <strong>Security & Protection:</strong> Tokens that prevent Cross-Site Request Forgery (CSRF) and protect session integrity.
                </li>
              </ul>
              <p>
                We do not employ third-party advertising cookies or cross-site behavioral tracking scripts on our application dashboard.
              </p>
            </section>

            {/* 12. User Rights and Choices */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  12
                </span>
                User Rights and Choices
              </h2>
              <p>
                Depending on your geographic location and applicable local data protection regulations, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Right of Access:</strong> The right to request confirmation of whether we process your data and receive a copy thereof.</li>
                <li><strong>Right to Rectification:</strong> The right to correct inaccurate or incomplete profile and business information.</li>
                <li><strong>Right to Erasure:</strong> The right to request the deletion of your account and personal data, subject to legal exceptions.</li>
                <li><strong>Right to Restriction & Objection:</strong> The right to request restrictions on certain processing activities where applicable under relevant law.</li>
                <li><strong>Right to Data Portability:</strong> The right to export contact lists and campaign histories in structured, machine-readable formats (such as CSV).</li>
              </ul>
              <p>
                To exercise any of these rights, contact our privacy desk at{' '}
                <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">
                  contact@arcocommunication.com
                </a>.
              </p>
            </section>

            {/* 13. Children's Privacy */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  13
                </span>
                Children's Privacy
              </h2>
              <p>
                ARCO Communication is an enterprise business communication SaaS platform intended exclusively for commercial and professional use by businesses and authorized adult operators. Our Services are not designed for, marketed to, or directed at children under the age of 18. We do not knowingly solicit or collect personal information from minors.
              </p>
            </section>

            {/* 14. International Data Processing */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  14
                </span>
                International Data Processing
              </h2>
              <p>
                ARCO Communication operates through distributed cloud infrastructure provided by global hosting providers. Information collected through our platform may be stored and processed on servers located outside your home state, province, or country. When data is transferred internationally, we ensure appropriate contractual, technical, and organizational measures are implemented to protect your information.
              </p>
            </section>

            {/* 15. Changes to This Privacy Policy */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-1 border-b border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  15
                </span>
                Changes to This Privacy Policy
              </h2>
              <p>
                We may periodically update this Privacy Policy to reflect enhancements to our platform features, integration changes with Meta WhatsApp APIs, or evolving regulatory requirements. Whenever material modifications are published, we will revise the "Last Updated" and "Effective Date" at the top of this page. Your continued use of the platform following the posting of an updated policy signifies your acknowledgment of the revisions.
              </p>
            </section>



          </div>

          {/* Bottom Navigation Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-semibold text-slate-500">
            <Link to="/terms-of-service" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
              <span>View Terms of Service</span>
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
