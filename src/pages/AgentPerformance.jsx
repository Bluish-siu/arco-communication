import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Calendar,
  Download,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Info,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import ChatAnalyticsLayout from '../components/analytics/ChatAnalyticsLayout';
import { analyticsService } from '../services/analyticsService';

export default function AgentPerformance() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [toast, setToast] = useState(null);

  // Date Range Filters
  const [dateRangeType, setDateRangeType] = useState('last7days');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [dateError, setDateError] = useState('');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dateRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Load Agent Performance Data
  const loadAgentData = async () => {
    if (dateError) return;
    setLoading(true);
    try {
      const res = await analyticsService.getAgentPerformance({
        dateRange: dateRangeType,
        from: customFrom || undefined,
        to: customTo || undefined,
      });
      setAgents(res?.agents || []);
    } catch (err) {
      console.warn('Failed to load agent performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, [dateRangeType, customFrom, customTo]);

  // Export Agent Performance Data
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await analyticsService.exportAnalytics({
        type: 'agent-performance',
        dateRange: dateRangeType,
        from: customFrom,
        to: customTo,
      });

      if (res?.data?.csv) {
        const blob = new Blob([res.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.data.filename || 'agent_performance.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Agent performance data exported successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to export agent data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ChatAnalyticsLayout activeTab="agent-performance">
      
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Title & Subtitle */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Agent Performance
              </h1>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Find out if your customers are getting timely responses & getting their issues resolved quickly!{' '}
              <a
                href="#learn-more"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Agent Performance metrics show individual team member workloads, response speeds, and resolution counts.');
                }}
                className="text-emerald-800 font-semibold hover:underline"
              >
                Learn More
              </a>
            </p>
          </div>

          {/* Right Filter Bar: Date Range | Export data */}
          <div className="flex items-center gap-2 text-xs">
            
            {/* Date Range Dropdown */}
            <div className="relative" ref={dateRef}>
              <button
                type="button"
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
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

            {/* Export Data Button */}
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

        {/* Agent Performance Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 text-center">Assigned</th>
                  <th className="py-3 px-4 text-center">Responded</th>
                  <th className="py-3 px-4 text-center">
                    <div>Total Resolved</div>
                    <div className="text-[9px] font-normal text-gray-400 normal-case">(Reassigned + Closed)</div>
                  </th>
                  <th className="py-3 px-4 text-center">Reassigned</th>
                  <th className="py-3 px-4 text-center">Closed</th>
                  <th className="py-3 px-4 text-center">1st Response Time</th>
                  <th className="py-3 px-4 text-center">Avg Response Time</th>
                  <th className="py-3 px-4 text-center">Resolution Time</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 space-y-2">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0d3b30]" />
                      <p className="text-xs">Loading agent performance...</p>
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 space-y-1">
                      <Users className="w-6 h-6 mx-auto text-gray-300" />
                      <p className="text-xs font-semibold text-gray-600">No agent performance data found</p>
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {agent.name}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {agent.assigned}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {agent.responded}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#0d3b30]">
                        {agent.totalResolved}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {agent.reassigned}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {agent.closed}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-800">
                        {agent.firstResponseTime}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-blue-800">
                        {agent.avgResponseTime}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">
                        {agent.resolutionTime}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>

      </div>

    </ChatAnalyticsLayout>
  );
}
