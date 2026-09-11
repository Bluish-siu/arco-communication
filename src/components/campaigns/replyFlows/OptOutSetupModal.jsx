import React, { useState, useEffect } from 'react';
import { X, GitFork, Check } from 'lucide-react';

export default function OptOutSetupModal({
  isOpen,
  onClose,
  templateButtons = [],
  currentConfig = {},
  onSave,
}) {
  const [triggerType, setTriggerType] = useState('On Button Click');
  const [triggerButton, setTriggerButton] = useState('');
  const [acknowledgementEnabled, setAcknowledgementEnabled] = useState(true);
  const [acknowledgementText, setAcknowledgementText] = useState(
    'Sure, we will not message you further.'
  );

  useEffect(() => {
    if (isOpen) {
      setTriggerType(currentConfig.triggerType || 'On Button Click');
      setTriggerButton(
        currentConfig.triggerButton ||
          templateButtons.find((b) => /stop|opt/i.test(b.text || b))?.text ||
          (templateButtons[0]?.text || templateButtons[0] || 'STOP')
      );
      setAcknowledgementEnabled(
        currentConfig.acknowledgementEnabled !== undefined
          ? currentConfig.acknowledgementEnabled
          : true
      );
      setAcknowledgementText(
        currentConfig.acknowledgementText ||
          'Sure, we will not message you further.'
      );
    }
  }, [isOpen, currentConfig, templateButtons]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      enabled: true,
      triggerType,
      triggerButton: triggerButton || 'STOP',
      acknowledgementEnabled,
      acknowledgementText: acknowledgementEnabled ? acknowledgementText.trim() : '',
    });
    onClose();
  };

  const handleDisable = () => {
    onSave({
      enabled: false,
      triggerType: 'On Button Click',
      triggerButton: '',
      acknowledgementEnabled: false,
      acknowledgementText: '',
    });
    onClose();
  };

  const availableButtons = templateButtons.map((b) => (typeof b === 'string' ? b : b.text || 'Button'));
  if (!availableButtons.includes('STOP')) availableButtons.push('STOP');
  if (!availableButtons.includes('Unsubscribe')) availableButtons.push('Unsubscribe');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0d3b30] px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <GitFork className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Set up Opt-out the customer flow</h3>
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
        <div className="p-6 space-y-5">
          <p className="text-xs text-gray-600 leading-relaxed">
            If the customer's reply matches the below trigger, their <strong className="text-gray-900 font-semibold">'WhatsApp Opted'</strong> trait will be updated to False. Make sure you filter out opted-out customers from future marketing campaigns.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Configuration Controls */}
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
                      <option value="On Keyword Text">On Keyword Text</option>
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

              {/* Acknowledgement Message */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledgementEnabled}
                    onChange={(e) => setAcknowledgementEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0d3b30] focus:ring-[#0d3b30] border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Acknowledgement message
                  </span>
                </label>

                {acknowledgementEnabled && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 focus-within:border-[#0d3b30] focus-within:bg-white transition-colors">
                    <textarea
                      rows={3}
                      value={acknowledgementText}
                      onChange={(e) => setAcknowledgementText(e.target.value)}
                      maxLength={999}
                      placeholder="Enter acknowledgement message sent upon opt-out..."
                      className="w-full text-xs text-gray-800 bg-transparent border-none p-0 focus:outline-none resize-none"
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                      <span className="italic">Supports plain text</span>
                      <span>{acknowledgementText.length}/999</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Mobile WhatsApp Interactive Preview */}
            <div className="md:col-span-5 bg-[#f0f2f5] p-3 rounded-xl border border-gray-200/80">
              <div className="text-[11px] font-bold text-gray-600 mb-2 flex items-center justify-between">
                <span>Interactive Preview</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">WhatsApp</span>
              </div>
              <div className="bg-[#efeae2] rounded-lg p-3 space-y-2.5 shadow-inner min-h-[220px] flex flex-col justify-end text-xs">
                {/* Outbound Campaign Sample Bubble */}
                <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                  <p className="text-[11px] leading-relaxed">
                    Here is your exclusive promo code! Reply STOP to opt-out at any time.
                  </p>
                  <div className="mt-2 pt-1 border-t border-gray-100 text-center text-[11px] font-semibold text-[#00a884]">
                    {triggerButton || 'STOP'}
                  </div>
                </div>

                {/* Inbound Customer Click */}
                <div className="bg-[#d9fdd3] p-2 rounded-lg rounded-tr-none shadow-xs text-gray-800 self-end max-w-[70%] font-medium text-[11px]">
                  {triggerButton || 'STOP'}
                </div>

                {/* Auto-response acknowledgement */}
                {acknowledgementEnabled && acknowledgementText && (
                  <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                    <p className="text-[11px] leading-relaxed">
                      {acknowledgementText}
                    </p>
                    <div className="text-[9px] text-gray-400 text-right mt-1">Just now ✓✓</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
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
