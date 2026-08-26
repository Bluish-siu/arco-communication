import React, { useState, useRef, useEffect } from 'react';
import { PieChart, ChevronDown, Check, Users, Plus } from 'lucide-react';

export default function SelectSegmentDropdown({
  savedSegments = [],
  selectedSegmentId = 'all',
  onSelectSegment,
  onOpenSaveSegmentModal,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedSegment = savedSegments.find((s) => s.id === selectedSegmentId);
  const displayText = selectedSegmentId === 'all' || !selectedSegment
    ? 'Select Segment'
    : selectedSegment.name;

  const handleChoose = (id) => {
    onSelectSegment(id);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left text-xs ${className}`}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 inline-flex items-center justify-between gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
      >
        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
          <PieChart className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{displayText}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-slate-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
              Saved Segments
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {savedSegments.length} saved
            </span>
          </div>

          <div className="overflow-y-auto max-h-56 py-1">
            {/* 1. "All Contacts" (Clear / Reset Filter) */}
            <button
              type="button"
              onClick={() => handleChoose('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                selectedSegmentId === 'all'
                  ? 'bg-red-50/70 text-red-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">All Contacts</span>
              </div>
              {selectedSegmentId === 'all' && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
            </button>

            {/* 2. Empty State or List of Saved Segments */}
            {savedSegments.length === 0 ? (
              <div className="px-3 py-3 text-slate-400 text-center text-xs italic">
                No segments available
              </div>
            ) : (
              savedSegments.map((s) => {
                const isSelected = s.id === selectedSegmentId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleChoose(s.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/70 text-red-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate font-semibold">{s.name}</span>
                      {s.description && (
                        <span className="text-[10px] text-slate-400 truncate">{s.description}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {(s.estimatedCount || 0).toLocaleString()}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* 3. "+ Save Segment" Action (Preserved Save Segment Flow) */}
          {onOpenSaveSegmentModal && (
            <div className="pt-1 mt-1 border-t border-slate-100 px-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSaveSegmentModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save New Segment</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
