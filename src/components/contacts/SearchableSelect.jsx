import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  showSearch = true,
  allowCustom = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  icon: Icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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

  const filteredOptions = options.filter((opt) => {
    const label = typeof opt === 'string' ? opt : opt.label || opt.name || opt.value || '';
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedOption = options.find((opt) => (typeof opt === 'string' ? opt === value : opt.value === value));
  const displayLabel = selectedOption
    ? typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption.label || selectedOption.name
    : value || placeholder;

  const ActiveIcon = selectedOption?.icon || Icon;

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCustomAdd = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim());
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left text-xs ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {ActiveIcon && <ActiveIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span className={`truncate ${!value ? 'text-slate-400' : 'text-slate-900 font-semibold'}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 w-full min-w-[200px] max-h-60 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col ${dropdownClassName}`}
        >
          {showSearch && (
            <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && allowCustom && filteredOptions.length === 0) {
                      e.preventDefault();
                      handleCustomAdd();
                    }
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-48 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-center text-xs">
                {allowCustom && searchQuery.trim() ? (
                  <button
                    type="button"
                    onClick={handleCustomAdd}
                    className="w-full px-2 py-1 text-left text-red-600 hover:bg-red-50 rounded-lg font-bold"
                  >
                    + Use "{searchQuery.trim()}"
                  </button>
                ) : (
                  'No options found'
                )}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optVal = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label || opt.name;
                const optSub = typeof opt === 'object' && opt.count !== undefined ? `(${opt.count})` : null;
                const OptIcon = typeof opt === 'object' && opt.icon ? opt.icon : null;
                const isSelected = optVal === value;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(optVal)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-red-50/70 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {OptIcon && <OptIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                      <span className="truncate">{optLabel}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {optSub && <span className="text-[10px] text-slate-400 font-normal">{optSub}</span>}
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                    </div>
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
