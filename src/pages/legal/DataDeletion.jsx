import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, Mail, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import Container from '../../components/common/Container';

export default function DataDeletion() {
  const lastUpdated = 'August 20, 2026';

  return (
    <div className="py-12 sm:py-20 bg-slate-50/50 text-slate-800">
      <Container>
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Data Privacy & Control</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              User Data Deletion Instructions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Last Updated: <span className="font-semibold text-slate-700">{lastUpdated}</span>
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600">
            
            {/* Overview */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">1</span>
                Overview & Commitment
              </h2>
              <p>
                At <strong>[Registered Business Name]</strong> ("ARCO Communication"), we respect your privacy and provide transparent mechanisms for you to manage, disconnect, or permanently delete your account and associated data from our systems.
              </p>
              <p>
                In compliance with Meta Platform Policies and applicable data protection regulations, this page outlines what data can be deleted and the exact steps to submit a deletion request.
              </p>
            </section>

            {/* What Can Be Deleted */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">2</span>
                What Data Can Be Deleted
              </h2>
              <p>Upon receiving a verified deletion request, ARCO will delete or anonymize:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ARCO Account Profile
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Your name, login email, password hash, and company profile.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Meta & WhatsApp Integration
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Encrypted Meta access tokens, WABA IDs, and phone number links.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Contacts & Lead Lists
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Customer contacts, phone numbers, tags, and CRM segments stored on ARCO.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Message History & Broadcast Logs
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Stored conversation threads, broadcast campaign history, and delivery metrics.
                  </p>
                </div>
              </div>
            </section>

            {/* Difference between Disconnecting and Deleting */}
            <section className="space-y-3 p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950">
              <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Important: Disconnecting WhatsApp vs. Full Account Deletion</span>
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Disconnecting WhatsApp:</strong> You can disconnect your WhatsApp Business Account at any time from your ARCO Dashboard (under <em>Quick Setup Actions → Disconnect</em>). This revokes ARCO's access to your WhatsApp account without deleting your ARCO account history.
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Full Account Deletion:</strong> Permanently removes your entire ARCO user account, contact records, and all associated database records.
              </p>
            </section>

            {/* How to Request Deletion */}
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">3</span>
                How to Request Account & Data Deletion
              </h2>
              <p>To request permanent deletion of your ARCO account and data, follow these steps:</p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Submit an Email Request</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Send an email from your registered ARCO account email address to{' '}
                      <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">
                        contact@arcocommunication.com
                      </a>{' '}
                      with the subject line: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">Data Deletion Request</code>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Provide Account Verification Details</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Include your registered company name, account email, and whether you wish to delete only the connected WhatsApp integration or the entire ARCO account.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Verification and Confirmation</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Our support team will verify your identity, process the deletion across our database, and send a final confirmation email once deletion is complete.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Processing Timeline */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">4</span>
                Processing Timeline
              </h2>
              <p>
                We process verified data deletion requests within <strong>[Within 30 Days]</strong> of receipt. Once processed, the action is irreversible and deleted data cannot be recovered.
              </p>
            </section>

            {/* Third-Party Data (Meta Platforms) */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">5</span>
                Third-Party Data on Meta Platforms
              </h2>
              <p>
                Please note that deleting data from ARCO does not delete your underlying Meta Business Account, WhatsApp Business Account (WABA), or phone number registration hosted on Meta's infrastructure. To manage or delete your assets directly on Meta, please use the Meta Business Manager and Meta WhatsApp Manager portals.
              </p>
            </section>

            {/* Contact for Privacy */}
            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center">6</span>
                Contact Information
              </h2>
              <p>
                For any questions regarding data deletion or privacy inquiries, please contact our data privacy team:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p><strong>Entity:</strong> [Registered Business Name]</p>
                <p><strong>Privacy Email:</strong> <a href="mailto:contact@arcocommunication.com" className="text-red-600 font-semibold hover:underline">contact@arcocommunication.com</a></p>
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
            <Link to="/terms-of-service" className="hover:text-red-600 font-semibold flex items-center gap-1">
              <span>View Terms of Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
}
