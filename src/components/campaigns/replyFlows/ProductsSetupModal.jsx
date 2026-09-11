import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, AlertTriangle, CheckCircle2, Check, ExternalLink } from 'lucide-react';

export default function ProductsSetupModal({
  isOpen,
  onClose,
  templateButtons = [],
  currentConfig = {},
  onSave,
}) {
  const [triggerType, setTriggerType] = useState('On Button Click');
  const [triggerButton, setTriggerButton] = useState('');
  const [productType, setProductType] = useState('collection_list');
  const [messageText, setMessageText] = useState('Check out our product collections');
  const [catalogConnected, setCatalogConnected] = useState(true);
  const [catalogName, setCatalogName] = useState('ARCO Storefront Catalog');
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTriggerType(currentConfig.triggerType || 'On Button Click');
      setTriggerButton(
        currentConfig.triggerButton ||
          templateButtons.find((b) => /product|shop|catalog/i.test(b.text || b))?.text ||
          (templateButtons[0]?.text || templateButtons[0] || 'See our products')
      );
      setProductType(currentConfig.productType || 'collection_list');
      setMessageText(currentConfig.messageText || 'Check out our product collections');

      // Fetch live commerce catalog status
      setLoadingStatus(true);
      fetch('/api/commerce/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setCatalogConnected(data.data.catalogConnected !== false);
            setCatalogName(data.data.catalogName || 'ARCO Storefront Catalog');
          }
        })
        .catch(() => {
          // If offline or test mode, default to connected
          setCatalogConnected(true);
        })
        .finally(() => setLoadingStatus(false));
    }
  }, [isOpen, currentConfig, templateButtons]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      enabled: true,
      triggerType,
      triggerButton: triggerButton || 'See our products',
      productType,
      messageText: messageText.trim(),
    });
    onClose();
  };

  const handleDisable = () => {
    onSave({
      enabled: false,
      triggerType: 'On Button Click',
      triggerButton: '',
      productType: 'collection_list',
      messageText: '',
    });
    onClose();
  };

  const availableButtons = templateButtons.map((b) => (typeof b === 'string' ? b : b.text || 'Button'));
  if (!availableButtons.includes('See our products')) availableButtons.push('See our products');
  if (!availableButtons.includes('Shop Now')) availableButtons.push('Shop Now');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0d3b30] px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Set up Products Collections/Catalog flow</h3>
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
            If the customer's reply matches the below trigger, the <strong className="text-gray-900 font-semibold">Product Collections list / Product Catalog message</strong> will be sent to the customer automatically.
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

              {/* Response Message Section */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Response Message
                </h4>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">
                    Select message type
                  </label>
                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-800 font-medium">
                      <input
                        type="radio"
                        name="productType"
                        value="collection_list"
                        checked={productType === 'collection_list'}
                        onChange={(e) => setProductType(e.target.value)}
                        className="w-4 h-4 text-[#0d3b30] focus:ring-[#0d3b30]"
                      />
                      Product Collection list
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-800 font-medium">
                      <input
                        type="radio"
                        name="productType"
                        value="catalog_message"
                        checked={productType === 'catalog_message'}
                        onChange={(e) => setProductType(e.target.value)}
                        className="w-4 h-4 text-[#0d3b30] focus:ring-[#0d3b30]"
                      />
                      Catalog Message
                    </label>
                  </div>
                </div>

                {/* Catalog Connectivity Notice */}
                {!catalogConnected ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span>Connect your catalog </span>
                      <a
                        href="/commerce"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-800 underline font-bold inline-flex items-center gap-0.5"
                      >
                        here <ExternalLink className="w-3 h-3" />
                      </a>
                      <span> to be able to enable setup this flow.</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Catalog Connected: <strong>{catalogName}</strong></span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Introduction Message
                  </label>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter introductory text before products..."
                    className="w-full text-xs h-9 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: WhatsApp Interactive Preview */}
            <div className="md:col-span-5 bg-[#f0f2f5] p-3 rounded-xl border border-gray-200/80">
              <div className="text-[11px] font-bold text-gray-600 mb-2 flex items-center justify-between">
                <span>Interactive Preview</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">WhatsApp</span>
              </div>
              <div className="bg-[#efeae2] rounded-lg p-3 space-y-2.5 shadow-inner min-h-[260px] flex flex-col justify-end text-xs">
                {/* Outbound Campaign Sample Bubble */}
                <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                  <p className="text-[11px] leading-relaxed">
                    Explore our trending styles and new catalog arrivals!
                  </p>
                  <div className="mt-2 pt-1 border-t border-gray-100 text-center text-[11px] font-semibold text-[#00a884]">
                    {triggerButton || 'See our products'}
                  </div>
                </div>

                {/* Inbound Customer Click */}
                <div className="bg-[#d9fdd3] p-2 rounded-lg rounded-tr-none shadow-xs text-gray-800 self-end max-w-[70%] font-medium text-[11px]">
                  {triggerButton || 'See our products'}
                </div>

                {/* Auto-response Products Bubble */}
                <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                  <p className="text-[11px] leading-relaxed">
                    {messageText || 'Check out our product collections'}
                  </p>
                  <div className="mt-2 pt-1 border-t border-gray-100 space-y-1">
                    <div className="text-[11px] font-semibold text-gray-800">
                      📦 {productType === 'catalog_message' ? 'Store Catalog' : 'Featured Collection'}
                    </div>
                    <div className="text-[10px] text-gray-500">Tap below to open catalog & shop</div>
                    <div className="mt-1 pt-1 border-t border-gray-100 text-center text-[11px] font-semibold text-[#00a884]">
                      {productType === 'catalog_message' ? 'View Catalog' : 'View Collections'}
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-400 text-right mt-1">Just now ✓✓</div>
                </div>
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
              disabled={!catalogConnected}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                catalogConnected
                  ? 'bg-[#0d3b30] hover:bg-[#154d3f] cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
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
