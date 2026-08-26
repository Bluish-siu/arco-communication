import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart,
  BarChart2,
  Calendar,
  Filter,
  Download,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Info,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import ChatAnalyticsLayout from '../components/analytics/ChatAnalyticsLayout';
import { analyticsService } from '../services/analyticsService';

export default function ConversationAnalyticsOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters State
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [dateRangeType, setDateRangeType] = useState('last7days');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [dateError, setDateError] = useState('');

  // Dropdown visibility
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const eventRef = useRef(null);
  const tagRef = useRef(null);
  const dateRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (eventRef.current && !eventRef.current.contains(e.target)) setEventDropdownOpen(false);
      if (tagRef.current && !tagRef.current.contains(e.target)) setTagDropdownOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Specified 9 Tags in exact order
  const availableTags = [
    'Recovered',
    'Order Placed(Prepaid)',
    'Order Placed(CoD)',
    'Loyal',
    'Lost',
    'High Spenders',
    'Curious Browsers',
    'At Risk',
    'Abandoned Cart',
  ];

  // Specified Events
  const availableEvents = [
    { id: 'all', label: 'All Events' },
    { id: 'phone_updated', label: 'Phone Number Updated' },
    { id: 'flow_completed', label: 'Flow Completed' },
    { id: 'ctwa', label: 'CTWA' },
  ];

  // Date Range Validation
  useEffect(() => {
    if (dateRangeType === 'custom') {
      if (!customFrom || !customTo) {
        setDateError('Please select From and To dates');
        return;
      }
      const from = new Date(customFrom);
      const to = new Date(customTo);
      if (from > to) {
        setDateError('From date cannot be after To date');
        return;
      }
      setDateError('');
    } else {
      setDateError('');
    }
  }, [dateRangeType, customFrom, customTo]);

  // Load Overview Data
  const loadOverviewData = async () => {
    if (dateError) return;
    setLoading(true);
    try {
      const res = await analyticsService.getConversationOverview({
        dateRange: dateRangeType,
        from: customFrom || undefined,
        to: customTo || undefined,
        event: selectedEvent,
        tags: selectedTags,
      });
      setData(res);
    } catch (err) {
      console.warn('Failed to load conversation analytics overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, [selectedEvent, selectedTags, dateRangeType, customFrom, customTo]);

  // Toggle Tag Selection
  const toggleTag = (t) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((item) => item !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  // Export Analytics Data
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await analyticsService.exportAnalytics({
        type: 'overview',
        dateRange: dateRangeType,
        from: customFrom,
        to: customTo,
        event: selectedEvent,
        tags: selectedTags,
      });

      if (res?.data?.csv) {
        const blob = new Blob([res.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.data.filename || 'conversation_overview.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Conversation analytics data exported successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const autoMsg = data?.automationMessages || {
    outOfOffice: 0,
    welcomeMessage: 0,
    delayedMessage: 0,
    workflowConversations: 0,
    customAutoReplies: 0,
  };

  const kpis = data?.kpis || {
    totalConversations: 0,
    responded: 0,
    resolved: 0,
    closedWithoutResponse: 0,
  };

  const timing = data?.timing || {
    firstResponseTimeFormatted: '0 sec',
    avgResponseTimeFormatted: '0 sec',
    resolutionTimeFormatted: '0 sec',
    hasGraphData: false,
    chartData: [],
  };

  return (
    <ChatAnalyticsLayout activeTab="overview">
      
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

      <div className="space-y-5 max-w-[1280px] w-full">
        
        {/* Top Header & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Subtitle */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center">
                <PieChart className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Conversation Analytics
              </h1>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Find out if your customers are getting timely responses & getting their issues resolved quickly!{' '}
              <a
                href="#learn-more"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Conversation Analytics helps identify response latency and resolution bottlenecks.');
                }}
                className="text-emerald-800 font-semibold hover:underline"
              >
                Learn More
              </a>
            </p>
          </div>

          {/* Right Filters Bar: Events | Tags | Date Range | Export data */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* 1. Events Dropdown */}
            <div className="relative" ref={eventRef}>
              <button
                type="button"
                onClick={() => {
                  setEventDropdownOpen(!eventDropdownOpen);
                  setTagDropdownOpen(false);
                  setDateDropdownOpen(false);
                }}
                className={`h-8 px-3 rounded border flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedEvent !== 'all'
                    ? 'border-[#0d3b30] bg-[#f2fbf6] text-[#0d3b30] font-semibold'
                    : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>{selectedEvent === 'all' ? 'Events' : availableEvents.find((e) => e.id === selectedEvent)?.label}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {eventDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30 animate-in fade-in duration-100 divide-y divide-gray-100">
                  {availableEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt.id);
                        setEventDropdownOpen(false);
                      }}
                      className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 text-xs ${
                        selectedEvent === evt.id ? 'font-bold text-[#0d3b30] bg-emerald-50/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{evt.label}</span>
                      {selectedEvent === evt.id && <Check className="w-3.5 h-3.5 text-[#0d3b30]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Tags Dropdown */}
            <div className="relative" ref={tagRef}>
              <button
                type="button"
                onClick={() => {
                  setTagDropdownOpen(!tagDropdownOpen);
                  setEventDropdownOpen(false);
                  setDateDropdownOpen(false);
                }}
                className={`h-8 px-3 rounded border flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedTags.length > 0
                    ? 'border-[#0d3b30] bg-[#f2fbf6] text-[#0d3b30] font-semibold'
                    : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Filter className="w-3 h-3 text-gray-400" />
                <span>{selectedTags.length === 0 ? 'Tags' : `${selectedTags.length} tags`}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {tagDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in duration-100 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select Tags
                  </div>
                  {availableTags.map((t) => (
                    <div
                      key={t}
                      onClick={() => toggleTag(t)}
                      className="px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 text-xs text-gray-800"
                    >
                      <span className="truncate pr-2">{t}</span>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(t)}
                        onChange={() => {}}
                        className="rounded text-[#0d3b30] focus:ring-0 cursor-pointer"
                      />
                    </div>
                  ))}
                  {selectedTags.length > 0 && (
                    <div className="p-2 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedTags([])}
                        className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Date Range Dropdown */}
            <div className="relative" ref={dateRef}>
              <button
                type="button"
                onClick={() => {
                  setDateDropdownOpen(!dateDropdownOpen);
                  setEventDropdownOpen(false);
                  setTagDropdownOpen(false);
                }}
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 text-gray-700 cursor-pointer shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="capitalize">{dateRangeType === 'last7days' ? 'Last 7 days' : dateRangeType === 'last30days' ? 'Last 30 days' : dateRangeType}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {dateDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in duration-100">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: 'last7days', label: 'Last 7 days' },
                    { id: 'last30days', label: 'Last 30 days' },
                    { id: 'custom', label: 'Custom Date' },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setDateRangeType(opt.id);
                        if (opt.id !== 'custom') setDateDropdownOpen(false);
                      }}
                      className={`px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 text-xs ${
                        dateRangeType === opt.id ? 'font-bold text-[#0d3b30] bg-emerald-50/40' : 'text-gray-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {dateRangeType === opt.id && <Check className="w-3.5 h-3.5 text-[#0d3b30]" />}
                    </div>
                  ))}

                  {dateRangeType === 'custom' && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50 space-y-2 mt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">From</label>
                        <input
                          type="date"
                          value={customFrom}
                          onChange={(e) => setCustomFrom(e.target.value)}
                          className="w-full h-7 px-2 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">To</label>
                        <input
                          type="date"
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-full h-7 px-2 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setDateDropdownOpen(false)}
                        className="w-full h-6 bg-[#0d3b30] text-white text-[10px] font-bold rounded cursor-pointer mt-1"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Export Data Button */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportData}
              className="h-8 px-3.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              {isExporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3 text-emerald-700" />}
              <span>Export data</span>
            </button>

          </div>
        </div>

        {/* Yellow Informational Alert */}
        <div className="bg-[#fffbeb] border border-[#fef08a] rounded-lg p-3 text-xs text-amber-900 flex items-center gap-2.5 shadow-2xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-relaxed">
            To get meaningful insights, ensure that your team members close chats
          </span>
        </div>

        {/* Section 1: Automation Messages Sent */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-gray-900 tracking-tight">
            Automation Messages Sent
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
            
            <div className="space-y-1">
              <div className="text-[11px] text-gray-500">Out of Office Message</div>
              <div className="text-lg font-bold text-gray-900">{autoMsg.outOfOffice}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-gray-500">Welcome Message</div>
              <div className="text-lg font-bold text-gray-900">{autoMsg.welcomeMessage}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-gray-500">Delayed Message</div>
              <div className="text-lg font-bold text-gray-900">{autoMsg.delayedMessage}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-gray-500 leading-tight">Workflow Conversations for WhatsApp</div>
              <div className="text-lg font-bold text-gray-900">{autoMsg.workflowConversations}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-gray-500 leading-tight">Custom Auto Replies for WhatsApp</div>
              <div className="text-lg font-bold text-gray-900">{autoMsg.customAutoReplies}</div>
            </div>

          </div>
        </div>

        {/* Section 2: Conversation KPI Cards (Total Conversations | Responded | Resolved) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-gray-500">Total Conversations</span>
            <div className="text-2xl font-bold text-gray-900">{kpis.totalConversations}</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-gray-500">Responded</span>
            <div className="text-2xl font-bold text-gray-900">{kpis.responded}</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-gray-500">Resolved</span>
            <div className="text-2xl font-bold text-gray-900">{kpis.resolved}</div>
            {kpis.closedWithoutResponse > 0 && (
              <p className="text-[10px] text-gray-400 pt-0.5">
                {kpis.closedWithoutResponse} were closed without response
              </p>
            )}
          </div>

        </div>

        {/* Section 3: Response & Resolution Time Metric Cards (With Charts / Graph Not Available) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Wait Time for 1st Agent Response */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">
                Wait Time for 1st Agent Response
              </span>
              <div className="text-2xl font-bold text-gray-900">
                {timing.firstResponseTimeFormatted}
              </div>
            </div>

            {timing.hasGraphData && timing.chartData.length > 0 ? (
              <div className="h-28 flex items-end justify-between gap-1 pt-4 border-t border-gray-100">
                {timing.chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      style={{ height: `${Math.min(100, Math.max(15, d.waitTime))}%` }}
                      className="w-full bg-emerald-600/80 rounded-t hover:bg-emerald-600 transition-colors"
                      title={`${d.label}: ${d.waitTime}s`}
                    />
                    <span className="text-[9px] text-gray-400">{d.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center text-[11px] text-gray-400 italic">
                Graph not available
              </div>
            )}
          </div>

          {/* Card 2: Average Wait Time for Agent Responses */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">
                Average Wait Time for Agent Responses
              </span>
              <div className="text-2xl font-bold text-gray-900">
                {timing.avgResponseTimeFormatted}
              </div>
            </div>

            {timing.hasGraphData && timing.chartData.length > 0 ? (
              <div className="h-28 flex items-end justify-between gap-1 pt-4 border-t border-gray-100">
                {timing.chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      style={{ height: `${Math.min(100, Math.max(15, d.avgWait))}%` }}
                      className="w-full bg-blue-600/80 rounded-t hover:bg-blue-600 transition-colors"
                      title={`${d.label}: ${d.avgWait}s`}
                    />
                    <span className="text-[9px] text-gray-400">{d.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center text-[11px] text-gray-400 italic">
                Graph not available
              </div>
            )}
          </div>

          {/* Card 3: Resolution Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">
                Resolution Time
              </span>
              <div className="text-2xl font-bold text-gray-900">
                {timing.resolutionTimeFormatted}
              </div>
            </div>

            {timing.hasGraphData && timing.chartData.length > 0 ? (
              <div className="h-28 flex items-end justify-between gap-1 pt-4 border-t border-gray-100">
                {timing.chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      style={{ height: `${Math.min(100, Math.max(15, (d.resolutionTime / 1000) * 100))}%` }}
                      className="w-full bg-teal-700/80 rounded-t hover:bg-teal-700 transition-colors"
                      title={`${d.label}: ${Math.round(d.resolutionTime / 60)}m`}
                    />
                    <span className="text-[9px] text-gray-400">{d.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center text-[11px] text-gray-400 italic">
                Graph not available
              </div>
            )}
          </div>

        </div>

      </div>

    </ChatAnalyticsLayout>
  );
}
