import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Globe,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Trash2,
  Sparkles,
  Search,
  RefreshCw,
  X,
  Send,
  Sliders,
  Settings,
  Info,
  Check,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

export default function WhatsAppAiAgent() {
  const [config, setConfig] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Active modal: null | 'website' | 'document' | 'fields' | 'personality'
  const [activeModal, setActiveModal] = useState(null);

  // Form Inputs
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);

  // Lead qualification fields state
  const [leadFields, setLeadFields] = useState({
    fullName: true,
    phone: true,
    email: true,
    requirement: true,
    budget: false,
    timeline: false,
  });

  // Personality Form
  const [agentName, setAgentName] = useState('ARCO Leads Agent');
  const [greetingMessage, setGreetingMessage] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [personalityTone, setPersonalityTone] = useState('consultative');
  const [customInstructions, setCustomInstructions] = useState('');

  // Interactive Live Chat Test Box
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Consultative Leads Agent. How can I help your business scale today?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await automationService.getWhatsAppAiAgentData();
      if (res?.data) {
        setConfig(res.data.config || {});
        setSources(res.data.sources || []);

        const c = res.data.config || {};
        setAgentName(c.agent_name || 'ARCO Leads Agent');
        setGreetingMessage(c.greeting_message || 'Hello! I am your AI Consultative Leads Agent.');
        setFallbackMessage(c.fallback_message || 'I am passing your inquiry to our senior team.');
        setPersonalityTone(c.personality_tone || 'consultative');
        setCustomInstructions(c.custom_instructions || '');
        if (c.qualification_fields) {
          setLeadFields(c.qualification_fields);
        }
      }
    } catch (err) {
      console.error('Failed to load AI Agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWebsiteSource = async (e) => {
    if (e) e.preventDefault();
    if (!websiteUrl.trim()) return;

    setIsIndexing(true);
    try {
      await automationService.addTrainingSource({
        source_type: 'website',
        name: new URL(websiteUrl.trim()).hostname || 'Website URL',
        url_or_path: websiteUrl.trim(),
      });
      showToast('Website crawled and indexed into knowledge base!');
      setWebsiteUrl('');
      setActiveModal(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to index website');
    } finally {
      setIsIndexing(false);
    }
  };

  const handleAddDocSource = async (e) => {
    if (e) e.preventDefault();
    if (!docName.trim()) return;

    setIsIndexing(true);
    try {
      await automationService.addTrainingSource({
        source_type: 'document',
        name: docName.trim(),
        content: docContent.trim(),
      });
      showToast('Knowledge document saved and vectorized!');
      setDocName('');
      setDocContent('');
      setActiveModal(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save document');
    } finally {
      setIsIndexing(false);
    }
  };

  const handleDeleteSource = async (id) => {
    try {
      await automationService.deleteTrainingSource(id);
      showToast('Knowledge source removed');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete source');
    }
  };

  const handleSaveFields = async () => {
    try {
      await automationService.updateWhatsAppAiAgentConfig({
        agent_name: agentName,
        greeting_message: greetingMessage,
        fallback_message: fallbackMessage,
        personality_tone: personalityTone,
        custom_instructions: customInstructions,
        qualification_fields: leadFields,
      });
      showToast('Lead qualification parameters updated!');
      setActiveModal(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save fields');
    }
  };

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);

    setIsSendingChat(true);
    try {
      const res = await automationService.testAiAgentChat({
        message: userText,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.response || 'Thank you! A specialist will review your requirement.' },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error connecting to AI Agent engine.' },
      ]);
    } finally {
      setIsSendingChat(false);
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
          
          <div className="p-6 md:p-8 max-w-5xl w-full space-y-5">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">Build Your AI Agent</h1>
                <button
                  onClick={() => alert('Opening AI Agent Video Tutorial...')}
                  className="px-2.5 py-0.5 rounded-full bg-[#fdeeed] text-[#e04f44] border border-[#fbd3d0] font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-[#fcdcd9] transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-[#e04f44]" />
                  <span>Watch Tutorial</span>
                </button>
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
                  onClick={() => setActiveModal('fields')}
                  className="px-4 py-1.5 rounded-lg bg-slate-400 text-white font-bold text-xs cursor-pointer hover:bg-[#0d3b30] transition-colors"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Free Trial Notice Note */}
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-900">🎉 First 7 days are completely free</span> — no charges on any conversations. After your free trial ends, the AI Agent will be paused. Cost after Free Trial: ₹3000/month & ₹0.6 per AI message.
            </div>

            {/* Hero Card: Meet AI Leads Agent */}
            <div className="border border-emerald-200 rounded-xl p-8 bg-[#eef9f5] relative overflow-hidden space-y-6 shadow-2xs">
              
              {/* Top ARCO tag */}
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0d3b30]">
                <div className="w-4 h-4 rounded-sm bg-[#0d3b30] text-white flex items-center justify-center text-[10px] font-black">
                  A
                </div>
                <span>ARCO Communication</span>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="space-y-4 max-w-xl">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Meet AI Leads Agent</h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Automatically identify and qualify potential customers by asking the right questions and capturing key lead details.
                    </p>
                  </div>

                  {/* Training Resources Pills */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      TRAINING RESOURCES
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5">
                      
                      {/* Website URL */}
                      <button
                        onClick={() => setActiveModal('website')}
                        className="px-3.5 py-1.5 rounded-full bg-[#ece8ff] text-[#5e43f3] font-bold text-xs flex items-center gap-1.5 border border-purple-200 hover:bg-[#ded6ff] transition-colors cursor-pointer shadow-2xs"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Website URL</span>
                      </button>

                      {/* Documents */}
                      <button
                        onClick={() => setActiveModal('document')}
                        className="px-3.5 py-1.5 rounded-full bg-[#fff0e5] text-[#e06714] font-bold text-xs flex items-center gap-1.5 border border-orange-200 hover:bg-[#ffe3d1] transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Documents</span>
                      </button>

                      {/* Lead Qualification Fields */}
                      <button
                        onClick={() => setActiveModal('fields')}
                        className="px-3.5 py-1.5 rounded-full bg-[#fdebf3] text-[#c42878] font-bold text-xs flex items-center gap-1.5 border border-pink-200 hover:bg-[#fbd3e5] transition-colors cursor-pointer shadow-2xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Lead Qualification Fields</span>
                      </button>

                    </div>
                  </div>
                </div>

                {/* Robot Illustration / Mascot Graphic */}
                <div className="w-32 h-32 shrink-0 bg-emerald-600/10 rounded-full border-4 border-emerald-200 flex items-center justify-center relative shadow-inner">
                  <Bot className="w-16 h-16 text-[#0d3b30]" />
                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                </div>

              </div>

              {/* Bottom Centered Slider Dots */}
              <div className="flex justify-center items-center gap-1.5 pt-2">
                <span className="w-4 h-1.5 bg-[#0d3b30] rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              </div>

            </div>

            {/* Bottom Notice Banner */}
            <div className="bg-[#f0f7fc] border border-sky-200 rounded-xl p-4 flex items-center gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="text-slate-700">
                <span className="font-bold text-sky-950">Works alongside your existing workflows</span> — Your existing automations always take priority. The AI bot only responds when no other workflow matches.
              </div>
            </div>

            {/* Knowledge Sources & Live Chat Preview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Left: Knowledge Sources List */}
              <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Indexed Knowledge Base ({sources.length})</h3>
                  <button
                    onClick={() => setActiveModal('website')}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + Add Source
                  </button>
                </div>

                {sources.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No sources added yet. Index your website or upload documents to train the agent.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {sources.map((source) => (
                      <div key={source.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {source.source_type === 'website' ? (
                            <Globe className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-orange-600" />
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{source.name}</div>
                            <div className="text-[10px] text-slate-400">{source.tokens_indexed || 120} tokens indexed</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSource(source.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Live Interactive Agent Chat Box */}
              <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Live AI Conversation Test</h3>
                  <p className="text-[11px] text-slate-400">Ask anything to test the agent's qualification logic</p>
                </div>

                {/* Chat window */}
                <div className="h-44 overflow-y-auto p-3 bg-slate-50 rounded-xl space-y-2.5 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`p-2.5 rounded-xl max-w-[80%] ${
                          msg.role === 'user'
                            ? 'bg-[#0d3b30] text-white font-medium'
                            : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="text-[11px] text-slate-400 italic">AI Agent is thinking...</div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a test message (e.g. What is your pricing?)..."
                    className="flex-1 p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0d3b30] outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isSendingChat}
                    className="px-3.5 py-2 rounded-lg bg-[#0d3b30] text-white font-bold text-xs cursor-pointer hover:bg-[#092b23]"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD WEBSITE URL */}
      {/* ========================================================================= */}
      {activeModal === 'website' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                Crawl Website URL
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWebsiteSource} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Website or Documentation URL *</label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com/docs"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIndexing}
                  className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isIndexing ? 'Crawling...' : 'Index Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD DOCUMENTS */}
      {/* ========================================================================= */}
      {activeModal === 'document' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                Upload Document Knowledge
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDocSource} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Document Title *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Product Pricing & FAQs"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Document Content / Text *</label>
                <textarea
                  rows={4}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste FAQ or document contents..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIndexing}
                  className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isIndexing ? 'Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LEAD QUALIFICATION FIELDS */}
      {/* ========================================================================= */}
      {activeModal === 'fields' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-pink-600" />
                Configure Lead Qualification Fields
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500">
                Select which attributes the AI Agent should extract from conversations:
              </p>

              {Object.keys(leadFields).map((fieldKey) => (
                <label key={fieldKey} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium cursor-pointer">
                  <span className="capitalize">{fieldKey.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={leadFields[fieldKey]}
                    onChange={(e) => setLeadFields({ ...leadFields, [fieldKey]: e.target.checked })}
                    className="w-4 h-4 accent-[#0d3b30] rounded-xs"
                  />
                </label>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFields}
                className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Save Fields
              </button>
            </div>
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
