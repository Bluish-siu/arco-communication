import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  Plus,
  Play,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Sparkles,
  Tag,
  DollarSign,
  Gift,
  Users,
  MessageCircle,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

const CATEGORIES = [
  { id: 'price_please', label: 'Price Please', icon: DollarSign, emptyLabel: 'Instagram PP Automations' },
  { id: 'giveaway', label: 'Giveaway', icon: Gift, emptyLabel: 'Instagram Giveaway Automations' },
  { id: 'lead_gen', label: 'Lead Gen', icon: Users, emptyLabel: 'Instagram Lead Gen Automations' },
  { id: 'story_replies', label: 'Story Auto-Replies', icon: MessageCircle, emptyLabel: 'Instagram Story Auto-Reply Automations' },
];

export default function InstagramQuickflows() {
  const [quickflows, setQuickflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('price_please');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Modal State: null | { mode: 'create' } | { mode: 'edit', data: item } | { mode: 'delete', data: item }
  const [modalState, setModalState] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('price_please');
  const [formTriggerType, setFormTriggerType] = useState('post_comment');
  const [formKeywords, setFormKeywords] = useState('PRICE, COST, HOW MUCH');
  const [formPostTarget, setFormPostTarget] = useState('all_posts');
  const [formDmResponse, setFormDmResponse] = useState('');
  const [formCollectLead, setFormCollectLead] = useState(true);
  const [formTag, setFormTag] = useState('Instagram Lead');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadQuickflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await automationService.getQuickflows(params);
      if (res?.data) {
        setQuickflows(res.data);
      }
    } catch (err) {
      console.error('Failed to load quickflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuickflows();
  }, [activeCategory, searchQuery]);

  const handleOpenCreate = () => {
    setFormName(
      activeCategory === 'price_please'
        ? 'Price Inquiry Auto-DM'
        : activeCategory === 'giveaway'
        ? 'Giveaway Keyword Entry Flow'
        : activeCategory === 'lead_gen'
        ? 'Lead Qualification Flow'
        : 'Story Mention Instant DM'
    );
    setFormCategory(activeCategory);
    setFormTriggerType(activeCategory === 'story_replies' ? 'story_mention' : 'post_comment');
    setFormKeywords(
      activeCategory === 'price_please'
        ? 'PRICE, COST, HOW MUCH'
        : activeCategory === 'giveaway'
        ? 'WIN, ENTRY, GIVEAWAY'
        : activeCategory === 'lead_gen'
        ? 'INFO, DEMO, SCALE'
        : 'STORY'
    );
    setFormPostTarget('all_posts');
    setFormDmResponse(
      activeCategory === 'price_please'
        ? 'Hey there! Thanks for your interest. Our plans start at ₹999/mo. Check our pricing brochure: https://example.com/pricing'
        : 'Thanks for participating! You are now entered into our contest.'
    );
    setFormCollectLead(true);
    setFormTag(`Instagram - ${activeCategory}`);
    setModalState({ mode: 'create' });
  };

  const handleOpenEdit = (item) => {
    setFormName(item.name || '');
    setFormCategory(item.category || 'price_please');
    setFormTriggerType(item.trigger_type || 'post_comment');
    const kw = Array.isArray(item.trigger_keywords) ? item.trigger_keywords.join(', ') : '';
    setFormKeywords(kw);
    setFormPostTarget(item.post_target || 'all_posts');
    setFormDmResponse(item.dm_response || '');
    setFormCollectLead(item.collect_lead !== false);
    setFormTag(item.lead_tag || 'Instagram Lead');
    setModalState({ mode: 'edit', data: item });
  };

  const handleSaveSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a quickflow name');
      return;
    }
    if (!formDmResponse.trim()) {
      alert('Please enter a DM response message');
      return;
    }

    const keywordList = formKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      name: formName.trim(),
      category: formCategory,
      trigger_type: formTriggerType,
      trigger_keywords: keywordList,
      post_target: formPostTarget,
      dm_response: formDmResponse.trim(),
      collect_lead: formCollectLead,
      lead_tag: formTag.trim(),
    };

    try {
      if (modalState.mode === 'create') {
        await automationService.createQuickflow(payload);
        showToast('Instagram Quickflow activated!');
      } else if (modalState.mode === 'edit') {
        await automationService.updateQuickflow(modalState.data.id, payload);
        showToast('Instagram Quickflow updated!');
      }

      setModalState(null);
      loadQuickflows();
    } catch (err) {
      alert(err.message || 'Failed to save quickflow');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await automationService.toggleQuickflow(item.id);
      showToast(`Toggled status for "${item.name}"`);
      loadQuickflows();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDuplicate = async (item) => {
    try {
      await automationService.duplicateQuickflow(item.id);
      showToast(`Duplicated "${item.name}"`);
      loadQuickflows();
    } catch (err) {
      alert(err.message || 'Failed to duplicate quickflow');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await automationService.deleteQuickflow(modalState.data.id);
      showToast('Quickflow deleted successfully');
      setModalState(null);
      loadQuickflows();
    } catch (err) {
      alert(err.message || 'Failed to delete quickflow');
    }
  };

  const currentCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 relative font-sans">
      <DashboardSidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-row pl-14 sm:pl-16 transition-all duration-200">
        
        {/* Secondary Sub Navigation Sidebar */}
        <AutomationSubNav />

        {/* Page Main Work Area */}
        <div className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">
          <div className="p-6 md:p-8 max-w-6xl w-full space-y-6">
            
            {/* Toast message */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-white flex items-center justify-center shadow-2xs">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-slate-900 leading-tight">Quick Flows for Instagram</h1>
                    <button
                      onClick={() => alert('Opening Instagram Quickflows Video Tutorial...')}
                      className="px-2.5 py-0.5 rounded-full bg-[#fdeeed] text-[#e04f44] border border-[#fbd3d0] font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-[#fcdcd9] transition-colors"
                    >
                      <Play className="w-2.5 h-2.5 fill-[#e04f44]" />
                      <span>Watch Tutorial</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Enable pre-set Instagram quick flows in 3-4 simple steps!{' '}
                    <a href="#learn" className="text-blue-600 hover:underline">Learn more</a>
                  </p>
                </div>
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
                  onClick={handleOpenCreate}
                  className="px-3.5 py-1.5 rounded-lg bg-[#64748b] hover:bg-[#475569] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create new</span>
                </button>
              </div>
            </div>

            {/* Category Tabs Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#e8f6f0] border border-emerald-300 text-[#0d3b30] font-bold shadow-2xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content / Empty State */}
            <div className="pt-8">
              {loading ? (
                <div className="py-24 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30] mx-auto" />
                  <p className="text-xs text-slate-400">Loading Instagram automations...</p>
                </div>
              ) : quickflows.length === 0 ? (
                
                /* Exact Interakt Empty State */
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto">
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {currentCategoryMeta.emptyLabel} you create will be displayed here. Set one up to streamline your post interactions!
                  </p>

                  <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 rounded-lg bg-[#64748b] hover:bg-[#475569] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create new</span>
                  </button>
                </div>

              ) : (

                /* Data Table when items exist */
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                        <th className="py-3 px-4">Flow Name & Trigger</th>
                        <th className="py-3 px-4">Keywords</th>
                        <th className="py-3 px-4">DM Response</th>
                        <th className="py-3 px-4 text-center">Leads Captured</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {quickflows.map((qf) => {
                        const keywords = Array.isArray(qf.trigger_keywords) ? qf.trigger_keywords : [];
                        return (
                          <tr key={qf.id} className="hover:bg-slate-50/50 transition-colors">
                            
                            {/* Name & Target */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-900">{qf.name}</div>
                                <div className="text-[11px] text-slate-400">
                                  Trigger: <span className="text-slate-600 font-semibold">{qf.trigger_type?.replace('_', ' ')}</span> • Target: <span className="text-slate-600 font-semibold">{qf.post_target}</span>
                                </div>
                              </div>
                            </td>

                            {/* Keywords */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1">
                                {keywords.map((kw, kwIdx) => (
                                  <span key={kwIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* DM Response Preview */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="text-slate-600 truncate font-normal">
                                {qf.dm_response}
                              </p>
                            </td>

                            {/* Leads Captured */}
                            <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                              {qf.leads_captured || 0}
                            </td>

                            {/* Status Toggle */}
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleToggleStatus(qf)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  qf.status === 'active'
                                    ? 'bg-[#e8f6f0] text-[#0d3b30] border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {qf.status || 'ACTIVE'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(qf)}
                                  title="Edit quickflow"
                                  className="p-1 rounded-sm text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(qf)}
                                  title="Duplicate quickflow"
                                  className="p-1 rounded-sm text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setModalState({ mode: 'delete', data: qf })}
                                  title="Delete quickflow"
                                  className="p-1 rounded-sm text-slate-400 hover:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT INSTAGRAM QUICKFLOW */}
      {/* ========================================================================= */}
      {(modalState?.mode === 'create' || modalState?.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900">
                {modalState.mode === 'create' ? 'Create Instagram Quickflow' : 'Edit Instagram Quickflow'}
              </h3>
              <button onClick={() => setModalState(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Quickflow Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Price Request Instant DM"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  >
                    <option value="price_please">Price Please</option>
                    <option value="giveaway">Giveaway</option>
                    <option value="lead_gen">Lead Gen</option>
                    <option value="story_replies">Story Auto-Replies</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Trigger Type</label>
                  <select
                    value={formTriggerType}
                    onChange={(e) => setFormTriggerType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  >
                    <option value="post_comment">Comment on Post / Reel</option>
                    <option value="story_mention">Story Mention / Reply</option>
                    <option value="direct_message">Direct Message (DM)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Trigger Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="PRICE, COST, DETAILS, INFO"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Automated Direct Message (DM) *</label>
                <textarea
                  rows={4}
                  required
                  value={formDmResponse}
                  onChange={(e) => setFormDmResponse(e.target.value)}
                  placeholder="Hey there! Thanks for your comment. Here is what you requested..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setModalState(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {modalState.mode === 'create' ? 'Create Quickflow' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {modalState?.mode === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-900">Delete Quickflow?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete quickflow "{modalState.data.name}"?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Delete
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
