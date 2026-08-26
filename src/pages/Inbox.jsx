import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Plus,
  Paperclip,
  Smile,
  Send,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Bell,
  Settings,
  User,
  LogOut,
  Clock,
  ArrowLeft,
  MessageSquare,
  Check,
  CheckCheck,
  Sparkles,
  Phone,
  Video,
  Info,
  Tag,
  UserCheck,
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink,
  Users,
  Calendar,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import Container from '../components/common/Container';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { inboxService } from '../services/inboxService';
import { contactsService } from '../services/contactsService';

// Custom Contextual Instagram Icon
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: '+91 (India)' },
  { code: '+1', country: 'US', label: '+1 (USA/Canada)' },
  { code: '+44', country: 'GB', label: '+44 (UK)' },
  { code: '+971', country: 'AE', label: '+971 (UAE)' },
  { code: '+65', country: 'SG', label: '+65 (Singapore)' },
  { code: '+61', country: 'AU', label: '+61 (Australia)' },
  { code: '+49', country: 'DE', label: '+49 (Germany)' },
];

const FILTER_CATEGORIES = [
  { id: 'labels', label: 'Labels' },
  { id: 'tags', label: 'Tags' },
  { id: 'chat_status', label: 'Chat Status' },
  { id: 'assignee', label: 'Assignee' },
  { id: 'reply_status', label: 'Reply Status' },
  { id: 'read_unread', label: 'Read/Unread' },
  { id: 'response_window', label: 'Response Window' },
  { id: 'last_message_time', label: 'Last Message Time' },
  { id: 'spam_chats', label: 'Spam Chats' },
];

const STANDARD_TAGS = [
  'Repeat Buyers',
  'Recovered',
  'Order Placed (Prepaid)',
  'Order Placed (CoD)',
  'Loyal',
  'Lost',
  'High Spenders',
  'Curious Browsers',
  'At Risk',
  'Abandoned Cart',
];

const STANDARD_AGENTS = [
  { id: 'Unassigned', name: 'Unassigned' },
  { id: 'Me', name: 'Assigned to me' },
  { id: 'Shraddha', name: 'Shraddha (Admin)' },
  { id: 'Support Agent 1', name: 'Support Agent 1' },
  { id: 'Sales Representative', name: 'Sales Representative' },
];

const DEFAULT_FILTERS = {
  labels: [], // array of strings, 'none' for no label
  tags: [], // array of strings
  chatStatus: 'open', // 'all' | 'open' | 'closed'
  assignees: [], // array of strings
  replyStatus: [], // 'unreplied' | 'replied_manually' | 'replied_by_bot'
  readUnread: 'all', // 'all' | 'read' | 'unread'
  responseWindow: 'all', // 'all' | 'active' | 'inactive'
  fromDate: '',
  toDate: '',
  spamChats: false,
};

const initialConversations = [
  {
    id: 'cnv_1',
    name: 'Rahul Sharma',
    channel: 'whatsapp',
    status: 'Online',
    phone: '+91 98765 43210',
    unreadCount: 1,
    lastMessageTime: '10:42 AM',
    tag: 'Repeat Buyers',
    label: null,
    statusFilter: 'open',
    assignee: 'Me',
    replyStatus: 'replied_manually',
    responseWindow: 'active',
    isSpam: false,
    updatedAt: new Date().toISOString(),
    messages: [
      { id: 'm1', sender: 'them', text: 'Hi, I want to know about your services.', time: '10:40 AM' },
      { id: 'm2', sender: 'me', text: 'Hello Rahul! Welcome to ARCO Communication. We provide end-to-end WhatsApp marketing, AI bots, and omnichannel support. How can we help your business today?', time: '10:41 AM' },
      { id: 'm3', sender: 'them', text: 'Can we schedule a quick demo for our sales team?', time: '10:42 AM' },
    ],
  },
  {
    id: 'cnv_2',
    name: 'Priya Mehta',
    channel: 'whatsapp',
    status: 'Active 15m ago',
    phone: '+91 98234 56789',
    unreadCount: 0,
    lastMessageTime: '09:15 AM',
    tag: 'High Spenders',
    label: null,
    statusFilter: 'open',
    assignee: 'Me',
    replyStatus: 'replied_by_bot',
    responseWindow: 'active',
    isSpam: false,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      { id: 'm1', sender: 'them', text: 'Can you send me the pricing details?', time: '09:12 AM' },
      { id: 'm2', sender: 'me', text: 'Hi Priya! Our plans start at ₹999/mo for Starter and ₹2,499/mo for Growth with unlimited AI agents. Sending the full plan comparison sheet right away.', time: '09:15 AM' },
    ],
  },
  {
    id: 'cnv_3',
    name: 'Gaming World',
    channel: 'instagram',
    status: 'Online',
    phone: '@gamingworld_official',
    unreadCount: 2,
    lastMessageTime: 'Yesterday',
    tag: 'Loyal',
    label: null,
    statusFilter: 'open',
    assignee: 'Unassigned',
    replyStatus: 'unreplied',
    responseWindow: 'inactive',
    isSpam: false,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      { id: 'm1', sender: 'them', text: 'We are interested in your WhatsApp automation.', time: 'Yesterday 4:20 PM' },
      { id: 'm2', sender: 'them', text: 'Specifically for tournament alerts and real-time player leaderboards.', time: 'Yesterday 4:22 PM' },
    ],
  },
];

