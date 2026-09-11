import React, { useState, useEffect } from 'react';
import { X, List, Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function InteractiveListSetupModal({
  isOpen,
  onClose,
  templateButtons = [],
  currentConfig = {},
  onSave,
}) {
  const [triggerType, setTriggerType] = useState('On Button Click');
  const [triggerButton, setTriggerButton] = useState('');
  const [headerText, setHeaderText] = useState('Help & Options');
  const [bodyText, setBodyText] = useState('Select a topic to know more!');
  const [footerText, setFooterText] = useState('Tap View Options to select');
  const [buttonText, setButtonText] = useState('View Options');
  const [options, setOptions] = useState([
    {
      id: 'opt_1',
      title: 'Software Bug',
      description: 'Report an application issue',
      replyText: 'Thank you for reporting. Please describe the issue or share a screenshot and our team will investigate.',
    },
    {
      id: 'opt_2',
      title: 'Account/Login',
      description: 'Help with logging into your account',
      replyText: 'For login issues, please reset your password on our website or reply with your registered email.',
    },
    {
      id: 'opt_3',
      title: 'Payment/Billing',
      description: 'Inquiries about invoices or charges',
      replyText: 'Our billing team is reviewing your account. We will share your invoice breakdown shortly.',
    },
  ]);
  const [expandedOptionIdx, setExpandedOptionIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTriggerType(currentConfig.triggerType || 'On Button Click');
      setTriggerButton(
        currentConfig.triggerButton ||
          templateButtons.find((b) => /know|faq|help|info|option/i.test(b.text || b))?.text ||
          (templateButtons[0]?.text || templateButtons[0] || 'Know more about us')
      );
      setHeaderText(currentConfig.headerText || 'Help & Options');
      setBodyText(currentConfig.bodyText || 'Select a topic to know more!');
      setFooterText(currentConfig.footerText || 'Tap View Options to select');
      setButtonText(currentConfig.buttonText || 'View Options');
      if (Array.isArray(currentConfig.options) && currentConfig.options.length > 0) {
        setOptions(currentConfig.options);
      }
    }
  }, [isOpen, currentConfig, templateButtons]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      enabled: true,
      triggerType,
      triggerButton: triggerButton || 'Know more about us',
      headerText: headerText.trim(),
      bodyText: bodyText.trim(),
      footerText: footerText.trim(),
      buttonText: (buttonText || 'View Options').trim().slice(0, 20),
      options: options.map((opt, idx) => ({
        id: opt.id || `opt_${idx + 1}`,
        title: (opt.title || `Option ${idx + 1}`).trim().slice(0, 24),
        description: (opt.description || '').trim().slice(0, 72),
        replyText: (opt.replyText || '').trim(),
      })),
    });
    onClose();
  };

  const handleDisable = () => {
    onSave({
      enabled: false,
      triggerType: 'On Button Click',
      triggerButton: '',
      headerText: '',
      bodyText: '',
      footerText: '',
      buttonText: 'View Options',
      options: [],
    });
    onClose();
  };

  const handleAddOption = () => {
    if (options.length >= 10) return;
    const newIdx = options.length + 1;
    const newOpt = {
      id: `opt_${Date.now()}`,
      title: `Option ${newIdx}`,
      description: 'Select this topic',
      replyText: 'Thank you for selecting this option. We will help you right away.',
    };
    setOptions([...options, newOpt]);
    setExpandedOptionIdx(options.length);
  };

  const handleRemoveOption = (indexToRemove) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, idx) => idx !== indexToRemove));
    if (expandedOptionIdx >= options.length - 1) {
      setExpandedOptionIdx(Math.max(0, options.length - 2));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const availableButtons = templateButtons.map((b) => (typeof b === 'string' ? b : b.text || 'Button'));
  if (!availableButtons.includes('Know more about us')) availableButtons.push('Know more about us');
  if (!availableButtons.includes('Help')) availableButtons.push('Help');

  const activeOption = options[expandedOptionIdx] || options[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0d3b30] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <List className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Setup Interactive List Message flow</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <p className="text-xs text-gray-600 leading-relaxed">
            If the customer's reply matches the below trigger, the <strong className="text-gray-900 font-semibold">Interactive list message</strong> will be sent to them automatically. If the customer then selects an option from the list, the corresponding custom auto reply will be sent automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Settings */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Set Trigger
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Trigger Type
                    </label>
                    <select
                      value={triggerType}
                      onChange={(e) => setTriggerType(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                    >
                      <option value="On Button Click">On Button Click</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Choose Button
                    </label>
                    <select
                      value={triggerButton}
                      onChange={(e) => setTriggerButton(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                    >
                      {availableButtons.map((btnText, idx) => (
                        <option key={idx} value={btnText}>
                          {btnText}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Response Message Body */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Response Message
                </h4>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Custom Message Prompt
                  </label>
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 focus-within:border-[#0d3b30] focus-within:bg-white transition-colors">
                    <textarea
                      rows={2}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      maxLength={999}
                      placeholder="Select a topic to know more!"
                      className="w-full text-xs text-gray-800 bg-transparent border-none p-0 focus:outline-none resize-none"
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                      <span>List button label: <strong>{buttonText}</strong></span>
                      <span>{bodyText.length}/999</span>
                    </div>
                  </div>
                </div>

                {/* View Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <span>View Options</span>
                      <span className="text-gray-400 font-normal">({options.length}/10)</span>
                    </label>
                    {options.length < 10 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs text-[#0d3b30] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Option
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {options.map((opt, idx) => {
                      const isExpanded = expandedOptionIdx === idx;
                      return (
                        <div
                          key={opt.id || idx}
                          className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs"
                        >
                          <div
                            onClick={() => setExpandedOptionIdx(isExpanded ? -1 : idx)}
                            className="px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer text-xs"
                          >
                            <span className="font-semibold text-gray-800">
                              {idx + 1}. {opt.title || 'Untitled Option'}
                            </span>
                            <div className="flex items-center gap-2">
                              {options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveOption(idx);
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-0.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3 space-y-2 border-t border-gray-100 text-xs">
                              <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                  Option Title (max 24 chars)
                                </label>
                                <input
                                  type="text"
                                  maxLength={24}
                                  value={opt.title}
                                  onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                                  className="w-full text-xs h-8 px-2.5 rounded border border-gray-300 focus:outline-none focus:border-[#0d3b30]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                  Description (optional, max 72 chars)
                                </label>
                                <input
                                  type="text"
                                  maxLength={72}
                                  value={opt.description || ''}
                                  onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                                  className="w-full text-xs h-8 px-2.5 rounded border border-gray-300 focus:outline-none focus:border-[#0d3b30]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                  Automated Reply when selected
                                </label>
                                <textarea
                                  rows={2}
                                  value={opt.replyText || ''}
                                  onChange={(e) => handleOptionChange(idx, 'replyText', e.target.value)}
                                  placeholder="Message sent automatically when customer clicks this option..."
                                  className="w-full text-xs p-2 rounded border border-gray-300 focus:outline-none focus:border-[#0d3b30] resize-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive WhatsApp Live Preview */}
            <div className="md:col-span-5 bg-[#f0f2f5] p-3 rounded-xl border border-gray-200/80 sticky top-0">
              <div className="text-[11px] font-bold text-gray-600 mb-2 flex items-center justify-between">
                <span>Interactive Preview</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">WhatsApp</span>
              </div>
              <div className="bg-[#efeae2] rounded-lg p-3 space-y-2 shadow-inner min-h-[300px] flex flex-col justify-end text-xs">
                {/* Outbound Campaign Sample Bubble */}
                <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                  <p className="text-[11px]">
                    Have questions about our service? Tap below to explore options:
                  </p>
                  <div className="mt-1 pt-1 border-t border-gray-100 text-center text-[11px] font-semibold text-[#00a884]">
                    {triggerButton || 'Know more about us'}
                  </div>
                </div>

                {/* Customer Click */}
                <div className="bg-[#d9fdd3] p-1.5 rounded-lg rounded-tr-none shadow-xs text-gray-800 self-end max-w-[70%] font-medium text-[11px]">
                  {triggerButton || 'Know more about us'}
                </div>

                {/* Interactive List Prompt Bubble */}
                <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                  <div className="font-semibold text-[11px] text-gray-900">{headerText}</div>
                  <p className="text-[11px] text-gray-700 mt-0.5">{bodyText}</p>
                  <div className="mt-1.5 pt-1 border-t border-gray-100 text-center text-[11px] font-semibold text-[#00a884] flex items-center justify-center gap-1">
                    <List className="w-3 h-3" />
                    {buttonText || 'View Options'}
                  </div>
                </div>

                {/* Simulated Customer Choice */}
                <div className="bg-[#d9fdd3] p-1.5 rounded-lg rounded-tr-none shadow-xs text-gray-800 self-end max-w-[70%] font-medium text-[11px]">
                  {activeOption?.title || 'Selected Option'}
                </div>

                {/* Automated Option Reply */}
                {activeOption?.replyText && (
                  <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                    <p className="text-[11px] leading-relaxed">{activeOption.replyText}</p>
                    <div className="text-[9px] text-gray-400 text-right mt-0.5">Just now ✓✓</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div>
            {currentConfig.enabled && (
              <button
                type="button"
                onClick={handleDisable}
                className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
              >
                Disable Flow
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0d3b30] hover:bg-[#154d3f] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
