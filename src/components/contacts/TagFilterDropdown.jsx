import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Tag as TagIcon } from 'lucide-react';

// Exact 11 Tag Options matching Interakt specification
export const TAG_FILTER_OPTIONS = [
  { value: 'all', label: 'Tag: All' },
  { value: 'Repeat Buyers', label: 'Repeat Buyers' },
  { value: 'Recovered', label: 'Recovered' },
  { value: 'Order Placed(Prepaid)', label: 'Order Placed(Prepaid)' },
  { value: 'Order Placed(CoD)', label: 'Order Placed(CoD)' },
  { value: 'Loyal', label: 'Loyal' },
  { value: 'Lost', label: 'Lost' },
  { value: 'High Spenders', label: 'High Spenders' },
  { value: 'Curious Browsers', label: 'Curious Browsers' },
  { value: 'At Risk', label: 'At Risk' },
  { value: 'Abandoned Cart', label: 'Abandoned Cart' },
];

export default function TagFilterDropdown({
  selectedTag = 'all',
  onSelectTag,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredOptions = TAG_FILTER_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = TAG_FILTER_OPTIONS.find((opt) => opt.value === selectedTag);
  const displayText = selectedTag === 'all'
    ? 'Select Tag'
    : selectedOption
    ? selectedOption.label
    : selectedTag;

  const handleSelect = (val) => {
    onSelectTag(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left text-xs ${className}`}>
      {/* Compact Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 inline-flex items-center justify-between gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
      >
        <div className="flex items-center gap-1.5 truncate max-w-[150px]">
          <TagIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{displayText}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-slate-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-56 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-center text-xs">
                No tags found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === selectedTag;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/70 text-red-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
