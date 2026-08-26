import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  PhoneForwarded,
  Sparkles,
  Play,
  Pause,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Volume2,
  Calendar,
  Clock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Check,
  ChevronDown,
  MessageSquare,
  FileText,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

export default function VoiceAiCallGenie() {
  const [data, setData] = useState({ config: null, calls: [] });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Selected Credit Tier
  const [creditsTier, setCreditsTier] = useState('100 call credits');

  // Interactive Audio Player State
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Inbound Call Simulator Modal
  const [isCallSimModalOpen, setIsCallSimModalOpen] = useState(false);
  const [simCallerName, setSimCallerName] = useState('Pooja Hegde');
  const [simCallerPhone, setSimCallerPhone] = useState('+91 98765 43210');
  const [simInquiryTopic, setSimInquiryTopic] = useState('Inquiry for WhatsApp API & Automated Workflows for 50 agents');
  const [simCallbackPref, setSimCallbackPref] = useState('Today at 5:30 PM');
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await automationService.getVoiceAiData();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load Voice AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateCallSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!simCallerName.trim() || !simCallerPhone.trim()) {
      alert('Please enter caller name and phone number');
      return;
    }

    setIsSimulatingCall(true);
    try {
      await automationService.simulateInboundVoiceCall({
        caller_name: simCallerName.trim(),
        caller_phone: simCallerPhone.trim(),
        inquiry_topic: simInquiryTopic.trim(),
        callback_preference: simCallbackPref.trim(),
      });
      showToast('Voice AI answered call and generated CRM Lead in ARCO!');
      setIsCallSimModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to simulate voice call');
    } finally {
      setIsSimulatingCall(false);
    }
  };

  const togglePlayAudio = (id) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 relative font-sans">
      <DashboardSidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-row pl-14 sm:pl-16 transition-all duration-200">
        
        {/* Secondary Sub Navigation Sidebar */}
        <AutomationSubNav />

        {/* Page Main Work Area */}
        <div className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">
          <div className="p-6 md:p-10 max-w-5xl w-full mx-auto space-y-12">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Top Bar Action */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">Voice AI Agent — Inbound Receptionist</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-slate-700" />
                  <span>Test Simulator</span>
                </button>

                <button
                  onClick={() => setIsCallSimModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <PhoneForwarded className="w-3.5 h-3.5" />
                  <span>Simulate Inbound Call</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 1: HERO OVERVIEW */}
            {/* ========================================================================= */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
              
              {/* Dual Brand Icon Badges */}
              <div className="flex items-center justify-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">✕</span>
                <div className="w-9 h-9 rounded-xl bg-[#0d3b30] text-white flex items-center justify-center shadow-xs font-black text-sm">
                  A
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Turn Missed Calls into Leads — <span className="text-emerald-700">Right Inside ARCO</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  MyCallGenie's AI receptionist answers calls you miss, captures customer details, and <span className="font-semibold text-slate-900">pushes leads directly into ARCO</span> — all on autopilot.
                </p>
              </div>

              {/* 2-Column Hero Details: Features on Left, How it Works on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6 text-left">
                
                {/* Left: Value Propositions */}
                <div className="space-y-3 pl-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <PhoneCall className="w-3 h-3" />
                    </div>
                    <span>AI answers calls 24×7</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span>Leads auto-pushed to ARCO CRM</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Phone className="w-3 h-3" />
                    </div>
                    <span>Works on your existing personal number</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 pt-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                    <span>Built by your trusted team at <span className="font-bold text-slate-900">ARCO</span></span>
                  </div>
                </div>

                {/* Right: How It Works Flow */}
                <div className="space-y-2 text-center md:text-left">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    How It Works
                  </div>

                  <div className="flex items-center justify-between gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    
                    {/* Node 1 */}
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center mx-auto shadow-2xs border border-slate-200">
                        <PhoneCall className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-700">Missed Call</div>
                    </div>

                    <span className="text-slate-400 text-xs">→</span>

                    {/* Node 2 */}
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-2xs border border-purple-200">
                        <Headphones className="w-4 h-4 text-purple-700" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-700">MyCallGenie Answers</div>
                    </div>

                    <span className="text-slate-400 text-xs">→</span>

                    {/* Node 3 */}
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0d3b30] flex items-center justify-center mx-auto shadow-2xs border border-emerald-200">
                        <MessageSquare className="w-4 h-4 text-[#0d3b30]" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-700">Lead Captured</div>
                    </div>

                    <span className="text-slate-400 text-xs">→</span>

                    {/* Node 4 */}
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-white flex items-center justify-center mx-auto shadow-2xs font-bold text-xs">
                        A
                      </div>
                      <div className="text-[10px] font-bold text-slate-700">Lead in ARCO</div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* ========================================================================= */}
            {/* SECTION 2: FULL CONTEXT ATTRIBUTES */}
            {/* ========================================================================= */}
            <div className="bg-[#f7faf8] border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-2xs">
              <div className="text-xs font-bold text-slate-900">
                Every lead comes with <span className="text-emerald-700 font-extrabold">full context</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Caller Name</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone Number</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Summary</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Callback Date</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Callback Time</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Additional Notes</span>
                </div>

              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsCallSimModalOpen(true)}
                  className="px-6 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs shadow-2xs cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 3: HEAR IT IN ACTION AUDIO PLAYER CARDS */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Hear It In <span className="text-emerald-700">Action</span>
                </h2>
                <p className="text-xs text-slate-500">Tap the orb to play real AI-handled calls</p>
              </div>

              <div className="space-y-3.5">
                
                {/* Audio Card 1: AI Receptionist */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-all">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-emerald-100 text-[#0d3b30] flex items-center justify-center text-[10px] font-bold">
                          💼
                        </div>
                        <span className="text-xs font-bold text-slate-900">AI Receptionist</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Business • Travel
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Gradient Orb Play Button */}
                      <button
                        onClick={() => togglePlayAudio('audio_1')}
                        className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-400 text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      >
                        {playingAudioId === 'audio_1' ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-blue-600 rounded-full ${playingAudioId === 'audio_1' ? 'w-2/3 transition-all duration-1000' : 'w-0'}`} />
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">0:00 / 1:31</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">AI SUMMARY</div>
                      <p className="text-slate-700 leading-relaxed">
                        Jay enquired about Switzerland tour packages, 20-27 March for 3 people, with Skiing & Hiking. No fixed budget. Assistant assured the team will follow up with great options soon.
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">Sent via • App • WhatsApp</span>
                  </div>
                </div>

                {/* Audio Card 2: Personal Assistant */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-all">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-bold">
                          👤
                        </div>
                        <span className="text-xs font-bold text-slate-900">Personal Assistant</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Personal • Busy Mode
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Gradient Orb Play Button */}
                      <button
                        onClick={() => togglePlayAudio('audio_2')}
                        className="w-12 h-12 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-500 to-pink-400 text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      >
                        {playingAudioId === 'audio_2' ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-purple-600 rounded-full ${playingAudioId === 'audio_2' ? 'w-1/2 transition-all duration-1000' : 'w-0'}`} />
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">0:00 / 0:43</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">AI SUMMARY</div>
                      <p className="text-slate-700 leading-relaxed">
                        Caller wanted to discuss with Amit about going to the gym tomorrow and whose car to take. They requested a callback within 30 min.
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">Sent via • App • WhatsApp</span>
                  </div>
                </div>

                {/* Audio Card 3: Spam Shield */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-all">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                          🛡️
                        </div>
                        <span className="text-xs font-bold text-slate-900">Spam Shield</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Spam • Scam Call
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Gradient Orb Play Button */}
                      <button
                        onClick={() => togglePlayAudio('audio_3')}
                        className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      >
                        {playingAudioId === 'audio_3' ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-amber-600 rounded-full ${playingAudioId === 'audio_3' ? 'w-3/4 transition-all duration-1000' : 'w-0'}`} />
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">0:00 / 0:46</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">AI SUMMARY</div>
                      <p className="text-slate-700 leading-relaxed">
                        Assistant detected a credit card sales call. Caller was informed that Arun is busy and will get back to them if interested.
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">Sent via • App • WhatsApp</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 4: SIMPLE PRICING PLAN */}
            {/* ========================================================================= */}
            <div className="space-y-6 pt-4 text-center">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Simple <span className="text-emerald-700">Pricing</span>
                </h2>
              </div>

              {/* Pricing Card */}
              <div className="border border-emerald-300 rounded-2xl p-6 bg-[#f7fcf9] max-w-sm mx-auto space-y-5 shadow-2xs text-left">
                
                <div className="text-center space-y-1 border-b border-emerald-100 pb-4">
                  <h3 className="text-xs font-bold text-slate-700">Business Plan</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">₹300</span>
                    <span className="text-xs text-slate-500 font-medium">/month</span>
                  </div>
                </div>

                {/* Dropdown Selector */}
                <div className="space-y-1">
                  <div className="relative">
                    <select
                      value={creditsTier}
                      onChange={(e) => setCreditsTier(e.target.value)}
                      className="w-full p-2.5 pr-8 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 appearance-none focus:ring-1 focus:ring-[#0d3b30] outline-hidden cursor-pointer"
                    >
                      <option value="100 call credits">100 call credits</option>
                      <option value="250 call credits">250 call credits</option>
                      <option value="500 call credits">500 call credits</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 text-xs text-slate-700 pt-1">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>AI Voice Receptionist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Spam blocking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Call summaries via WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Credits rollover monthly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>ARCO integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Leads pushed to ARCO automatically</span>
                  </div>
                </div>

                {/* Data Passed Per Lead */}
                <div className="pt-3 border-t border-emerald-100 text-[10px] text-slate-500 space-y-2">
                  <div className="font-bold uppercase tracking-wider text-slate-600 text-center">
                    DATA PASSED PER LEAD
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">👤 Caller Name</div>
                    <div className="flex items-center gap-1">📞 Phone Number</div>
                    <div className="flex items-center gap-1">🤖 AI Summary</div>
                    <div className="flex items-center gap-1">📅 Callback Date</div>
                    <div className="flex items-center gap-1">⏰ Callback Time</div>
                    <div className="flex items-center gap-1">📝 Additional Notes</div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setIsCallSimModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SIMULATE INBOUND CALL */}
      {/* ========================================================================= */}
      {isCallSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                Simulate Inbound Voice Call
              </h3>
              <button onClick={() => setIsCallSimModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateCallSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Caller Full Name *</label>
                <input
                  type="text"
                  required
                  value={simCallerName}
                  onChange={(e) => setSimCallerName(e.target.value)}
                  placeholder="e.g. Pooja Hegde"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Caller Phone Number *</label>
                <input
                  type="text"
                  required
                  value={simCallerPhone}
                  onChange={(e) => setSimCallerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Inquiry Topic / Reason for Call</label>
                <textarea
                  rows={2}
                  value={simInquiryTopic}
                  onChange={(e) => setSimInquiryTopic(e.target.value)}
                  placeholder="e.g. Wants demo of WhatsApp automation"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Callback Preference</label>
                <input
                  type="text"
                  value={simCallbackPref}
                  onChange={(e) => setSimCallbackPref(e.target.value)}
                  placeholder="e.g. Today at 5:30 PM"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCallSimModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulatingCall}
                  className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isSimulatingCall ? 'Simulating Call...' : 'Trigger Voice Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Drawer */}
      <AutomationSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

    </div>
  );
}
