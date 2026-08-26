import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Bookmark, ChevronDown, Tag as TagIcon } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

// Available Tag Options (Exact 10 options matching Interakt with SVG tag icon)
const TAG_OPTIONS = [
  { value: 'Repeat Buyers', label: 'Repeat Buyers', icon: TagIcon },
  { value: 'Recovered', label: 'Recovered', icon: TagIcon },
  { value: 'Order Placed(Prepaid)', label: 'Order Placed(Prepaid)', icon: TagIcon },
  { value: 'Order Placed(CoD)', label: 'Order Placed(CoD)', icon: TagIcon },
  { value: 'Loyal', label: 'Loyal', icon: TagIcon },
  { value: 'Lost', label: 'Lost', icon: TagIcon },
  { value: 'High Spenders', label: 'High Spenders', icon: TagIcon },
  { value: 'Curious Browsers', label: 'Curious Browsers', icon: TagIcon },
  { value: 'At Risk', label: 'At Risk', icon: TagIcon },
  { value: 'Abandoned Cart', label: 'Abandoned Cart', icon: TagIcon },
];

// Available Contact Fields (Matching Interakt Reference in exact order)
const FIELD_OPTIONS = [
  { value: 'id', label: 'id', type: 'text' },
  { value: 'user_id', label: 'User Id', type: 'text' },
  { value: 'phone', label: 'Phone Number', type: 'text' },
  { value: 'email', label: 'Email', type: 'text' },
  { value: 'name', label: 'Name', type: 'text' },
  { value: 'created_at', label: 'Creation Date', type: 'date' },
  { value: 'country_code', label: 'Country Code', type: 'text' },
  { value: 'marked_as_spam', label: 'Marked as Spam?', type: 'boolean' },
  { value: 'source_id', label: 'Source ID', type: 'text' },
  { value: 'ctwa_clid', label: 'CTWA clid', type: 'text' },
  { value: 'source_url', label: 'Source URL', type: 'text' },
  { value: 'company_name', label: 'Company Name', type: 'text' },
  { value: 'status', label: 'Status', type: 'status' },
  { value: 'status_updated_at', label: 'Status Updated At', type: 'date' },
  { value: 'owner', label: 'Account Owner', type: 'text' },
  { value: 'source', label: 'Source', type: 'text' },
  { value: 'closure_deadline', label: 'Closure Deadline', type: 'date' },
  { value: 'leadgen_workflow_trigger', label: 'LeadGen Workflow Trigger', type: 'text' },
  { value: 'value', label: 'Contact Deal Value', type: 'number' },
  { value: 'add_to_sales_cycle', label: 'Add To Sales Cycle', type: 'boolean' },
  { value: 'row_number', label: 'Row Number', type: 'number' },
  { value: 'failure_reason', label: 'Failure Reason', type: 'text' },
];

// Available Events Options (Exact 5 items matching Interakt)
const EVENT_OPTIONS = [
  { value: 'Phone Number Updated', label: 'Phone Number Updated' },
  { value: 'Flow Completed', label: 'Flow Completed' },
  { value: 'CTWA Notification', label: 'CTWA Notification' },
  { value: 'Replied to Notification', label: 'Replied to Notification' },
  { value: 'Notification Sent', label: 'Notification Sent' },
];

