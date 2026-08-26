import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CategoryFilter({ value = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(Array.isArray(value) ? value : []);
  const dropdownRef = useRef(null);

  const categoryOptions = [
    { id: 'Marketing', label: 'Marketing' },
    { id: 'Utility', label: 'Utility' },
    { id: 'Authentication', label: 'Authentication' },
  ];

  useEffect(() => {
    setTempValue(Array.isArray(value) ? value : []);
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

  const handleToggle = (categoryId) => {
    if (tempValue.includes(categoryId)) {
      setTempValue(tempValue.filter((c) => c !== categoryId));
    } else {
      setTempValue([...tempValue, categoryId]);
    }
  };

  const handleApply = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  const isFiltered = Array.isArray(value) && value.length > 0;

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
        <span>
          {isFiltered
            ? `Category: ${value.join(', ')}`
            : 'Category'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 px-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs font-sans">
          <div className="space-y-0.5 px-1.5">
            {categoryOptions.map((opt) => {
              const isChecked = tempValue.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  onClick={() => handleToggle(opt.id)}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700 font-normal'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? 'border-[#0d3b30] bg-[#0d3b30] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
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
                setTempValue([]);
                onChange([]);
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
