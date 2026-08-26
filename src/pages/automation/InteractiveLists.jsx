import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  Plus,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Smartphone,
  ChevronRight,
  GripVertical,
  ExternalLink,
  Sparkles,
  Info,
  ChevronDown,
  Phone,
  Video,
  Check,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

const DEFAULT_QUESTIONS = [
  'What digital solutions do you offer?',
  'What industries do you serve?',
  "Why should we choose D'Crypt Code?",
  'What is your pricing and packages?',
  'Where is my order / shipment status?',
  'Book a product demo consultation',
  'Connect with human support executive',
];

export default function InteractiveLists() {
  const [listData, setListData] = useState(null);
  const [availableReplies, setAvailableReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Active List Configuration State
  const [listName, setListName] = useState('View Options');
  const [isEditingListName, setIsEditingListName] = useState(false);
  const [items, setItems] = useState([
    { id: 'item_1', input: 'Healthcare solutions inquiry', text: 'Healthcare' },
    { id: 'item_2', input: 'Renewable energy projects', text: 'Renewable Energy' },
    { id: 'item_3', input: 'Professional consulting services', text: 'Professional Services' },
    { id: 'item_4', input: 'Retail & E-commerce solutions', text: 'Retail' },
    { id: 'item_5', input: 'Education & EdTech platforms', text: 'Education' },
    { id: 'item_6', input: 'Manufacturing operations', text: 'Manufacturing' },
    { id: 'item_7', input: 'Banking & Financial tech', text: 'Finance' },
    { id: 'item_8', input: 'Custom software development', text: 'IT/Software' },
    { id: 'item_9', input: 'Other general inquiries', text: 'Others' },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedInput, setSelectedInput] = useState('');
  const [listItemText, setListItemText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Load interactive list from backend
      const resList = await automationService.getInteractiveLists();
      if (resList?.data && resList.data.length > 0) {
        const firstList = resList.data[0];
        setListData(firstList);
        if (firstList.button_text) setListName(firstList.button_text);
        if (firstList.sections && firstList.sections[0]?.rows) {
          setItems(
            firstList.sections[0].rows.map((r, i) => ({
              id: r.id || `item_${i + 1}`,
              input: r.description || '',
              text: r.title || `Option ${i + 1}`,
            }))
          );
        }
      }

      // 2. Load custom auto replies for dropdown mapping
      const resReplies = await automationService.getCustomReplies({ channel: 'whatsapp' });
      if (resReplies?.data && resReplies.data.length > 0) {
        setAvailableReplies(resReplies.data);
      }
    } catch (err) {
      console.error('Failed to load interactive list data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save changes to backend
  const persistChanges = async (newItems, newListName) => {
    const titleToSave = newListName !== undefined ? newListName : listName;
    const itemsToSave = newItems !== undefined ? newItems : items;

    const payload = {
      title: 'Active Interactive List',
      header_text: 'ARCO Interactive Menu',
      body_text: 'Hey! Thanks for reaching out to us. How can we help you, click on below option and choose one of the items we can help you',
      footer_text: 'ARCO Communication',
      button_text: titleToSave,
      sections: [
        {
          title: 'Options',
          rows: itemsToSave.map((it) => ({
            id: it.id,
            title: it.text,
            description: it.input || it.text,
          })),
        },
      ],
    };

    try {
      if (listData?.id) {
        await automationService.updateInteractiveList(listData.id, payload);
      } else {
        const created = await automationService.createInteractiveList(payload);
        if (created?.data) setListData(created.data);
      }
    } catch (err) {
      console.error('Error persisting interactive list:', err);
    }
  };

  // Open "Include new Reply" modal with a clean form
  const handleOpenAddModal = () => {
    if (items.length >= 10) {
      alert('You can add up to 10 items in a WhatsApp Interactive List.');
      return;
    }
    setModalMode('create');
    setEditingIndex(null);
    setSelectedInput('');
    setListItemText('');
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal with pre-filled row data
  const handleOpenEditModal = (item, index) => {
    setModalMode('edit');
    setEditingIndex(index);
    setSelectedInput(item.input || '');
    setListItemText(item.text || '');
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Close modal safely
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
  };

  // Select an input from dropdown
  const handleSelectInputOption = (optionText) => {
    setSelectedInput(optionText);
    setIsDropdownOpen(false);
    // If List item text is currently empty, suggest a short default title
    if (!listItemText.trim()) {
      const truncated = optionText.length > 24 ? optionText.substring(0, 24).trim() : optionText;
      setListItemText(truncated);
    }
  };

  // Save Modal Item
  const handleSaveModalItem = async (e) => {
    if (e) e.preventDefault();
    const cleanText = listItemText.trim();
    if (!cleanText) {
      alert('Please enter a List item text');
      return;
    }

    let updatedItems = [];
    if (modalMode === 'create') {
      const newItem = {
        id: `item_${Date.now()}`,
        input: selectedInput.trim(),
        text: cleanText.substring(0, 24),
      };
      updatedItems = [...items, newItem];
      showToast(`Added "${cleanText}" to interactive list!`);
    } else {
      updatedItems = [...items];
      updatedItems[editingIndex] = {
        ...updatedItems[editingIndex],
        input: selectedInput.trim(),
        text: cleanText.substring(0, 24),
      };
      showToast(`Updated "${cleanText}"!`);
    }

    setItems(updatedItems);
    setIsModalOpen(false);
    await persistChanges(updatedItems, listName);
  };

  // Delete Item
  const handleDeleteItem = async (index) => {
    const itemToDelete = items[index];
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    showToast(`Removed "${itemToDelete.text}"`);
    await persistChanges(updatedItems, listName);
  };

  // Rename Button / List Name
  const handleSaveListName = async () => {
    setIsEditingListName(false);
    showToast(`Renamed button to "${listName}"`);
    await persistChanges(items, listName);
  };

  // Drag and Drop Reordering Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...items];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setItems(reordered);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    showToast('Reordered list items!');
    await persistChanges(items, listName);
  };

  // Combined available inputs list
  const combinedInputOptions = Array.from(
    new Set([
      ...availableReplies.map((r) => r.trigger_keyword),
      ...DEFAULT_QUESTIONS,
    ])
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 relative font-sans">
      <DashboardSidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-row pl-14 sm:pl-16 transition-all duration-200">
        
        {/* Secondary Sub Navigation Sidebar */}
        <AutomationSubNav />

        {/* Page Main Work Area */}
        <div className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">
          <div className="p-6 md:p-8 max-w-6xl w-full space-y-5">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="text-slate-900 mt-0.5">
                  <List className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">Interaktive Lists</h1>
                  <p className="text-xs text-slate-500">Set up and manage Interaktive List Messages for your account</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href="#feedback"
                  onClick={(e) => { e.preventDefault(); alert('Thank you for your feedback!'); }}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-normal"
                >
                  <span>Give your feedback</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-slate-700" />
                  <span>Test Simulator</span>
                </button>
              </div>
            </div>

            {/* Informational Blue Banner */}
            <div className="bg-[#f0f7fc] border border-sky-200 rounded-lg p-3 flex items-start gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-bold text-sky-950">Automate Conversations with users</span>
                <p className="text-slate-600">
                  Create Interaktive List Messages for Frequently Asked Questions or otherwise to automate your conversations. This helps save time and improve user experience.{' '}
                  <a href="#help" onClick={(e) => { e.preventDefault(); alert('Interactive lists trigger custom auto-replies seamlessly.'); }} className="text-blue-600 font-medium hover:underline">Learn More</a>
                </p>
              </div>
            </div>

            {/* Description Paragraph and "Include new Reply" button row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Interaktive List Messages are used to trigger Custom Auto Replies in form of a List Message. This gives customers the flexibility to enter their query, converse with your business via, free text or List Messages thereby improving the overall customer experience. You can add upto 10 items and re-order them as well. Click{' '}
                <a href="#read" onClick={(e) => { e.preventDefault(); alert('List messages allow up to 10 options divided into sections.'); }} className="text-blue-600 hover:underline">here</a> to read more.
              </p>

              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 rounded-lg border border-emerald-700 text-[#0d3b30] hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#0d3b30] stroke-[3]" />
                <span>Include new Reply</span>
              </button>
            </div>

            {/* Interactive List Name field */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                <span>Interaktive list Name</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="inline-flex items-center">
                {isEditingListName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      className="px-3 py-1 text-xs font-semibold border border-[#0d3b30] rounded-lg focus:ring-1 focus:ring-[#0d3b30] outline-hidden"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveListName}
                      className="px-2.5 py-1 bg-[#0d3b30] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingListName(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <span>{listName}</span>
                    <Edit2 className="w-3 h-3 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Main 2-Column Workspace: Left List Table, Right WhatsApp Mobile Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2 items-start">
              
              {/* Left Column: Re-orderable List Table */}
              <div className="lg:col-span-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-xs font-bold text-slate-900">
                      <th className="py-2.5 px-2 w-12">Input</th>
                      <th className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <span>List Item text</span>
                          <Info className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-2.5 px-4 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30] mx-auto mb-2" />
                          Loading interactive items...
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-500">
                          No items in this interactive list. Click "+ Include new Reply" to add your first option.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr
                          key={item.id || index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`hover:bg-slate-50/70 transition-colors select-none ${
                            draggedIndex === index ? 'opacity-40 bg-slate-100' : ''
                          }`}
                        >
                          {/* Drag Grip Column */}
                          <td className="py-3 px-2 text-slate-400 cursor-grab active:cursor-grabbing">
                            <div className="flex items-center gap-1 text-slate-400 hover:text-slate-700">
                              <span className="font-mono text-sm leading-none">:::</span>
                            </div>
                          </td>

                          {/* List Item Text */}
                          <td className="py-3 px-4 font-normal text-slate-800">
                            {item.text}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-3 text-slate-500">
                              <button
                                onClick={() => handleOpenEditModal(item, index)}
                                className="hover:text-slate-900 cursor-pointer p-0.5"
                                title="Edit Item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(index)}
                                className="hover:text-red-600 cursor-pointer p-0.5"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Right Column: WhatsApp Interactive Phone Mockup Preview */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-[280px] bg-slate-100 rounded-[28px] border border-slate-300 p-2.5 shadow-xl space-y-3 flex flex-col justify-between">
                  
                  {/* WhatsApp Header */}
                  <div className="bg-[#f0f2f5] p-2.5 rounded-t-2xl border-b border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-xs">‹</span>
                      <span className="font-bold text-slate-900 text-[11px]">Brand Store</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3 h-3" />
                      <Video className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Message Bubble with Menu CTA */}
                  <div className="p-2 space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-2xl shadow-2xs border border-slate-200/80 space-y-2">
                      <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                        Hey! Thanks for reaching out to us. How can we help you, click on below option and choose one of the items we can help you
                      </p>
                      
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <List className="w-3 h-3 text-slate-500" />
                          <span>{listName || 'Menu'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded List Sheet Mockup */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-slate-900 text-xs">Menu</span>
                      <span className="text-slate-400 text-xs cursor-pointer">✕</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {items.slice(0, 5).map((item, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded-lg border border-slate-100 hover:bg-emerald-50/60 text-[11px] flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-slate-800 font-medium truncate">{item.text}</span>
                          <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        </div>
                      ))}
                      {items.length > 5 && (
                        <div className="text-[10px] text-slate-400 text-center pt-0.5">
                          + {items.length - 5} more items
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: SETUP INTERACTIVE LIST (MATCHING SCREENSHOT media_1787727693545) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Dark Green Modal Header */}
            <div className="px-5 py-3.5 bg-[#0d3b30] text-white flex items-center justify-between">
              <h3 className="font-bold text-xs tracking-tight">Setup Interaktive List</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModalItem} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed text-xs">
                Choose the Input you want to include in the list message options. It is this input that triggers a Custom Auto Reply.
              </p>

              {/* 1. Choose Input Dropdown Section */}
              <div className="space-y-1.5" ref={dropdownRef}>
                <label className="font-bold text-slate-800">Choose Input</label>
                
                <div className="relative">
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs flex items-center justify-between cursor-pointer focus:ring-1 focus:ring-[#0d3b30] shadow-2xs hover:border-slate-400"
                  >
                    <span className={selectedInput ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                      {selectedInput || 'Choose Input'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  </div>

                  {/* Dropdown Options Box */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 z-50 animate-in fade-in duration-100">
                      {combinedInputOptions.map((opt, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectInputOption(opt)}
                          className={`p-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#0d3b30] cursor-pointer transition-colors ${
                            selectedInput === opt ? 'bg-emerald-50/80 font-bold text-[#0d3b30]' : ''
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. List item text Input Section */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-800">List item text</label>
                
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={listItemText}
                    onChange={(e) => setListItemText(e.target.value.substring(0, 24))}
                    placeholder="Input"
                    className="w-full p-2.5 pr-14 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0d3b30] outline-hidden placeholder:text-slate-400 shadow-2xs"
                  />
                  <span className="absolute right-3 text-[11px] text-slate-400 font-mono pointer-events-none">
                    {listItemText.length}/24
                  </span>
                </div>
              </div>

              {/* Modal CTA Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  Save
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Simulator Drawer */}
      <AutomationSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

    </div>
  );
}