// Data-driven Event Traits Configuration
const EVENT_CONFIG = {
  'Phone Number Updated': {
    traits: [
      { value: 'country_code', label: 'country_code', type: 'text' },
      { value: 'phone_number', label: 'phone_number', type: 'text' },
      { value: 'old_phone_number', label: 'old_phone_number', type: 'text' },
      { value: 'updated_at', label: 'updated_at', type: 'date' },
    ],
  },
  'Flow Completed': {
    traits: [
      { value: 'flow_name', label: 'flow_name', type: 'text' },
      { value: 'flow_id', label: 'flow_id', type: 'text' },
      { value: 'step_count', label: 'step_count', type: 'number' },
      { value: 'status', label: 'status', type: 'text' },
      { value: 'completed_at', label: 'completed_at', type: 'date' },
    ],
  },
  'CTWA Notification': {
    traits: [
      { value: 'campaign_name', label: 'campaign_name', type: 'text' },
      { value: 'ad_id', label: 'ad_id', type: 'text' },
      { value: 'source', label: 'source', type: 'text' },
      { value: 'received_at', label: 'received_at', type: 'date' },
    ],
  },
  'Replied to Notification': {
    traits: [
      { value: 'campaign_name', label: 'campaign_name', type: 'text' },
      { value: 'template_name', label: 'template_name', type: 'text' },
      { value: 'reply_text', label: 'reply_text', type: 'text' },
      { value: 'replied_at', label: 'replied_at', type: 'date' },
    ],
  },
  'Notification Sent': {
    traits: [
      { value: 'campaign_name', label: 'campaign_name', type: 'text' },
      { value: 'template_name', label: 'template_name', type: 'text' },
      { value: 'status', label: 'status', type: 'text' },
      { value: 'sent_at', label: 'sent_at', type: 'date' },
    ],
  },
};

const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'In Discussion', label: 'In Discussion' },
  { value: 'Won', label: 'Won' },
];

// Helper: Create an empty trait condition for an event
const createEmptyEventTrait = (defaultTrait = '') => ({
  trait: defaultTrait,
  operator: 'is',
  value: '',
});

// Factory for condition blocks
const createInitialCondition = () => ({
  id: `cond_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  tab: 'fields', // Condition 1 defaults to Fields (matching Interakt)
  // Field state
  field: 'id',
  operator: 'is',
  value: '',
  // Tag state
  tagOperator: 'is',
  tagValue: '',
  // Event state
  eventOperator: 'has_done',
  eventValue: '', // Starts with Select Event Name
  eventLogic: 'AND',
  eventTraits: [createEmptyEventTrait()],
});

const createNewConditionBlock = () => ({
  id: `cond_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  tab: 'tags', // Added conditions default to Tags (matching Interakt)
  // Field state
  field: '',
  operator: 'is',
  value: '',
  // Tag state
  tagOperator: 'is',
  tagValue: '',
  // Event state
  eventOperator: 'has_done',
  eventValue: '',
  eventLogic: 'AND',
  eventTraits: [createEmptyEventTrait()],
});

