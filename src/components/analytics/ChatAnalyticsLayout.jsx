import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2,
  PieChart,
  Users,
  ChevronDown,
  LogOut,
  ExternalLink,
  Info,
  Calendar,
  Filter,
  Download,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import { useOnboarding } from '../../context/OnboardingContext';

export default function ChatAnalyticsLayout({ children, activeTab = 'overview' }) {
  const location = useLocation();
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      
      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Content Shell */}
        <div className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          
          {/* Top Navigation Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb: Dashboard / Support / Chat Analytics */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Support</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Chat Analytics</span>
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

          {/* Body Split: Secondary Analytics Sidebar + Main Analytics View */}
          <div className="flex-1 flex flex-row min-w-0">
            
            {/* Secondary Left Navigation Sidebar */}
            <aside className="w-56 bg-white border-r border-gray-200 p-4 shrink-0 flex flex-col space-y-4 min-h-[calc(100vh-45px)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 px-2 py-1">
                  <PieChart className="w-4 h-4 text-[#0d3b30]" />
                  <span>Conversation Analytics</span>
                </div>
              </div>

              <nav className="space-y-1 text-xs font-medium">
                <Link
                  to="/analytics/overview"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-[#f2fbf6] text-[#0d3b30] font-bold border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Overview</span>
                </Link>

                <Link
                  to="/analytics/agent-performance"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'agent-performance'
                      ? 'bg-[#f2fbf6] text-[#0d3b30] font-bold border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Agent Performance</span>
                </Link>
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 p-6 overflow-y-auto">
              {children}
            </main>

          </div>

        </div>
      </div>

    </div>
  );
}
