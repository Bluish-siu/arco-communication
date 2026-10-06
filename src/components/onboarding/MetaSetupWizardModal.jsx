import React, { useState, useRef } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Upload,
  FileText,
  Globe,
  ExternalLink,
  HelpCircle,
  RotateCw,
  Sparkles,
  Smartphone,
  Server,
  Zap,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { metaService } from '../../services/metaService';

// Meta Logo Contextual SVG
const MetaIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// WhatsApp Logo Contextual SVG
const WhatsAppIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function MetaSetupWizardModal({
  isOpen,
  onClose,
  onLaunchMetaPopup,
  isConnecting = false,
  error = '',
  onFastConnectOfficial = null,
}) {
  const [step, setStep] = useState(1);
  const [numberType, setNumberType] = useState('wa_business'); // 'wa_business' | 'new_number'
  const [country, setCountry] = useState('India');
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [gstFile, setGstFile] = useState(null);
  const [uploadingGst, setUploadingGst] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle GST File Selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadError('Invalid format. Supported: PDF, JPEG, JPG & PNG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    setUploadingGst(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await metaService.uploadGstCertificate({
            fileName: file.name,
            fileType: file.type,
            fileData: reader.result,
            fileSize: file.size,
          });
          setGstFile({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            id: res?.data?.fileId || 'gst_' + Date.now(),
          });
        } catch (err) {
          setUploadError(err.message || 'Failed to upload GST certificate.');
        } finally {
          setUploadingGst(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('Error reading file.');
      setUploadingGst(false);
    }
  };

  const handleProceedStep1 = (type) => {
    setNumberType(type);
    setStep(2);
  };

  const handleConnectWithMeta = (withoutVerification = false) => {
    onLaunchMetaPopup({
      numberType,
      country,
      isAlreadyVerified,
      withoutVerification,
      gstFile,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        
        {/* ========================================================================= */}
        {/* TOP MODAL HEADER BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Go back to Step 1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Step {step} of 2
              </span>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {step === 1 ? 'WhatsApp Business API' : 'Business Verification'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Notice if any */}
        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: 2 WAYS TO SETUP WHATSAPP API NUMBER */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                2 Ways to Setup WhatsApp API Number
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                You can connect your number in two ways. Here's how they differ.
              </p>
            </div>

            {/* Side-by-Side 2 Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              
              {/* Option 1: WA Business App Number */}
              <div className="flex flex-col rounded-2xl border-2 border-purple-200/80 bg-purple-50/20 hover:border-purple-300 transition-all overflow-hidden shadow-2xs">
                {/* Header Badge */}
                <div className="p-4 bg-purple-100/60 border-b border-purple-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-purple-900">
                      WA Business App Number
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-md">
                    Co-existence
                  </span>
                </div>

                {/* Comparison Specifications */}
                <div className="p-5 flex-1 space-y-4 text-xs text-slate-700">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Requirements Before Connecting
                    </span>
                    <ul className="space-y-1 text-slate-600 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>A number registered on WhatsApp Business App version <strong>2.24.4+</strong></span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>GST Certificate or Active Website needed for verification</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Number
                    </span>
                    <p className="font-semibold text-slate-900">No new number needed</p>
                    <p className="text-[11px] text-slate-500">Use your existing WhatsApp Business App number</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      App Usage
                    </span>
                    <p className="font-semibold text-slate-900">Continue using WhatsApp Business App</p>
                    <p className="text-[11px] text-slate-500">Messages sync bi-directionally between ARCO & phone app</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Broadcasts (from ARCO)
                    </span>
                    <p className="font-semibold text-amber-700">Slower Broadcast Speeds</p>
                    <p className="text-[11px] text-slate-500">Broadcast to 10,000 contacts could take up to an hour to send</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Catalog
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Catalog must be created in WhatsApp mobile app. Can't be created via APIs / CSV / no sync with Shopify.
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Chat Automations
                    </span>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Possible to use Chatbots & AI Agents for customer replies.
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Groups, Status & Calling
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Groups, Status, and Calling continue to be available on WA Business App.
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Display Name
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Customers see your name only if they saved your number.
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-4 bg-purple-50/60 border-t border-purple-200/60">
                  <button
                    type="button"
                    onClick={() => handleProceedStep1('wa_business')}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Proceed with WA business</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Option 2: New Number (Pure Cloud API) */}
              <div className="flex flex-col rounded-2xl border-2 border-blue-200/80 bg-blue-50/20 hover:border-blue-300 transition-all overflow-hidden shadow-2xs">
                {/* Header Badge */}
                <div className="p-4 bg-blue-100/60 border-b border-blue-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-blue-900">
                      New Number
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded-md">
                    High Speed Cloud API
                  </span>
                </div>

                {/* Comparison Specifications */}
                <div className="p-5 flex-1 space-y-4 text-xs text-slate-700">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Requirements Before Connecting
                    </span>
                    <ul className="space-y-1 text-slate-600 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Fresh number not active on WA Personal/Business</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Must be able to receive OTP via call or SMS</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>GST Certificate or Active Website needed for verification</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-blue-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Number
                    </span>
                    <p className="font-semibold text-slate-900">Requires a fresh phone number</p>
                    <p className="text-[11px] text-slate-500">Cannot be already registered on personal/business WhatsApp</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-blue-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      App Usage
                    </span>
                    <p className="font-semibold text-slate-900">Fully Cloud API-based</p>
                    <p className="text-[11px] text-slate-500">Manage everything inside ARCO — no physical phone app needed</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-blue-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Broadcasts (from ARCO)
                    </span>
                    <p className="font-semibold text-emerald-700">Faster Broadcast Speeds</p>
                    <p className="text-[11px] text-slate-500">Broadcast to 10,000 contacts takes only a few minutes to send</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-blue-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Catalog
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Catalog can be created via APIs / CSVs. Direct sync with Shopify & Commerce Manager supported.
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-blue-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Chat Automations
                    </span>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Possible to use Chatbots & AI Agents for customer replies.
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-blue-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Groups, Status & Calling
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Groups & Status sharing not available. High-volume Cloud VoIP calling supported from ARCO.
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-blue-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Display Name
                    </span>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      After business verification: Customers see your business name even if they haven't saved your number!
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-4 bg-blue-50/60 border-t border-blue-200/60">
                  <button
                    type="button"
                    onClick={() => handleProceedStep1('new_number')}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Proceed with New Number</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Optional Fast-Connect for Admin / Official Branding Catalyst */}
            {onFastConnectOfficial && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-slate-400">
                  Admin pre-configured gateway:
                </span>
                <button
                  type="button"
                  onClick={onFastConnectOfficial}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 cursor-pointer"
                >
                  Fast Connect Official Account (+91 96199 81755) ↗
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: VERIFY YOUR BUSINESS (INTERAKT REPLICA) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Title & Badge */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Verify Your Business
                </h2>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Recommended
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Verification helps increase your messaging limits and improves trust.
              </p>
            </div>

            {/* Value Proposition Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <span className="text-xs font-bold text-emerald-950 block">
                Why Verification is Important:
              </span>
              <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Messaging limit increases from <strong>250 → 1,000</strong> customers per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your business display name becomes visible to customers, even if they haven't saved your number</span>
                </li>
              </ul>
            </div>

            {/* Country Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                BUSINESS COUNTRY
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Singapore">Singapore</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            {/* Checkbox: Already Verified by Meta */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isAlreadyVerified}
                onChange={(e) => setIsAlreadyVerified(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  My business is already verified by Meta
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Select this if you have already completed Meta Business Verification in Meta Business Suite.
                </span>
              </div>
            </label>

            {/* Verification Method Cards */}
            {!isAlreadyVerified && (
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Verification Method
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: GST Certificate */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/10 hover:border-emerald-500 space-y-3 transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Verify using GST Certificate
                      </h4>
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Fastest
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500">
                      <p className="flex items-center gap-1.5 text-slate-700">
                        <span>⏱</span> Takes a few minutes to a few hours
                      </p>
                      <p className="flex items-start gap-1.5">
                        <span>📄</span> Supported file formats: PDF, JPEG, JPG & PNG (Don't use screenshots)
                      </p>
                    </div>

                    {/* Upload button or preview */}
                    <div className="pt-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />

                      {gstFile ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">{gstFile.name}</p>
                              <p className="text-[10px] text-emerald-700 font-semibold">{gstFile.size} • Uploaded</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer shrink-0"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingGst}
                          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-400 bg-white hover:bg-emerald-50/50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                        >
                          {uploadingGst ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                              <span>Uploading GST...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Upload GST Certificate</span>
                            </>
                          )}
                        </button>
                      )}

                      {uploadError && (
                        <p className="text-[10px] font-bold text-red-600 mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Website Domain */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 space-y-3 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Verify using Website Domain
                      </h4>
                      <div className="space-y-1 text-[11px] text-slate-500">
                        <p className="flex items-center gap-1.5 text-slate-700">
                          <span>⏱</span> Takes 3–5 working days
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span>🔗</span> Requires a verifiable website with matching corporate details
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDomainHelp(true)}
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>Watch how to verify</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleConnectWithMeta(true)}
                disabled={isConnecting}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 text-center py-2 cursor-pointer transition-colors"
              >
                Connect without Verification
              </button>

              <button
                type="button"
                onClick={() => handleConnectWithMeta(false)}
                disabled={isConnecting}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md shadow-slate-900/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting via Meta...</span>
                  </>
                ) : (
                  <>
                    <MetaIcon className="w-4 h-4 text-white" />
                    <span>Connect Number</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* DOMAIN VERIFICATION HELP MODAL */}
      {/* ========================================================================= */}
      {showDomainHelp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  How to Verify with Domain
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDomainHelp(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Meta allows verifying business ownership by checking that your website domain belongs to you:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-1 font-medium">
                <li>
                  Open <strong>Meta Business Suite</strong> (<a href="https://business.facebook.com/settings/owned-domains" target="_blank" rel="noreferrer" className="text-blue-600 underline">business.facebook.com</a>).
                </li>
                <li>
                  Navigate to <strong>Brand Safety & Suitability → Domains</strong>.
                </li>
                <li>
                  Click <strong>Add Domain</strong> and copy the DNS TXT record provided by Meta.
                </li>
                <li>
                  Add the TXT record to your DNS manager (Cloudflare, GoDaddy, Namecheap) and click <strong>Verify Domain</strong>.
                </li>
              </ol>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                💡 <strong>Tip:</strong> If you have an Indian GST certificate, uploading your GST certificate in Step 2 is 10x faster (approved in 1–4 hours) than domain verification.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDomainHelp(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
            >
              Got it, continue setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
