import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  RotateCw,
  Scale,
  Plus,
  Info,
  Check,
  X,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  LogOut,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Users,
  RefreshCw,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { chatAssignmentService } from '../services/chatAssignmentService';

export default function ChatAssignment() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    defaultRule: 'round_robin', // 'round_robin' | 'equal_load' | 'none'
    assignOnlyOnline: true,
    reassignOffline: false,
  });

  // Custom Rules State
  const [rules, setRules] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);

  // Drawer / Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrait, setRuleTrait] = useState('tag');
  const [ruleCondition, setRuleCondition] = useState('contains');
  const [ruleValues, setRuleValues] = useState([]);
  const [valueInput, setValueInput] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);

  // Inner Agent Selection Drawer / Overlay
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState('');
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);

  // Delete Confirmation Modal
  const [deletingRuleId, setDeletingRuleId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Data on Mount
  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, rulesData, agentsData] = await Promise.all([
        chatAssignmentService.getSettings(),
        chatAssignmentService.getRules(),
        chatAssignmentService.getAgents(),
      ]);

      if (settingsData) setSettings(settingsData);
      if (Array.isArray(rulesData)) setRules(rulesData);
      if (Array.isArray(agentsData)) setAvailableAgents(agentsData);
    } catch (err) {
      console.warn('Failed to load chat assignment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Settings in PostgreSQL
  const handleUpdateSetting = async (updatedFields) => {
    const newSettings = { ...settings, ...updatedFields };
    setSettings(newSettings);
    try {
      await chatAssignmentService.updateSettings(newSettings);
      showToast('Assignment settings updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    }
  };

  // Toggle Default Rule
  const handleSelectDefaultRule = (ruleKey) => {
    const nextRule = settings.defaultRule === ruleKey ? 'none' : ruleKey;
    handleUpdateSetting({ defaultRule: nextRule });
  };

  // Open Drawer for New Rule
  const handleOpenNewRule = () => {
    setEditingRuleId(null);
    setRuleName('');
    setRuleTrait('tag');
    setRuleCondition('contains');
    setRuleValues([]);
    setValueInput('');
    setSelectedAgents([]);
    setIsAgentDrawerOpen(false);
    setIsDrawerOpen(true);
  };

  // Open Drawer to Edit Rule
  const handleOpenEditRule = (rule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setRuleTrait(rule.trait);
    setRuleCondition(rule.condition);
    setRuleValues(rule.values || []);
    setValueInput('');
    setSelectedAgents(rule.assignedAgents || []);
    setIsAgentDrawerOpen(false);
    setIsDrawerOpen(true);
  };

  // Handle Add Value Chip on Enter Key
  const handleValueKeyDown = (e) => {
    if (e.key === 'Enter' && valueInput.trim()) {
      e.preventDefault();
      const trimmed = valueInput.trim();
      if (!ruleValues.includes(trimmed)) {
        setRuleValues([...ruleValues, trimmed]);
      }
      setValueInput('');
    }
  };

  // Remove Value Chip
  const handleRemoveValue = (val) => {
    setRuleValues(ruleValues.filter((v) => v !== val));
  };

  // Toggle Single Agent in Inner Drawer
  const handleToggleAgent = (agent) => {
    const exists = selectedAgents.some((a) => a.id === agent.id);
    if (exists) {
      setSelectedAgents(selectedAgents.filter((a) => a.id !== agent.id));
    } else {
      setSelectedAgents([...selectedAgents, { id: agent.id, name: agent.name, email: agent.email }]);
    }
  };

  // Toggle All Agents in Inner Drawer
  const handleToggleAllAgents = () => {
    if (selectedAgents.length === availableAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(availableAgents.map((a) => ({ id: a.id, name: a.name, email: a.email })));
    }
  };

  // Save Custom Rule
  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      showToast('Please enter a Chat Assignment Name', 'error');
      return;
    }
    if (ruleValues.length === 0) {
      showToast('Please add at least one trait value (press Enter key)', 'error');
      return;
    }
    if (selectedAgents.length === 0) {
      showToast('Please select at least one agent for this rule', 'error');
      return;
    }

    setIsSubmittingRule(true);
    try {
      const payload = {
        name: ruleName.trim(),
        trait: ruleTrait,
        condition: ruleCondition,
        values: ruleValues,
        assignedAgents: selectedAgents,
        isActive: true,
      };

      if (editingRuleId) {
        await chatAssignmentService.updateRule(editingRuleId, payload);
        showToast('Custom assignment rule updated successfully!');
      } else {
        await chatAssignmentService.createRule(payload);
        showToast('Custom assignment rule created successfully!');
      }

      setIsDrawerOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save rule', 'error');
    } finally {
      setIsSubmittingRule(false);
    }
  };

  // Delete Rule
  const handleDeleteRule = async () => {
    if (!deletingRuleId) return;
    try {
      await chatAssignmentService.deleteRule(deletingRuleId);
      showToast('Custom assignment rule deleted successfully!');
      setDeletingRuleId(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete rule', 'error');
    }
  };

  // Toggle Rule Active State
  const handleToggleRuleActive = async (rule) => {
    try {
      await chatAssignmentService.updateRule(rule.id, {
        ...rule,
        isActive: !rule.isActive,
      });
      showToast(`Rule ${!rule.isActive ? 'activated' : 'deactivated'} successfully!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to toggle rule', 'error');
    }
  };

  const filteredAgents = availableAgents.filter(
    (a) =>
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(agentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-3.5 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-gray-900 text-white border-gray-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Content Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          
          {/* Top Navigation Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb: Dashboard / Support / Chat Assignment */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Support</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Chat Assignment</span>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative profile-container">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-gray-100 font-semibold text-gray-900 truncate">
                      {userName}
                    </div>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

          </header>

          {/* Main Page Body */}
          <div className="p-6 max-w-[1100px] w-full mx-auto space-y-6">
            
            {/* Header: Icon + Title + Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Chat Assignment
                </h1>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Control how incoming conversations are routed to your agents.
              </p>
            </div>

            {/* Blue Information Banner */}
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 text-xs text-blue-900 shadow-2xs space-y-1">
              <div className="font-bold flex items-center gap-2 text-blue-950">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>When does Chat Assignment apply?</span>
              </div>
              <p className="text-blue-900/90 leading-relaxed pl-6 text-[11px]">
                Only when a brand-new customer sends their first message, or when a conversation moves from Closed → Open. Assignment does not trigger mid-conversation.
              </p>
            </div>

            {/* Section 1: Default Assignment Rule */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-gray-900">
                  Default Assignment Rule
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Optionally select a default rule to distribute conversations that don't match any custom rule below. Leave both unselected to rely purely on custom rules.
                </p>
                <div className="text-[11px] font-semibold text-gray-400 pt-1 uppercase tracking-wider">
                  Select one (optional)
                </div>
              </div>

              {/* 2 Selectable Cards Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                
                {/* CARD 1: Round Robin */}
                <div
                  onClick={() => handleSelectDefaultRule('round_robin')}
                  className={`rounded-xl border p-4.5 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    settings.defaultRule === 'round_robin'
                      ? 'border-[#0d3b30] bg-[#f2fbf6] shadow-xs ring-1 ring-[#0d3b30]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4 text-[#0d3b30]" />
                        <h3 className="font-bold text-xs text-gray-900">Round Robin</h3>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.defaultRule === 'round_robin'}
                        onChange={() => {}}
                        className="rounded-full text-[#0d3b30] focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Assigns conversations to agents in a fixed rotation — cycling through each agent one by one, regardless of current workload.
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-800 border-t border-emerald-100/60 pt-2">
                    Best for: Equal turn-taking, predictable rotation.
                  </div>
                </div>

                {/* CARD 2: Equal Load Balancing */}
                <div
                  onClick={() => handleSelectDefaultRule('equal_load')}
                  className={`rounded-xl border p-4.5 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    settings.defaultRule === 'equal_load'
                      ? 'border-[#0d3b30] bg-[#f2fbf6] shadow-xs ring-1 ring-[#0d3b30]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#0d3b30]" />
                        <h3 className="font-bold text-xs text-gray-900">Equal Load Balancing</h3>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.defaultRule === 'equal_load'}
                        onChange={() => {}}
                        className="rounded-full text-[#0d3b30] focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Each new conversation goes to the agent with the fewest open chats at that moment, keeping workloads balanced dynamically.
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-800 border-t border-emerald-100/60 pt-2">
                    Best for: Busy teams with uneven availability.
                  </div>
                </div>

              </div>

              {settings.defaultRule === 'none' && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  No default selected. Conversations that don't match a custom rule below will be left unassigned.
                </p>
              )}

              {/* Toggles */}
              <div className="pt-3 border-t border-gray-100 space-y-3 text-xs">
                
                {/* Toggle 1: Assign only to Online agents */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-lg">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span>Assign only to Online agents</span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-[11px]">
                      Skip agents who are Away or Offline when applying the rule above
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateSetting({ assignOnlyOnline: !settings.assignOnlyOnline })}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.assignOnlyOnline ? 'bg-[#0d3b30]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.assignOnlyOnline ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Reassign offline agent */}
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5 max-w-lg">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span>Reassign chat to another agent as soon as assigned agent goes offline</span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-[11px]">
                      Automatically re-route pending open chats when an agent's status shifts to Offline
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateSetting({ reassignOffline: !settings.reassignOffline })}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.reassignOffline ? 'bg-[#0d3b30]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.reassignOffline ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

              </div>

            </div>

            {/* Section 2: Custom Assignment Rules */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-gray-900">
                    Custom Assignment Rules
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Route specific conversations to agents based on contact fields or tags. Custom rules are always evaluated before the default rule above.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenNewRule}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Rule</span>
                </button>
              </div>

              {/* Rules List OR Empty State */}
              {rules.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center shadow-xs">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-gray-900">
                      Assign chats to agents conditionally
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm">
                      Create rules based on contact tags, phone numbers, or custom attributes to direct VIPs and inquiries to specific specialists.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewRule}
                    className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create your first rule</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {rules.map((rule) => (
                    <div key={rule.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 p-2 rounded-lg transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{rule.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rule.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs flex items-center gap-1.5 flex-wrap">
                          <span>If</span>
                          <span className="font-semibold text-gray-800 uppercase text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{rule.trait}</span>
                          <span className="italic">{rule.condition}</span>
                          <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                            {Array.isArray(rule.values) ? rule.values.join(', ') : rule.values}
                          </span>
                          <span>→ Assign to:</span>
                          <span className="font-semibold text-gray-900">
                            {Array.isArray(rule.assignedAgents) ? rule.assignedAgents.map((a) => a.name).join(', ') : 'Assigned Agents'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleRuleActive(rule)}
                          className="text-xs text-gray-500 hover:text-gray-900 font-semibold px-2 py-1 cursor-pointer"
                        >
                          {rule.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditRule(rule)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                          title="Edit Rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingRuleId(rule.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </main>
      </div>

      {/* RIGHT-SIDE SETUP DRAWER (Dimmed Overlay) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Dimmed Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in"
          />

          {/* Slide-in Drawer */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <h2 className="font-bold text-sm text-gray-900">
                  {editingRuleId ? 'Edit Chat Assignment' : 'Setup Chat Assignment'}
                </h2>
              </div>

              <button
                type="button"
                disabled={isSubmittingRule}
                onClick={handleSaveRule}
                className="h-7 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                {isSubmittingRule ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Save</span>}
              </button>
            </div>

            {/* Drawer Form Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
              
              {/* Chat Assignment Name */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-800">
                  Chat Assignment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Enter a unique chat assignment name"
                  className="w-full h-8 px-3 rounded border border-gray-300 text-xs bg-white focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Rule Card */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4">
                
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <span className="text-[#0d3b30]">Rule Condition</span>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-gray-700">If</span>

                  {/* User Trait Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-500">User Trait</label>
                    <select
                      value={ruleTrait}
                      onChange={(e) => setRuleTrait(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                    >
                      <option value="tag">Tag</option>
                      <option value="name">Contact Name</option>
                      <option value="phone">Phone Number</option>
                      <option value="email">Email</option>
                      <option value="channel">Channel</option>
                      <option value="country">Country</option>
                      <option value="city">City</option>
                    </select>
                  </div>

                  {/* Condition Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-500">Condition</label>
                    <select
                      value={ruleCondition}
                      onChange={(e) => setRuleCondition(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                    >
                      <option value="contains">contains</option>
                      <option value="does_not_contain">does not contain</option>
                      <option value="equals">equals</option>
                      <option value="not_equals">not equals</option>
                      <option value="starts_with">starts with</option>
                      <option value="ends_with">ends with</option>
                    </select>
                  </div>

                  {/* Enter values for trait with Chips */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-500">
                      Enter values for the trait <span className="text-red-500">*</span>
                    </label>
                    
                    <input
                      type="text"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                      onKeyDown={handleValueKeyDown}
                      placeholder="Type here & press enter"
                      className="w-full h-8 px-3 rounded border border-gray-300 text-xs bg-white focus:outline-none focus:border-gray-400"
                    />
                    <p className="text-[10px] text-gray-400 italic">Press Enter key to add value</p>

                    {/* Chips Display */}
                    {ruleValues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {ruleValues.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold"
                          >
                            <span>{val}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveValue(val)}
                              className="hover:text-red-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Select Agents Button */}
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-gray-800">Assigned Agents</label>
                      <button
                        type="button"
                        onClick={() => setIsAgentDrawerOpen(true)}
                        className="text-xs font-bold text-[#0d3b30] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Select agents →</span>
                      </button>
                    </div>

                    {selectedAgents.length === 0 ? (
                      <div
                        onClick={() => setIsAgentDrawerOpen(true)}
                        className="p-3 border border-dashed border-gray-300 rounded-lg text-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        Click "Select agents →" to assign agents
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAgents.map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-xs"
                          >
                            <div className="w-3.5 h-3.5 rounded-full bg-[#0d3b30] text-white text-[8px] flex items-center justify-center font-bold">
                              {a.name.charAt(0)}
                            </div>
                            <span>{a.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Inner Nested Agent Selector Drawer */}
            {isAgentDrawerOpen && (
              <div className="absolute inset-0 bg-white z-20 flex flex-col justify-between animate-in slide-in-from-right duration-150">
                
                {/* Agent Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-sm text-gray-900">Agent</h3>
                  <button
                    type="button"
                    onClick={() => setIsAgentDrawerOpen(false)}
                    className="h-7 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-bold rounded shadow-2xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                {/* Search & All Agents Checkbox */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={agentSearch}
                      onChange={(e) => setAgentSearch(e.target.value)}
                      placeholder="Search an agent"
                      className="w-full h-8 pl-8 pr-3 rounded border border-gray-300 text-xs bg-white focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={selectedAgents.length === availableAgents.length && availableAgents.length > 0}
                      onChange={handleToggleAllAgents}
                      className="rounded text-[#0d3b30] focus:ring-0 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-gray-900">All Agents</span>
                  </label>
                </div>

                {/* Agent List */}
                <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100">
                  {filteredAgents.map((agent) => {
                    const isChecked = selectedAgents.some((a) => a.id === agent.id);
                    return (
                      <label
                        key={agent.id}
                        onClick={() => handleToggleAgent(agent)}
                        className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-xs flex items-center justify-center">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-gray-900">{agent.name}</div>
                            <div className="text-[10px] text-gray-400">{agent.email}</div>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#0d3b30] focus:ring-0 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Delete Rule Confirmation Modal */}
      {deletingRuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-gray-900">Delete Custom Rule</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete this custom assignment rule? Incoming chats will fall back to the default rule.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingRuleId(null)}
                className="h-8 px-3 rounded border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRule}
                className="h-8 px-4 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
