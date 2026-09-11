import React, { useState, useEffect } from 'react';
import { X, Workflow, ArrowRight, Check, ListFilter, Play } from 'lucide-react';

export default function WorkflowSetupModal({
  isOpen,
  onClose,
  templateButtons = [],
  currentConfig = {},
  onSave,
}) {
  const [triggerType, setTriggerType] = useState('On button click');
  const [triggerButton, setTriggerButton] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [selectedWorkflowName, setSelectedWorkflowName] = useState('');
  const [selectedWorkflowDesc, setSelectedWorkflowDesc] = useState('');
  const [workflowInitialMsg, setWorkflowInitialMsg] = useState('');
  const [workflowsList, setWorkflowsList] = useState([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTriggerType(currentConfig.triggerType || 'On button click');
      setTriggerButton(
        currentConfig.triggerButton ||
          templateButtons[0]?.text ||
          templateButtons[0] ||
          'Start Flow'
      );
      setSelectedWorkflowId(currentConfig.workflowId || '');
      setSelectedWorkflowName(currentConfig.workflowName || '');

      // Load available workflows from ARCO database
      setLoading(true);
      fetch('/api/automation/workflows')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setWorkflowsList(data.data);
            if (!currentConfig.workflowId && data.data.length > 0) {
              const defaultWf = data.data[0];
              setSelectedWorkflowId(defaultWf.id);
              setSelectedWorkflowName(defaultWf.name);
              setSelectedWorkflowDesc(defaultWf.description || '');
              const firstNode = defaultWf.nodes?.find((n) => n.data?.text || n.data?.bodyText);
              setWorkflowInitialMsg(firstNode?.data?.text || firstNode?.data?.bodyText || `Welcome to ${defaultWf.name}`);
            } else if (currentConfig.workflowId) {
              const matched = data.data.find((w) => w.id === currentConfig.workflowId);
              if (matched) {
                setSelectedWorkflowDesc(matched.description || '');
                const firstNode = matched.nodes?.find((n) => n.data?.text || n.data?.bodyText);
                setWorkflowInitialMsg(firstNode?.data?.text || firstNode?.data?.bodyText || `Welcome to ${matched.name}`);
              }
            }
          }
        })
        .catch(() => {
          // Fallback mock list for standalone testing
          const fallback = [
            {
              id: 'wf_ai_proj_1',
              name: 'ai_project_progress_notifications_7i',
              description: 'Automated project progress notifications and milestone updates',
              initialMsg: 'Hello! Here is your latest project sprint status and delivery timeline.',
            },
            {
              id: 'wf_ai_tech_2',
              name: 'ai_technical_support_ticketing_ja',
              description: 'Technical issue reporting, auto-ticket creation and engineer assignment',
              initialMsg: 'Welcome to ARCO Technical Support. Please select your issue category.',
            },
            {
              id: 'wf_ai_onb_3',
              name: 'ai_automated_client_onboarding_je',
              description: 'Interactive step-by-step customer onboarding with documentation',
              initialMsg: "Welcome aboard! Let's guide you through your account onboarding in 3 quick steps.",
            },
          ];
          setWorkflowsList(fallback);
          if (!currentConfig.workflowId) {
            setSelectedWorkflowId(fallback[0].id);
            setSelectedWorkflowName(fallback[0].name);
            setSelectedWorkflowDesc(fallback[0].description);
            setWorkflowInitialMsg(fallback[0].initialMsg);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentConfig, templateButtons]);

  if (!isOpen) return null;

  const handleSelectWorkflow = (wf) => {
    setSelectedWorkflowId(wf.id);
    setSelectedWorkflowName(wf.name);
    setSelectedWorkflowDesc(wf.description || '');
    const firstNode = wf.nodes?.find((n) => n.data?.text || n.data?.bodyText);
    setWorkflowInitialMsg(firstNode?.data?.text || firstNode?.data?.bodyText || wf.initialMsg || `Welcome to ${wf.name}`);
    setIsLibraryOpen(false);
  };

  const handleSave = () => {
    onSave({
      enabled: true,
      triggerType,
      triggerButton: triggerButton || 'Start Flow',
      workflowId: selectedWorkflowId,
      workflowName: selectedWorkflowName,
    });
    onClose();
  };

  const handleDisable = () => {
    onSave({
      enabled: false,
      triggerType: 'On button click',
      triggerButton: '',
      workflowId: '',
      workflowName: '',
    });
    onClose();
  };

  const availableButtons = templateButtons.map((b) => (typeof b === 'string' ? b : b.text || 'Button'));
  if (availableButtons.length === 0) availableButtons.push('Select a button or list type');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0d3b30] px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Workflow className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Send Workflow</h3>
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
            If customer's response matches, the associated business response will be sent to the customer automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Customer Response
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Choose customer response type
                    </label>
                    <select
                      value={triggerType}
                      onChange={(e) => setTriggerType(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                    >
                      <option value="On button click">On button click</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Choose the button
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

              {/* Response Workflow Selector */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Response
                </h4>

                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-blue-600" />
                    <span>View Workflow Library</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown / Library Picker */}
                {isLibraryOpen && (
                  <div className="border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden divide-y divide-gray-100 max-h-52 overflow-y-auto">
                    {workflowsList.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 text-center">No workflows found</div>
                    ) : (
                      workflowsList.map((wf) => (
                        <div
                          key={wf.id}
                          onClick={() => handleSelectWorkflow(wf)}
                          className={`p-3 text-xs hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                            selectedWorkflowId === wf.id ? 'bg-emerald-50/60 font-semibold' : ''
                          }`}
                        >
                          <div>
                            <div className="text-gray-900 font-medium">{wf.name}</div>
                            <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{wf.description || 'Automation flow'}</div>
                          </div>
                          {selectedWorkflowId === wf.id && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Selected Workflow Card */}
                {selectedWorkflowName && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{selectedWorkflowName}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Selected</span>
                    </div>
                    {selectedWorkflowDesc && (
                      <p className="text-[11px] text-gray-500">{selectedWorkflowDesc}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: WhatsApp Preview */}
            <div className="md:col-span-5 bg-[#f0f2f5] p-3 rounded-xl border border-gray-200/80">
              <div className="text-[11px] font-bold text-gray-600 mb-2 flex items-center justify-between">
                <span>Interactive Preview</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">WhatsApp</span>
              </div>
              <div className="bg-[#efeae2] rounded-lg p-3 space-y-2.5 shadow-inner min-h-[220px] flex flex-col justify-end text-xs">
                {/* Outbound Campaign Bubble */}
                <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                  <p className="text-[11px] leading-relaxed">
                    Tap below to trigger automated support & onboarding:
                  </p>
                  <div className="mt-2 pt-1 border-t border-gray-100 text-center text-[11px] font-semibold text-[#00a884]">
                    {triggerButton || 'Start Flow'}
                  </div>
                </div>

                {/* Customer Click */}
                <div className="bg-[#d9fdd3] p-2 rounded-lg rounded-tr-none shadow-xs text-gray-800 self-end max-w-[70%] font-medium text-[11px]">
                  {triggerButton || 'Start Flow'}
                </div>

                {/* Workflow Initial Execution Bubble */}
                <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-xs text-gray-800 self-start max-w-[85%] border border-black/5">
                  <p className="text-[11px] leading-relaxed">
                    {workflowInitialMsg || `Welcome to ${selectedWorkflowName || 'Workflow'}`}
                  </p>
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
              disabled={!selectedWorkflowId}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                selectedWorkflowId
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
