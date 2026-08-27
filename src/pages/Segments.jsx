import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Filter,
  Plus,
  Search,
  RefreshCw,
  ChevronDown,
  LogOut,
  Trash2,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { segmentsService } from '../services/segmentsService';
import SaveSegmentModal from '../components/contacts/SaveSegmentModal';

export default function Segments() {
  const { user, businessSetup, logout, subscription, trialDaysRemaining } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';
  const navigate = useNavigate();

  // Navigation Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Segments Data
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Save Segment Modal State (Reusing Sales CRM Contacts Segment Builder)
  const [saveSegmentModalOpen, setSaveSegmentModalOpen] = useState(false);
  const [isSavingSegment, setIsSavingSegment] = useState(false);

  // Delete Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest('.profile-container')) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch Segments
  const loadSegments = async () => {
    setLoading(true);
    try {
      const data = await segmentsService.getSegments();
      setSegments(data || []);
    } catch (err) {
      console.error('Failed to load segments:', err);
      showToast('Failed to load segments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegments();
  }, []);

  // Handle Save Segment Submission from Reused SaveSegmentModal
  const handleSaveSegmentSubmit = async ({ name, description, filterType, conditions, logic, whatsappOpted }) => {
    setIsSavingSegment(true);
    try {
      const payload = {
        name,
        description,
        filterType,
        conditions,
        logic,
        whatsappOpted,
      };

      await segmentsService.createSegment(payload);
      showToast(`Saved segment "${name}" created successfully!`);
      setSaveSegmentModalOpen(false);
      await loadSegments();
    } catch (err) {
      showToast(err.message || 'Failed to save segment.', 'error');
    } finally {
      setIsSavingSegment(false);
    }
  };

  // Handle Apply Filter Without Saving from Reused SaveSegmentModal
  const handleApplyWithoutSaving = ({ conditions, logic, whatsappOpted }) => {
    setSaveSegmentModalOpen(false);
    showToast(`Applied ${conditions?.length || 0} filter conditions in Contacts.`);
    navigate('/contacts');
  };

  // Delete Segment
  const handleDeleteSegment = async () => {
    if (!segmentToDelete) return;
    try {
      await segmentsService.deleteSegment(segmentToDelete.id);
      showToast('Segment deleted successfully');
      setDeleteConfirmOpen(false);
      setSegmentToDelete(null);
      loadSegments();
    } catch (err) {
      showToast('Failed to delete segment', 'error');
    }
  };

  // Filtered Segments
  const filteredSegments = segments.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term) ||
      s.createdBy?.toLowerCase().includes(term)
    );
  });

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

      {/* Main Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Workspace Content Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          
          {/* Top Header Navigation */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb: Dashboard / Market / Segments */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Market</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Segments</span>
            </div>

            {/* Profile & Controls */}
            <div className="flex items-center gap-3">
              {/* Trial Plan Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <span className="font-bold">{subscription?.planName || 'Trial Plan'}</span>
                <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {trialDaysRemaining} Days Left
                </span>
              </div>

              <div className="relative profile-container">
                <button
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
          <div className="p-6 max-w-[1400px] w-full mx-auto space-y-4">
            
            {/* Header: Title + Subtitle + Create New Segment Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                  Segments
                </h1>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Create & update audience segments
                </p>
              </div>

              {/* + Create New Segment Button (Interakt Dark Green Button) */}
              <button
                type="button"
                onClick={() => setSaveSegmentModalOpen(true)}
                className="h-8 px-3.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Create New Segment</span>
              </button>
            </div>

            {/* Filter / Search Bar (when segments exist) */}
            {segments.length > 0 && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="relative w-72">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search segments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={loadSegments}
                  className="h-8 w-8 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer shadow-2xs"
                  title="Refresh Segments"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}

            {/* Content: Loading | Empty State | Table */}
            {loading ? (
              <div className="border border-gray-200 rounded bg-white min-h-[360px] flex flex-col items-center justify-center p-12 space-y-3">
                <RefreshCw className="w-7 h-7 text-[#0d3b30] animate-spin" />
                <p className="text-xs font-semibold text-gray-500">Loading audience segments...</p>
              </div>
            ) : segments.length === 0 ? (
              /* Interakt Empty State */
              <div className="border border-gray-200 rounded bg-white min-h-[420px] flex flex-col items-center justify-center p-12 text-center space-y-3.5 shadow-2xs">
                
                {/* Circular Segment Icon */}
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3b30]">
                  <Filter className="w-7 h-7 stroke-[1.75]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">No Segments Yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                    Create segments to organize and filter your contacts more efficiently.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSaveSegmentModalOpen(true)}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create New Segment</span>
                </button>

              </div>
            ) : (
              /* Segments List Table */
              <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600">
                        <th className="py-2.5 px-4 font-semibold">Segment Name</th>
                        <th className="py-2.5 px-4 font-semibold">Estimated Reach</th>
                        <th className="py-2.5 px-4 font-semibold">Filter Criteria</th>
                        <th className="py-2.5 px-4 font-semibold">Created By</th>
                        <th className="py-2.5 px-4 font-semibold">Last Updated</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                      {filteredSegments.map((seg) => (
                        <tr key={seg.id} className="hover:bg-gray-50/70 transition-colors">
                          
                          {/* Segment Name + Description */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900 text-xs">{seg.name}</div>
                            {seg.description && (
                              <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                                {seg.description}
                              </div>
                            )}
                          </td>

                          {/* Estimated Reach */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Users className="w-3 h-3" />
                              {seg.estimatedCount || 0} contacts
                            </span>
                          </td>

                          {/* Filter Criteria */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1 max-w-sm">
                              {Array.isArray(seg.conditions) && seg.conditions.length > 0 ? (
                                seg.conditions.map((c, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-mono border border-gray-200"
                                  >
                                    {c.category === 'tag'
                                      ? `Tag ${c.operator || 'is'} "${c.value}"`
                                      : c.category === 'event'
                                      ? `Event: ${c.event}`
                                      : `${c.field} ${c.operator || 'is'} ${c.value}`}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic text-[11px]">All Contacts</span>
                              )}
                            </div>
                          </td>

                          {/* Created By */}
                          <td className="py-3 px-4 text-gray-700">
                            {seg.createdBy || 'Shraddha Sharma'}
                          </td>

                          {/* Last Updated */}
                          <td className="py-3 px-4 text-gray-500 text-[11px]">
                            {seg.updatedAt ? new Date(seg.updatedAt).toLocaleDateString() : 'Recently'}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Open in Contacts Hub */}
                              <Link
                                to={`/contacts?segment=${encodeURIComponent(seg.name)}`}
                                className="p-1.5 rounded hover:bg-gray-100 text-emerald-700 transition-colors"
                                title="View Contacts in Hub"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSegmentToDelete(seg);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete Segment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Reused Sales CRM Contacts Segment Builder Modal */}
      <SaveSegmentModal
        isOpen={saveSegmentModalOpen}
        onClose={() => setSaveSegmentModalOpen(false)}
        onApplyWithoutSaving={handleApplyWithoutSaving}
        onSaveSegment={handleSaveSegmentSubmit}
        isSaving={isSavingSegment}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && segmentToDelete && (
        <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 space-y-3 text-xs font-sans text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-sm text-gray-900">Delete Segment?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{segmentToDelete.name}"</span>? Saved contacts won't be deleted.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setSegmentToDelete(null);
                }}
                className="h-8 px-3 rounded border border-gray-300 hover:bg-gray-50 font-medium text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSegment}
                className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
