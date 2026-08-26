import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Edit2,
  CheckCircle2,
  X,
  Play,
  Share2,
  ChevronRight,
  Info,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

export default function BasicAutomations() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Active edit modal: null | 'working_hours' | 'out_of_office' | 'welcome' | 'delayed'
  const [activeModal, setActiveModal] = useState(null);

  // Working hours edit state
  const [workingDays, setWorkingDays] = useState([]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isWorkingHoursEnabled, setIsWorkingHoursEnabled] = useState(true);

  // Out of office edit state
  const [oooMessage, setOooMessage] = useState('');
  const [oooEnabled, setOooEnabled] = useState(true);

  // Welcome edit state
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);

  // Delayed response edit state
  const [delayedMinutes, setDelayedMinutes] = useState(10);
  const [delayedMessage, setDelayedMessage] = useState('');
  const [delayedEnabled, setDelayedEnabled] = useState(true);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await automationService.getSettings();
      if (res?.data) {
        setSettings(res.data);
        const wh = res.data.working_hours || {};
        setWorkingDays(wh.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        setStartTime(wh.startTime || '10:00');
        setEndTime(wh.endTime || '18:00');
        setIsWorkingHoursEnabled(wh.enabled !== false);

        const ooo = res.data.out_of_office || {};
        setOooMessage(ooo.message || 'Hello! We are currently away outside our regular working hours. We will respond promptly when our office opens!');
        setOooEnabled(ooo.enabled !== false);

        const wm = res.data.welcome_message || {};
        setWelcomeMessage(wm.message || 'Welcome to ARCO Communication! How can our team assist your business today?');
        setWelcomeEnabled(wm.enabled !== false);

        const dr = res.data.delayed_response || {};
        setDelayedMinutes(dr.delayMinutes || 10);
        setDelayedMessage(dr.message || 'Thank you for holding on! Our support agents are currently assisting other inquiries, but we will connect shortly.');
        setDelayedEnabled(dr.enabled !== false);
      }
    } catch (err) {
      console.error('Failed to load automation settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveWorkingHours = async () => {
    try {
      const updated = {
        ...settings,
        workingHours: {
          enabled: isWorkingHoursEnabled,
          timezone: 'Asia/Kolkata',
          days: workingDays,
          startTime,
          endTime,
        },
      };
      await automationService.updateSettings(updated);
      showToast('Working hours schedule saved successfully!');
      setActiveModal(null);
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to update working hours');
    }
  };

  const handleSaveOutOfOffice = async () => {
    try {
      const updated = {
        ...settings,
        outOfOffice: {
          ...settings.out_of_office,
          enabled: oooEnabled,
          message: oooMessage,
        },
      };
      await automationService.updateSettings(updated);
      showToast('Out-of-office message saved!');
      setActiveModal(null);
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to save Out of Office');
    }
  };

  const handleSaveWelcome = async () => {
    try {
      const updated = {
        ...settings,
        welcomeMessage: {
          ...settings.welcome_message,
          enabled: welcomeEnabled,
          message: welcomeMessage,
        },
      };
      await automationService.updateSettings(updated);
      showToast('Welcome message saved!');
      setActiveModal(null);
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to save Welcome message');
    }
  };

  const handleSaveDelayed = async () => {
    try {
      const updated = {
        ...settings,
        delayedResponse: {
          ...settings.delayed_response,
          enabled: delayedEnabled,
          delayMinutes: Number(delayedMinutes),
          message: delayedMessage,
        },
      };
      await automationService.updateSettings(updated);
      showToast('Delayed response settings saved!');
      setActiveModal(null);
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to save Delayed response');
    }
  };

  const toggleDay = (day) => {
    const fullDay = day.length === 3 ? {
      Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday'
    }[day] : day;

    setWorkingDays((prev) =>
      prev.includes(fullDay) || prev.includes(day)
        ? prev.filter((d) => d !== fullDay && d !== day)
        : [...prev, fullDay]
    );
  };

  const formatDaysString = () => {
    if (!workingDays || workingDays.length === 0) return 'Mon, Tue, Wed, Thu, Fri';
    return workingDays
      .map((d) => d.slice(0, 3))
      .join(', ');
  };

  const formatTimeString = (t) => {
    if (!t) return '10am';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    if (hour === 12) return `12pm`;
    if (hour > 12) return `${hour - 12}${m !== '00' ? ':' + m : ''}pm`;
    return `${hour}${m !== '00' ? ':' + m : ''}am`;
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
          
          <div className="p-6 md:p-8 max-w-5xl w-full space-y-6">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mt-0.5">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-base font-bold text-slate-900 leading-tight">Basic Automations</h1>
                  <p className="text-xs text-slate-500">
                    Set up Welcome, OOO & Delayed autoreplies. Know more{' '}
                    <a href="#help" className="text-blue-600 hover:underline">here</a>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3 h-3 fill-slate-700" />
                <span>Test Simulation</span>
              </button>
            </div>

            {/* Setup Your Working Hours Header Block */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900">Setup your working hours</span>
                <button
                  onClick={() => setActiveModal('working_hours')}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Edit working hours"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 pl-6">
                {formatDaysString()} {formatTimeString(startTime)} to {formatTimeString(endTime)}
              </p>
            </div>

            {/* 3 Full-Width Stacked Automation Cards */}
            <div className="space-y-4 pt-1">
              
              {/* Card 1: Out of Office Message */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-all">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Out of Office Message</h3>
                    <button
                      onClick={() => setActiveModal('out_of_office')}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${
                        settings?.out_of_office?.enabled !== false ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {settings?.out_of_office?.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set up your working hours and Out Of Office Message. Please note that the Auto Reply gets triggered for new users and users whose conversation is marked closed.
                  </p>
                </div>

                <div
                  onClick={() => setActiveModal('out_of_office')}
                  className="bg-[#eef9f5] border-t border-emerald-100/70 py-2 px-4 text-center text-xs text-emerald-800 font-medium cursor-pointer hover:bg-emerald-100/60 transition-colors"
                >
                  {settings?.out_of_office?.sentCount || 0} Out of Office Messages sent
                </div>
              </div>

              {/* Card 2: Welcome Message */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-all">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Welcome Message</h3>
                    <button
                      onClick={() => setActiveModal('welcome')}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${
                        settings?.welcome_message?.enabled !== false ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {settings?.welcome_message?.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Configure Greeting message to be triggered when new customers reach out to your business for the first time or existing customers reach out after a period of 24 hours.
                  </p>
                </div>

                <div
                  onClick={() => setActiveModal('welcome')}
                  className="bg-[#eef9f5] border-t border-emerald-100/70 py-2 px-4 text-center text-xs text-emerald-800 font-medium cursor-pointer hover:bg-emerald-100/60 transition-colors"
                >
                  {settings?.welcome_message?.sentCount || 0} Welcome Messages sent
                </div>
              </div>

              {/* Card 3: Delayed Response Message */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-all">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Delayed Response Message</h3>
                    <button
                      onClick={() => setActiveModal('delayed')}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${
                        settings?.delayed_response?.enabled !== false ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {settings?.delayed_response?.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Configure Auto Replies when you are delayed in responding to customer messages. Setup your delay time and the message to be triggered.
                  </p>
                </div>

                <div
                  onClick={() => setActiveModal('delayed')}
                  className="bg-[#eef9f5] border-t border-emerald-100/70 py-2 px-4 text-center text-xs text-emerald-800 font-medium cursor-pointer hover:bg-emerald-100/60 transition-colors"
                >
                  {settings?.delayed_response?.sentCount || 0} Delayed Messages sent
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT WORKING HOURS */}
      {/* ========================================================================= */}
      {activeModal === 'working_hours' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0d3b30]" />
                Setup Your Working Hours
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Active Days of Week</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map((day) => {
                    const isSelected = workingDays.some((d) => d.startsWith(day));
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0d3b30] text-white font-bold shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">Enforce Out of Office Outside These Hours</span>
                <input
                  type="checkbox"
                  checked={isWorkingHoursEnabled}
                  onChange={(e) => setIsWorkingHoursEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0d3b30] rounded-xs cursor-pointer"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWorkingHours}
                className="px-4 py-1.5 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIGURE OUT OF OFFICE */}
      {/* ========================================================================= */}
      {activeModal === 'out_of_office' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900">Configure Out of Office Message</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">Status: Enabled</span>
                <input
                  type="checkbox"
                  checked={oooEnabled}
                  onChange={(e) => setOooEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0d3b30] rounded-xs cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Out of Office Message</label>
                <textarea
                  rows={4}
                  value={oooMessage}
                  onChange={(e) => setOooMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
              </div>
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
                onClick={handleSaveOutOfOffice}
                className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIGURE WELCOME MESSAGE */}
      {/* ========================================================================= */}
      {activeModal === 'welcome' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900">Configure Welcome Greeting</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">Status: Enabled</span>
                <input
                  type="checkbox"
                  checked={welcomeEnabled}
                  onChange={(e) => setWelcomeEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0d3b30] rounded-xs cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Welcome Message</label>
                <textarea
                  rows={4}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
              </div>
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
                onClick={handleSaveWelcome}
                className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIGURE DELAYED RESPONSE */}
      {/* ========================================================================= */}
      {activeModal === 'delayed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900">Configure Delayed Response</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">Status: Enabled</span>
                <input
                  type="checkbox"
                  checked={delayedEnabled}
                  onChange={(e) => setDelayedEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0d3b30] rounded-xs cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Delay Threshold (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={delayedMinutes}
                  onChange={(e) => setDelayedMinutes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Delayed Message</label>
                <textarea
                  rows={4}
                  value={delayedMessage}
                  onChange={(e) => setDelayedMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
              </div>
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
                onClick={handleSaveDelayed}
                className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Save
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
