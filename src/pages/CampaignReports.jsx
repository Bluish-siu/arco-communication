import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileBarChart,
  Plus,
  ExternalLink,
  ChevronDown,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Layers,
  FileText,
  Mail,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import GenerateReportModal from '../components/reports/GenerateReportModal';

export default function CampaignReports() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';
  const userEmail = user?.email || businessSetup?.email || 'owner@arco.com';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [recentReports, setRecentReports] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleReportGenerated = (reportData) => {
    showToast('Report generated successfully. Report has been sent to your email address.');
    setRecentReports((prev) => [reportData, ...prev]);
  };

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
            
            {/* Breadcrumb: Dashboard / Market / Custom Campaign Reports */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Market</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Custom Campaign Reports</span>
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

          {/* Page Body */}
          <div className="p-6 max-w-[1400px] w-full mx-auto space-y-5">
            
            {/* Header: Icon + Campaign Reports Title + Generate a Report Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center border border-emerald-100">
                  <FileBarChart className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                  Campaign Reports
                </h1>
              </div>

              {/* Action Button: Generate a Report */}
              <button
                type="button"
                onClick={() => setGenerateModalOpen(true)}
                className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Generate a Report</span>
              </button>
            </div>

            {/* Interakt Information Box */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-2xs space-y-1.5 text-xs text-gray-700">
              <p className="leading-relaxed">
                Please click on generate a report to get all the data to your email address -{' '}
                <span className="font-semibold text-gray-900">{userEmail}</span>
              </p>
              <p className="text-gray-500 leading-relaxed">
                For additional information about the reports, please visit our documentation by{' '}
                <a
                  href="#docs"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Documentation: Custom Campaign Reports provide aggregated and detailed delivery metrics.');
                  }}
                  className="text-emerald-800 font-semibold hover:underline"
                >
                  clicking here
                </a>
                .
              </p>
            </div>

            {/* Recent Generated Reports Table (if any generated in session) */}
            {recentReports.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs space-y-0">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">Recently Generated Reports</span>
                  <span className="text-[11px] text-gray-500">{recentReports.length} report(s)</span>
                </div>

                <div className="divide-y divide-gray-100 text-xs">
                  {recentReports.map((r, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-gray-900">
                          {r.reportTitle || r.reportType}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-3">
                          <span>Date Range: {r.dateRange?.type || 'Last 7 days'}</span>
                          <span>•</span>
                          <span>Records: {r.totalRecords || 0}</span>
                          <span>•</span>
                          <span>Sent to: {r.recipientEmail}</span>
                        </div>
                      </div>

                      {r.csv && (
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([r.csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.setAttribute('href', url);
                            link.setAttribute('download', `${r.reportType}_report.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="h-7 px-3 rounded border border-gray-300 hover:bg-gray-50 text-[11px] font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3 h-3 text-emerald-700" />
                          <span>Download CSV</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Generate Report Modal */}
      {generateModalOpen && (
        <GenerateReportModal
          isOpen={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          userEmail={userEmail}
          onReportGenerated={handleReportGenerated}
        />
      )}

    </div>
  );
}