export default function SaveSegmentModal({
  isOpen,
  onClose,
  onApplyWithoutSaving,
  onSaveSegment,
  liveMatchingCount = 0,
  isSaving = false,
}) {
  const [logic, setLogic] = useState('AND'); // Global logic (default: AND)
  const [whatsappOpted, setWhatsappOpted] = useState(true); // Default = ON (matching Interakt)

  // Condition Blocks Array
  const [conditions, setConditions] = useState([createInitialCondition()]);

  // Inline Naming Step State
  const [showNameStep, setShowNameStep] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Aggregate all valid conditions from all condition blocks
  const getFlattenedValidConditions = () => {
    const valid = [];
    conditions.forEach((c) => {
      if (c.tab === 'tags') {
        if (c.tagValue && String(c.tagValue).trim()) {
          valid.push({
            category: 'tag',
            operator: c.tagOperator || 'is',
            value: String(c.tagValue).trim(),
          });
        }
      } else if (c.tab === 'fields') {
        if (c.field && c.value !== undefined && String(c.value).trim() !== '') {
          valid.push({
            category: 'field',
            field: c.field,
            operator: c.operator || 'is',
            value: c.value,
          });
        }
      } else if (c.tab === 'events') {
        if (c.eventValue && String(c.eventValue).trim()) {
          const filledTraits = (c.eventTraits || []).filter(
            (t) => t.trait && t.value !== undefined && String(t.value).trim() !== ''
          );

          if (filledTraits.length > 0) {
            filledTraits.forEach((t) => {
              valid.push({
                category: 'event',
                event: c.eventValue,
                operator: c.eventOperator || 'has_done',
                trait: t.trait,
                traitOperator: t.operator || 'is',
                value: String(t.value).trim(),
              });
            });
          } else {
            valid.push({
              category: 'event',
              operator: c.eventOperator || 'has_done',
              event: String(c.eventValue).trim(),
            });
          }
        }
      }
    });
    return valid;
  };

  // Add a new top-level condition block
  const handleAddConditionBlock = () => {
    setConditions((prev) => [...prev, createNewConditionBlock()]);
  };

  // Delete a top-level condition block
  const handleDeleteConditionBlock = (indexToDelete) => {
    if (conditions.length <= 1) {
      setConditions([createInitialCondition()]);
    } else {
      setConditions((prev) => prev.filter((_, i) => i !== indexToDelete));
    }
  };

  // Update a field inside a specific condition block
  const updateConditionBlock = (index, updates) => {
    setConditions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Event traits manipulation helpers
  const handleAddEventTrait = (blockIndex) => {
    setConditions((prev) => {
      const next = [...prev];
      const currentTraits = next[blockIndex].eventTraits || [];
      next[blockIndex] = {
        ...next[blockIndex],
        eventTraits: [...currentTraits, createEmptyEventTrait()],
      };
      return next;
    });
  };

  const handleDeleteEventTrait = (blockIndex, traitIndex) => {
    setConditions((prev) => {
      const next = [...prev];
      const currentTraits = next[blockIndex].eventTraits || [];
      if (currentTraits.length <= 1) {
        next[blockIndex].eventTraits = [createEmptyEventTrait()];
      } else {
        next[blockIndex].eventTraits = currentTraits.filter((_, i) => i !== traitIndex);
      }
      return next;
    });
  };

  const updateEventTrait = (blockIndex, traitIndex, traitUpdates) => {
    setConditions((prev) => {
      const next = [...prev];
      const currentTraits = [...(next[blockIndex].eventTraits || [])];
      currentTraits[traitIndex] = { ...currentTraits[traitIndex], ...traitUpdates };
      next[blockIndex] = { ...next[blockIndex], eventTraits: currentTraits };
      return next;
    });
  };

  // 1. "Apply Filter Without Saving"
  const handleApplyClick = () => {
    const validConditions = getFlattenedValidConditions();
    onApplyWithoutSaving({
      conditions: validConditions,
      logic,
      whatsappOpted,
    });
  };

  // 2. "Save Segment"
  const handleSaveClick = () => {
    const validConditions = getFlattenedValidConditions();
    if (validConditions.length === 0) {
      setErrorMsg('Please configure at least one condition before saving.');
      return;
    }
    setErrorMsg('');
    setShowNameStep(true);
  };

  const handleFinalizeSave = (e) => {
    if (e) e.preventDefault();
    if (!segmentName.trim()) {
      setErrorMsg('Segment name is required.');
      return;
    }

    const validConditions = getFlattenedValidConditions();
    onSaveSegment({
      name: segmentName.trim(),
      description: segmentDescription.trim() || undefined,
      filterType: conditions[0]?.tab || 'fields',
      conditions: validConditions,
      logic,
      whatsappOpted,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* ==================================================== */}
        {/* HEADER: Title & Close Button                        */}
        {/* ==================================================== */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <h3 className="font-extrabold text-base text-slate-900">Save Segment</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================================================== */}
        {/* BODY: Filter Contacts by + LOGIC + Independent Blocks*/}
        {/* ==================================================== */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Top Bar: "Filter Contacts by" + Top-Right Segmented LOGIC Selector */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">Filter Contacts by</span>

            {/* Segmented LOGIC [ AND ] [ OR ] Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px]">
              <span className="font-bold text-slate-400 px-1.5 uppercase">LOGIC:</span>
              <button
                type="button"
                onClick={() => setLogic('AND')}
                className={`px-2 py-0.5 rounded-lg font-extrabold cursor-pointer transition-colors ${
                  logic === 'AND' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AND
              </button>
              <button
                type="button"
                onClick={() => setLogic('OR')}
                className={`px-2 py-0.5 rounded-lg font-extrabold cursor-pointer transition-colors ${
                  logic === 'OR' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                OR
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* CONDITION BLOCKS LIST (Each block has its OWN tabs)  */}
          {/* ==================================================== */}
          <div className="space-y-4">
            {conditions.map((condBlock, idx) => {
              const activeTab = condBlock.tab;
              const hasField = Boolean(condBlock.field);
              const fieldMeta = FIELD_OPTIONS.find((f) => f.value === condBlock.field);
              const isNumber = fieldMeta?.type === 'number';
              const isDate = fieldMeta?.type === 'date';
              const isBoolean = fieldMeta?.type === 'boolean';
              const isStatus = fieldMeta?.type === 'status';

              // Dynamic operators for fields
              let fieldOperators = [
                { value: 'is', label: 'Is' },
                { value: 'is_not', label: 'Is not' },
                { value: 'contains', label: 'Contains' },
                { value: 'does_not_contain', label: 'Does not contain' },
                { value: 'starts_with', label: 'Starts with' },
              ];

              if (isNumber) {
                fieldOperators = [
                  { value: 'greater_than', label: 'Greater than (>)' },
                  { value: 'less_than', label: 'Less than (<)' },
                  { value: 'equals', label: 'Equals (=)' },
                  { value: 'greater_than_or_equal', label: 'Greater or equal (>=)' },
                  { value: 'less_than_or_equal', label: 'Less or equal (<=)' },
                ];
              } else if (isDate) {
                fieldOperators = [
                  { value: 'after', label: 'After' },
                  { value: 'before', label: 'Before' },
                  { value: 'is', label: 'Is Date' },
                ];
              } else if (isBoolean) {
                fieldOperators = [
                  { value: 'is', label: 'Is' },
                  { value: 'is_not', label: 'Is not' },
                ];
              }

              // Event configuration & traits
              const selectedEventConfig = EVENT_CONFIG[condBlock.eventValue];
              const availableTraits = selectedEventConfig ? selectedEventConfig.traits : [];

              return (
                <React.Fragment key={condBlock.id || idx}>
                  {/* Logic Separator Between Independent Condition Blocks */}
                  {idx > 0 && (
                    <div className="flex items-center justify-center my-3 gap-2">
                      <div className="h-px bg-slate-200 flex-1" />
                      <button
                        type="button"
                        onClick={() => setLogic(logic === 'AND' ? 'OR' : 'AND')}
                        className="px-2.5 py-0.5 rounded-lg border border-slate-300 bg-white text-[11px] font-extrabold text-slate-800 hover:bg-slate-50 flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                        title="Click to toggle between AND / OR"
                      >
                        <span>{logic}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>
                      <div className="h-px bg-slate-200 flex-1" />
                    </div>
                  )}

                  {/* Independent Condition Block Card */}
                  <div className="p-4 rounded-3xl bg-slate-50/80 border border-slate-200 shadow-2xs space-y-3.5">
                    
                    {/* Each Condition Block Has Its OWN [ Tags ] [ Fields ] [ Events ] Tabs */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateConditionBlock(idx, { tab: 'tags' })}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          activeTab === 'tags'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tags
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConditionBlock(idx, { tab: 'fields' })}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          activeTab === 'fields'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Fields
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConditionBlock(idx, { tab: 'events' })}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          activeTab === 'events'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Events
                      </button>
                    </div>

                    {/* Condition Row Based on This Block's Selected Tab */}
                    {/* 1. TAGS TAB */}
                    {activeTab === 'tags' && (
                      <div className="flex items-center gap-2">
                        {/* Operator: [ Is ▼ ] / [ Is not ▼ ] */}
                        <div className="w-24 shrink-0">
                          <SearchableSelect
                            options={[
                              { value: 'is', label: 'Is' },
                              { value: 'is_not', label: 'Is not' },
                            ]}
                            value={condBlock.tagOperator || 'is'}
                            showSearch={false}
                            onChange={(val) => updateConditionBlock(idx, { tagOperator: val })}
                          />
                        </div>

                        {/* Tag Selector: [ Select a Tag ▼ ] */}
                        <div className="flex-1">
                          <SearchableSelect
                            options={TAG_OPTIONS}
                            value={condBlock.tagValue}
                            placeholder="Select a Tag"
                            searchPlaceholder="Search Tags..."
                            showSearch={true}
                            allowCustom={false}
                            icon={TagIcon}
                            onChange={(val) => updateConditionBlock(idx, { tagValue: val })}
                          />
                        </div>

                        {/* Delete Condition Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteConditionBlock(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-200/60 cursor-pointer transition-colors shrink-0"
                          title="Remove condition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* 2. FIELDS TAB */}
                    {activeTab === 'fields' && (
                      <div className="flex items-center gap-2">
                        {/* [ Select a Field ▼ ] / [ Field ▼ ] */}
                        <div className={hasField ? 'w-44 shrink-0' : 'flex-1'}>
                          <SearchableSelect
                            options={FIELD_OPTIONS}
                            value={condBlock.field}
                            placeholder="Select a Field"
                            searchPlaceholder="Search Fields"
                            showSearch={true}
                            onChange={(val) => {
                              const selectedF = FIELD_OPTIONS.find((f) => f.value === val);
                              updateConditionBlock(idx, {
                                field: val,
                                operator: selectedF?.type === 'number'
                                  ? 'greater_than'
                                  : selectedF?.type === 'date'
                                  ? 'after'
                                  : 'is',
                                value: selectedF?.type === 'boolean' ? 'true' : '',
                              });
                            }}
                          />
                        </div>

                        {/* Once field selected: [ Operator ▼ ] [ Enter a value ] */}
                        {hasField && (
                          <>
                            {/* [ Operator ▼ ] */}
                            <div className="w-36 shrink-0">
                              <SearchableSelect
                                options={fieldOperators}
                                value={condBlock.operator || 'is'}
                                showSearch={false}
                                onChange={(val) => updateConditionBlock(idx, { operator: val })}
                              />
                            </div>

                            {/* [ Value Input ] */}
                            <div className="flex-1 min-w-[120px]">
                              {isStatus ? (
                                <SearchableSelect
                                  options={STATUS_OPTIONS}
                                  value={condBlock.value}
                                  placeholder="Select Status..."
                                  showSearch={false}
                                  onChange={(val) => updateConditionBlock(idx, { value: val })}
                                />
                              ) : isBoolean ? (
                                <SearchableSelect
                                  options={[
                                    { value: 'true', label: 'Yes / True' },
                                    { value: 'false', label: 'No / False' },
                                  ]}
                                  value={condBlock.value || 'true'}
                                  placeholder="Select value..."
                                  showSearch={false}
                                  onChange={(val) => updateConditionBlock(idx, { value: val })}
                                />
                              ) : isDate ? (
                                <input
                                  type="date"
                                  value={condBlock.value}
                                  onChange={(e) => updateConditionBlock(idx, { value: e.target.value })}
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                              ) : (
                                <input
                                  type={isNumber ? 'number' : 'text'}
                                  placeholder="Enter a value"
                                  value={condBlock.value}
                                  onChange={(e) => updateConditionBlock(idx, { value: e.target.value })}
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                              )}
                            </div>
                          </>
                        )}

                        {/* Delete Condition Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteConditionBlock(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-200/60 cursor-pointer transition-colors shrink-0"
                          title="Remove condition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* 3. EVENTS TAB (With Event-Specific Traits & Inner Condition Builder) */}
                    {activeTab === 'events' && (
                      <div className="space-y-3">
                        {/* Main Event Row */}
                        <div className="flex items-center gap-2">
                          {/* Operator: [ Has Done ▼ ] / [ Has Not Done ▼ ] */}
                          <div className="w-32 shrink-0">
                            <SearchableSelect
                              options={[
                                { value: 'has_done', label: 'Has Done' },
                                { value: 'has_not_done', label: 'Has Not Done' },
                              ]}
                              value={condBlock.eventOperator || 'has_done'}
                              showSearch={false}
                              onChange={(val) => updateConditionBlock(idx, { eventOperator: val })}
                            />
                          </div>

                          {/* Event Selector: [ Select Event Name ▼ ] */}
                          <div className="flex-1">
                            <SearchableSelect
                              options={EVENT_OPTIONS}
                              value={condBlock.eventValue}
                              placeholder="Select Event Name"
                              searchPlaceholder="Search event name..."
                              showSearch={true}
                              onChange={(val) => {
                                updateConditionBlock(idx, {
                                  eventValue: val,
                                  eventTraits: [createEmptyEventTrait()],
                                });
                              }}
                            />
                          </div>

                          {/* Delete Condition Block Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteConditionBlock(idx)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-200/60 cursor-pointer transition-colors shrink-0"
                            title="Remove condition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Event Traits Sub-Condition Builder (Rendered when event is selected) */}
                        {condBlock.eventValue && availableTraits.length > 0 && (
                          <div className="pt-2 pl-3 border-l-2 border-slate-200 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                With:
                              </span>

                              {/* Inner logic toggle for multiple traits */}
                              {(condBlock.eventTraits || []).length > 1 && (
                                <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-[9px]">
                                  <button
                                    type="button"
                                    onClick={() => updateConditionBlock(idx, { eventLogic: 'AND' })}
                                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                                      (condBlock.eventLogic || 'AND') === 'AND'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    AND
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateConditionBlock(idx, { eventLogic: 'OR' })}
                                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                                      (condBlock.eventLogic || 'AND') === 'OR'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    OR
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Trait Rows */}
                            <div className="space-y-2">
                              {(condBlock.eventTraits || []).map((tCond, tIdx) => {
                                const hasTrait = Boolean(tCond.trait);
                                const traitMeta = availableTraits.find((t) => t.value === tCond.trait);
                                const isTraitNum = traitMeta?.type === 'number';
                                const isTraitDate = traitMeta?.type === 'date';

                                let traitOperators = [
                                  { value: 'is', label: 'Is' },
                                  { value: 'is_not', label: 'Is not' },
                                  { value: 'contains', label: 'Contains' },
                                  { value: 'does_not_contain', label: 'Does not contain' },
                                  { value: 'starts_with', label: 'Starts with' },
                                ];

                                if (isTraitNum) {
                                  traitOperators = [
                                    { value: 'greater_than', label: 'Greater than (>)' },
                                    { value: 'less_than', label: 'Less than (<)' },
                                    { value: 'equals', label: 'Equals (=)' },
                                    { value: 'greater_than_or_equal', label: 'Greater or equal (>=)' },
                                    { value: 'less_than_or_equal', label: 'Less or equal (<=)' },
                                  ];
                                } else if (isTraitDate) {
                                  traitOperators = [
                                    { value: 'after', label: 'After' },
                                    { value: 'before', label: 'Before' },
                                    { value: 'is', label: 'Is Date' },
                                  ];
                                }

                                return (
                                  <React.Fragment key={tIdx}>
                                    {tIdx > 0 && (
                                      <div className="flex items-center my-1 gap-2 text-[10px] text-slate-400 font-bold">
                                        <div className="h-px bg-slate-200 flex-1" />
                                        <span>{condBlock.eventLogic || 'AND'}</span>
                                        <div className="h-px bg-slate-200 flex-1" />
                                      </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                      {/* [ Select Event Trait ▼ ] */}
                                      <div className={hasTrait ? 'w-40 shrink-0' : 'flex-1'}>
                                        <SearchableSelect
                                          options={availableTraits}
                                          value={tCond.trait}
                                          placeholder="Select Event Trait"
                                          searchPlaceholder="Search trait..."
                                          showSearch={true}
                                          onChange={(val) => {
                                            const selectedT = availableTraits.find((t) => t.value === val);
                                            updateEventTrait(idx, tIdx, {
                                              trait: val,
                                              operator: selectedT?.type === 'number'
                                                ? 'greater_than'
                                                : selectedT?.type === 'date'
                                                ? 'after'
                                                : 'is',
                                              value: '',
                                            });
                                          }}
                                        />
                                      </div>

                                      {/* Once Trait Selected: [ Operator ▼ ] [ Value ] */}
                                      {hasTrait && (
                                        <>
                                          <div className="w-32 shrink-0">
                                            <SearchableSelect
                                              options={traitOperators}
                                              value={tCond.operator || 'is'}
                                              showSearch={false}
                                              onChange={(val) => updateEventTrait(idx, tIdx, { operator: val })}
                                            />
                                          </div>

                                          <div className="flex-1 min-w-[100px]">
                                            {isTraitDate ? (
                                              <input
                                                type="date"
                                                value={tCond.value}
                                                onChange={(e) => updateEventTrait(idx, tIdx, { value: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                              />
                                            ) : (
                                              <input
                                                type={isTraitNum ? 'number' : 'text'}
                                                placeholder="Enter a value"
                                                value={tCond.value}
                                                onChange={(e) => updateEventTrait(idx, tIdx, { value: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                              />
                                            )}
                                          </div>
                                        </>
                                      )}

                                      {/* Delete Trait Row Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteEventTrait(idx, tIdx)}
                                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-200/60 cursor-pointer transition-colors shrink-0"
                                        title="Remove trait condition"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            {/* + Add Condition within Event Button */}
                            <button
                              type="button"
                              onClick={() => handleAddEventTrait(idx)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 pt-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Condition within Event</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* + Add Condition Button (Appends a new top-level independent condition block) */}
          <button
            type="button"
            onClick={handleAddConditionBlock}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 pt-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Condition</span>
          </button>

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 font-semibold text-xs border border-red-200 animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* ==================================================== */}
          {/* INLINE SEGMENT NAME STEP (Appears on Save Click)     */}
          {/* ==================================================== */}
          {showNameStep && (
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
                <span className="font-extrabold text-xs text-slate-900">Name Your Segment</span>
                <button
                  type="button"
                  onClick={() => setShowNameStep(false)}
                  className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold cursor-pointer"
                >
                  Back to Conditions
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Segment Name *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. VIP Repeat Buyers Diwali"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Optional notes for your marketing team..."
                    value={segmentDescription}
                    onChange={(e) => setSegmentDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ==================================================== */}
        {/* FOOTER: WhatsApp Opt-in Card & Dual Actions          */}
        {/* ==================================================== */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-4">
          
          {/* WhatsApp Opt-in Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              {/* Toggle Switch */}
              <div
                onClick={() => setWhatsappOpted(!whatsappOpted)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                  whatsappOpted ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-150 ${
                    whatsappOpted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>

              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Only include customers whose 'WhatsApp opted' is true
                </span>
                <span className="text-[10px] text-slate-500">
                  Ensures compliance and delivers broadcasts strictly to opted-in audiences.
                </span>
              </div>
            </label>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                Recommended
              </span>
              <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                {liveMatchingCount.toLocaleString()} matching
              </span>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            {/* [ Apply Filter Without Saving ] */}
            <button
              type="button"
              onClick={handleApplyClick}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Apply Filter Without Saving
            </button>

            {/* [ Save Segment ] */}
            {showNameStep ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNameStep(false)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleFinalizeSave}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Segment'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveClick}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Segment</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
