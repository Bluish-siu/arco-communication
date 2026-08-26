import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function StatusFilter({ value = 'Any', onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const dropdownRef = useRef(null);

  const statusOptions = [
    { id: 'Any', label: 'Any' },
    { id: 'Approved', label: 'Approved' },
    { id: 'Disabled', label: 'Disabled' },
    { id: 'In Appeal', label: 'In Appeal' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Pending Deletion', label: 'Pending Deletion' },
    { id: 'Rejected', label: 'Rejected' },
    { id: 'Waiting', label: 'Waiting' },
  ];

  useEffect(() => {
    setTempValue(value);
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleApply = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  const isFiltered = value && value !== 'Any';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          isFiltered
            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>{isFiltered ? `Status: ${value}` : 'Status'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 px-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs font-sans">
          <div className="space-y-0.5 max-h-56 overflow-y-auto px-1.5">
            {statusOptions.map((opt) => {
              const isSelected = tempValue === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => setTempValue(opt.id)}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700 font-normal'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'border-[#0d3b30] bg-[#0d3b30]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs">{opt.label}</span>
                </label>
              );
            })}
          </div>

          {/* Footer with Dark Green Done Button */}
          <div className="pt-2 mt-1 border-t border-gray-100 px-1.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setTempValue('Any');
                onChange('Any');
                setIsOpen(false);
              }}
              className="text-[11px] text-gray-400 hover:text-gray-600 font-medium px-1 cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3.5 py-1 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