export default function Inbox() {
  const navigate = useNavigate();
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup.companyName || user.name || 'Business Owner';

  const [conversations, setConversations] = useState(initialConversations);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // =========================================================================
  // FUNNEL / FILTERS MODAL STATE (Interakt Replication)
  // =========================================================================
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState('labels');
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

  // Separate in-modal filter searches
  const [filterLabelSearch, setFilterLabelSearch] = useState('');
  const [filterTagSearch, setFilterTagSearch] = useState('');
  const [filterAgentSearch, setFilterAgentSearch] = useState('');

  // =========================================================================
  // STEP 1: NEW CHAT PANEL STATE (Attached to bottom of left list)
  // =========================================================================
  const [isNewChatPanelOpen, setIsNewChatPanelOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');

  // =========================================================================
  // STEP 2: NEW CONTACT CENTERED MODAL STATE
  // =========================================================================
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [quickCountryCode, setQuickCountryCode] = useState('+91');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickCreating, setQuickCreating] = useState(false);

  // =========================================================================
  // STEP 3: CREATE CONTACTS RIGHT-SIDE DRAWER STATE
  // =========================================================================
  const [isCreateContactDrawerOpen, setIsCreateContactDrawerOpen] = useState(false);
  const [createContactMethod, setCreateContactMethod] = useState('manual'); // 'manual' | 'automated'
  const [drawerName, setDrawerName] = useState('');
  const [drawerCountryCode, setDrawerCountryCode] = useState('+91');
  const [drawerPhone, setDrawerPhone] = useState('');
  const [drawerUserId, setDrawerUserId] = useState('');
  const [drawerStatus, setDrawerStatus] = useState('Open Lead');
  const [drawerOwner, setDrawerOwner] = useState(user.name || 'Shraddha (Admin)');
  const [drawerTag, setDrawerTag] = useState('Lead');
  const [drawerEmail, setDrawerEmail] = useState('');
  const [drawerOpted, setDrawerOpted] = useState('yes'); // 'yes' | 'no'
  const [drawerDealValue, setDrawerDealValue] = useState('');
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const [isCsvInstructionsOpen, setIsCsvInstructionsOpen] = useState(false);

  // Bulk CSV Upload within Drawer
  const drawerFileInputRef = useRef(null);
  const [drawerCsvFile, setDrawerCsvFile] = useState(null);
  const [drawerCsvPreviewRows, setDrawerCsvPreviewRows] = useState([]);
  const [drawerCsvImporting, setDrawerCsvImporting] = useState(false);

  const messagesEndRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Prevent background scrolling when modals or drawers are open
  useEffect(() => {
    if (isNewContactModalOpen || isCreateContactDrawerOpen || isFilterModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isNewContactModalOpen, isCreateContactDrawerOpen, isFilterModalOpen]);

  // Load conversations from backend with applied filters
  const loadConversations = async (filtersToApply = appliedFilters) => {
    try {
      const queryParams = {
        status: filtersToApply.chatStatus !== 'all' ? filtersToApply.chatStatus : undefined,
        tags: filtersToApply.tags.length ? filtersToApply.tags : undefined,
        labels: filtersToApply.labels.length ? filtersToApply.labels : undefined,
        assignees: filtersToApply.assignees.length ? filtersToApply.assignees : undefined,
        replyStatus: filtersToApply.replyStatus.length ? filtersToApply.replyStatus : undefined,
        readUnread: filtersToApply.readUnread !== 'all' ? filtersToApply.readUnread : undefined,
        responseWindow: filtersToApply.responseWindow !== 'all' ? filtersToApply.responseWindow : undefined,
        isSpam: filtersToApply.spamChats ? 'true' : undefined,
        fromDate: filtersToApply.fromDate || undefined,
        toDate: filtersToApply.toDate || undefined,
      };

      const data = await inboxService.getConversations(queryParams);
      if (data && Array.isArray(data) && data.length > 0) {
        setConversations(data);
      }
    } catch (err) {
      console.warn('Load conversations fallback:', err);
    }
  };

  // Initial mount load
  useEffect(() => {
    async function initData() {
      await loadConversations(appliedFilters);

      try {
        const contactsRes = await contactsService.getContacts({ limit: 50 });
        if (contactsRes && Array.isArray(contactsRes.data)) {
          setAvailableContacts(contactsRes.data);
        }
      } catch (err) {
        console.warn('Load contacts fallback:', err);
      }
    }
    initData();
  }, []);

  // When opening Filter modal, sync draftFilters from appliedFilters
  const handleOpenFilterModal = () => {
    setDraftFilters({ ...appliedFilters });
    setFilterLabelSearch('');
    setFilterTagSearch('');
    setFilterAgentSearch('');
    setIsFilterModalOpen(true);
  };

  // Calculate active filter count for badge indicator
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.labels?.length > 0) count += appliedFilters.labels.length;
    if (appliedFilters.tags?.length > 0) count += appliedFilters.tags.length;
    if (appliedFilters.chatStatus && appliedFilters.chatStatus !== 'open') count += 1;
    if (appliedFilters.assignees?.length > 0) count += appliedFilters.assignees.length;
    if (appliedFilters.replyStatus?.length > 0) count += appliedFilters.replyStatus.length;
    if (appliedFilters.readUnread && appliedFilters.readUnread !== 'all') count += 1;
    if (appliedFilters.responseWindow && appliedFilters.responseWindow !== 'all') count += 1;
    if (appliedFilters.fromDate || appliedFilters.toDate) count += 1;
    if (appliedFilters.spamChats) count += 1;
    return count;
  }, [appliedFilters]);

  // Dynamically extract unique non-empty labels present across conversations without hardcoding static default labels
  const dynamicLabelsList = useMemo(() => {
    const list = [{ id: 'none', label: 'No Label Attached' }];
    const uniqueSet = new Set();
    conversations.forEach((c) => {
      if (
        c.label &&
        typeof c.label === 'string' &&
        c.label.trim() &&
        c.label !== 'none' &&
        c.label !== 'No Label Attached'
      ) {
        uniqueSet.add(c.label.trim());
      }
    });
    uniqueSet.forEach((lbl) => {
      list.push({ id: lbl, label: lbl });
    });
    return list;
  }, [conversations]);

  // Apply filters from modal
  const handleApplyFilters = async () => {
    setAppliedFilters(draftFilters);
    setIsFilterModalOpen(false);
    await loadConversations(draftFilters);
    showToast('Filters applied successfully', 'success');
  };

  // Reset all filters in modal
  const handleResetAllFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
  };

  const selectedChat = conversations.find((c) => c.id === selectedChatId);

  // Auto scroll messages to bottom on new message or chat select
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Comprehensive conversation filtering (Combines API results with real-time UI filtering)
  const filteredConversations = useMemo(() => {
    return conversations.filter((chat) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = chat.name?.toLowerCase().includes(q);
        const matchesPhone = chat.phone?.includes(q);
        const matchesMsg = chat.messages?.some((m) => m.text?.toLowerCase().includes(q));
        if (!matchesName && !matchesPhone && !matchesMsg) return false;
      }

      // 2. Chat Status
      if (appliedFilters.chatStatus !== 'all') {
        if (chat.statusFilter !== appliedFilters.chatStatus) return false;
      }

      // 3. Tags (OR logic inside tags category)
      if (appliedFilters.tags.length > 0) {
        if (!appliedFilters.tags.includes(chat.tag)) return false;
      }

      // 4. Labels (OR logic inside labels category)
      if (appliedFilters.labels.length > 0) {
        const matchesNoLabel = appliedFilters.labels.includes('none') && (!chat.label || chat.label === '');
        const matchesSpecificLabel = chat.label && appliedFilters.labels.includes(chat.label);
        if (!matchesNoLabel && !matchesSpecificLabel) return false;
      }

      // 5. Assignee (OR logic inside assignee category)
      if (appliedFilters.assignees.length > 0) {
        const matchesMe = appliedFilters.assignees.includes('Me') && chat.assignee === 'Me';
        const matchesUnassigned = appliedFilters.assignees.includes('Unassigned') && (!chat.assignee || chat.assignee === 'Unassigned');
        const matchesSpecific = appliedFilters.assignees.includes(chat.assignee);
        if (!matchesMe && !matchesUnassigned && !matchesSpecific) return false;
      }

      // 6. Reply Status
      if (appliedFilters.replyStatus.length > 0) {
        if (!appliedFilters.replyStatus.includes(chat.replyStatus)) return false;
      }

      // 7. Read / Unread
      if (appliedFilters.readUnread === 'read' && chat.unreadCount > 0) return false;
      if (appliedFilters.readUnread === 'unread' && chat.unreadCount === 0) return false;

      // 8. Response Window
      if (appliedFilters.responseWindow !== 'all') {
        if (chat.responseWindow !== appliedFilters.responseWindow) return false;
      }

      // 9. Spam Chats
      if (appliedFilters.spamChats) {
        if (!chat.isSpam) return false;
      } else {
        if (chat.isSpam) return false;
      }

      // 10. Date Range
      if (appliedFilters.fromDate) {
        const chatDate = new Date(chat.updatedAt || Date.now());
        const fromD = new Date(appliedFilters.fromDate);
        if (chatDate < fromD) return false;
      }
      if (appliedFilters.toDate) {
        const chatDate = new Date(chat.updatedAt || Date.now());
        const toD = new Date(appliedFilters.toDate);
        toD.setHours(23, 59, 59, 999);
        if (chatDate > toD) return false;
      }

      return true;
    });
  }, [conversations, searchQuery, appliedFilters]);

  // Filter contacts in Step 1 New Chat panel
  const filteredNewChatContacts = availableContacts.filter((c) => {
    const term = newChatSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    const msgText = messageInput.trim();
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'me',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedChatId) {
          return {
            ...c,
            lastMessageTime: 'Just now',
            replyStatus: 'replied_manually',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setMessageInput('');
    await inboxService.sendMessage(selectedChatId, msgText);
  };

  // Start chat with an existing contact from Step 1 panel
  const handleSelectExistingContactForChat = async (contact) => {
    setIsNewChatPanelOpen(false);
    setNewChatSearch('');

    const existingChat = conversations.find(
      (c) => c.phone === contact.phone || c.name.toLowerCase() === contact.name.toLowerCase()
    );

    if (existingChat) {
      setSelectedChatId(existingChat.id);
      return;
    }

    const chatPayload = {
      name: contact.name,
      channel: 'whatsapp',
      phone: contact.phone,
      initialMessage: `Hi ${contact.name}, thank you for contacting us!`,
    };

    try {
      const saved = await inboxService.createConversation(chatPayload);
      const newChat = saved || {
        id: `chat_${Date.now()}`,
        ...chatPayload,
        status: 'Online',
        unreadCount: 0,
        lastMessageTime: 'Just now',
        tag: contact.tag || 'Repeat Buyers',
        label: 'VIP',
        statusFilter: 'open',
        assignee: 'Me',
        replyStatus: 'replied_manually',
        responseWindow: 'active',
        isSpam: false,
        messages: [
          {
            id: `m_${Date.now()}`,
            sender: 'me',
            text: chatPayload.initialMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

      setConversations([newChat, ...conversations]);
      setSelectedChatId(newChat.id);
      showToast(`Conversation started with ${contact.name}`, 'success');
    } catch (err) {
      showToast(err.message || 'Error creating chat', 'error');
    }
  };

  // Handle Step 2 "Start Chat" from Centered New Contact Modal
  const handleQuickNewContactSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!quickPhone.trim() || !quickName.trim()) return;

    setQuickCreating(true);
    const fullPhone = `${quickCountryCode} ${quickPhone.trim()}`;
    const contactName = quickName.trim();

    try {
      // 1. Create Contact in Backend
      await contactsService.createContact({
        name: contactName,
        phone: fullPhone,
        tag: 'Repeat Buyers',
        status: 'Open Lead',
        whatsapp_opted: true,
      });

      // 2. Start Conversation
      const chatPayload = {
        name: contactName,
        channel: 'whatsapp',
        phone: fullPhone,
        initialMessage: `Hello ${contactName}! Welcome to ARCO Communication. How can we help you today?`,
      };

      const saved = await inboxService.createConversation(chatPayload);
      const newChat = saved || {
        id: `chat_${Date.now()}`,
        ...chatPayload,
        status: 'Online',
        unreadCount: 0,
        lastMessageTime: 'Just now',
        tag: 'Repeat Buyers',
        label: 'VIP',
        statusFilter: 'open',
        assignee: 'Me',
        replyStatus: 'replied_manually',
        responseWindow: 'active',
        isSpam: false,
        messages: [
          {
            id: `m_${Date.now()}`,
            sender: 'me',
            text: chatPayload.initialMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

      setConversations([newChat, ...conversations]);
      setSelectedChatId(newChat.id);
      setIsNewContactModalOpen(false);
      setQuickPhone('');
      setQuickName('');
      showToast(`Contact created and chat started with ${contactName}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Error creating contact', 'error');
    } finally {
      setQuickCreating(false);
    }
  };

  // Switch from Step 2 Modal to Step 3 Drawer ("+ Add More Details")
  const handleOpenAddMoreDetails = () => {
    setDrawerName(quickName);
    setDrawerPhone(quickPhone);
    setDrawerCountryCode(quickCountryCode);
    setIsNewContactModalOpen(false);
    setIsCreateContactDrawerOpen(true);
  };

  // Handle Step 3 Detailed Contact Creation from Right-Side Drawer
  const handleDrawerContactSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!drawerName.trim() || !drawerPhone.trim()) {
      showToast('Name and Phone Number are required', 'error');
      return;
    }

    setDrawerSubmitting(true);
    const fullPhone = `${drawerCountryCode} ${drawerPhone.trim()}`;
    const contactName = drawerName.trim();

    try {
      // 1. Create Contact in Backend
      await contactsService.createContact({
        name: contactName,
        phone: fullPhone,
        userId: drawerUserId.trim() || undefined,
        email: drawerEmail.trim() || undefined,
        tag: drawerTag || 'Repeat Buyers',
        status: drawerStatus || 'Open Lead',
        accountOwner: drawerOwner,
        whatsapp_opted: drawerOpted === 'yes',
        dealValue: drawerDealValue ? Number(drawerDealValue) : undefined,
      });

      // 2. Start Conversation
      const chatPayload = {
        name: contactName,
        channel: 'whatsapp',
        phone: fullPhone,
        initialMessage: `Hello ${contactName}! Thank you for connecting with us.`,
      };

      const saved = await inboxService.createConversation(chatPayload);
      const newChat = saved || {
        id: `chat_${Date.now()}`,
        ...chatPayload,
        status: 'Online',
        unreadCount: 0,
        lastMessageTime: 'Just now',
        tag: drawerTag || 'Repeat Buyers',
        label: 'VIP',
        statusFilter: 'open',
        assignee: 'Me',
        replyStatus: 'replied_manually',
        responseWindow: 'active',
        isSpam: false,
        messages: [
          {
            id: `m_${Date.now()}`,
            sender: 'me',
            text: chatPayload.initialMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

      setConversations([newChat, ...conversations]);
      setSelectedChatId(newChat.id);
      setIsCreateContactDrawerOpen(false);
      setDrawerName('');
      setDrawerPhone('');
      setDrawerEmail('');
      setDrawerUserId('');
      setDrawerDealValue('');
      showToast(`Contact ${contactName} created successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create contact', 'error');
    } finally {
      setDrawerSubmitting(false);
    }
  };

  // Sample CSV Download in Drawer
  const handleDownloadSampleCsv = () => {
    const csvContent = 'Name,Phone,Email,Tag,Status,Opted,DealValue\nRamesh Kumar,+919876543210,ramesh@example.com,VIP,Customer,TRUE,15000\nAnita Rao,+919823456789,anita@example.com,Lead,Open Lead,TRUE,5000\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'arco_contacts_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Selected in Drawer
  const handleDrawerCsvSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDrawerCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        showToast('CSV file is empty or missing data rows', 'error');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const parsedRows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || '';
        });
        return obj;
      });
      setDrawerCsvPreviewRows(parsedRows);
    };
    reader.readAsText(file);
  };

  // Bulk CSV Upload execution
  const handleDrawerCsvUpload = async () => {
    if (!drawerCsvPreviewRows.length) return;
    setDrawerCsvImporting(true);
    try {
      const formattedRows = drawerCsvPreviewRows.map((r) => ({
        name: r.Name || r.name || 'Unnamed',
        phone: r.Phone || r.phone || '',
        email: r.Email || r.email || '',
        tag: r.Tag || r.tag || 'Lead',
        status: r.Status || r.status || 'Open Lead',
        whatsapp_opted: (r.Opted || r.opted || 'TRUE').toUpperCase() === 'TRUE',
        dealValue: Number(r.DealValue || r.dealValue || 0),
      }));

      const res = await contactsService.bulkUpload(formattedRows);
      if (res && res.success) {
        showToast(`Successfully imported ${res.importedCount || formattedRows.length} contacts!`, 'success');
        setIsCreateContactDrawerOpen(false);
        setDrawerCsvFile(null);
        setDrawerCsvPreviewRows([]);
      } else {
        showToast(res.error || 'Failed to import CSV', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error during bulk upload', 'error');
    } finally {
      setDrawerCsvImporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 relative overflow-hidden font-sans">
      {/* 0. SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Page Content Wrapper with Left Offset */}
      <div className="flex-1 flex flex-col pl-14 sm:pl-16 h-full overflow-hidden">
        
        {/* 1. TOP HEADER (Matching Dashboard Styling) */}
        <header className="bg-white border-b border-slate-200/90 h-16 sm:h-18 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-2xs">
          {/* Brand Logo & Section Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center group">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                ARCO <span className="font-semibold text-slate-800">Communication</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              Team Inbox
            </span>
          </div>

          {/* Right Controls: Trial, Notifications, Settings, Profile */}
          <div className="flex items-center gap-3">
            {/* Trial Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>14 Days Trial Remaining</span>
            </div>

            {/* Notification Button */}
            <button
              type="button"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1.5 right-1.5" />
            </button>

            {/* Settings Button */}
            <Link
              to="/commerce-settings"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{userName}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Owner</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{userName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user.email || 'owner@arcocomm.com'}</div>
                  </div>
                  <div className="p-1">
                    <Link
                      to="/commerce-settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 2. THREE-SECTION WORKSPACE (Full-height split layout) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* A. CONVERSATION LIST PANEL (320px - 360px on desktop) */}
          <div
            className={`w-full lg:w-[340px] xl:w-[360px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full relative ${
              selectedChatId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Top Search & Filter Bar */}
            <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* FUNNEL / FILTERS BUTTON (Interakt Centered Modal Trigger) */}
                <button
                  type="button"
                  onClick={handleOpenFilterModal}
                  className={`p-2 rounded-xl border transition-all relative cursor-pointer shrink-0 ${
                    activeFilterCount > 0
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title="Open Filters"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {activeFilterCount > 0 && (
                    <span className="min-w-4 h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold absolute -top-1.5 -right-1.5 flex items-center justify-center shadow-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Status / Filter Chips Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 capitalize">
                    {appliedFilters.chatStatus === 'all' ? 'All Chats' : `${appliedFilters.chatStatus} Chats`}
                  </span>

                  {appliedFilters.tags.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                      {appliedFilters.tags.length} {appliedFilters.tags.length === 1 ? 'Tag' : 'Tags'}
                    </span>
                  )}

                  {appliedFilters.labels.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[10px] font-bold text-purple-700">
                      {appliedFilters.labels.length} {appliedFilters.labels.length === 1 ? 'Label' : 'Labels'}
                    </span>
                  )}

                  {appliedFilters.readUnread !== 'all' && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 capitalize">
                      {appliedFilters.readUnread}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {filteredConversations.length} {filteredConversations.length === 1 ? 'Chat' : 'Chats'}
                </span>
              </div>
            </div>

            {/* Conversation List Scrollable Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-2 mt-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No Chats Found.</h4>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                    Try adjusting your filters or search query to see more conversations.
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedFilters(DEFAULT_FILTERS);
                        loadConversations(DEFAULT_FILTERS);
                      }}
                      className="mt-2 text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const isSelected = selectedChatId === chat.id;
                  const lastMsg = chat.messages[chat.messages.length - 1];

                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedChatId(chat.id);
                        setConversations((prev) =>
                          prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
                        );
                      }}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                          {chat.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
                          {chat.channel === 'whatsapp' ? (
                            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <InstagramIcon className="w-3 h-3 text-purple-600" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{chat.name}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {chat.lastMessageTime}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.text : 'No messages'}
                        </p>

                        <div className="mt-1.5 flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[90px]">
                              {chat.tag}
                            </span>
                            {chat.label && (
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                {chat.label}
                              </span>
                            )}
                          </div>

                          {chat.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ========================================================================= */}
            {/* STEP 1: COMPACT ATTACHED NEW CHAT PANEL (Matching Interakt) */}
            {/* ========================================================================= */}
            {isNewChatPanelOpen && (
              <div className="absolute bottom-16 left-3 right-3 z-30 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 space-y-3 animate-in slide-in-from-bottom-3 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">New Chat</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewChatPanelOpen(false);
                      setNewChatSearch('');
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    placeholder="Search by name or number..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* + New Contact Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsNewChatPanelOpen(false);
                    setIsNewContactModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>+ New Contact</span>
                </button>

                {/* Quick Select Contacts List */}
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 pt-1">
                  {filteredNewChatContacts.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">
                      No matching contacts. Click + New Contact to add.
                    </p>
                  ) : (
                    filteredNewChatContacts.slice(0, 5).map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => handleSelectExistingContactForChat(contact)}
                        className="py-1.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{contact.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{contact.phone}</p>
                        </div>
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Floating New Conversation Button (+) */}
            <button
              type="button"
              onClick={() => setIsNewChatPanelOpen(!isNewChatPanelOpen)}
              className="absolute bottom-4 right-4 w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-105 cursor-pointer z-20"
              title="Start New Chat"
            >
              {isNewChatPanelOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* B. MAIN CONVERSATION VIEW (Large Right Panel) */}
          <div
            className={`flex-1 flex flex-col bg-slate-50/50 h-full overflow-hidden ${
              !selectedChatId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {selectedChat ? (
              <>
                {/* 1. Chat Header */}
                <div className="h-16 sm:h-18 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedChatId(null)}
                      className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {selectedChat.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{selectedChat.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {selectedChat.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                        <span>{selectedChat.phone}</span>
                        <span>•</span>
                        <span className="capitalize">{selectedChat.channel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Contact details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {selectedChat.messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* 3. Message Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-2xs"
                >
                  <button
                    type="button"
                    className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Insert emoji / template"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      messageInput.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Select a conversation</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Choose a chat from the inbox to view messages, reply to customers, or initiate WhatsApp workflows.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERAKT REPLICATION: CENTERED "FILTERS" MODAL */}
      {/* ========================================================================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-base font-bold text-slate-900">Filters</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                title="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Left Categories + Right Content */}
            <div className="flex-1 flex overflow-hidden min-h-[380px]">
              
              {/* LEFT CATEGORIES NAVIGATION (Exact Interakt Sequence) */}
              <div className="w-48 sm:w-52 border-r border-slate-200 bg-slate-50/70 overflow-y-auto py-2 shrink-0">
                {FILTER_CATEGORIES.map((cat) => {
                  const isActive = activeFilterCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveFilterCategory(cat.id)}
                      className={`w-full px-4 py-2.5 text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50/90 text-emerald-800 font-bold border-l-3 border-emerald-600'
                          : 'text-slate-600 hover:bg-slate-100/70 font-medium'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* RIGHT CONTENT PANEL */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white p-5">
                
                {/* 1. LABELS */}
                {activeFilterCategory === 'labels' && (() => {
                  const filteredLabels = dynamicLabelsList.filter((item) =>
                    item.label.toLowerCase().includes(filterLabelSearch.toLowerCase().trim())
                  );

                  return (
                    <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <h4 className="text-xs font-bold text-slate-900">Labels</h4>
                        {draftFilters.labels.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setDraftFilters({ ...draftFilters, labels: [] })}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={filterLabelSearch}
                          onChange={(e) => setFilterLabelSearch(e.target.value)}
                          placeholder="Search Labels"
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pt-1">
                        {filteredLabels.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No labels found
                          </div>
                        ) : (
                          filteredLabels.map((item) => {
                            const isChecked = draftFilters.labels.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900 select-none py-0.5"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setDraftFilters({
                                        ...draftFilters,
                                        labels: [...draftFilters.labels, item.id],
                                      });
                                    } else {
                                      setDraftFilters({
                                        ...draftFilters,
                                        labels: draftFilters.labels.filter((l) => l !== item.id),
                                      });
                                    }
                                  }}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer accent-emerald-600"
                                />
                                <span>{item.label}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. TAGS */}
                {activeFilterCategory === 'tags' && (
                  <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Tags</h4>
                      {draftFilters.tags.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, tags: [] })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={filterTagSearch}
                        onChange={(e) => setFilterTagSearch(e.target.value)}
                        placeholder="Search Tags"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pt-1">
                      {STANDARD_TAGS.filter((t) => t.toLowerCase().includes(filterTagSearch.toLowerCase())).map((tg) => (
                        <label key={tg} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={draftFilters.tags.includes(tg)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDraftFilters({ ...draftFilters, tags: [...draftFilters.tags, tg] });
                              } else {
                                setDraftFilters({ ...draftFilters, tags: draftFilters.tags.filter((t) => t !== tg) });
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{tg}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CHAT STATUS */}
                {activeFilterCategory === 'chat_status' && (
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Chat Status</h4>
                      {draftFilters.chatStatus !== 'open' && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, chatStatus: 'open' })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftChatStatus"
                          value="all"
                          checked={draftFilters.chatStatus === 'all'}
                          onChange={() => setDraftFilters({ ...draftFilters, chatStatus: 'all' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>All Chats</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftChatStatus"
                          value="open"
                          checked={draftFilters.chatStatus === 'open'}
                          onChange={() => setDraftFilters({ ...draftFilters, chatStatus: 'open' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>Open Chats</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftChatStatus"
                          value="closed"
                          checked={draftFilters.chatStatus === 'closed'}
                          onChange={() => setDraftFilters({ ...draftFilters, chatStatus: 'closed' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>Closed Chats</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 4. ASSIGNEE */}
                {activeFilterCategory === 'assignee' && (
                  <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Assignee</h4>
                      {draftFilters.assignees.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, assignees: [] })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={filterAgentSearch}
                        onChange={(e) => setFilterAgentSearch(e.target.value)}
                        placeholder="Search Agent Name"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pt-1">
                      {STANDARD_AGENTS.filter((a) => a.name.toLowerCase().includes(filterAgentSearch.toLowerCase())).map((agent) => (
                        <label key={agent.id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={draftFilters.assignees.includes(agent.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDraftFilters({ ...draftFilters, assignees: [...draftFilters.assignees, agent.id] });
                              } else {
                                setDraftFilters({ ...draftFilters, assignees: draftFilters.assignees.filter((a) => a !== agent.id) });
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{agent.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. REPLY STATUS */}
                {activeFilterCategory === 'reply_status' && (
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Reply Status</h4>
                      {draftFilters.replyStatus.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, replyStatus: [] })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={draftFilters.replyStatus.includes('unreplied')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDraftFilters({ ...draftFilters, replyStatus: [...draftFilters.replyStatus, 'unreplied'] });
                            } else {
                              setDraftFilters({ ...draftFilters, replyStatus: draftFilters.replyStatus.filter((r) => r !== 'unreplied') });
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Unreplied</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={draftFilters.replyStatus.includes('replied_manually')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDraftFilters({ ...draftFilters, replyStatus: [...draftFilters.replyStatus, 'replied_manually'] });
                            } else {
                              setDraftFilters({ ...draftFilters, replyStatus: draftFilters.replyStatus.filter((r) => r !== 'replied_manually') });
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Replied Manually</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={draftFilters.replyStatus.includes('replied_by_bot')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDraftFilters({ ...draftFilters, replyStatus: [...draftFilters.replyStatus, 'replied_by_bot'] });
                            } else {
                              setDraftFilters({ ...draftFilters, replyStatus: draftFilters.replyStatus.filter((r) => r !== 'replied_by_bot') });
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Replied by Bot</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 6. READ / UNREAD */}
                {activeFilterCategory === 'read_unread' && (
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Read/Unread</h4>
                      {draftFilters.readUnread !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, readUnread: 'all' })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftReadUnread"
                          value="all"
                          checked={draftFilters.readUnread === 'all'}
                          onChange={() => setDraftFilters({ ...draftFilters, readUnread: 'all' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>All</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftReadUnread"
                          value="read"
                          checked={draftFilters.readUnread === 'read'}
                          onChange={() => setDraftFilters({ ...draftFilters, readUnread: 'read' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>Read</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftReadUnread"
                          value="unread"
                          checked={draftFilters.readUnread === 'unread'}
                          onChange={() => setDraftFilters({ ...draftFilters, readUnread: 'unread' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>Unread</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 7. RESPONSE WINDOW */}
                {activeFilterCategory === 'response_window' && (
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Response Window</h4>
                      {draftFilters.responseWindow !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, responseWindow: 'all' })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftResponseWindow"
                          value="all"
                          checked={draftFilters.responseWindow === 'all'}
                          onChange={() => setDraftFilters({ ...draftFilters, responseWindow: 'all' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>All</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftResponseWindow"
                          value="active"
                          checked={draftFilters.responseWindow === 'active'}
                          onChange={() => setDraftFilters({ ...draftFilters, responseWindow: 'active' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>Active</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="draftResponseWindow"
                          value="inactive"
                          checked={draftFilters.responseWindow === 'inactive'}
                          onChange={() => setDraftFilters({ ...draftFilters, responseWindow: 'inactive' })}
                          className="w-3.5 h-3.5 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>Inactive</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 8. LAST MESSAGE TIME */}
                {activeFilterCategory === 'last_message_time' && (
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Last Message Time</h4>
                      {(draftFilters.fromDate || draftFilters.toDate) && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, fromDate: '', toDate: '' })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          From
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={draftFilters.fromDate}
                            onChange={(e) => setDraftFilters({ ...draftFilters, fromDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          To
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={draftFilters.toDate}
                            onChange={(e) => setDraftFilters({ ...draftFilters, toDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. SPAM CHATS */}
                {activeFilterCategory === 'spam_chats' && (
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-bold text-slate-900">Spam Chats</h4>
                      {draftFilters.spamChats && (
                        <button
                          type="button"
                          onClick={() => setDraftFilters({ ...draftFilters, spamChats: false })}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={draftFilters.spamChats}
                          onChange={(e) => setDraftFilters({ ...draftFilters, spamChats: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Show Spam Chats</span>
                      </label>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Modal Bottom Footer (Reset All & Apply Filter) */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Apply Filter
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CENTERED "NEW CONTACT" MODAL (Matching Interakt Screenshot) */}
      {/* ========================================================================= */}
      {isNewContactModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5 animate-in zoom-in-95 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">New Contact</h3>
              <button
                type="button"
                onClick={() => setIsNewContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickNewContactSubmit} className="space-y-4">
              {/* 1. Contact Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={quickCountryCode}
                    onChange={(e) => setQuickCountryCode(e.target.value)}
                    className="w-24 px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* 2. Contact Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              {/* 3. + Add More Details link */}
              <div>
                <button
                  type="button"
                  onClick={handleOpenAddMoreDetails}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer transition-colors inline-flex items-center gap-1"
                >
                  <span>+ Add More Details</span>
                </button>
              </div>

              {/* Bottom: Start Chat button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!quickPhone.trim() || !quickName.trim() || quickCreating}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{quickCreating ? 'Starting Chat...' : 'Start Chat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: "CREATE CONTACTS" RIGHT-SIDE DRAWER (Matching Interakt Screenshot) */}
      {/* ========================================================================= */}
      {isCreateContactDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 font-sans">
            
            {/* Drawer Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Create Contacts</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateContactDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Choose a Method */}
              <div>
                <p className="text-xs font-bold text-slate-900 mb-3">
                  Choose a Method to Create Contacts.
                </p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="createContactMethod"
                      value="manual"
                      checked={createContactMethod === 'manual'}
                      onChange={() => setCreateContactMethod('manual')}
                      className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <span>Manual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="createContactMethod"
                      value="automated"
                      checked={createContactMethod === 'automated'}
                      onChange={() => setCreateContactMethod('automated')}
                      className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <span>Automated</span>
                  </label>
                </div>
              </div>

              {/* SECTION 1: CREATE CONTACTS VIA BULK UPLOAD */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  Create Contacts Via Bulk Upload
                </h4>

                {/* Dashed Upload Area */}
                <div
                  onClick={() => drawerFileInputRef.current?.click()}
                  className="p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {drawerCsvFile ? drawerCsvFile.name : 'Select a CSV file to upload'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    or drag and drop it here
                  </p>
                  <input
                    type="file"
                    ref={drawerFileInputRef}
                    accept=".csv"
                    onChange={handleDrawerCsvSelected}
                    className="hidden"
                  />
                </div>

                {/* Watch Video & Download Sample CSV links */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => showToast('Tutorial video: Standard CSV with Name and Phone headers', 'success')}
                    className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Watch Video</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download sample CSV</span>
                  </button>
                </div>

                {/* Collapsible Instructions to upload CSV */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsCsvInstructionsOpen(!isCsvInstructionsOpen)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-left flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <span>Instructions to upload CSV</span>
                    {isCsvInstructionsOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isCsvInstructionsOpen && (
                    <div className="p-3.5 bg-white text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
                      <p>1. Column headers must include: <span className="font-mono text-slate-800">Name</span> and <span className="font-mono text-slate-800">Phone</span>.</p>
                      <p>2. Optional headers: <span className="font-mono text-slate-800">Email, Tag, Status, Opted, DealValue</span>.</p>
                      <p>3. Phone numbers should include country code prefix (e.g. +919876543210).</p>
                    </div>
                  )}
                </div>

                {/* CSV Preview and Upload Button */}
                {drawerCsvPreviewRows.length > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>{drawerCsvPreviewRows.length} contacts detected in CSV</span>
                      <button
                        type="button"
                        onClick={handleDrawerCsvUpload}
                        disabled={drawerCsvImporting}
                        className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                      >
                        {drawerCsvImporting ? 'Importing...' : 'Upload & Import'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* SECTION 2: CREATE CONTACT INDIVIDUALLY */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900">
                  Create Contact Individually
                </h4>

                <form onSubmit={handleDrawerContactSubmit} id="create-contact-drawer-form" className="space-y-4">
                  {/* 1. Name * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={drawerName}
                      onChange={(e) => setDrawerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* 2. Phone Number * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={drawerCountryCode}
                        onChange={(e) => setDrawerCountryCode(e.target.value)}
                        className="w-24 px-2 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={drawerPhone}
                        onChange={(e) => setDrawerPhone(e.target.value)}
                        placeholder="9876543210"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* 3. User Id */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      User Id
                    </label>
                    <input
                      type="text"
                      value={drawerUserId}
                      onChange={(e) => setDrawerUserId(e.target.value)}
                      placeholder="e.g. USR_104"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* 4. Status * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={drawerStatus}
                      onChange={(e) => setDrawerStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="Open Lead">Open Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Customer">Customer</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* 5. Account Owner * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Owner <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={drawerOwner}
                      onChange={(e) => setDrawerOwner(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="Shraddha (Admin)">Shraddha (Admin)</option>
                      <option value="Support Agent 1">Support Agent 1</option>
                      <option value="Sales Representative">Sales Representative</option>
                    </select>
                  </div>

                  {/* 6. Add Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Add Tag
                    </label>
                    <select
                      value={drawerTag}
                      onChange={(e) => setDrawerTag(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      {STANDARD_TAGS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 7. Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={drawerEmail}
                      onChange={(e) => setDrawerEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* 8. WhatsApp Opted */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      WhatsApp Opted
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="drawerOpted"
                          value="yes"
                          checked={drawerOpted === 'yes'}
                          onChange={() => setDrawerOpted('yes')}
                          className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="drawerOpted"
                          value="no"
                          checked={drawerOpted === 'no'}
                          onChange={() => setDrawerOpted('no')}
                          className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {/* 9. Contact Deal Value */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Deal Value
                    </label>
                    <input
                      type="number"
                      value={drawerDealValue}
                      onChange={(e) => setDrawerDealValue(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </form>
              </div>

            </div>

            {/* Drawer Footer with Submit Button */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateContactDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-contact-drawer-form"
                disabled={drawerSubmitting || !drawerName.trim() || !drawerPhone.trim()}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {drawerSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
