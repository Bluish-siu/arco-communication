import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Search,
  Check,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  Mail,
  FileBarChart,
} from 'lucide-react';
import { reportsService } from '../../services/reportsService';

export default function GenerateReportModal({
  isOpen,
  onClose,
  userEmail = 'owner@arco.com',
  onReportGenerated,
}) {
  if (!isOpen) return null;

  // Report Type: 'summary' | 'detailed' | 'ctwa' | ''
  const [reportType, setReportType] = useState('summary');
  const [tooltipText, setTooltipText] = useState(null);

  // Date Range
  const [dateRangeType, setDateRangeType] = useState('last7days');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [dateError, setDateError] = useState('');

  // Additional Filters Accordion
  const [additionalFiltersOpen, setAdditionalFiltersOpen] = useState(false);
  const [campaignType, setCampaignType] = useState('all'); // 'all' | 'onetime' | 'ongoing' | 'api'

  // Campaign Selector Drawer / Panel inside modal
  const [campaignDrawerOpen, setCampaignDrawerOpen] = useState(false);
  const [campaignsList, setCampaignsList] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState('');
  const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);

  // Submission & Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Campaigns for Selector
  useEffect(() => {
    async function loadCampaigns() {
      setLoadingCampaigns(true);
      try {
        const data = await reportsService.getCampaignsForReports({
          search: campaignSearch,
          campaignType: campaignType === 'all' ? undefined : campaignType,
        });
        setCampaignsList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Failed to load campaigns for selector:', err);
      } finally {
        setLoadingCampaigns(false);
      }
    }
    if (isOpen) {
      loadCampaigns();
    }
  }, [isOpen, campaignSearch, campaignType]);

  // Date Range Validation (Enforce 31-day max limit)
  useEffect(() => {
    if (dateRangeType === 'custom') {
      if (!customFrom || !customTo) {
        setDateError('Please select both From and To dates');
        return;
      }
      const from = new Date(customFrom);
      const to = new Date(customTo);

      if (from > to) {
        setDateError('From date cannot be after To date');
        return;
      }

      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 31) {
        setDateError('Custom date range cannot exceed 31 days (Interakt limit)');
        return;
      }

      setDateError('');
    } else {
      setDateError('');
    }
  }, [dateRangeType, customFrom, customTo]);

  // Toggle Campaign Selection
  const toggleCampaignSelection = (id) => {
    if (selectedCampaignIds.includes(id)) {
      setSelectedCampaignIds(selectedCampaignIds.filter((item) => item !== id));
    } else {
      setSelectedCampaignIds([...selectedCampaignIds, id]);
    }
  };

  // Select / Deselect All Campaigns
  const handleSelectAllCampaigns = () => {
    if (selectedCampaignIds.length === campaignsList.length && campaignsList.length > 0) {
      setSelectedCampaignIds([]);
    } else {
      setSelectedCampaignIds(campaignsList.map((c) => c.id));
    }
  };

  // Format Campaign Name Field Label
  const getCampaignFieldLabel = () => {
    if (selectedCampaignIds.length === 0) return 'All';
    if (selectedCampaignIds.length === 1) {
      const match = campaignsList.find((c) => c.id === selectedCampaignIds[0]);
      return match ? match.name : '1 campaign';
    }
    return `${selectedCampaignIds.length} campaigns`;
  };

  // Submit & Generate Report
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!reportType) {
      setErrorMessage('Please select a report type');
      return;
    }
    if (dateError) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        reportType,
        dateRange: {
          type: dateRangeType,
          from: customFrom || undefined,
          to: customTo || undefined,
        },
        campaignType,
        campaignIds: selectedCampaignIds,
        email: userEmail,
      };

      const res = await reportsService.generateReport(payload);

      // Auto-trigger CSV download for convenience if CSV exists
      if (res?.data?.csv) {
        const blob = new Blob([res.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `${res.data.reportType}_campaign_report_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (onReportGenerated) {
        onReportGenerated(res.data);
      }

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Unable to generate report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(reportType && !dateError && (!dateRangeType === 'custom' || (customFrom && customTo)));

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-2xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      
      {/* Modal Container (Widens when Campaign Drawer is open) */}
      <div
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-200 max-h-[90vh] ${
          campaignDrawerOpen ? 'w-full max-w-[880px]' : 'w-full max-w-[500px]'
        }`}
      >
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center">
              <FileBarChart className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Generate Report</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Split into Left (Form) and Right (Campaigns Drawer) */}
        <div className="flex-1 flex flex-row min-h-0 divide-x divide-gray-200 overflow-hidden">
          
          {/* Left Column: Form Configuration */}
          <form
            onSubmit={handleGenerateReport}
            className="flex-1 p-5 space-y-4 overflow-y-auto text-xs font-sans text-gray-800"
          >
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Select the type of report */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900">
                Select the type of report
              </label>

              <div className="space-y-2 pt-0.5">
                {[
                  {
                    id: 'summary',
                    label: 'Campaign Summary Report',
                    info: 'Aggregated metrics for all selected campaigns: attempts, sent, delivered, read, and failed counts.',
                  },
                  {
                    id: 'detailed',
                    label: 'Campaign Detailed Report',
                    info: 'Customer-level campaign delivery and click logs including phone numbers and timestamps.',
                  },
                  {
                    id: 'ctwa',
                    label: 'CTWA Ad Campaign Detailed Report',
                    info: 'Detailed metrics and performance data for Click-to-WhatsApp Meta Ads campaigns.',
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                      reportType === opt.id
                        ? 'border-[#0d3b30] bg-[#f2fbf6]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="reportType"
                        checked={reportType === opt.id}
                        onChange={() => setReportType(opt.id)}
                        className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-gray-900">{opt.label}</span>
                    </div>

                    <div className="relative group">
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={opt.info}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Date Range */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-gray-900">Date Range</label>
              
              <div className="relative">
                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={dateRangeType}
                    onChange={(e) => setDateRangeType(e.target.value)}
                    className="w-full h-8 pl-9 pr-8 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none focus:border-gray-400 cursor-pointer"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 days</option>
                    <option value="last30days">Last 30 days</option>
                    <option value="custom">Custom Date</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Pickers */}
              {dateRangeType === 'custom' && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200 grid grid-cols-2 gap-2.5 mt-2 animate-in fade-in duration-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Date Error Banner */}
              {dateError && (
                <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                  <span>{dateError}</span>
                </p>
              )}
            </div>

            {/* 3. Additional Filters (Collapsible Accordion) */}
            <div className="border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setAdditionalFiltersOpen(!additionalFiltersOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-gray-700 cursor-pointer py-1"
              >
                <span>Additional Filters</span>
                {additionalFiltersOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {additionalFiltersOpen && (
                <div className="space-y-3 pt-2 animate-in fade-in duration-100">
                  {/* Campaign Type */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600">Campaign Type</label>
                    <select
                      value={campaignType}
                      onChange={(e) => setCampaignType(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All</option>
                      <option value="onetime">OneTime</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="api">API Campaign</option>
                    </select>
                  </div>

                  {/* Campaign Name Selector Action */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600">Campaign Name</label>
                    <button
                      type="button"
                      onClick={() => setCampaignDrawerOpen(!campaignDrawerOpen)}
                      className={`w-full h-8 px-3 rounded border flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                        campaignDrawerOpen
                          ? 'border-[#0d3b30] bg-[#f2fbf6] text-[#0d3b30]'
                          : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <span className="truncate">{getCampaignFieldLabel()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Bottom Action: Email Report Button */}
            <div className="pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full h-9 bg-[#0d3b30] hover:bg-[#154d3f] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Report</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Right Column: Campaigns Selector Drawer / Panel */}
          {campaignDrawerOpen && (
            <div className="w-[360px] flex flex-col bg-white overflow-hidden animate-in slide-in-from-right duration-150">
              
              {/* Drawer Header */}
              <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/70 shrink-0">
                <span className="font-bold text-xs text-gray-900">Campaigns</span>
                <button
                  type="button"
                  onClick={() => setCampaignDrawerOpen(false)}
                  className="h-6 px-3 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-[11px] font-semibold rounded cursor-pointer shadow-2xs"
                >
                  Done
                </button>
              </div>

              {/* Drawer Search */}
              <div className="p-2.5 border-b border-gray-100 shrink-0">
                <div className="relative">
                  <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search a campaign"
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    className="w-full h-7 pl-7 pr-2 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Campaigns Items List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-xs">
                
                {/* Select All Option */}
                <div
                  onClick={handleSelectAllCampaigns}
                  className="px-3.5 py-2.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer font-semibold text-gray-800"
                >
                  <span>All Campaigns</span>
                  <input
                    type="checkbox"
                    checked={selectedCampaignIds.length === campaignsList.length && campaignsList.length > 0}
                    onChange={handleSelectAllCampaigns}
                    className="rounded text-[#0d3b30] focus:ring-0 cursor-pointer"
                  />
                </div>

                {loadingCampaigns ? (
                  <div className="p-8 text-center text-gray-400 space-y-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto text-[#0d3b30]" />
                    <p className="text-[11px]">Loading campaigns...</p>
                  </div>
                ) : campaignsList.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-1.5">
                    <Search className="w-5 h-5 mx-auto text-gray-300" />
                    <p className="text-xs font-semibold text-gray-600">No result found</p>
                  </div>
                ) : (
                  campaignsList.map((camp) => {
                    const isSelected = selectedCampaignIds.includes(camp.id);
                    return (
                      <div
                        key={camp.id}
                        onClick={() => toggleCampaignSelection(camp.id)}
                        className={`px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#f2fbf6]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-xs text-gray-900 truncate">{camp.name}</div>
                          <div className="text-[10px] text-gray-400 capitalize">
                            {camp.type} • {camp.recipients || 0} recipients
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCampaignSelection(camp.id)}
                          className="rounded text-[#0d3b30] focus:ring-0 cursor-pointer shrink-0"
                        />
                      </div>
                    );
                  })
                )}

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
