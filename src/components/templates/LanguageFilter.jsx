import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function LanguageFilter({ value = 'All', onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const dropdownRef = useRef(null);

  const languageOptions = [
    { id: 'All', label: 'All' },
    { id: 'en_US', label: 'English (en_US)' },
    { id: 'hi_IN', label: 'Hindi (hi_IN)' },
    { id: 'es_ES', label: 'Spanish (es_ES)' },
    { id: 'pt_BR', label: 'Portuguese (pt_BR)' },
    { id: 'ar', label: 'Arabic (ar)' },
  ];

  // Sync tempValue
  useEffect(() => {
    setTempValue(value);
  }, [value, isOpen]);

  // Handle outside click
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

  const isFiltered = value && value !== 'All';
  const selectedLabel = languageOptions.find((l) => l.id === value)?.label || value;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
          isFiltered
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <span>{isFiltered ? `Language: ${selectedLabel}` : 'Language ▾'}</span>
      </button>

      {/* Floating Panel Popup */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2 text-xs font-sans">
          <div className="font-extrabold text-slate-800 pb-1.5 border-b border-slate-100">
            Language
          </div>

          <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
            {languageOptions.map((opt) => {
              const isSelected = tempValue === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => setTempValue(opt.id)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs">{opt.label}</span>
                </label>
              );
            })}
          </div>

          {/* Footer with Dark Green Done Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setTempValue('All');
                onChange('All');
                setIsOpen(false);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 font-bold px-1 py-1 cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
