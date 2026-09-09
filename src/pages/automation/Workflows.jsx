import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Layers,
  Plus,
  Minus,
  PlusCircle,
  Smile,
  Play,
  Edit3,
  Copy,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  Search,
  RefreshCw,
  X,
  ArrowDown,
  MessageSquare,
  HelpCircle,
  UserCheck,
  Tag,
  Clock,
  Save,
  CheckSquare,
  MoreVertical,
  Settings,
  Info,
  GitBranch,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  ListFilter,
  FileText,
  Sliders,
  DollarSign,
  Eraser,
  Calculator,
  ShoppingBag,
  ExternalLink,
  Target,
  Code,
  Webhook,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Unlock,
  Zap,
  GripVertical,
  MinusCircle,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

const DEFAULT_USER_TRAITS = [
  'id',
  'user_id',
  'phone_number',
  'Email',
  'name',
  'created_at_utc',
  'country_code',
  'whatsapp_opted_in',
  'marked_spam',
  'source_id',
  'ctwa_clid',
  'source_url',
  '_internal_company_name',
  '_internal_stage_id',
  '_internal_stage_id_updated_at',
  '_internal_contact_owner_id',
  '_internal_lead_source',
  '_internal_closure_date',
  '_internal_lead_gen_workflow_trigger',
  '_internal_contact_deal_value',
  '_internal_add_to_sales_cycle',
  'row_number',
  'failure_reason',
];

const CONDITION_OPERATORS = [
  'Equal',
  'Not Equal',
  'Contains',
  'Not Contains',
  'Starts With',
  'Not Starts With',
  'Greater Than',
  'Less Than',
  'Is Empty',
  'Is Not Empty',
  'One Of',
];

const WORKFLOW_TEMPLATES = [
  {
    id: 'tpl_vehicle_service_booking',
    name: 'Vehicle service booking',
    description: 'Automated workflow for booking car and bike service appointments with date and slot selection',
    trigger: 'User sends a WhatsApp message',
    keywords: 'service, bike service, car repair, vehicle maintenance, booking',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Hello! Welcome to our Vehicle Service Center 🚗. Please let us know how we can assist you today.' },
      },
      {
        id: 'node_2',
        type: 'message_buttons',
        label: 'Message + Buttons',
        x: 880,
        y: 100,
        data: { text: 'Please choose your preferred service package:', buttons: ['Periodic Maintenance', 'Express Oil Change', 'Accidental Repair', 'Custom Inquiry'] },
      },
      {
        id: 'node_3',
        type: 'assign_agent',
        label: 'Assign Chat to Agent',
        x: 1280,
        y: 100,
        data: { agent: 'Service Desk Team', queue: 'Auto Routing' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
      { id: 'edge_node_1_node_2', source: 'node_1', target: 'node_2' },
      { id: 'edge_node_2_node_3', source: 'node_2', target: 'node_3' },
    ],
  },
  {
    id: 'tpl_lead_gen_all_industry',
    name: 'Lead Gen - all industry',
    description: 'Universal lead capture and qualification chatbot workflow for inbound customer inquiries',
    trigger: 'User sends a WhatsApp message',
    keywords: 'hi, hello, inquiry, get started, interested, pricing, demo',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Hi there! 👋 Thanks for reaching out. We would love to learn more about your business needs.' },
      },
      {
        id: 'node_2',
        type: 'message_buttons',
        label: 'Message + Buttons',
        x: 880,
        y: 100,
        data: { text: 'Which department or solution are you interested in?', buttons: ['Sales Solutions', 'Marketing Automation', 'Enterprise API', 'Other'] },
      },
      {
        id: 'node_3',
        type: 'update_tag',
        label: 'Update Field / Tag',
        x: 1280,
        y: 100,
        data: { tag: 'Qualified Lead' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
      { id: 'edge_node_1_node_2', source: 'node_1', target: 'node_2' },
      { id: 'edge_node_2_node_3', source: 'node_2', target: 'node_3' },
    ],
  },
  {
    id: 'tpl_healthcare_supplements_lead_gen',
    name: 'Healthcare supplements - lead gen',
    description: 'Health & nutrition supplement recommendation and consultation lead generation flow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'supplements, vitamins, health, fitness, nutrition, consultation',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Welcome to VitalHealth Nutrition! 🌿 Let us help you find the perfect supplements tailored to your health goals.' },
      },
      {
        id: 'node_2',
        type: 'message_buttons',
        label: 'Message + Buttons',
        x: 880,
        y: 100,
        data: { text: 'What is your primary wellness goal?', buttons: ['Weight Management', 'Immunity & Energy', 'Muscle Growth', 'General Wellness'] },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
      { id: 'edge_node_1_node_2', source: 'node_1', target: 'node_2' },
    ],
  },
  {
    id: 'tpl_vehicle_insurance_renewal',
    name: 'Vehicle Insurance renewal',
    description: 'Automated vehicle insurance policy quote generation and instant renewal reminder workflow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'insurance, policy renewal, quote, motor insurance, renew policy',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Protect your journey! 🛡️ Renew your vehicle insurance in under 2 minutes with instant zero-dep cover.' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_lead_gen_agency',
    name: 'Lead Gen - Agency',
    description: 'Digital agency client qualification, budget estimation, and discovery call booking flow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'agency, marketing, web design, branding, ads, seo, development',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Welcome to our Creative Digital Agency! 🚀 We help ambitious brands grow through design, performance ads, and tech.' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_product_feedback',
    name: 'Product Feedback',
    description: 'Post-purchase product experience survey and customer satisfaction review collector',
    trigger: 'User sends a WhatsApp message',
    keywords: 'feedback, review, product review, rating, experience',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Hi! We hope you love your recent order. 🛍️ How was your experience with the product?' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_capture_a_testimonial',
    name: 'Capture a Testimonial',
    description: 'Automated customer testimonial, video review, and rating capture workflow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'testimonial, customer story, video review, success story',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Thank you for being our customer! 🌟 We would love to feature your success story.' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_healthcare_appointment_booking',
    name: 'Healthcare - Appointment Booking',
    description: 'Doctor consultation, clinic visit, and medical specialist appointment booking flow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'doctor, clinic, hospital, appointment, medical, consultation, specialist',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Welcome to CarePlus Health Clinic 🏥. How can we assist your medical needs?' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_lead_gen_new_student_registration',
    name: 'Lead Gen - New Student Registration',
    description: 'School, college, coaching, or university admission inquiry and course registration flow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'admissions, student, course, enroll, academy, tuition, syllabus',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Welcome to Apex Learning Academy! 🎓 Admissions are now open for the upcoming academic year.' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_nps',
    name: 'NPS',
    description: 'Net Promoter Score (0-10) customer loyalty and satisfaction score collector',
    trigger: 'User sends a WhatsApp message',
    keywords: 'nps, score, recommend, satisfaction score, loyalty',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'On a scale of 0 to 10, how likely are you to recommend us to a friend or colleague? 📊' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_appointment_booking_general',
    name: 'Appointment booking - General',
    description: 'Versatile calendar slot booking for consultations, sales calls, and customer visits',
    trigger: 'User sends a WhatsApp message',
    keywords: 'book, schedule, calendar, meeting, consultation, demo slot',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Hello! Let us get you scheduled on our calendar. 📅' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_lead_gen_with_pincode',
    name: 'Lead Gen - with pincode',
    description: 'Location and pincode-based lead capture and serviceability check flow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'pincode, location, area, delivery check, serviceable, near me',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Hi! Let us check service availability in your area. 📍' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
  {
    id: 'tpl_pathology_center_booking',
    name: 'Pathology center - booking',
    description: 'Diagnostic lab test booking, home sample collection, and prescription upload flow',
    trigger: 'User sends a WhatsApp message',
    keywords: 'blood test, lab, pathology, health checkup, diagnostic, sample collection',
    nodes: [
      {
        id: 'node_1',
        type: 'plain_message',
        label: 'Plain Message',
        x: 480,
        y: 100,
        data: { text: 'Welcome to CityPath Diagnostic Labs 🔬. Book your health tests with free home sample collection.' },
      },
    ],
    edges: [
      { id: 'edge_trigger_node_1', source: 'trigger', target: 'node_1' },
    ],
  },
];

// Calculate SVG orthogonal stepped path matching the reference screenshot
function getSteppedPath(x1, y1, x2, y2) {
  const midX = x1 + Math.max(30, (x2 - x1) / 2);
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}

export default function Workflows() {
  const navigate = useNavigate();
  const { id: routeWorkflowId } = useParams();

  const [workflows, setWorkflows] = useState([
    {
      id: 'wf_ai_proj_1',
      name: 'ai_project_progress_notifications_7i',
      trigger: '--',
      action: 'Workflow',
      executions: 0,
      created_at: '2026-09-04T08:00:00.000Z',
      updated_at: '2026-09-04T08:00:00.000Z',
    },
    {
      id: 'wf_ai_tech_2',
      name: 'ai_technical_support_ticketing_ja',
      trigger: '--',
      action: 'Workflow',
      executions: 0,
      created_at: '2026-09-04T08:00:00.000Z',
      updated_at: '2026-09-04T08:00:00.000Z',
    },
    {
      id: 'wf_ai_onb_3',
      name: 'ai_automated_client_onboarding_je',
      trigger: '--',
      action: 'Workflow',
      executions: 0,
      created_at: '2026-09-04T08:00:00.000Z',
      updated_at: '2026-09-04T08:00:00.000Z',
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTopNoticeVisible, setIsTopNoticeVisible] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // 1. Template Modal State ('Choose from the Workflow')
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // 2. Name Input Dialog State ('Create a new Workflow' - Screenshots 1 & 2)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newWorkflowNameInput, setNewWorkflowNameInput] = useState('');

  // 3. Canvas Visual Builder Active State (Screenshots 3 & 4)
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isCanvasLocked, setIsCanvasLocked] = useState(false);
  const [isActionsCollapsed, setIsActionsCollapsed] = useState(false);
  const [isMessagesAccordionOpen, setIsMessagesAccordionOpen] = useState(true);
  const [isSmartbizAccordionOpen, setIsSmartbizAccordionOpen] = useState(false);
  const [isTriggerDrawerOpen, setIsTriggerDrawerOpen] = useState(false);
  const [triggerModalStep, setTriggerModalStep] = useState('choose_trigger');
  const [triggerMatchType, setTriggerMatchType] = useState('exact');
  const [triggerKeywordInput, setTriggerKeywordInput] = useState('');
  const [triggerKeywordsList, setTriggerKeywordsList] = useState([]);
  const [isSaveTriggerResponseOpen, setIsSaveTriggerResponseOpen] = useState(false);
  const [saveResponseType, setSaveResponseType] = useState('user_trait');
  const [selectedUserTrait, setSelectedUserTrait] = useState('');
  const [customWorkflowVariable, setCustomWorkflowVariable] = useState('');

  // Selected Node Side Editor Drawer State (Interakt-style Send a Message panel)
  const [selectedEditingNodeId, setSelectedEditingNodeId] = useState(null);
  const [nodeMenuId, setNodeMenuId] = useState(null);
  const [isVariablesSectionOpen, setIsVariablesSectionOpen] = useState(false);
  const [isQuickReplySectionOpen, setIsQuickReplySectionOpen] = useState(true);
  const [listConfigNodeId, setListConfigNodeId] = useState(null);
  const [activeTraitDropdownKey, setActiveTraitDropdownKey] = useState(null);
  const [activeOperatorDropdownKey, setActiveOperatorDropdownKey] = useState(null);
  const [traitSearchQuery, setTraitSearchQuery] = useState('');

  // Webhook Drawer Accordions State matching user screenshot
  const [openWebhookAccordions, setOpenWebhookAccordions] = useState({
    define_url: false,
    customize_header: false,
    customize_body: false,
    save_response: false,
    error_handling: false,
    variables: false,
  });
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState(null);
  const [activeVariablePickerTarget, setActiveVariablePickerTarget] = useState(null);

  const toggleWebhookAccordion = (key) => {
    setOpenWebhookAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const [customUserTraits, setCustomUserTraits] = useState([]);
  const [isAddingNewTrait, setIsAddingNewTrait] = useState(false);
  const [newTraitInput, setNewTraitInput] = useState('');

  // Canvas Navigation and Panning State
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Interactive Connection State
  const [connectingSource, setConnectingSource] = useState(null); // { nodeId: string, portType: 'output' }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleImageUpload = (e, nodeId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result;
      if (url) {
        handleUpdateNodeData(nodeId, 'imageUrl', url);
        handleUpdateNodeData(nodeId, 'attachmentUrl', url);
        handleUpdateNodeData(nodeId, 'attachmentType', 'image');
        handleUpdateNodeData(nodeId, 'imageName', file.name);
        showToast('Image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e, nodeId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result;
      if (url) {
        handleUpdateNodeData(nodeId, 'videoUrl', url);
        handleUpdateNodeData(nodeId, 'attachmentUrl', url);
        handleUpdateNodeData(nodeId, 'attachmentType', 'video');
        handleUpdateNodeData(nodeId, 'videoName', file.name);
        showToast('Video uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await automationService.getWorkflows(params);
      if (res?.data) {
        setWorkflows(res.data);

        if (routeWorkflowId) {
          const match = res.data.find((w) => w.id === routeWorkflowId);
          if (match) {
            setActiveWorkflow({
              ...match,
              nodes: Array.isArray(match.nodes) ? match.nodes : [],
              edges: Array.isArray(match.edges) ? match.edges : [],
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [searchQuery, routeWorkflowId]);

  // Left click on background to start canvas pan
  const handleCanvasMouseDown = (e) => {
    if (e.button === 0 && !isCanvasLocked && !draggingNodeId && !connectingSource) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
    }
  };

  // Track mouse coordinates on canvas for live connection line, canvas panning & card dragging
  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
    const y = (e.clientY - rect.top - canvasPan.y) / canvasZoom;

    if (connectingSource) {
      setMousePos({ x, y });
    }

    if (isPanning && !isCanvasLocked && !draggingNodeId && !connectingSource) {
      setCanvasPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    if (draggingNodeId && !isCanvasLocked) {
      setActiveWorkflow((prev) => {
        if (!prev) return prev;
        if (draggingNodeId === 'trigger') {
          return {
            ...prev,
            triggerX: Math.max(20, x - dragOffset.x),
            triggerY: Math.max(20, y - dragOffset.y),
          };
        }
        return {
          ...prev,
          nodes: prev.nodes.map((n) =>
            n.id === draggingNodeId
              ? { ...n, x: Math.max(20, x - dragOffset.x), y: Math.max(20, y - dragOffset.y) }
              : n
          ),
        };
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggingNodeId) setDraggingNodeId(null);
  };

  // Start dragging or clicking to initiate a connection from an Output port (blue/green dot)
  const handleStartConnection = (nodeId, arg2, arg3) => {
    let portType = 'output';
    let e = null;
    if (typeof arg2 === 'string') {
      portType = arg2;
      e = arg3;
    } else if (arg2 && typeof arg2 === 'object') {
      e = arg2;
    }

    if (e && e.stopPropagation) e.stopPropagation();

    let x = 0;
    let y = 0;
    if (canvasRef.current && e && e.clientX !== undefined) {
      const rect = canvasRef.current.getBoundingClientRect();
      x = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
      y = (e.clientY - rect.top - canvasPan.y) / canvasZoom;
    } else {
      const pos = getNodePortPos(nodeId, portType);
      x = pos.x;
      y = pos.y;
    }

    setConnectingSource({ nodeId, portType });
    setMousePos({ x, y });
  };

  // Drop or click on Input port (blue dot) on target node to complete connection
  const handleCompleteConnection = (targetNodeId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!connectingSource) return;
    if (connectingSource.nodeId === targetNodeId) {
      setConnectingSource(null);
      return;
    }

    const portType = connectingSource.portType || 'output';
    const newEdge = {
      id: `edge_${connectingSource.nodeId}_${portType}_${targetNodeId}`,
      source: connectingSource.nodeId,
      sourcePort: portType,
      target: targetNodeId,
    };

    setActiveWorkflow((prev) => {
      const existing = (prev.edges || []).filter(
        (ed) =>
          !(
            ed.source === newEdge.source &&
            (ed.sourcePort || 'output') === newEdge.sourcePort &&
            ed.target === newEdge.target
          )
      );
      return {
        ...prev,
        edges: [...existing, newEdge],
      };
    });

    setConnectingSource(null);
    showToast('Connected!');
  };

  // Delete edge
  const handleDeleteEdge = (edgeId) => {
    setActiveWorkflow((prev) => ({
      ...prev,
      edges: (prev.edges || []).filter((ed) => ed.id !== edgeId),
    }));
    showToast('Connection removed');
  };

  // Handle "+ New Workflow" button click
  const handleOpenNewWorkflow = () => {
    setIsTemplateModalOpen(true);
  };

  // Click "+ Create from Scratch" in Template Gallery -> Opens "Create a new Workflow" name dialog
  const handleOpenCreateFromScratchDialog = () => {
    setIsTemplateModalOpen(false);
    setNewWorkflowNameInput('');
    setIsNameDialogOpen(true);
  };

  // Confirm new workflow name -> Navigates to full Visual Canvas Builder
  const handleConfirmCreateFromScratch = async () => {
    const trimmed = newWorkflowNameInput.trim();
    if (!trimmed) return;

    const newWf = {
      id: `wf_${Date.now()}`,
      name: trimmed,
      description: `Custom workflow: ${trimmed}`,
      trigger: 'When to trigger the workflow',
      trigger_config: { keywords: ['start', 'hi', 'hello'] },
      triggerX: 60,
      triggerY: 100,
      nodes: [],
      edges: [],
      is_active: false,
    };

    setIsNameDialogOpen(false);
    setActiveWorkflow(newWf);
  };

  // Select a template from the list
  const handleSelectTemplate = (tpl) => {
    setIsTemplateModalOpen(false);
    const newWf = {
      id: `wf_${Date.now()}`,
      name: tpl.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      description: tpl.description,
      trigger: tpl.trigger,
      trigger_config: { keywords: tpl.keywords.split(',').map((k) => k.trim()) },
      triggerX: 60,
      triggerY: 100,
      nodes: tpl.nodes,
      edges: tpl.edges || [],
      is_active: true,
    };
    setActiveWorkflow(newWf);
  };

  // Edit existing workflow from list
  const handleOpenEdit = (wf) => {
    setActiveWorkflow({
      ...wf,
      triggerX: wf.trigger_config?.triggerX || wf.triggerX || 60,
      triggerY: wf.trigger_config?.triggerY || wf.triggerY || 100,
      nodes: Array.isArray(wf.nodes) ? wf.nodes : [],
      edges: Array.isArray(wf.edges) ? wf.edges : [],
    });
    setActiveMenuId(null);
  };

  // Open Trigger Configuration Modal
  const handleOpenTriggerModal = () => {
    setTriggerModalStep('choose_trigger');
    setTriggerMatchType(activeWorkflow?.trigger_config?.match_type || 'exact');
    setTriggerKeywordsList(activeWorkflow?.trigger_config?.keywords || []);
    setTriggerKeywordInput('');
    setIsSaveTriggerResponseOpen(Boolean(activeWorkflow?.trigger_config?.save_response));
    setSaveResponseType(activeWorkflow?.trigger_config?.save_response?.type || 'user_trait');
    setSelectedUserTrait(activeWorkflow?.trigger_config?.save_response?.trait || '');
    setIsTriggerDrawerOpen(true);
  };

  // Save workflow in canvas builder
  const handleSaveWorkflow = async () => {
    if (!activeWorkflow) return;
    try {
      const payload = {
        name: activeWorkflow.name,
        description: activeWorkflow.description || `Workflow ${activeWorkflow.name}`,
        trigger: activeWorkflow.trigger || 'Inbound Trigger',
        trigger_config: {
          ...(activeWorkflow.trigger_config || {}),
          triggerX: activeWorkflow.triggerX || 60,
          triggerY: activeWorkflow.triggerY || 100,
          keywords: activeWorkflow.trigger_config?.keywords || ['hi', 'start'],
        },
        nodes: activeWorkflow.nodes || [],
        edges: activeWorkflow.edges || [],
        is_active: activeWorkflow.is_active !== false,
      };

      if (workflows.some((w) => w.id === activeWorkflow.id)) {
        await automationService.updateWorkflow(activeWorkflow.id, payload);
        showToast('Workflow saved successfully!');
      } else {
        const createRes = await automationService.createWorkflow(payload);
        if (createRes?.data?.id) {
          setActiveWorkflow((prev) => ({ ...prev, id: createRes.data.id }));
        }
        showToast('Workflow created and saved successfully!');
      }
      loadWorkflows();
    } catch (err) {
      showToast(err.message || 'Failed to save workflow');
    }
  };

  // Export workflow definition as JSON
  const handleExportResponses = () => {
    if (!activeWorkflow) return;
    const dataToExport = {
      workflowId: activeWorkflow.id,
      workflowName: activeWorkflow.name,
      exportedAt: new Date().toISOString(),
      executionsCount: activeWorkflow.executions || 0,
      trigger: activeWorkflow.trigger,
      trigger_config: activeWorkflow.trigger_config,
      nodes: activeWorkflow.nodes || [],
      edges: activeWorkflow.edges || [],
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeWorkflow.name || 'workflow').replace(/[^a-z0-9_-]/gi, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Workflow exported successfully!');
  };

  // Add node from Left Actions Palette onto the canvas (without auto-edge, allowing manual drag connect)
  const handleAddActionNode = (actionType, label) => {
    if (!activeWorkflow) return;

    const nodeCount = (activeWorkflow.nodes || []).length;
    const newNodeId = `node_${Date.now()}`;
    const newX = (activeWorkflow.nodes && activeWorkflow.nodes.length > 0)
      ? Math.max(...activeWorkflow.nodes.map(n => n.x || 0)) + 380
      : (activeWorkflow.triggerX || 60) + 380;
    const newY = 100 + (nodeCount % 2 === 0 ? 0 : 40);

    const isMessageImage = actionType === 'message_image';
    const isMessageVideo = actionType === 'message_video';
    const isMessageList = actionType === 'message_list';
    const isMessageButtons = actionType === 'message_buttons';
    const isWaForm = actionType === 'wa_form';
    const isMessageCarousel = actionType === 'message_carousel';
    const isMessage = actionType.includes('message') || isWaForm;

    const newNode = {
      id: newNodeId,
      type: actionType,
      label: isMessageCarousel ? 'Send Message + Carousel' : (isWaForm ? 'Send WhatsApp Form' : (actionType === 'condition' ? 'Set a Condition' : (actionType === 'trigger_webhook' ? 'Trigger a Webhook' : (isMessage ? 'Send a Message' : label)))),
      x: newX,
      y: newY,
      data: {
        text: (isMessageImage || isMessageVideo || isMessageList || isWaForm || isMessageCarousel || actionType === 'condition') ? '' : (isMessage ? 'Hello! Thank you for connecting with us.' : ''),
        buttons: isMessageButtons ? ['View Options', 'Speak to Agent'] : [],
        addMoreType: isMessageButtons ? 'quick_reply' : (isMessageList ? 'list' : 'none'),
        attachmentType: isMessageImage ? 'image' : (isMessageVideo ? 'video' : 'none'),
        imageUrl: '',
        videoUrl: '',
        attachmentUrl: '',
        imageName: '',
        videoName: '',
        listName: '',
        listButtonText: 'Select an Option',
        formButtonText: '',
        selectedFormName: '',
        formOpenAction: 'first_screen',
        carouselCards: [
          {
            id: `card_${Date.now()}`,
            imageUrl: '',
            imageName: '',
            bodyText: '',
            buttons: [],
          },
        ],
        conditions: actionType === 'condition' ? [
          {
            id: `cond_${Date.now()}_1`,
            sourceType: 'user_trait',
            trait: '',
            workflowVar: '',
            operator: '',
            value: '',
          },
        ] : [],
        isSaveUserResponseOpen: false,
        hasValidationRule: false,
        tag: actionType === 'update_tag' ? 'Interested Customer' : '',
        webhookMethod: actionType === 'trigger_webhook' ? 'GET' : 'POST',
        webhookUrl: '',
        customHeaders: [],
        webhookHeaders: actionType === 'trigger_webhook' ? [{ key: 'Content-Type', value: 'application/json' }] : [],
        webhookBody: actionType === 'trigger_webhook' ? '{}' : '',
        bodyType: 'json',
        responseMappings: actionType === 'trigger_webhook' ? [{ key: 'data.id', trait: 'user_id' }] : [],
        errorAction: 'continue',
        retryCount: '1',
        requestTimeout: '10',
        paymentAmount: actionType === 'send_payment' ? 499 : '',
      },
    };

    setActiveWorkflow((prev) => ({
      ...prev,
      nodes: [...(prev.nodes || []), newNode],
    }));

    setSelectedEditingNodeId(newNodeId);
    showToast(`Added "${label}". Configure it in the panel.`);
  };

  const handleRemoveNode = (nodeId) => {
    if (!activeWorkflow) return;
    setActiveWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: (prev.edges || []).filter((ed) => ed.source !== nodeId && ed.target !== nodeId),
    }));
  };

  const handleUpdateNodeData = (nodeId, key, value) => {
    if (!activeWorkflow) return;
    setActiveWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n
      ),
    }));
  };

  const handleDuplicate = async (wf) => {
    try {
      await automationService.duplicateWorkflow(wf.id);
      showToast(`Duplicated "${wf.name}"`);
      setActiveMenuId(null);
      loadWorkflows();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate workflow');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await automationService.deleteWorkflow(deleteTarget.id);
      showToast('Workflow deleted successfully');
      setDeleteTarget(null);
      loadWorkflows();
    } catch (err) {
      showToast(err.message || 'Failed to delete workflow');
    }
  };

  // Node Port Positions Calculator
  const getNodePortPos = (nodeId, portType = 'output') => {
    if (nodeId === 'trigger') {
      const tx = activeWorkflow?.triggerX || 60;
      const ty = activeWorkflow?.triggerY || 100;
      return { x: tx + 320, y: ty + 90 }; // Right center of trigger card (width ~320px)
    }

    const targetNode = (activeWorkflow?.nodes || []).find((n) => n.id === nodeId);
    if (!targetNode) return { x: 0, y: 0 };

    const nx = targetNode.x || 480;
    const ny = targetNode.y || 100;

    // Both input and output ports are vertically centered on the node card (~80px)
    if (portType === 'input') {
      return { x: nx, y: ny + 80 }; // Left port dot on card
    }

    if (portType && portType.startsWith('btn_')) {
      const btnIdx = parseInt(portType.replace('btn_', ''), 10) || 0;
      return { x: nx + 320, y: ny + 105 + btnIdx * 45 }; // Right port on button pill
    }

    return { x: nx + 320, y: ny + 80 }; // Right center of node card
  };

  // =========================================================================
  // VIEW 2: VISUAL WORKFLOW CANVAS BUILDER (SCREENSHOTS 3 & 4)
  // =========================================================================
  if (activeWorkflow) {
    const triggerX = activeWorkflow.triggerX || 60;
    const triggerY = activeWorkflow.triggerY || 100;

    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 font-sans relative overflow-hidden select-none">
        
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0 shadow-2xs">
          
          {/* Left: Back & Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveWorkflow(null)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go back to all Workflows</span>
            </button>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-700" />
              <input
                type="text"
                value={activeWorkflow.name}
                onChange={(e) =>
                  setActiveWorkflow({ ...activeWorkflow, name: e.target.value })
                }
                className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white outline-none px-1 py-0.5 rounded"
                placeholder="Workflow name"
              />
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Template gallery</span>
            </button>

            <button
              type="button"
              onClick={handleExportResponses}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Workflow Responses</span>
            </button>

            {/* Activate Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-semibold text-slate-700">Activate Workflow</span>
              <input
                type="checkbox"
                checked={activeWorkflow.is_active !== false}
                onChange={(e) =>
                  setActiveWorkflow({ ...activeWorkflow, is_active: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00875a]"></div>
            </label>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveWorkflow}
              className="px-4 py-1.5 rounded-lg bg-[#0d3b30] hover:bg-[#08261f] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Workflow</span>
            </button>
          </div>

        </header>

        {/* Subheader Notice Banner */}
        {isTopNoticeVisible && (
          <div className="px-6 py-2 bg-[#0d3b30] text-emerald-100 text-[11px] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Post Free Trial, Workflows are only available on the Sales CRM, Growth and the Advanced plans. • Sales CRM & Growth - Does not include Branching, Set a Condition node, Send a Webhook node & some other advanced nodes. • Advanced plan - Includes all Workflow features.
              </span>
            </div>
            <button
              onClick={() => setIsTopNoticeVisible(false)}
              className="text-emerald-300 hover:text-white p-0.5 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Workspace: Left Actions Sidebar + Interactive Node Graph Canvas */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          
          {/* ========================================== */}
          {/* LEFT SIDEBAR: ACTIONS PALETTE */}
          {/* ========================================== */}
          <div
            className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col z-20 shrink-0 ${
              isActionsCollapsed ? 'w-12' : 'w-64'
            }`}
          >
            {/* Palette Header */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              {!isActionsCollapsed && (
                <span className="text-xs font-bold text-slate-800">Actions</span>
              )}
              <button
                type="button"
                onClick={() => setIsActionsCollapsed(!isActionsCollapsed)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                title={isActionsCollapsed ? 'Expand Actions' : 'Collapse Actions'}
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Palette Items Scrollable */}
            {!isActionsCollapsed && (
              <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs">
                
                {/* 1. Collapsible Group: Messages */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setIsMessagesAccordionOpen(!isMessagesAccordionOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Messages</span>
                    </div>
                    {isMessagesAccordionOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {isMessagesAccordionOpen && (
                    <div className="pl-2 space-y-0.5 animate-in fade-in">
                      <button
                        type="button"
                        onClick={() => handleAddActionNode('plain_message', 'Plain Message')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Plain Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddActionNode('message_buttons', 'Message + Buttons')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Message + Buttons</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddActionNode('message_image', 'Message + Image')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Message + Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddActionNode('message_video', 'Message + Video')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        <span>Message + Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddActionNode('message_list', 'Message + List')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                        <span>Message + List</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddActionNode('wa_form', 'WA Form Message')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>WA Form Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddActionNode('message_carousel', 'Send Message + Carousel')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Send Message + Carousel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Logic & CRM Actions */}
                <div className="space-y-0.5 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleAddActionNode('condition', 'Set a Condition')}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    <span>Set a Condition</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddActionNode('trigger_webhook', 'Trigger Webhook')}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <Code className="w-3.5 h-3.5 text-slate-400" />
                    <span>Trigger Webhook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddActionNode('update_tag', 'Update Field / Tag')}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Update Field / Tag</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddActionNode('pass_conversion', 'Pass Conversion Event')}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <Target className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pass Conversion Event</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddActionNode('assign_agent', 'Assign Chat to Agent')}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assign Chat to Agent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddActionNode('send_payment', 'Send Payment Link')}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>Send Payment Link</span>
                    </div>
                    <span className="text-emerald-600 font-bold text-xs">+</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddActionNode('clear_variable', 'Clear Variable')}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <Eraser className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear Variable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddActionNode('calculate_values', 'Calculate Values')}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                  >
                    <Calculator className="w-3.5 h-3.5 text-slate-400" />
                    <span>Calculate Values</span>
                  </button>
                </div>

                {/* 3. Collapsible Group: Smartbiz Actions */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSmartbizAccordionOpen(!isSmartbizAccordionOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      <span>Smartbiz Actions</span>
                    </div>
                    {isSmartbizAccordionOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {isSmartbizAccordionOpen && (
                    <div className="pl-2 space-y-0.5 animate-in fade-in">
                      <button
                        type="button"
                        onClick={() => handleAddActionNode('smartbiz_confirm_cod', 'Smartbiz Confirm CoD Order')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Smartbiz Confirm CoD Order</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddActionNode('smartbiz_cancel_cod', 'Smartbiz Cancel CoD Order')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors text-left"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                        <span>Smartbiz Cancel CoD Order</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* MAIN VISUAL CANVAS WITH REAL SVG CONNECTIONS */}
          {/* ========================================== */}
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{
              backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px`,
            }}
            className={`flex-1 relative overflow-hidden bg-[#fafafa] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] select-none ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            
            {/* Top Right Zoom Controls (Matches Screenshot 2) */}
            <div className="absolute top-4 right-6 bg-white border border-slate-200 rounded-md shadow-xs flex items-center divide-x divide-slate-100 z-30 text-slate-600">
              <button
                type="button"
                onClick={() => setCanvasZoom(Math.min(canvasZoom + 0.1, 1.5))}
                className="px-2 py-1.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700"
                title="Zoom In"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCanvasZoom(Math.max(canvasZoom - 0.1, 0.5))}
                className="px-2 py-1.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700"
                title="Zoom Out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCanvasZoom(1);
                  setCanvasPan({ x: 0, y: 0 });
                }}
                className="px-2 py-1.5 hover:bg-slate-50 cursor-pointer text-xs text-slate-600"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCanvasLocked(!isCanvasLocked)}
                className="px-2 py-1.5 hover:bg-slate-50 cursor-pointer text-xs"
                title={isCanvasLocked ? 'Unlock Canvas' : 'Lock Canvas'}
              >
                {isCanvasLocked ? (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Canvas Transformation Container with Pan & Zoom */}
            <div
              style={{
                transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
                transformOrigin: 'top left',
              }}
              className="relative w-[5000px] h-[3000px] transition-transform duration-75 pointer-events-auto"
            >
              
              {/* SVG Layer for Stepped Connecting Lines (Exact matching screenshot) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                <defs>
                  {/* Blue Arrow Marker */}
                  <marker
                    id="flow-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1677ff" />
                  </marker>
                </defs>

                {/* Render established edges */}
                {(activeWorkflow.edges || []).map((edge) => {
                  const p1 = getNodePortPos(edge.source, edge.sourcePort || 'output');
                  const p2 = getNodePortPos(edge.target, 'input');
                  if (!p1 || !p2) return null;

                  const pathD = getSteppedPath(p1.x, p1.y, p2.x, p2.y);
                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;

                  return (
                    <g key={edge.id} className="group pointer-events-auto">
                      {/* Outer hit area */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="16"
                        className="cursor-pointer"
                      />
                      {/* Actual blue line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#1677ff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        markerEnd="url(#flow-arrow)"
                        className="transition-all"
                      />
                      {/* Delete connection button on midpoint */}
                      <circle
                        cx={midX}
                        cy={midY}
                        r="9"
                        fill="#ef4444"
                        onClick={() => handleDeleteEdge(edge.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      />
                      <text
                        x={midX}
                        y={midY + 3.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        onClick={() => handleDeleteEdge(edge.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer select-none"
                      >
                        ×
                      </text>
                    </g>
                  );
                })}

                {/* Live connecting line while user is dragging from output port */}
                {connectingSource && (
                  <path
                    d={getSteppedPath(
                      getNodePortPos(connectingSource.nodeId, connectingSource.portType || 'output').x,
                      getNodePortPos(connectingSource.nodeId, connectingSource.portType || 'output').y,
                      mousePos.x,
                      mousePos.y
                    )}
                    fill="none"
                    stroke="#1677ff"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    markerEnd="url(#flow-arrow)"
                  />
                )}
              </svg>

              {/* ========================================== */}
              {/* STARTER TRIGGER CARD (DRAGGABLE & CONNECTABLE) */}
              {/* ========================================== */}
              <div
                style={{ left: `${triggerX}px`, top: `${triggerY}px` }}
                onMouseDown={(e) => {
                  if (e.button !== 0 || isCanvasLocked) return;
                  e.stopPropagation();
                  if (!canvasRef.current) return;
                  const rect = canvasRef.current.getBoundingClientRect();
                  const mouseCanvasX = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
                  const mouseCanvasY = (e.clientY - rect.top - canvasPan.y) / canvasZoom;
                  setDraggingNodeId('trigger');
                  setDragOffset({ x: mouseCanvasX - triggerX, y: mouseCanvasY - triggerY });
                }}
                className="absolute w-80 bg-white border border-emerald-300 rounded-xl shadow-md overflow-visible z-20 cursor-move transition-shadow hover:shadow-lg"
              >
                {/* Trigger Card Header */}
                <div className="px-4 py-2.5 bg-[#f0f9f6] border-b border-emerald-200 flex items-center justify-between text-xs font-bold text-[#0d3b30] rounded-t-xl">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>When to trigger the workflow</span>
                  </div>
                </div>

                {/* Trigger Card Body */}
                <div className="p-4 space-y-3 text-center">
                  {activeWorkflow.trigger && activeWorkflow.trigger !== 'When to trigger the workflow' ? (
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f0f9f6] border border-emerald-200 text-xs font-semibold text-[#0d3b30]">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                        <span>{activeWorkflow.trigger}</span>
                      </div>

                      {activeWorkflow.trigger_config?.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {activeWorkflow.trigger_config.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleOpenTriggerModal}
                        className="w-full py-1.5 px-3 rounded border border-slate-300 hover:border-slate-700 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                      >
                        Edit Trigger
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-600">
                        Click here to add a trigger that starts your automation
                      </p>

                      <button
                        type="button"
                        onClick={handleOpenTriggerModal}
                        className="w-full py-2 px-4 rounded border border-slate-400 hover:border-slate-800 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                      >
                        Add a Trigger
                      </button>

                      <p className="text-[10px] text-slate-400 leading-relaxed text-left">
                        * You may skip this step &amp; instead attach workflow to campaigns/ Welcome, OOO, delayed messages separately
                      </p>
                    </>
                  )}
                </div>

                {/* Blue Output Connection Port Dot on the Right Edge (Interactive Drag & Click) */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleStartConnection('trigger', e);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartConnection('trigger', e);
                  }}
                  className={`w-4 h-4 rounded-full bg-[#1677ff] border-2 border-white absolute -right-2 top-1/2 -translate-y-1/2 shadow-md cursor-crosshair hover:scale-150 hover:ring-4 hover:ring-blue-300 transition-all z-30 ${
                    connectingSource?.nodeId === 'trigger' ? 'ring-4 ring-blue-400 scale-125' : ''
                  }`}
                  title="Drag or click to connect to another node"
                />
              </div>

              {/* ========================================== */}
              {/* CONNECTABLE ACTION NODES ON CANVAS (INTERAKT STYLE) */}
              {/* ========================================== */}
              {(activeWorkflow.nodes || []).map((node, index) => {
                const nx = node.x || 480 + index * 380;
                const ny = node.y || 100;
                const isSelected = selectedEditingNodeId === node.id;
                const isMsgNode = !['update_tag', 'assign_agent', 'trigger_webhook', 'send_payment', 'condition'].includes(node.type);
                const hasButtons = isMsgNode && node.data?.addMoreType === 'quick_reply' && (node.data?.buttons && node.data.buttons.length > 0);
                const isMenuOpen = nodeMenuId === node.id;

                return (
                  <div
                    key={node.id}
                    style={{ left: `${nx}px`, top: `${ny}px` }}
                    onMouseDown={(e) => {
                      if (e.button !== 0 || isCanvasLocked) return;
                      e.stopPropagation();
                      if (!canvasRef.current) return;
                      const rect = canvasRef.current.getBoundingClientRect();
                      const mouseCanvasX = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
                      const mouseCanvasY = (e.clientY - rect.top - canvasPan.y) / canvasZoom;
                      setDraggingNodeId(node.id);
                      setDragOffset({ x: mouseCanvasX - nx, y: mouseCanvasY - ny });
                    }}
                    className={`absolute w-80 bg-white border rounded-xl shadow-xs overflow-visible z-20 cursor-move transition-all ${
                      isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' : 'border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    
                    {/* Blue Input Connection Port Dot on the Left Edge - Vertically Centered */}
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => handleCompleteConnection(node.id, e)}
                      onClick={(e) => handleCompleteConnection(node.id, e)}
                      className={`w-3.5 h-3.5 rounded-full bg-[#1677ff] border-2 border-white absolute -left-1.5 top-1/2 -translate-y-1/2 shadow-md cursor-pointer hover:scale-150 hover:ring-4 hover:ring-sky-300 transition-all z-30 ${
                        connectingSource && connectingSource.nodeId !== node.id ? 'animate-pulse ring-4 ring-emerald-400 scale-125' : ''
                      }`}
                      title="Connect here"
                    />

                    {/* Node Card Header (Interakt Style) */}
                    <div className="px-4 py-2.5 bg-[#f0f9f6] border-b border-emerald-200/80 flex items-center justify-between rounded-t-xl">
                      <span className="font-semibold text-xs text-[#065f46] tracking-tight">
                        {node.type === 'message_carousel' ? 'Send Message + Carousel' : node.type === 'wa_form' ? 'Send WhatsApp Form' : (node.type === 'condition' ? 'Set a Condition' : (node.type === 'trigger_webhook' ? 'Trigger a Webhook' : (node.label || 'Send a Message')))}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEditingNodeId(isSelected ? null : node.id);
                          }}
                          className="p-1 text-slate-500 hover:text-emerald-800 rounded hover:bg-emerald-100/50 transition-colors cursor-pointer"
                          title="Edit Node"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* More Menu Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNodeMenuId(isMenuOpen ? null : node.id);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-emerald-100/50 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-40 text-xs text-left animate-in fade-in zoom-in-95"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEditingNodeId(node.id);
                                  setNodeMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cloned = {
                                    ...node,
                                    id: `node_${Date.now()}`,
                                    x: (node.x || 480) + 40,
                                    y: (node.y || 100) + 40,
                                  };
                                  setActiveWorkflow((prev) => ({
                                    ...prev,
                                    nodes: [...prev.nodes, cloned],
                                  }));
                                  setNodeMenuId(null);
                                  showToast('Duplicated node');
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemoveNode(node.id);
                                  setNodeMenuId(null);
                                  if (selectedEditingNodeId === node.id) setSelectedEditingNodeId(null);
                                }}
                                className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Node Body (Interakt Style) */}
                    <div className="p-3.5 space-y-2.5 text-xs">
                      
                      {isMsgNode ? (
                        <>
                          {/* Uploaded / Attached Image Preview */}
                          {(node.data?.imageUrl || (node.data?.attachmentType === 'image' && node.data?.attachmentUrl)) && (
                            <div
                              onClick={() => setSelectedEditingNodeId(node.id)}
                              className="rounded-lg overflow-hidden border border-emerald-200 bg-[#f8fafc] cursor-pointer hover:border-emerald-400 transition-all shadow-2xs group"
                            >
                              <img
                                src={node.data.imageUrl || node.data.attachmentUrl}
                                alt="Uploaded preview"
                                className="w-full h-28 object-cover group-hover:opacity-95 transition-opacity"
                              />
                              <div className="p-1.5 bg-white text-[10px] text-slate-600 truncate border-t border-slate-100 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{node.data.imageName || 'image_attachment.png'}</span>
                              </div>
                            </div>
                          )}

                          {/* Uploaded / Attached Video Preview */}
                          {(node.data?.videoUrl || (node.data?.attachmentType === 'video' && node.data?.attachmentUrl)) && (
                            <div
                              onClick={() => setSelectedEditingNodeId(node.id)}
                              className="rounded-lg overflow-hidden border border-emerald-200 bg-[#0f172a] cursor-pointer hover:border-emerald-400 transition-all shadow-2xs group relative"
                            >
                              <video
                                src={node.data.videoUrl || node.data.attachmentUrl}
                                className="w-full h-28 object-cover opacity-90 group-hover:opacity-100"
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-8 h-8 rounded-full bg-black/60 border border-white/80 flex items-center justify-center pl-0.5 shadow-md">
                                  <Play className="w-4 h-4 fill-white text-white" />
                                </div>
                              </div>
                              <div className="p-1.5 bg-white text-[10px] text-slate-600 truncate border-t border-slate-100 flex items-center gap-1">
                                <Video className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{node.data.videoName || 'video_attachment.mp4'}</span>
                              </div>
                            </div>
                          )}

                          {/* Message Text Preview */}
                          {node.data?.text?.trim() ? (
                            <div className="space-y-2">
                              <div
                                onClick={() => setSelectedEditingNodeId(node.id)}
                                className="p-3 bg-[#f1f5f9]/80 rounded-lg text-slate-700 text-xs font-normal leading-relaxed cursor-pointer hover:bg-[#e2e8f0]/80 transition-colors border border-transparent hover:border-slate-200 whitespace-pre-wrap"
                              >
                                {node.data.text}
                              </div>

                              {/* List Button on Canvas Node if List attached */}
                              {node.data?.addMoreType === 'list' && (
                                <div
                                  onClick={() => setSelectedEditingNodeId(node.id)}
                                  className="p-2 bg-[#edf5ff] border border-[#bfdbfe] rounded-lg text-xs font-semibold text-[#1677ff] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:bg-[#e1effe] transition-colors"
                                >
                                  <ListFilter className="w-3.5 h-3.5 text-[#1677ff]" />
                                  <span>{node.data.listButtonText || node.data.listName || 'Select an Option'}</span>
                                </div>
                              )}

                              {/* WhatsApp Form Button on Canvas Node if Form */}
                              {node.type === 'wa_form' && (
                                <div
                                  onClick={() => setSelectedEditingNodeId(node.id)}
                                  className="p-2 bg-[#edf5ff] border border-[#bfdbfe] rounded-lg text-xs font-semibold text-[#1677ff] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:bg-[#e1effe] transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#1677ff]" />
                                  <span>{node.data?.formButtonText || 'Open Form'}</span>
                                </div>
                              )}

                              {/* Carousel Cards on Canvas Node if Carousel */}
                              {node.type === 'message_carousel' && (node.data?.carouselCards || []).some(c => c.imageUrl || c.bodyText || (c.buttons && c.buttons.length > 0)) && (
                                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                                  {(node.data?.carouselCards || []).map((c, i) => (
                                    <div key={c.id || i} className="w-24 shrink-0 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                                      {c.imageUrl ? (
                                        <img src={c.imageUrl} alt="" className="w-full h-14 object-cover" />
                                      ) : (
                                        <div className="w-full h-12 bg-slate-100 flex items-center justify-center">
                                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                      )}
                                      <div className="p-1 text-[9px] text-slate-700 truncate font-medium">
                                        {c.bodyText || `Card ${i + 1}`}
                                      </div>
                                      {c.buttons && c.buttons.length > 0 && (
                                        <div className="px-1 pb-1 space-y-0.5">
                                          {c.buttons.map((b, bi) => (
                                            <div key={bi} className="text-[8px] text-slate-600 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-center truncate">
                                              {b.text || `Button ${bi + 1}`}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Empty state placeholder */
                            !node.data?.imageUrl && !node.data?.videoUrl && !node.data?.attachmentUrl && (
                              node.type === 'message_carousel' ? (
                                <div
                                  onClick={() => setSelectedEditingNodeId(node.id)}
                                  className="p-4 bg-[#f0f9f6]/70 border border-[#d1fae5] rounded-xl text-[#334155] text-xs font-normal text-center py-7 shadow-2xs cursor-pointer hover:bg-[#e6f4ea] transition-colors"
                                >
                                  Preview of your message appears here
                                </div>
                              ) : (
                                <div
                                  onClick={() => setSelectedEditingNodeId(node.id)}
                                  className="py-6 px-3 flex flex-col items-center justify-center text-center space-y-2.5 cursor-pointer hover:bg-[#f8fafc] rounded-lg transition-colors"
                                >
                                  <div className="relative mb-1">
                                    <div className="w-11 h-8 bg-[#e6f4ea] border border-[#a3d9b8] rounded p-1.5 flex flex-col justify-between shadow-2xs">
                                      <div className="flex items-center justify-between border-b border-[#a3d9b8]/60 pb-0.5">
                                        <div className="w-3 h-0.5 bg-[#065f46] rounded"></div>
                                        <div className="w-1 h-0.5 bg-[#065f46]/60 rounded"></div>
                                      </div>
                                      <div className="space-y-0.5">
                                        <div className="w-6 h-0.5 bg-[#065f46]/40 rounded"></div>
                                        <div className="w-4 h-0.5 bg-[#065f46]/20 rounded"></div>
                                      </div>
                                      <div className="absolute -bottom-1 right-2 w-1.5 h-1.5 bg-[#e6f4ea] border-r border-b border-[#a3d9b8] transform rotate-45"></div>
                                    </div>
                                    <span className="absolute -bottom-1 -left-1.5 text-[#065f46] text-xs font-bold select-none leading-none">✦</span>
                                  </div>

                                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed max-w-[190px]">
                                    A preview of the message will be displayed here.
                                  </p>
                                </div>
                              )
                            )
                          )}

                          {/* Button pills if Quick Reply is active */}
                          {hasButtons && (
                            <div className="space-y-2 pt-1">
                              {(node.data?.buttons || ['View Options']).map((btn, bIdx) => (
                                <div
                                  key={bIdx}
                                  className="p-2.5 bg-[#f1f5f9] border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 text-center relative shadow-2xs hover:bg-slate-200/70 transition-colors"
                                >
                                  <span>{btn?.trim() || 'Button text to appear here'}</span>

                                  <div
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      handleStartConnection(node.id, `btn_${bIdx}`, e);
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartConnection(node.id, `btn_${bIdx}`, e);
                                    }}
                                    className={`w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-white absolute -right-1.5 top-1/2 -translate-y-1/2 shadow-md cursor-crosshair hover:scale-150 hover:ring-4 hover:ring-emerald-300 transition-all z-30 ${
                                      connectingSource?.nodeId === node.id && connectingSource?.portType === `btn_${bIdx}`
                                        ? 'ring-4 ring-emerald-400 scale-125'
                                        : ''
                                    }`}
                                    title={`Drag to connect from "${btn || `Button ${bIdx + 1}`}"`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {node.type === 'condition' && (
                            <div
                              onClick={() => setSelectedEditingNodeId(node.id)}
                              className="py-5 px-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50/60 rounded-lg transition-colors space-y-3"
                            >
                              {/* Branching Icon matching user reference screenshot */}
                              <div className="text-[#0d3b30] flex items-center justify-center">
                                <svg className="w-8 h-8" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 14h8" />
                                  <path d="M12 14c2.5 0 4.5-2.5 6-5l4-3" />
                                  <path d="M18 6h4v4" />
                                  <path d="M12 14c2.5 0 4.5 2.5 6 5l4 3" />
                                  <path d="M18 22h4v-4" />
                                </svg>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                                Condition blocks create branches based on user traits, workflow variables, or user responses.
                              </p>
                            </div>
                          )}

                          {node.type === 'update_tag' && (
                            <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-mono">
                              Tag: {node.data?.tag || 'Not set'}
                            </div>
                          )}

                          {node.type === 'assign_agent' && (
                            <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-mono">
                              Agent: {node.data?.agent || 'Auto Routing'}
                            </div>
                          )}

                          {node.type === 'trigger_webhook' && (
                            <div
                              onClick={() => setSelectedEditingNodeId(node.id)}
                              className="py-6 px-3 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-[#f8fafc] rounded-lg transition-colors"
                            >
                              {/* Webhook Tri-node Icon matching user reference screenshot */}
                              <div className="text-[#0d3b30] flex items-center justify-center">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
                                  <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06l1.97 3.65" />
                                  <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
                                </svg>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                                Webhooks can perform GET, POST, PUT, or DELETE API requests to retrieve data from third-party sources or update records in a CRM based on user responses.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                    </div>

                    {/* Blue Output Connection Port Dot on Right Edge (Vertically centered, shown when no button branches) */}
                    {!hasButtons && (
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleStartConnection(node.id, 'output', e);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnection(node.id, 'output', e);
                        }}
                        className={`w-3.5 h-3.5 rounded-full bg-[#1677ff] border-2 border-white absolute -right-1.5 top-1/2 -translate-y-1/2 shadow-md cursor-crosshair hover:scale-150 hover:ring-4 hover:ring-blue-300 transition-all z-30 ${
                          connectingSource?.nodeId === node.id && connectingSource?.portType === 'output'
                            ? 'ring-4 ring-blue-400 scale-125'
                            : ''
                        }`}
                        title="Drag or click to connect to next node"
                      />
                    )}

                  </div>
                );
              })}

              {/* ========================================== */}
              {/* INLINE CANVAS NODE EDITOR (MATCHES SCREENSHOT 2) */}
              {/* ========================================== */}
              {selectedEditingNodeId && (() => {
                const selectedNode = (activeWorkflow.nodes || []).find((n) => n.id === selectedEditingNodeId);
                if (!selectedNode) return null;

                const nx = selectedNode.x || 480;
                const ny = selectedNode.y || 100;
                const buttonsList = selectedNode.data?.buttons && selectedNode.data.buttons.length > 0
                  ? selectedNode.data.buttons
                  : [''];

                const isMsgNode = !['update_tag', 'assign_agent', 'trigger_webhook', 'send_payment', 'condition'].includes(selectedNode.type);

                return (
                  <div
                    style={{
                      left: `${nx + 340}px`,
                      top: `${ny}px`,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute w-[360px] bg-white border border-slate-200 rounded-xl shadow-lg z-30 flex flex-col select-text transition-all animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* Card Header (Matches Screenshots 2 & 3) */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-xl shrink-0">
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {selectedNode.type === 'message_carousel' ? 'Send Message + Carousel' : selectedNode.type === 'wa_form' ? 'Send WhatsApp Form' : selectedNode.type === 'condition' ? 'Set a Condition' : (selectedNode.type === 'trigger_webhook' ? 'Trigger a Webhook' : (isMsgNode ? 'Send a Message' : (selectedNode.label || 'Node Configuration')))}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedEditingNodeId(null)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Close editor"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Card Body (Matches Screenshots 2 & 3) */}
                    <div className="p-4 space-y-3.5 text-xs">
                      
                      {isMsgNode ? (
                        <>
                          {/* Message Input Box Container */}
                          <div className="space-y-1">
                            <div className="border border-slate-300 rounded-lg p-3 bg-white focus-within:border-slate-500 transition-colors shadow-2xs">
                              <textarea
                                rows={4}
                                value={selectedNode.data?.text || ''}
                                onChange={(e) => handleUpdateNodeData(selectedNode.id, 'text', e.target.value.slice(0, 1024))}
                                placeholder="Message will appear here"
                                className="w-full text-xs text-slate-800 outline-none resize-none bg-transparent placeholder:text-slate-400 leading-relaxed min-h-[72px]"
                              />

                              <div className="text-right text-[10px] text-slate-400 pt-1 select-none">
                                {(selectedNode.data?.text || '').length}/1024
                              </div>
                            </div>

                            {/* Toolbar below textarea (Matches Screenshot 2 & 3) */}
                            <div className="flex items-center justify-between pt-1 text-slate-600">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentVars = selectedNode.data?.variables || [];
                                    const nextNum = currentVars.length + 1;
                                    const current = selectedNode.data?.text || '';
                                    const token = `((${nextNum}))`;
                                    const updatedText = current ? `${current} ${token}` : token;
                                    const newVar = {
                                      id: `mvar_${Date.now()}_${nextNum}`,
                                      num: nextNum,
                                      type: 'user_trait',
                                      trait: '',
                                      fallback: '',
                                    };
                                    handleUpdateNodeData(selectedNode.id, 'text', updatedText.slice(0, 1024));
                                    handleUpdateNodeData(selectedNode.id, 'variables', [...currentVars, newVar]);
                                    setIsVariablesSectionOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                  <span>Add variable</span>
                                </button>
                                <HelpCircle className="w-3 h-3 text-slate-400 cursor-pointer" title="Insert dynamic contact traits" />
                              </div>

                              <div className="flex items-center gap-2 text-slate-500">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = selectedNode.data?.text || '';
                                    handleUpdateNodeData(selectedNode.id, 'text', current + ' 😊');
                                  }}
                                  className="p-0.5 hover:text-slate-800 cursor-pointer text-xs"
                                  title="Add Emoji"
                                >
                                  <Smile className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = selectedNode.data?.text || '';
                                    handleUpdateNodeData(selectedNode.id, 'text', `${current} *bold text*`);
                                  }}
                                  className="px-1 hover:text-slate-800 font-bold text-xs cursor-pointer select-none"
                                  title="Bold (*text*)"
                                >
                                  B
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = selectedNode.data?.text || '';
                                    handleUpdateNodeData(selectedNode.id, 'text', `${current} _italic text_`);
                                  }}
                                  className="px-1 hover:text-slate-800 italic font-serif text-xs cursor-pointer select-none"
                                  title="Italic (_text_)"
                                >
                                  I
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = selectedNode.data?.text || '';
                                    handleUpdateNodeData(selectedNode.id, 'text', `${current} ~strikethrough~`);
                                  }}
                                  className="px-1 hover:text-slate-800 line-through text-xs cursor-pointer select-none"
                                  title="Strikethrough (~text~)"
                                >
                                  S
                                </button>
                              </div>
                            </div>
                          </div>

                          {selectedNode.type === 'wa_form' ? (
                            <>
                              {/* Variables Collapsible Accordion (Matches Screenshot) */}
                              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setIsVariablesSectionOpen(!isVariablesSectionOpen)}
                                  className="w-full px-3 py-2 bg-white flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer select-none"
                                >
                                  <span>Variables</span>
                                  {isVariablesSectionOpen ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                </button>

                                {isVariablesSectionOpen && (
                                  <div className="p-2.5 bg-[#f8fafc] border-t border-slate-200 space-y-1.5 text-[11px] text-slate-600 animate-in fade-in">
                                    <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded">
                                      <span className="font-mono text-emerald-800">{`{{First Name}}`}</span>
                                      <span className="text-slate-400 text-[10px]">User Trait</span>
                                    </div>
                                    <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded">
                                      <span className="font-mono text-emerald-800">{`{{Phone Number}}`}</span>
                                      <span className="text-slate-400 text-[10px]">User Trait</span>
                                    </div>
                                    <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded">
                                      <span className="font-mono text-emerald-800">{`{{Last Message}}`}</span>
                                      <span className="text-slate-400 text-[10px]">Workflow</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Form Details Section (Matches Screenshot) */}
                              <div className="space-y-1.5 pt-0.5">
                                <label className="text-[11px] font-bold text-slate-800 block">
                                  Form Details
                                </label>

                                <div className="border border-slate-200 rounded-lg p-3.5 bg-white space-y-3.5 shadow-2xs">
                                  {/* Form Button Text */}
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 block">
                                      Form Button Text
                                    </label>
                                    <input
                                      type="text"
                                      value={selectedNode.data?.formButtonText || ''}
                                      onChange={(e) => handleUpdateNodeData(selectedNode.id, 'formButtonText', e.target.value)}
                                      placeholder="Enter text for the button"
                                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 shadow-2xs"
                                    />
                                  </div>

                                  {/* Select Form */}
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700 block">
                                      Select Form
                                    </label>
                                    <div className="relative">
                                      <select
                                        value={selectedNode.data?.selectedFormName || ''}
                                        onChange={(e) => handleUpdateNodeData(selectedNode.id, 'selectedFormName', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 appearance-none outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                                      >
                                        <option value="">Select Form Name</option>
                                        <option value="Customer Feedback Form">Customer Feedback Form</option>
                                        <option value="Lead Qualification Survey">Lead Qualification Survey</option>
                                        <option value="Event Registration Form">Event Registration Form</option>
                                        <option value="Product Order Form">Product Order Form</option>
                                        <option value="Support Request Form">Support Request Form</option>
                                      </select>
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                  </div>

                                  {/* Action on Opening Form */}
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-700 block">
                                      Action on Opening Form
                                    </label>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-0.5">
                                      <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                          type="radio"
                                          name={`form_action_${selectedNode.id}`}
                                          value="first_screen"
                                          checked={(selectedNode.data?.formOpenAction || 'first_screen') === 'first_screen'}
                                          onChange={() => handleUpdateNodeData(selectedNode.id, 'formOpenAction', 'first_screen')}
                                          className="w-3.5 h-3.5 accent-[#0d3b30] cursor-pointer"
                                        />
                                        <span className="text-[11px] text-slate-700">Navigate to first screen</span>
                                      </label>

                                      <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                          type="radio"
                                          name={`form_action_${selectedNode.id}`}
                                          value="data_exchange"
                                          checked={selectedNode.data?.formOpenAction === 'data_exchange'}
                                          onChange={() => handleUpdateNodeData(selectedNode.id, 'formOpenAction', 'data_exchange')}
                                          className="w-3.5 h-3.5 accent-[#0d3b30] cursor-pointer"
                                        />
                                        <span className="text-[11px] text-slate-700">Data Exchange</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Save Form Response Section (Matches Screenshot) */}
                              <div className="space-y-1 pt-0.5">
                                <label className="text-[11px] font-bold text-slate-800 block">
                                  Save Form Response
                                </label>
                                <div className="py-2.5 text-center text-xs text-slate-500 font-medium">
                                  No fields found
                                </div>
                              </div>

                              {/* Save Step Button (Matches Screenshot) */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEditingNodeId(null);
                                    showToast('Step saved successfully!');
                                  }}
                                  className="w-full py-2.5 px-4 rounded-md bg-[#9aa8ba] hover:bg-[#0d3b30] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs text-center tracking-wide"
                                >
                                  Save Step
                                </button>
                              </div>
                            </>
                          ) : selectedNode.type === 'message_carousel' ? (
                            <>
                              {/* Variables Collapsible Accordion (Matches Screenshot) */}
                              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setIsVariablesSectionOpen(!isVariablesSectionOpen)}
                                  className="w-full px-3 py-2 bg-white flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer select-none"
                                >
                                  <span>Variables</span>
                                  {isVariablesSectionOpen ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                </button>

                                {isVariablesSectionOpen && (
                                  <div className="p-3 bg-white border-t border-slate-200 space-y-3 text-[11px] text-slate-600 animate-in fade-in">
                                    {(selectedNode.data?.variables && selectedNode.data.variables.length > 0 ? selectedNode.data.variables : [
                                      { id: `var_1`, num: 1, type: 'user_trait', trait: '', fallback: '' }
                                    ]).map((vItem, vIdx) => (
                                      <div key={vItem.id || vIdx} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5 shadow-2xs">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-semibold text-slate-700">
                                            Variable (({vItem.num || vIdx + 1}))
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-[#1677ff]" />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const currentVars = selectedNode.data?.variables || [];
                                                const filtered = currentVars.filter((_, idx) => idx !== vIdx);
                                                const token = `((${vItem.num || vIdx + 1}))`;
                                                const newText = (selectedNode.data?.text || '').replace(token, '').trim();
                                                handleUpdateNodeData(selectedNode.id, 'text', newText);
                                                handleUpdateNodeData(selectedNode.id, 'variables', filtered);
                                              }}
                                              className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                              title="Remove variable"
                                            >
                                              <MinusCircle className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="radio"
                                              name={`top_var_source_${vItem.id}`}
                                              value="user_trait"
                                              checked={(vItem.type || 'user_trait') === 'user_trait'}
                                              onChange={() => {
                                                const currentVars = [...(selectedNode.data?.variables || [])];
                                                if (currentVars[vIdx]) {
                                                  currentVars[vIdx] = { ...currentVars[vIdx], type: 'user_trait' };
                                                  handleUpdateNodeData(selectedNode.id, 'variables', currentVars);
                                                }
                                              }}
                                              className="w-3.5 h-3.5 accent-[#0d3b30] cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-800">User Trait</span>
                                          </label>

                                          {(vItem.type || 'user_trait') === 'user_trait' && (
                                            <div className="relative pl-5 ml-2 border-l border-slate-200 space-y-2 pt-0.5">
                                              <div className="relative">
                                                <div className="flex items-center bg-white border border-slate-300 rounded-md px-2.5 py-1.5 shadow-2xs focus-within:border-slate-500">
                                                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                                                  <select
                                                    value={vItem.trait || ''}
                                                    onChange={(e) => {
                                                      const currentVars = [...(selectedNode.data?.variables || [])];
                                                      if (currentVars[vIdx]) {
                                                        currentVars[vIdx] = { ...currentVars[vIdx], trait: e.target.value };
                                                        handleUpdateNodeData(selectedNode.id, 'variables', currentVars);
                                                      }
                                                    }}
                                                    className="w-full text-xs text-slate-700 bg-transparent outline-none appearance-none cursor-pointer"
                                                  >
                                                    <option value="">Select a user trait</option>
                                                    <option value="First Name">First Name</option>
                                                    <option value="Last Name">Last Name</option>
                                                    <option value="Phone Number">Phone Number</option>
                                                    <option value="Email">Email</option>
                                                    <option value="City">City</option>
                                                    <option value="Customer Category">Customer Category</option>
                                                    <option value="Lead Source">Lead Source</option>
                                                    <option value="External ID">External ID</option>
                                                  </select>
                                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none ml-1" />
                                                </div>
                                              </div>

                                              <div>
                                                <input
                                                  type="text"
                                                  value={vItem.fallback || ''}
                                                  onChange={(e) => {
                                                    const currentVars = [...(selectedNode.data?.variables || [])];
                                                    if (currentVars[vIdx]) {
                                                      currentVars[vIdx] = { ...currentVars[vIdx], fallback: e.target.value };
                                                      handleUpdateNodeData(selectedNode.id, 'variables', currentVars);
                                                    }
                                                  }}
                                                  placeholder="Enter fallback value"
                                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500 shadow-2xs"
                                                />
                                              </div>
                                            </div>
                                          )}

                                          <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                                            <input
                                              type="radio"
                                              name={`top_var_source_${vItem.id}`}
                                              value="workflow_var"
                                              checked={vItem.type === 'workflow_var'}
                                              onChange={() => {
                                                const currentVars = [...(selectedNode.data?.variables || [])];
                                                if (currentVars[vIdx]) {
                                                  currentVars[vIdx] = { ...currentVars[vIdx], type: 'workflow_var' };
                                                  handleUpdateNodeData(selectedNode.id, 'variables', currentVars);
                                                }
                                              }}
                                              className="w-3.5 h-3.5 accent-[#0d3b30] cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-800">Workflow Variable</span>
                                          </label>

                                          {vItem.type === 'workflow_var' && (
                                            <div className="relative pl-5 ml-2 border-l border-slate-200 space-y-2 pt-0.5">
                                              <div className="relative">
                                                <div className="flex items-center bg-white border border-slate-300 rounded-md px-2.5 py-1.5 shadow-2xs focus-within:border-slate-500">
                                                  <select
                                                    value={vItem.workflowVar || ''}
                                                    onChange={(e) => {
                                                      const currentVars = [...(selectedNode.data?.variables || [])];
                                                      if (currentVars[vIdx]) {
                                                        currentVars[vIdx] = { ...currentVars[vIdx], workflowVar: e.target.value };
                                                        handleUpdateNodeData(selectedNode.id, 'variables', currentVars);
                                                      }
                                                    }}
                                                    className="w-full text-xs text-slate-700 bg-transparent outline-none appearance-none cursor-pointer"
                                                  >
                                                    <option value="">Select a workflow variable</option>
                                                    <option value="Last Message">Last Message</option>
                                                    <option value="Trigger Input">Trigger Input</option>
                                                    <option value="Form Response">Form Response</option>
                                                    <option value="Button Clicked">Button Clicked</option>
                                                  </select>
                                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none ml-1" />
                                                </div>
                                              </div>

                                              <div>
                                                <input
                                                  type="text"
                                                  value={vItem.fallback || ''}
                                                  onChange={(e) => {
                                                    const currentVars = [...(selectedNode.data?.variables || [])];
                                                    if (currentVars[vIdx]) {
                                                      currentVars[vIdx] = { ...currentVars[vIdx], fallback: e.target.value };
                                                      handleUpdateNodeData(selectedNode.id, 'variables', currentVars);
                                                    }
                                                  }}
                                                  placeholder="Enter fallback value"
                                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500 shadow-2xs"
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Add Validation Rule (Matches Screenshot) */}
                              <div className="pt-0.5">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(selectedNode.data?.hasValidationRule)}
                                    onChange={(e) => handleUpdateNodeData(selectedNode.id, 'hasValidationRule', e.target.checked)}
                                    className="w-3.5 h-3.5 accent-[#0d3b30] rounded border-slate-300 cursor-pointer"
                                  />
                                  <span>Add Validation Rule</span>
                                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" title="Validate user response before proceeding" />
                                </label>

                                {selectedNode.data?.hasValidationRule && (
                                  <div className="mt-2 p-2.5 bg-[#f4f7fa] rounded-lg border border-slate-200 space-y-2 text-xs animate-in fade-in">
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Validation Type</label>
                                      <select
                                        value={selectedNode.data?.validationType || 'text'}
                                        onChange={(e) => handleUpdateNodeData(selectedNode.id, 'validationType', e.target.value)}
                                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                                      >
                                        <option value="text">Any Text</option>
                                        <option value="number">Number only</option>
                                        <option value="email">Email address</option>
                                        <option value="phone">10-digit Phone Number</option>
                                        <option value="regex">Custom Regular Expression</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Configure Carousel Settings Header & Descriptions (Matches Screenshot) */}
                              <div className="space-y-1 pt-1">
                                <h4 className="text-xs font-bold text-slate-800">Configure Carousel Settings</h4>
                                <p className="text-[11px] text-slate-600 leading-snug">
                                  Create buttons that let customers respond to your message or take action.
                                </p>
                                <p className="text-[11px] text-slate-600 leading-snug">
                                  Minimum 2 cards are required to create a carousel
                                </p>
                              </div>

                              {/* Carousel Cards Container (Matches Screenshot Tinted Section) */}
                              <div className="p-3 bg-[#f4f6f9] rounded-lg border border-slate-200/80 space-y-3">
                                {/* Cards Limit Box */}
                                <div className="border border-dashed border-slate-300 rounded-md p-2.5 bg-white flex items-center justify-between text-[11px] shadow-2xs">
                                  <span className="font-semibold text-slate-800">
                                    The total number of carousel cards cannot exceed 10.
                                  </span>
                                  <span className="font-bold text-slate-500">
                                    {(selectedNode.data?.carouselCards || [{}]).length}/10
                                  </span>
                                </div>

                                {/* List of Carousel Cards */}
                                {(selectedNode.data?.carouselCards || [{ id: 'card_1', imageUrl: '', bodyText: '', buttons: [] }]).map((card, cIdx) => (
                                  <div key={card.id || cIdx} className="space-y-2 pt-1 border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
                                    {/* Card Top Row: Grip + Image Box + Text Area + Delete Button */}
                                    <div className="flex items-start gap-2">
                                      {/* Grip handle */}
                                      <div className="pt-2 text-slate-400 cursor-grab">
                                        <GripVertical className="w-3.5 h-3.5" />
                                      </div>

                                      {/* Upload Image Box */}
                                      <div className="relative shrink-0">
                                        {card.imageUrl ? (
                                          <div className="w-[72px] h-[72px] rounded-md border border-blue-200 overflow-hidden relative group bg-white shadow-2xs">
                                            <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const input = document.getElementById(`carousel_img_${selectedNode.id}_${cIdx}`);
                                                  input?.click();
                                                }}
                                                className="px-1.5 py-0.5 bg-white/90 text-[9px] font-bold text-slate-800 rounded cursor-pointer"
                                              >
                                                Change
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated = [...(selectedNode.data?.carouselCards || [])];
                                                  updated[cIdx] = { ...updated[cIdx], imageUrl: '', imageName: '' };
                                                  handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                }}
                                                className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded cursor-pointer"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const input = document.getElementById(`carousel_img_${selectedNode.id}_${cIdx}`);
                                              input?.click();
                                            }}
                                            className="w-[72px] h-[72px] rounded-md border border-dashed border-blue-400 bg-[#f0f7ff] hover:bg-[#e4f0fe] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs group"
                                          >
                                            <ImageIcon className="w-4 h-4 text-[#1677ff] group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-semibold text-[#1677ff] leading-none text-center">
                                              Upload Image
                                            </span>
                                          </button>
                                        )}

                                        <input
                                          id={`carousel_img_${selectedNode.id}_${cIdx}`}
                                          type="file"
                                          accept="image/jpeg,image/png,image/webp"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              const updated = [...(selectedNode.data?.carouselCards || [])];
                                              updated[cIdx] = { ...updated[cIdx], imageUrl: reader.result, imageName: file.name };
                                              handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                              showToast('Card image uploaded');
                                            };
                                            reader.readAsDataURL(file);
                                          }}
                                        />
                                      </div>

                                      {/* Write Text for Card Body Input Box */}
                                      <div className="flex-1 min-w-0 border border-slate-300 rounded-md p-2 bg-white relative focus-within:border-slate-500 shadow-2xs">
                                        <textarea
                                          rows={2}
                                          value={card.bodyText || ''}
                                          onChange={(e) => {
                                            const updated = [...(selectedNode.data?.carouselCards || [])];
                                            updated[cIdx] = { ...updated[cIdx], bodyText: e.target.value.slice(0, 160) };
                                            handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                          }}
                                          placeholder="Write the text for card body"
                                          className="w-full text-xs text-slate-800 outline-none resize-none bg-transparent placeholder:text-slate-400 leading-relaxed min-h-[52px]"
                                        />
                                        <div className="text-right text-[10px] text-slate-400 pt-0.5 select-none">
                                          {(card.bodyText || '').length}/160
                                        </div>
                                      </div>

                                      {/* Delete Card Button (Red circled minus ⊖) */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentCards = selectedNode.data?.carouselCards || [];
                                          if (currentCards.length <= 1) {
                                            showToast('At least 1 card is required');
                                            return;
                                          }
                                          const updated = currentCards.filter((_, idx) => idx !== cIdx);
                                          handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                        }}
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                                        title="Delete this carousel card"
                                      >
                                        <MinusCircle className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Card Sub-toolbar below textarea */}
                                    <div className="flex items-center justify-between text-slate-500 pl-[84px] pr-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...(selectedNode.data?.carouselCards || [])];
                                          const currentCard = updated[cIdx];
                                          const currentVars = currentCard.variables || [];
                                          const nextNum = currentVars.length + 1;
                                          const currentText = currentCard.bodyText || '';
                                          const token = `((${nextNum}))`;
                                          const updatedText = currentText ? `${currentText} ${token}` : token;
                                          const newVar = {
                                            id: `cvar_${Date.now()}_${nextNum}`,
                                            num: nextNum,
                                            type: 'user_trait',
                                            trait: '',
                                            fallback: '',
                                          };
                                          updated[cIdx] = {
                                            ...currentCard,
                                            bodyText: updatedText.slice(0, 160),
                                            variables: [...currentVars, newVar],
                                            isVariablesOpen: true,
                                          };
                                          handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                        }}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                        <span>Add variable</span>
                                        <HelpCircle className="w-3 h-3 text-slate-400 cursor-pointer" />
                                      </button>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...(selectedNode.data?.carouselCards || [])];
                                            const currentText = updated[cIdx].bodyText || '';
                                            updated[cIdx] = { ...updated[cIdx], bodyText: currentText + ' 😊' };
                                            handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                          }}
                                          className="p-0.5 hover:text-slate-800 cursor-pointer text-xs"
                                        >
                                          <Smile className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...(selectedNode.data?.carouselCards || [])];
                                            const currentText = updated[cIdx].bodyText || '';
                                            updated[cIdx] = { ...updated[cIdx], bodyText: `${currentText} *bold text*` };
                                            handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                          }}
                                          className="px-1 hover:text-slate-800 font-bold text-xs cursor-pointer select-none"
                                        >
                                          B
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...(selectedNode.data?.carouselCards || [])];
                                            const currentText = updated[cIdx].bodyText || '';
                                            updated[cIdx] = { ...updated[cIdx], bodyText: `${currentText} _italic text_` };
                                            handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                          }}
                                          className="px-1 hover:text-slate-800 italic font-serif text-xs cursor-pointer select-none"
                                        >
                                          I
                                        </button>
                                      </div>
                                    </div>

                                    {/* Card Variables Accordion matching user screenshot */}
                                    {((card.variables && card.variables.length > 0) || card.isVariablesOpen) && (
                                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs mt-2.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...(selectedNode.data?.carouselCards || [])];
                                            updated[cIdx] = {
                                              ...updated[cIdx],
                                              isVariablesOpen: updated[cIdx].isVariablesOpen === false ? true : false,
                                            };
                                            handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                          }}
                                          className="w-full px-3 py-2 bg-white flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer select-none"
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span>Variables</span>
                                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                          {card.isVariablesOpen !== false ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                          )}
                                        </button>

                                        {card.isVariablesOpen !== false && (
                                          <div className="p-3 border-t border-slate-100 space-y-3 bg-white animate-in fade-in">
                                            {(card.variables && card.variables.length > 0 ? card.variables : [
                                              { id: `cvar_${Date.now()}_1`, num: 1, type: 'user_trait', trait: '', fallback: '' }
                                            ]).map((vItem, vIdx) => (
                                              <div key={vItem.id || vIdx} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5 shadow-2xs">
                                                {/* Variable Title Row */}
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs font-semibold text-slate-700">
                                                    Variable (({vItem.num || vIdx + 1}))
                                                  </span>
                                                  <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4 text-[#1677ff]" />
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updated = [...(selectedNode.data?.carouselCards || [])];
                                                        const currentVars = updated[cIdx].variables || [];
                                                        const filteredVars = currentVars.filter((_, idx) => idx !== vIdx);
                                                        const token = `((${vItem.num || vIdx + 1}))`;
                                                        const newText = (updated[cIdx].bodyText || '').replace(token, '').trim();
                                                        updated[cIdx] = {
                                                          ...updated[cIdx],
                                                          bodyText: newText,
                                                          variables: filteredVars,
                                                        };
                                                        handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                      }}
                                                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                                      title="Delete variable"
                                                    >
                                                      <MinusCircle className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                </div>

                                                {/* Radio 1: User Trait */}
                                                <div className="space-y-2">
                                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                      type="radio"
                                                      name={`cvar_type_${cIdx}_${vItem.id}`}
                                                      value="user_trait"
                                                      checked={(vItem.type || 'user_trait') === 'user_trait'}
                                                      onChange={() => {
                                                        const updated = [...(selectedNode.data?.carouselCards || [])];
                                                        const currentVars = [...(updated[cIdx].variables || [])];
                                                        currentVars[vIdx] = { ...currentVars[vIdx], type: 'user_trait' };
                                                        updated[cIdx] = { ...updated[cIdx], variables: currentVars };
                                                        handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                      }}
                                                      className="w-3.5 h-3.5 accent-[#0d3b30] cursor-pointer"
                                                    />
                                                    <span className="text-xs font-bold text-slate-800">User Trait</span>
                                                  </label>

                                                  {(vItem.type || 'user_trait') === 'user_trait' && (
                                                    <div className="relative pl-5 ml-2 border-l border-slate-200 space-y-2 pt-0.5">
                                                      {/* Select User Trait Dropdown with Search icon */}
                                                      <div className="relative">
                                                        <div className="flex items-center bg-white border border-slate-300 rounded-md px-2.5 py-1.5 shadow-2xs focus-within:border-slate-500">
                                                          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                                                          <select
                                                            value={vItem.trait || ''}
                                                            onChange={(e) => {
                                                              const updated = [...(selectedNode.data?.carouselCards || [])];
                                                              const currentVars = [...(updated[cIdx].variables || [])];
                                                              currentVars[vIdx] = { ...currentVars[vIdx], trait: e.target.value };
                                                              updated[cIdx] = { ...updated[cIdx], variables: currentVars };
                                                              handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                            }}
                                                            className="w-full text-xs text-slate-700 bg-transparent outline-none appearance-none cursor-pointer"
                                                          >
                                                            <option value="">Select a user trait</option>
                                                            {DEFAULT_USER_TRAITS.map((t) => (
                                                              <option key={t} value={t}>
                                                                {t}
                                                              </option>
                                                            ))}
                                                          </select>
                                                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none ml-1" />
                                                        </div>
                                                      </div>

                                                      {/* Fallback value input */}
                                                      <div>
                                                        <input
                                                          type="text"
                                                          value={vItem.fallback || ''}
                                                          onChange={(e) => {
                                                            const updated = [...(selectedNode.data?.carouselCards || [])];
                                                            const currentVars = [...(updated[cIdx].variables || [])];
                                                            currentVars[vIdx] = { ...currentVars[vIdx], fallback: e.target.value };
                                                            updated[cIdx] = { ...updated[cIdx], variables: currentVars };
                                                            handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                          }}
                                                          placeholder="Enter fallback value"
                                                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500 shadow-2xs"
                                                        />
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* Radio 2: Workflow Variable */}
                                                  <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                                                    <input
                                                      type="radio"
                                                      name={`cvar_type_${cIdx}_${vItem.id}`}
                                                      value="workflow_var"
                                                      checked={vItem.type === 'workflow_var'}
                                                      onChange={() => {
                                                        const updated = [...(selectedNode.data?.carouselCards || [])];
                                                        const currentVars = [...(updated[cIdx].variables || [])];
                                                        currentVars[vIdx] = { ...currentVars[vIdx], type: 'workflow_var' };
                                                        updated[cIdx] = { ...updated[cIdx], variables: currentVars };
                                                        handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                      }}
                                                      className="w-3.5 h-3.5 accent-[#0d3b30] cursor-pointer"
                                                    />
                                                    <span className="text-xs font-bold text-slate-800">Workflow Variable</span>
                                                  </label>

                                                  {vItem.type === 'workflow_var' && (
                                                    <div className="relative pl-5 ml-2 border-l border-slate-200 space-y-2 pt-0.5">
                                                      <div className="relative">
                                                        <div className="flex items-center bg-white border border-slate-300 rounded-md px-2.5 py-1.5 shadow-2xs focus-within:border-slate-500">
                                                          <select
                                                            value={vItem.workflowVar || ''}
                                                            onChange={(e) => {
                                                              const updated = [...(selectedNode.data?.carouselCards || [])];
                                                              const currentVars = [...(updated[cIdx].variables || [])];
                                                              currentVars[vIdx] = { ...currentVars[vIdx], workflowVar: e.target.value };
                                                              updated[cIdx] = { ...updated[cIdx], variables: currentVars };
                                                              handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                            }}
                                                            className="w-full text-xs text-slate-700 bg-transparent outline-none appearance-none cursor-pointer"
                                                          >
                                                            <option value="">Select a workflow variable</option>
                                                            <option value="Last Message">Last Message</option>
                                                            <option value="Trigger Input">Trigger Input</option>
                                                            <option value="Form Response">Form Response</option>
                                                            <option value="Button Clicked">Button Clicked</option>
                                                          </select>
                                                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none ml-1" />
                                                        </div>
                                                      </div>

                                                      <div>
                                                        <input
                                                          type="text"
                                                          value={vItem.fallback || ''}
                                                          onChange={(e) => {
                                                            const updated = [...(selectedNode.data?.carouselCards || [])];
                                                            const currentVars = [...(updated[cIdx].variables || [])];
                                                            currentVars[vIdx] = { ...currentVars[vIdx], fallback: e.target.value };
                                                            updated[cIdx] = { ...updated[cIdx], variables: currentVars };
                                                            handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                                          }}
                                                          placeholder="Enter fallback value"
                                                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500 shadow-2xs"
                                                        />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Card Buttons Section matching reference image */}
                                    <div className="space-y-3 pt-2">
                                      {(card.buttons || []).map((btn, bIdx) => (
                                        <div key={btn.id || bIdx} className="space-y-1.5">
                                          {/* Row 1: Protocol Dropdown + URL input + Counter + Red Delete Button ⊖ */}
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 min-w-0 flex items-center bg-white border border-slate-300 rounded-md h-8.5 px-2.5 shadow-2xs focus-within:border-slate-500 transition-colors">
                                              {/* Protocol dropdown */}
                                              <div className="relative flex items-center shrink-0 pr-2 border-r border-slate-200 mr-2">
                                                <select
                                                  value={btn.urlType || 'https://'}
                                                  onChange={(e) => {
                                                    const updatedCards = [...(selectedNode.data?.carouselCards || [])];
                                                    const updatedButtons = [...(card.buttons || [])];
                                                    updatedButtons[bIdx] = { ...updatedButtons[bIdx], urlType: e.target.value };
                                                    updatedCards[cIdx] = { ...updatedCards[cIdx], buttons: updatedButtons };
                                                    handleUpdateNodeData(selectedNode.id, 'carouselCards', updatedCards);
                                                  }}
                                                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer pr-4 appearance-none"
                                                >
                                                  <option value="https://">https://</option>
                                                  <option value="http://">http://</option>
                                                </select>
                                                <ChevronDown className="w-3 h-3 text-slate-600 pointer-events-none absolute right-0" />
                                              </div>

                                              {/* URL text input */}
                                              <input
                                                type="text"
                                                value={btn.url || ''}
                                                onChange={(e) => {
                                                  const updatedCards = [...(selectedNode.data?.carouselCards || [])];
                                                  const updatedButtons = [...(card.buttons || [])];
                                                  updatedButtons[bIdx] = { ...updatedButtons[bIdx], url: e.target.value.slice(0, 2000) };
                                                  updatedCards[cIdx] = { ...updatedCards[cIdx], buttons: updatedButtons };
                                                  handleUpdateNodeData(selectedNode.id, 'carouselCards', updatedCards);
                                                }}
                                                placeholder="Enter url, example: www.interakt.shop"
                                                maxLength={2000}
                                                className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                                              />

                                              {/* Counter */}
                                              <span className="text-[10px] text-slate-400 shrink-0 select-none pl-2">
                                                {(btn.url || '').length}/2000
                                              </span>
                                            </div>

                                            {/* Red circled minus delete icon ⊖ */}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedCards = [...(selectedNode.data?.carouselCards || [])];
                                                const updatedButtons = (card.buttons || []).filter((_, idx) => idx !== bIdx);
                                                updatedCards[cIdx] = { ...updatedCards[cIdx], buttons: updatedButtons };
                                                handleUpdateNodeData(selectedNode.id, 'carouselCards', updatedCards);
                                              }}
                                              className="text-red-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer shrink-0"
                                              title="Delete button"
                                            >
                                              <MinusCircle className="w-4 h-4" />
                                            </button>
                                          </div>

                                          {/* Row 2: Button Text input + Counter */}
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 min-w-0 flex items-center bg-white border border-slate-300 rounded-md h-8.5 px-2.5 shadow-2xs focus-within:border-slate-500 transition-colors">
                                              <input
                                                type="text"
                                                value={btn.text || ''}
                                                onChange={(e) => {
                                                  const updatedCards = [...(selectedNode.data?.carouselCards || [])];
                                                  const updatedButtons = [...(card.buttons || [])];
                                                  updatedButtons[bIdx] = { ...updatedButtons[bIdx], text: e.target.value.slice(0, 25) };
                                                  updatedCards[cIdx] = { ...updatedCards[cIdx], buttons: updatedButtons };
                                                  handleUpdateNodeData(selectedNode.id, 'carouselCards', updatedCards);
                                                }}
                                                placeholder="Enter text for the button"
                                                maxLength={25}
                                                className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                                              />
                                              <span className="text-[10px] text-slate-400 shrink-0 select-none pl-2">
                                                {(btn.text || '').length}/25
                                              </span>
                                            </div>

                                            {/* Spacer matching delete button width so Row 2 ends at the exact same edge */}
                                            <div className="w-5 shrink-0" />
                                          </div>
                                        </div>
                                      ))}

                                      {/* Add a Card Button */}
                                      {(!card.buttons || card.buttons.length < 2) && (
                                        <div className="pt-0.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updatedCards = [...(selectedNode.data?.carouselCards || [])];
                                              const currentButtons = card.buttons || [];
                                              if (currentButtons.length >= 2) {
                                                showToast('Maximum 2 buttons per card');
                                                return;
                                              }
                                              updatedCards[cIdx] = {
                                                ...updatedCards[cIdx],
                                                buttons: [
                                                  ...currentButtons,
                                                  { id: `btn_${Date.now()}`, urlType: 'https://', url: '', text: '' },
                                                ],
                                              };
                                              handleUpdateNodeData(selectedNode.id, 'carouselCards', updatedCards);
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer select-none"
                                          >
                                            <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                            <span>Add a Card Button</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {/* Add another Carousel Card Button */}
                                <div className="pt-2 border-t border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentCards = selectedNode.data?.carouselCards || [];
                                      if (currentCards.length >= 10) {
                                        showToast('The total number of carousel cards cannot exceed 10.');
                                        return;
                                      }
                                      const updated = [
                                        ...currentCards,
                                        {
                                          id: `card_${Date.now()}`,
                                          imageUrl: '',
                                          imageName: '',
                                          bodyText: '',
                                          buttons: [],
                                        },
                                      ];
                                      handleUpdateNodeData(selectedNode.id, 'carouselCards', updated);
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                    <span>Add another Carousel Card</span>
                                  </button>
                                </div>
                              </div>

                              {/* Save Step Button (Matches Screenshot) */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEditingNodeId(null);
                                    showToast('Step saved successfully!');
                                  }}
                                  className="w-full py-2.5 px-4 rounded-md bg-[#9aa8ba] hover:bg-[#0d3b30] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs text-center tracking-wide"
                                >
                                  Save Step
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Add More Section (Matches Screenshot 1 & 2) */}
                              <div className="space-y-1.5 pt-0.5">
                                <label className="text-[11px] font-bold text-slate-800 block">
                                  Add more
                                </label>

                                <div className="relative">
                                  <select
                                    value={selectedNode.data?.addMoreType || 'none'}
                                    onChange={(e) => handleUpdateNodeData(selectedNode.id, 'addMoreType', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 appearance-none outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                                  >
                                    <option value="none">None</option>
                                    <option value="quick_reply">Quick Reply Button</option>
                                    <option value="list">List</option>
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Select a List Button matching screenshot */}
                                {selectedNode.data?.addMoreType === 'list' && (
                                  <div className="pt-1 animate-in fade-in">
                                    <button
                                      type="button"
                                      onClick={() => setListConfigNodeId(selectedNode.id)}
                                      className="w-full px-3 py-2 bg-[#edf5ff] border border-[#bfdbfe] rounded-lg text-xs font-semibold text-[#1677ff] flex items-center justify-between hover:bg-[#e1effe] transition-colors cursor-pointer shadow-2xs group"
                                    >
                                      <div className="flex items-center gap-2">
                                        <ListFilter className="w-3.5 h-3.5 text-[#1677ff]" />
                                        <span>{selectedNode.data?.listName ? `List: ${selectedNode.data.listName}` : 'Select a List'}</span>
                                      </div>
                                      <ArrowRight className="w-3.5 h-3.5 text-[#1677ff] group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                  </div>
                                )}

                                {/* Tinted Container for Buttons (Shown only when Quick Reply Button is selected) */}
                                {selectedNode.data?.addMoreType === 'quick_reply' && (
                                  <div className="p-3 bg-[#f4f7fb] rounded-lg border border-slate-100 space-y-2.5 mt-2 animate-in fade-in">
                                    {buttonsList.map((btn, bIdx) => (
                                      <div key={bIdx} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-bold text-slate-700">
                                            Button {bIdx + 1}
                                          </span>
                                          {buttonsList.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = buttonsList.filter((_, i) => i !== bIdx);
                                                handleUpdateNodeData(selectedNode.id, 'buttons', updated);
                                              }}
                                              className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer text-xs"
                                              title="Remove button"
                                            >
                                              ✕
                                            </button>
                                          )}
                                        </div>

                                        <div className="relative">
                                          <input
                                            type="text"
                                            value={btn}
                                            onChange={(e) => {
                                              const updated = [...buttonsList];
                                              updated[bIdx] = e.target.value.slice(0, 20);
                                              handleUpdateNodeData(selectedNode.id, 'buttons', updated);
                                            }}
                                            placeholder={`Write text for button ${bIdx + 1}`}
                                            className="w-full px-2.5 py-1.5 pr-12 text-xs bg-white border border-slate-200 rounded-md focus:border-slate-400 outline-none text-slate-800 placeholder:text-slate-400 shadow-2xs"
                                          />
                                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 select-none">
                                            {(btn || '').length}/20
                                          </span>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Button Actions */}
                                    <div className="space-y-1.5 pt-1">
                                      {buttonsList.length < 3 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...buttonsList, ''];
                                            handleUpdateNodeData(selectedNode.id, 'buttons', updated);
                                          }}
                                          className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer"
                                        >
                                          <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                          <span>Add another button</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          showToast('Variable inserted into button text');
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                        <span>Add variable</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Variables Collapsible Accordion (Matches Screenshot 1 & 2) */}
                              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setIsVariablesSectionOpen(!isVariablesSectionOpen)}
                                  className="w-full px-3 py-2 bg-white flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer select-none"
                                >
                                  <span>Variables</span>
                                  {isVariablesSectionOpen ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                </button>

                                {isVariablesSectionOpen && (
                                  <div className="p-2.5 bg-[#f8fafc] border-t border-slate-200 space-y-1.5 text-[11px] text-slate-600 animate-in fade-in">
                                    <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded">
                                      <span className="font-mono text-emerald-800">{`{{First Name}}`}</span>
                                      <span className="text-slate-400 text-[10px]">User Trait</span>
                                    </div>
                                    <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded">
                                      <span className="font-mono text-emerald-800">{`{{Phone Number}}`}</span>
                                      <span className="text-slate-400 text-[10px]">User Trait</span>
                                    </div>
                                    <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded">
                                      <span className="font-mono text-emerald-800">{`{{Last Message}}`}</span>
                                      <span className="text-slate-400 text-[10px]">Workflow</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Add an Attachment Section (Matches Screenshot 1 & 2) */}
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-800 block">
                                  Add an attachment
                                </label>

                                {/* Dropdown selector displaying green media or video pill when active */}
                                {(selectedNode.data?.attachmentType === 'image' || selectedNode.data?.attachmentType === 'media') ? (
                                  <div className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#e8f5e9] text-[#0d3b30] text-[11px] font-medium border border-emerald-300">
                                        <span>media</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateNodeData(selectedNode.id, 'attachmentType', 'none');
                                            handleUpdateNodeData(selectedNode.id, 'imageUrl', '');
                                            handleUpdateNodeData(selectedNode.id, 'attachmentUrl', '');
                                            handleUpdateNodeData(selectedNode.id, 'imageName', '');
                                          }}
                                          className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer leading-none"
                                          title="Remove media attachment"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  </div>
                                ) : selectedNode.data?.attachmentType === 'video' ? (
                                  <div className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#e8f5e9] text-[#0d3b30] text-[11px] font-medium border border-emerald-300">
                                        <span>video</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateNodeData(selectedNode.id, 'attachmentType', 'none');
                                            handleUpdateNodeData(selectedNode.id, 'videoUrl', '');
                                            handleUpdateNodeData(selectedNode.id, 'attachmentUrl', '');
                                            handleUpdateNodeData(selectedNode.id, 'videoName', '');
                                          }}
                                          className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer leading-none"
                                          title="Remove video attachment"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <select
                                      value={selectedNode.data?.attachmentType || 'none'}
                                      onChange={(e) => handleUpdateNodeData(selectedNode.id, 'attachmentType', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-600 appearance-none outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                                    >
                                      <option value="none">Select type of attachment</option>
                                      <option value="image">media (Image)</option>
                                      <option value="video">video</option>
                                      <option value="document">document</option>
                                      <option value="audio">audio</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                )}

                                {/* Green Dashed Upload Media Box (Image) */}
                                {(selectedNode.data?.attachmentType === 'image' || selectedNode.data?.attachmentType === 'media') && (
                                  <div className="border border-dashed border-emerald-400 bg-[#fafffd] rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-center transition-colors animate-in fade-in">
                                    {selectedNode.data?.imageUrl ? (
                                      <div className="space-y-2 w-full flex flex-col items-center">
                                        <img
                                          src={selectedNode.data.imageUrl}
                                          alt="Uploaded media preview"
                                          className="w-24 h-24 object-cover rounded-md border border-emerald-200 shadow-2xs"
                                        />
                                        <span className="text-[11px] text-slate-600 font-medium truncate max-w-[220px]">
                                          {selectedNode.data.imageName || 'image_file.png'}
                                        </span>
                                        <div className="flex items-center gap-2 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1 bg-white border border-[#0d3b30] text-[#0d3b30] rounded-md text-xs font-semibold hover:bg-emerald-50 cursor-pointer shadow-2xs"
                                          >
                                            Change media
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleUpdateNodeData(selectedNode.id, 'imageUrl', '');
                                              handleUpdateNodeData(selectedNode.id, 'attachmentUrl', '');
                                              handleUpdateNodeData(selectedNode.id, 'imageName', '');
                                            }}
                                            className="px-2 py-1 text-red-600 hover:text-red-700 text-xs font-medium cursor-pointer"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="w-7 h-7 flex items-center justify-center text-slate-500">
                                          <ImageIcon className="w-6 h-6 text-slate-500 stroke-[1.5]" />
                                        </div>

                                        <p className="text-[11px] text-slate-500 font-medium">
                                          JPEG or PNG, 1080×1080
                                        </p>

                                        <button
                                          type="button"
                                          onClick={() => fileInputRef.current?.click()}
                                          className="px-4 py-1.5 bg-white border border-[#0d3b30] text-[#0d3b30] rounded-md text-xs font-semibold hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                        >
                                          Upload media
                                        </button>
                                      </>
                                    )}

                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/jpg"
                                      onChange={(e) => handleImageUpload(e, selectedNode.id)}
                                      className="hidden"
                                    />
                                  </div>
                                )}

                                {/* Green Dashed Upload Video Box (Video - Matches Screenshot 1 & 2) */}
                                {selectedNode.data?.attachmentType === 'video' && (
                                  <div className="border border-dashed border-emerald-400 bg-[#fafffd] rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-center transition-colors animate-in fade-in">
                                    {selectedNode.data?.videoUrl ? (
                                      <div className="space-y-2 w-full flex flex-col items-center">
                                        <video
                                          src={selectedNode.data.videoUrl}
                                          controls
                                          className="w-48 max-h-28 rounded-md border border-emerald-200 shadow-2xs bg-black"
                                        />
                                        <span className="text-[11px] text-slate-600 font-medium truncate max-w-[220px]">
                                          {selectedNode.data.videoName || 'video_file.mp4'}
                                        </span>
                                        <div className="flex items-center gap-2 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => videoFileInputRef.current?.click()}
                                            className="px-3 py-1 bg-white border border-[#0d3b30] text-[#0d3b30] rounded-md text-xs font-semibold hover:bg-emerald-50 cursor-pointer shadow-2xs"
                                          >
                                            Change video
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleUpdateNodeData(selectedNode.id, 'videoUrl', '');
                                              handleUpdateNodeData(selectedNode.id, 'attachmentUrl', '');
                                              handleUpdateNodeData(selectedNode.id, 'videoName', '');
                                            }}
                                            className="px-2 py-1 text-red-600 hover:text-red-700 text-xs font-medium cursor-pointer"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="w-6 h-6 rounded-full border border-slate-400 flex items-center justify-center text-slate-500 pl-0.5">
                                          <Play className="w-3 h-3 fill-slate-500 text-slate-500" />
                                        </div>

                                        <p className="text-[11px] text-slate-600 font-medium text-center max-w-[280px]">
                                          WhatsApp has specific rules and guidelines for sending videos
                                        </p>

                                        <button
                                          type="button"
                                          onClick={() => videoFileInputRef.current?.click()}
                                          className="px-4 py-1.5 bg-white border border-[#0d3b30] text-[#0d3b30] rounded-md text-xs font-semibold hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                        >
                                          Upload video
                                        </button>
                                      </>
                                    )}

                                    <input
                                      ref={videoFileInputRef}
                                      type="file"
                                      accept="video/mp4,video/3gpp,video/*"
                                      onChange={(e) => handleVideoUpload(e, selectedNode.id)}
                                      className="hidden"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Save User Response (Matches Screenshot 3) */}
                              <div className="pt-1">
                                <label
                                  onClick={() => handleUpdateNodeData(selectedNode.id, 'isSaveUserResponseOpen', !selectedNode.data?.isSaveUserResponseOpen)}
                                  className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0d3b30] select-none"
                                >
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    selectedNode.data?.isSaveUserResponseOpen ? 'border-[#0d3b30]' : 'border-slate-400'
                                  }`}>
                                    {selectedNode.data?.isSaveUserResponseOpen && (
                                      <div className="w-2 h-2 rounded-full bg-[#0d3b30]"></div>
                                    )}
                                  </div>
                                  <span>Save user response</span>
                                </label>

                                {selectedNode.data?.isSaveUserResponseOpen && (
                                  <div className="mt-2 p-2.5 bg-[#f4f7fa] rounded-lg border border-slate-200 space-y-2 text-xs animate-in fade-in">
                                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                      <input
                                        type="radio"
                                        name={`saveType_${selectedNode.id}`}
                                        value="user_trait"
                                        checked={(selectedNode.data?.saveResponseType || 'user_trait') === 'user_trait'}
                                        onChange={() => handleUpdateNodeData(selectedNode.id, 'saveResponseType', 'user_trait')}
                                        className="w-3.5 h-3.5 accent-[#0d3b30]"
                                      />
                                      <span>User Trait</span>
                                    </label>
                                    {(selectedNode.data?.saveResponseType || 'user_trait') === 'user_trait' && (
                                      <select
                                        value={selectedNode.data?.userTrait || ''}
                                        onChange={(e) => handleUpdateNodeData(selectedNode.id, 'userTrait', e.target.value)}
                                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                                      >
                                        <option value="">Select a trait</option>
                                        <option value="First Name">First Name</option>
                                        <option value="Last Name">Last Name</option>
                                        <option value="Email">Email</option>
                                        <option value="Phone Number">Phone Number</option>
                                        <option value="City">City</option>
                                        <option value="Customer Category">Customer Category</option>
                                        <option value="Lead Source">Lead Source</option>
                                      </select>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Add Validation Rule (Matches Screenshot 3) */}
                              <div className="pt-0.5">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(selectedNode.data?.hasValidationRule)}
                                    onChange={(e) => handleUpdateNodeData(selectedNode.id, 'hasValidationRule', e.target.checked)}
                                    className="w-3.5 h-3.5 accent-[#0d3b30] rounded border-slate-300 cursor-pointer"
                                  />
                                  <span>Add Validation Rule</span>
                                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" title="Validate user response before proceeding" />
                                </label>

                                {selectedNode.data?.hasValidationRule && (
                                  <div className="mt-2 p-2.5 bg-[#f4f7fa] rounded-lg border border-slate-200 space-y-2 text-xs animate-in fade-in">
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Validation Type</label>
                                      <select
                                        value={selectedNode.data?.validationType || 'text'}
                                        onChange={(e) => handleUpdateNodeData(selectedNode.id, 'validationType', e.target.value)}
                                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                                      >
                                        <option value="text">Any Text</option>
                                        <option value="number">Number only</option>
                                        <option value="email">Email address</option>
                                        <option value="phone">10-digit Phone Number</option>
                                        <option value="regex">Custom Regular Expression</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Save Step Button (Matches Screenshot 3) */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEditingNodeId(null);
                                    showToast('Step saved successfully!');
                                  }}
                                  className="w-full py-2.5 px-4 rounded-md bg-[#9aa8ba] hover:bg-[#0d3b30] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs text-center tracking-wide"
                                >
                                  Save Step
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        /* Non-message node editors */
                        <div className="space-y-3">
                          {selectedNode.type === 'condition' && (
                            <div className="space-y-3">
                              {/* Condition Blocks List matching reference image */}
                              {(selectedNode.data?.conditions && selectedNode.data.conditions.length > 0
                                ? selectedNode.data.conditions
                                : [
                                    {
                                      id: `cond_${Date.now()}_1`,
                                      sourceType: 'user_trait',
                                      trait: '',
                                      workflowVar: '',
                                      operator: '',
                                      value: '',
                                    },
                                  ]
                              ).map((cond, cIdx) => (
                                <div
                                  key={cond.id || cIdx}
                                  className="bg-[#f4f7fa] border border-slate-200/80 rounded-lg p-3.5 space-y-3 relative shadow-2xs"
                                >
                                  {/* Delete condition button if multiple */}
                                  {(selectedNode.data?.conditions || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = selectedNode.data?.conditions || [];
                                        const updated = current.filter((_, idx) => idx !== cIdx);
                                        handleUpdateNodeData(selectedNode.id, 'conditions', updated);
                                      }}
                                      className="absolute top-2.5 right-2.5 text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                      title="Delete condition"
                                    >
                                      <MinusCircle className="w-4 h-4" />
                                    </button>
                                  )}

                                  {/* Radio Option Row: User Trait vs Workflow Variable */}
                                  <div className="flex items-center gap-6 select-none pt-0.5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`cond_src_${selectedNode.id}_${cIdx}`}
                                        value="user_trait"
                                        checked={(cond.sourceType || 'user_trait') === 'user_trait'}
                                        onChange={() => {
                                          const current = [...(selectedNode.data?.conditions || [cond])];
                                          current[cIdx] = { ...current[cIdx], sourceType: 'user_trait' };
                                          handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                        }}
                                        className="w-4 h-4 accent-[#0d3b30] cursor-pointer"
                                      />
                                      <span className="text-xs font-semibold text-slate-800">User Trait</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`cond_src_${selectedNode.id}_${cIdx}`}
                                        value="workflow_var"
                                        checked={cond.sourceType === 'workflow_var'}
                                        onChange={() => {
                                          const current = [...(selectedNode.data?.conditions || [cond])];
                                          current[cIdx] = { ...current[cIdx], sourceType: 'workflow_var' };
                                          handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                        }}
                                        className="w-4 h-4 accent-[#0d3b30] cursor-pointer"
                                      />
                                      <span className="text-xs font-semibold text-slate-800">Workflow Variable</span>
                                    </label>
                                  </div>

                                  {/* Field 1: Trait / Workflow Variable Selector */}
                                  {(cond.sourceType || 'user_trait') === 'user_trait' ? (
                                    <div className="relative">
                                      <div
                                        onClick={() => {
                                          const isCurrentOpen = activeTraitDropdownKey === `cond_${cIdx}`;
                                          setActiveTraitDropdownKey(isCurrentOpen ? null : `cond_${cIdx}`);
                                          setActiveOperatorDropdownKey(null);
                                          setTraitSearchQuery('');
                                        }}
                                        className={`flex items-center bg-white border ${
                                          activeTraitDropdownKey === `cond_${cIdx}`
                                            ? 'border-slate-400 rounded-t-md border-b-0 ring-1 ring-slate-400/20'
                                            : 'border-slate-300 rounded-md hover:border-slate-400'
                                        } px-3 h-9 shadow-2xs cursor-pointer transition-colors`}
                                      >
                                        <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                                        <input
                                          type="text"
                                          value={
                                            activeTraitDropdownKey === `cond_${cIdx}`
                                              ? traitSearchQuery
                                              : (cond.trait || '')
                                          }
                                          onChange={(e) => {
                                            setTraitSearchQuery(e.target.value);
                                            if (activeTraitDropdownKey !== `cond_${cIdx}`) {
                                              setActiveTraitDropdownKey(`cond_${cIdx}`);
                                              setActiveOperatorDropdownKey(null);
                                            }
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (activeTraitDropdownKey !== `cond_${cIdx}`) {
                                              setActiveTraitDropdownKey(`cond_${cIdx}`);
                                              setActiveOperatorDropdownKey(null);
                                              setTraitSearchQuery('');
                                            }
                                          }}
                                          placeholder="Select a trait"
                                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent cursor-pointer font-normal"
                                        />
                                        {activeTraitDropdownKey === `cond_${cIdx}` ? (
                                          <ChevronUp className="w-4 h-4 text-slate-600 ml-1 shrink-0" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                                        )}
                                      </div>

                                      {/* Dropdown Menu matching user reference screenshot */}
                                      {activeTraitDropdownKey === `cond_${cIdx}` && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 border-t-0 rounded-b-md shadow-xl z-50 max-h-56 overflow-y-auto animate-in fade-in duration-100">
                                          <div className="py-1">
                                            {[...DEFAULT_USER_TRAITS, ...customUserTraits]
                                              .filter((t) =>
                                                t.toLowerCase().includes((traitSearchQuery || '').toLowerCase().trim())
                                              )
                                              .map((traitName) => (
                                                <div
                                                  key={traitName}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const current = [...(selectedNode.data?.conditions || [cond])];
                                                    current[cIdx] = { ...current[cIdx], trait: traitName };
                                                    handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                                    setActiveTraitDropdownKey(null);
                                                    setTraitSearchQuery('');
                                                  }}
                                                  className={`px-3 py-1.5 text-xs hover:bg-slate-50 cursor-pointer select-none transition-colors ${
                                                    cond.trait === traitName
                                                      ? 'font-bold text-[#0d3b30] bg-[#f0fdf4]'
                                                      : 'text-slate-800'
                                                  }`}
                                                >
                                                  {traitName}
                                                </div>
                                              ))}

                                            {[...DEFAULT_USER_TRAITS, ...customUserTraits].filter((t) =>
                                              t.toLowerCase().includes((traitSearchQuery || '').toLowerCase().trim())
                                            ).length === 0 && (
                                              <div className="px-3 py-2 text-xs text-slate-400 italic">
                                                No matching traits found
                                              </div>
                                            )}
                                          </div>

                                          <div className="border-t border-slate-100 bg-white">
                                            {!isAddingNewTrait ? (
                                              <div className="p-2 bg-slate-50/50">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsAddingNewTrait(true);
                                                    setNewTraitInput('');
                                                  }}
                                                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer w-full select-none"
                                                >
                                                  <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                                  <span>Add another variable</span>
                                                </button>
                                              </div>
                                            ) : (
                                              <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2.5 bg-white space-y-2 animate-in fade-in duration-100"
                                              >
                                                <input
                                                  type="text"
                                                  autoFocus
                                                  value={newTraitInput}
                                                  onChange={(e) => setNewTraitInput(e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.preventDefault();
                                                      if (newTraitInput && newTraitInput.trim()) {
                                                        const clean = newTraitInput.trim();
                                                        setCustomUserTraits((prev) => [...prev, clean]);
                                                        const current = [...(selectedNode.data?.conditions || [cond])];
                                                        current[cIdx] = { ...current[cIdx], trait: clean };
                                                        handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                                        setIsAddingNewTrait(false);
                                                        setNewTraitInput('');
                                                        setActiveTraitDropdownKey(null);
                                                        setTraitSearchQuery('');
                                                        showToast(`Added trait: ${clean}`);
                                                      }
                                                    } else if (e.key === 'Escape') {
                                                      e.preventDefault();
                                                      setIsAddingNewTrait(false);
                                                      setNewTraitInput('');
                                                    }
                                                  }}
                                                  placeholder="Write new trait here"
                                                  className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md outline-none focus:border-slate-500 shadow-2xs placeholder:text-slate-400"
                                                />
                                                <div className="flex items-center justify-end gap-1.5 pt-0.5">
                                                  {/* Confirm Checkmark Button */}
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (newTraitInput && newTraitInput.trim()) {
                                                        const clean = newTraitInput.trim();
                                                        setCustomUserTraits((prev) => [...prev, clean]);
                                                        const current = [...(selectedNode.data?.conditions || [cond])];
                                                        current[cIdx] = { ...current[cIdx], trait: clean };
                                                        handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                                        setIsAddingNewTrait(false);
                                                        setNewTraitInput('');
                                                        setActiveTraitDropdownKey(null);
                                                        setTraitSearchQuery('');
                                                        showToast(`Added trait: ${clean}`);
                                                      }
                                                    }}
                                                    className="w-6 h-6 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                                    title="Confirm"
                                                  >
                                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                                  </button>

                                                  {/* Cancel Close Button */}
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setIsAddingNewTrait(false);
                                                      setNewTraitInput('');
                                                    }}
                                                    className="w-6 h-6 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                                    title="Cancel"
                                                  >
                                                    <X className="w-3 h-3 stroke-[2.5]" />
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <div className="flex items-center bg-white border border-slate-300 rounded-md px-3 h-9 shadow-2xs focus-within:border-slate-500 transition-colors">
                                        <select
                                          value={cond.workflowVar || ''}
                                          onChange={(e) => {
                                            const current = [...(selectedNode.data?.conditions || [cond])];
                                            current[cIdx] = { ...current[cIdx], workflowVar: e.target.value };
                                            handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                          }}
                                          className={`w-full text-xs bg-transparent outline-none cursor-pointer appearance-none ${
                                            !cond.workflowVar ? 'text-slate-400' : 'text-slate-800'
                                          }`}
                                        >
                                          <option value="" disabled>
                                            Select a workflow variable
                                          </option>
                                          <option value="last_message" className="text-slate-800">Last Message</option>
                                          <option value="trigger_input" className="text-slate-800">Trigger Input</option>
                                          <option value="form_response" className="text-slate-800">Form Response</option>
                                          <option value="button_clicked" className="text-slate-800">Button Clicked</option>
                                          <option value="user_response" className="text-slate-800">User Response</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
                                      </div>
                                    </div>
                                  )}

                                  {/* Field 2: Operator Dropdown matching user reference screenshots */}
                                  <div className="relative">
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const isCurrentOpen = activeOperatorDropdownKey === `cond_op_${cIdx}`;
                                        setActiveOperatorDropdownKey(isCurrentOpen ? null : `cond_op_${cIdx}`);
                                        setActiveTraitDropdownKey(null);
                                      }}
                                      className={`flex items-center justify-between bg-white border ${
                                        activeOperatorDropdownKey === `cond_op_${cIdx}`
                                          ? 'border-slate-400 ring-1 ring-slate-400/20'
                                          : 'border-slate-300 hover:border-slate-400'
                                      } rounded-md px-3 h-9 shadow-2xs cursor-pointer select-none transition-colors`}
                                    >
                                      <span className={`text-xs ${!cond.operator ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                                        {cond.operator || 'Operator'}
                                      </span>
                                      {activeOperatorDropdownKey === `cond_op_${cIdx}` ? (
                                        <ChevronUp className="w-3.5 h-3.5 text-slate-600 ml-1 shrink-0" />
                                      ) : (
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
                                      )}
                                    </div>

                                    {/* Custom Operator Popover Menu matching screenshots */}
                                    {activeOperatorDropdownKey === `cond_op_${cIdx}` && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-40"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveOperatorDropdownKey(null);
                                          }}
                                        />
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in duration-100">
                                          {CONDITION_OPERATORS.map((op) => (
                                            <div
                                              key={op}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const current = [...(selectedNode.data?.conditions || [cond])];
                                                current[cIdx] = { ...current[cIdx], operator: op };
                                                handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                                setActiveOperatorDropdownKey(null);
                                              }}
                                              className={`px-3.5 py-2 text-xs cursor-pointer select-none transition-colors mx-1 rounded-md ${
                                                cond.operator === op
                                                  ? 'bg-[#f2fbf7] text-slate-900 font-medium'
                                                  : 'text-slate-700 hover:bg-[#f2fbf7] hover:text-slate-900'
                                              }`}
                                            >
                                              {op}
                                            </div>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Field 3: Enter value here */}
                                  {!['Is Empty', 'Is Not Empty', 'is_set', 'is_not_set', 'is_empty', 'is_not_empty'].includes(cond.operator) && (
                                    <div className="relative">
                                      <div className="flex items-center bg-white border border-slate-300 rounded-md px-3 h-9 shadow-2xs focus-within:border-slate-500 transition-colors">
                                        <input
                                          type="text"
                                          value={cond.value || ''}
                                          onChange={(e) => {
                                            const current = [...(selectedNode.data?.conditions || [cond])];
                                            current[cIdx] = { ...current[cIdx], value: e.target.value };
                                            handleUpdateNodeData(selectedNode.id, 'conditions', current);
                                          }}
                                          placeholder={cond.operator === 'One Of' ? 'Enter values (comma separated)' : 'Enter value here'}
                                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Add another condition Button */}
                              <div className="pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = selectedNode.data?.conditions || [
                                      {
                                        id: `cond_${Date.now()}_1`,
                                        sourceType: 'user_trait',
                                        trait: '',
                                        workflowVar: '',
                                        operator: '',
                                        value: '',
                                      },
                                    ];
                                    const next = [
                                      ...current,
                                      {
                                        id: `cond_${Date.now()}_${current.length + 1}`,
                                        sourceType: 'user_trait',
                                        trait: '',
                                        workflowVar: '',
                                        operator: '',
                                        value: '',
                                      },
                                    ];
                                    handleUpdateNodeData(selectedNode.id, 'conditions', next);
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer select-none"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                  <span>Add another condition</span>
                                </button>
                              </div>

                              {/* Save Step Button (Solid dark green #0d3b30 matching reference image) */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEditingNodeId(null);
                                    showToast('Condition step saved successfully!');
                                  }}
                                  className="w-full py-2.5 px-4 rounded-md bg-[#0d3b30] hover:bg-[#06241d] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs text-center tracking-wide"
                                >
                                  Save Step
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedNode.type === 'update_tag' && (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold text-slate-700 block">Tag Name</label>
                              <input
                                type="text"
                                value={selectedNode.data?.tag || ''}
                                onChange={(e) => handleUpdateNodeData(selectedNode.id, 'tag', e.target.value)}
                                placeholder="e.g. Interested Customer"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400"
                              />
                            </div>
                          )}

                          {selectedNode.type === 'assign_agent' && (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold text-slate-700 block">Assign Agent / Queue</label>
                              <input
                                type="text"
                                value={selectedNode.data?.agent || ''}
                                onChange={(e) => handleUpdateNodeData(selectedNode.id, 'agent', e.target.value)}
                                placeholder="e.g. Support Team"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400"
                              />
                            </div>
                          )}

                          {/* Trigger a Webhook Drawer Sections (Matches User Screenshot with 6 Accordions) */}
                          {selectedNode.type === 'trigger_webhook' && (
                            <div className="space-y-2.5 select-none">
                              {/* 1. Define URL Accordion (Matches Screenshot 1) */}
                              {!openWebhookAccordions.define_url ? (
                                <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs transition-all">
                                  <button
                                    type="button"
                                    onClick={() => toggleWebhookAccordion('define_url')}
                                    className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left select-none"
                                  >
                                    <span className="font-semibold text-xs text-slate-900">Define URL</span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  </button>
                                </div>
                              ) : (
                                <div className="bg-[#f0f4f9] border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs transition-all">
                                  <button
                                    type="button"
                                    onClick={() => toggleWebhookAccordion('define_url')}
                                    className="w-full flex items-center justify-between cursor-pointer text-left select-none"
                                  >
                                    <span className="font-bold text-xs text-slate-900">Define URL</span>
                                    <ChevronUp className="w-4 h-4 text-slate-500" />
                                  </button>

                                  <div className="space-y-3 pt-1 select-text">
                                    {/* Request Type */}
                                    <div>
                                      <label className="text-xs font-bold text-slate-800 block mb-1.5">Request Type</label>
                                      <div className="relative">
                                        <select
                                          value={selectedNode.data?.webhookMethod || 'GET'}
                                          onChange={(e) => handleUpdateNodeData(selectedNode.id, 'webhookMethod', e.target.value)}
                                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-md text-xs font-normal text-slate-800 outline-none focus:border-slate-500 shadow-2xs cursor-pointer appearance-none"
                                        >
                                          <option value="GET">GET</option>
                                          <option value="POST">POST</option>
                                          <option value="PUT">PUT</option>
                                          <option value="DELETE">DELETE</option>
                                          <option value="PATCH">PATCH</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      </div>
                                    </div>

                                    {/* Request URL */}
                                    <div>
                                      <label className="text-xs font-bold text-slate-800 block mb-1.5">Request URL</label>
                                      <input
                                        type="text"
                                        value={selectedNode.data?.webhookUrl || ''}
                                        onChange={(e) => handleUpdateNodeData(selectedNode.id, 'webhookUrl', e.target.value)}
                                        placeholder="Enter the URL here"
                                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500 shadow-2xs"
                                      />
                                    </div>

                                    {/* Test Webhook Button */}
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsTestingWebhook(true);
                                          setTimeout(() => {
                                            setIsTestingWebhook(false);
                                            showToast('Webhook tested successfully! Status 200 OK');
                                          }, 600);
                                        }}
                                        className="w-full py-2 bg-[#9aa8ba] hover:bg-[#8897aa] text-white font-medium text-xs rounded-md transition-colors cursor-pointer text-center shadow-2xs"
                                      >
                                        {isTestingWebhook ? 'Testing Webhook...' : 'Test Webhook'}
                                      </button>
                                    </div>

                                    {/* Add variable Row */}
                                    <div className="relative pt-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveVariablePickerTarget(activeVariablePickerTarget === 'url' ? null : 'url');
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-[#00796b] hover:text-[#005a50] cursor-pointer"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5 text-[#00796b]" />
                                        <span>Add variable</span>
                                        <Info className="w-3.5 h-3.5 text-[#00796b]" />
                                      </button>

                                      {activeVariablePickerTarget === 'url' && (
                                        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 select-none">
                                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                                            <span className="text-[11px] font-bold text-slate-800">Insert Variable to URL</span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveVariablePickerTarget(null);
                                              }}
                                              className="text-slate-400 hover:text-slate-700"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <div className="max-h-40 overflow-y-auto space-y-0.5">
                                            {[...DEFAULT_USER_TRAITS, ...customUserTraits].map((trait) => (
                                              <button
                                                key={trait}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const currentUrl = selectedNode.data?.webhookUrl || '';
                                                  handleUpdateNodeData(selectedNode.id, 'webhookUrl', currentUrl + `{{${trait}}}`);
                                                  setActiveVariablePickerTarget(null);
                                                  showToast(`Inserted {{${trait}}}`);
                                                }}
                                                className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-[#f0f9f6] hover:text-[#0d3b30] rounded font-mono truncate cursor-pointer"
                                              >
                                                {`{{${trait}}}`}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 2. Customize Header Accordion (Matches Screenshots 2 & 3) */}
                              {!openWebhookAccordions.customize_header ? (
                                <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs transition-all">
                                  <button
                                    type="button"
                                    onClick={() => toggleWebhookAccordion('customize_header')}
                                    className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left select-none"
                                  >
                                    <span className="font-semibold text-xs text-slate-900">Customize Header</span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  </button>
                                </div>
                              ) : (
                                <div className="bg-[#f0f4f9] border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs transition-all">
                                  <button
                                    type="button"
                                    onClick={() => toggleWebhookAccordion('customize_header')}
                                    className="w-full flex items-center justify-between cursor-pointer text-left select-none"
                                  >
                                    <span className="font-bold text-xs text-slate-900">Customize Header</span>
                                    <ChevronUp className="w-4 h-4 text-slate-500" />
                                  </button>

                                  <div className="space-y-3 pt-1 select-text">
                                    {/* Column Headers */}
                                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                                      <span>Key</span>
                                      <span>Value</span>
                                    </div>

                                    {/* Default Row 1: Content-Type & application/json in disabled style */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="h-9 px-3 bg-[#dce2ec] border border-slate-300 rounded-md text-xs text-slate-700 flex items-center select-none font-normal">
                                        Content-Type
                                      </div>
                                      <div className="h-9 px-3 bg-[#dce2ec] border border-slate-300 rounded-md text-xs text-slate-700 flex items-center select-none font-normal">
                                        application/json
                                      </div>
                                    </div>

                                    {/* Dynamic Additional Headers: HEADER 2, HEADER 3, etc. (Matches Screenshot 3) */}
                                    {(selectedNode.data?.customHeaders || []).map((header, hIdx) => (
                                      <div
                                        key={header.id || hIdx}
                                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs space-y-2.5 animate-in fade-in"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-bold text-[#2d3748] tracking-wide">
                                            HEADER {hIdx + 2}
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center cursor-default"
                                              title="Header status"
                                            >
                                              <Check className="w-3 h-3 stroke-[2]" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = (selectedNode.data?.customHeaders || []).filter((_, i) => i !== hIdx);
                                                handleUpdateNodeData(selectedNode.id, 'customHeaders', updated);
                                              }}
                                              className="w-5 h-5 rounded-full border border-red-300 text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"
                                              title="Remove header"
                                            >
                                              <Minus className="w-3 h-3 stroke-[2.5]" />
                                            </button>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                                          <span>Key</span>
                                          <span>Value</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                          <input
                                            type="text"
                                            value={header.key || ''}
                                            onChange={(e) => {
                                              const updated = [...(selectedNode.data?.customHeaders || [])];
                                              updated[hIdx] = { ...updated[hIdx], key: e.target.value };
                                              handleUpdateNodeData(selectedNode.id, 'customHeaders', updated);
                                            }}
                                            placeholder="Key"
                                            className="h-8.5 px-3 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                          />
                                          <input
                                            type="text"
                                            value={header.value || ''}
                                            onChange={(e) => {
                                              const updated = [...(selectedNode.data?.customHeaders || [])];
                                              updated[hIdx] = { ...updated[hIdx], value: e.target.value };
                                              handleUpdateNodeData(selectedNode.id, 'customHeaders', updated);
                                            }}
                                            placeholder="Value"
                                            className="h-8.5 px-3 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                          />
                                        </div>

                                        <div className="relative pt-0.5">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveVariablePickerTarget(activeVariablePickerTarget === `header_${hIdx}` ? null : `header_${hIdx}`);
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#00796b] hover:text-[#005a50] cursor-pointer"
                                          >
                                            <PlusCircle className="w-3.5 h-3.5 text-[#00796b]" />
                                            <span>Add variable</span>
                                            <Info className="w-3.5 h-3.5 text-[#00796b]" />
                                          </button>

                                          {activeVariablePickerTarget === `header_${hIdx}` && (
                                            <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 select-none">
                                              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                                                <span className="text-[11px] font-bold text-slate-800">Insert Variable to Value</span>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveVariablePickerTarget(null);
                                                  }}
                                                  className="text-slate-400 hover:text-slate-700"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                              <div className="max-h-40 overflow-y-auto space-y-0.5">
                                                {[...DEFAULT_USER_TRAITS, ...customUserTraits].map((trait) => (
                                                  <button
                                                    key={trait}
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      const updated = [...(selectedNode.data?.customHeaders || [])];
                                                      const curVal = updated[hIdx]?.value || '';
                                                      updated[hIdx] = { ...updated[hIdx], value: curVal + `{{${trait}}}` };
                                                      handleUpdateNodeData(selectedNode.id, 'customHeaders', updated);
                                                      setActiveVariablePickerTarget(null);
                                                      showToast(`Inserted {{${trait}}}`);
                                                    }}
                                                    className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-[#f0f9f6] hover:text-[#0d3b30] rounded font-mono truncate cursor-pointer"
                                                  >
                                                    {`{{${trait}}}`}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}

                                    {/* Add another header Button */}
                                    <div className="pt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = selectedNode.data?.customHeaders || [];
                                          handleUpdateNodeData(selectedNode.id, 'customHeaders', [
                                            ...current,
                                            { id: `hdr_${Date.now()}`, key: '', value: '' },
                                          ]);
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-[#00796b] hover:text-[#005a50] cursor-pointer select-none"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5 text-[#00796b]" />
                                        <span>Add another header</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 3. Customize Body Accordion (Matches Screenshot 4) */}
                              {!openWebhookAccordions.customize_body ? (
                                <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs transition-all">
                                  <button
                                    type="button"
                                    onClick={() => toggleWebhookAccordion('customize_body')}
                                    className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left select-none"
                                  >
                                    <span className="font-semibold text-xs text-slate-900">Customize Body</span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  </button>
                                </div>
                              ) : (
                                <div className="bg-[#f0f4f9] border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs transition-all">
                                  <button
                                    type="button"
                                    onClick={() => toggleWebhookAccordion('customize_body')}
                                    className="w-full flex items-center justify-between cursor-pointer text-left select-none"
                                  >
                                    <span className="font-bold text-xs text-slate-900">Customize Body</span>
                                    <ChevronUp className="w-4 h-4 text-slate-500" />
                                  </button>

                                  <div className="space-y-3 pt-1 select-text">
                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                      <span>Request Body (JSON only)</span>
                                      <Info className="w-3.5 h-3.5 text-slate-500" />
                                    </div>

                                    <div className="relative">
                                      <textarea
                                        rows={4}
                                        value={
                                          selectedNode.data?.webhookBody !== undefined
                                            ? selectedNode.data.webhookBody
                                            : '{}'
                                        }
                                        onChange={(e) =>
                                          handleUpdateNodeData(
                                            selectedNode.id,
                                            'webhookBody',
                                            e.target.value.slice(0, 1024)
                                          )
                                        }
                                        maxLength={1024}
                                        className="w-full p-2.5 pb-6 text-xs text-slate-800 bg-white border border-slate-300 rounded-md outline-none focus:border-slate-400 font-normal shadow-2xs resize-y"
                                      />
                                      <span className="absolute right-2.5 bottom-2 text-[10px] text-slate-400 select-none pointer-events-none">
                                        {(selectedNode.data?.webhookBody !== undefined ? selectedNode.data.webhookBody : '{}').length}/1024
                                      </span>
                                    </div>

                                    <div className="relative pt-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveVariablePickerTarget(activeVariablePickerTarget === 'body' ? null : 'body');
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-[#00796b] hover:text-[#005a50] cursor-pointer"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5 text-[#00796b]" />
                                        <span>Add variable</span>
                                        <Info className="w-3.5 h-3.5 text-[#00796b]" />
                                      </button>

                                      {activeVariablePickerTarget === 'body' && (
                                        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 select-none">
                                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                                            <span className="text-[11px] font-bold text-slate-800">Insert Variable to Body</span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveVariablePickerTarget(null);
                                              }}
                                              className="text-slate-400 hover:text-slate-700"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <div className="max-h-40 overflow-y-auto space-y-0.5">
                                            {[...DEFAULT_USER_TRAITS, ...customUserTraits].map((trait) => (
                                              <button
                                                key={trait}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const curBody = selectedNode.data?.webhookBody !== undefined ? selectedNode.data.webhookBody : '{}';
                                                  const insertion = `{{${trait}}}`;
                                                  let newBody;
                                                  if (curBody.endsWith('}')) {
                                                    const trimmed = curBody.slice(0, -1).trim();
                                                    newBody = (trimmed.length > 1 ? trimmed + `,\n  "${trait}": "${insertion}"\n}` : `{\n  "${trait}": "${insertion}"\n}`);
                                                  } else {
                                                    newBody = curBody + insertion;
                                                  }
                                                  handleUpdateNodeData(selectedNode.id, 'webhookBody', newBody.slice(0, 1024));
                                                  setActiveVariablePickerTarget(null);
                                                  showToast(`Inserted {{${trait}}}`);
                                                }}
                                                className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-[#f0f9f6] hover:text-[#0d3b30] rounded font-mono truncate cursor-pointer"
                                              >
                                                {`{{${trait}}}`}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 4. Save Response Accordion */}
                              <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs transition-all">
                                <button
                                  type="button"
                                  onClick={() => toggleWebhookAccordion('save_response')}
                                  className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
                                >
                                  <span className="font-semibold text-xs text-slate-900">Save Response</span>
                                  {openWebhookAccordions.save_response ? (
                                    <ChevronUp className="w-4 h-4 text-slate-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                {openWebhookAccordions.save_response && (
                                  <div className="p-3.5 border-t border-slate-100 bg-[#fafbfc] space-y-3 animate-in fade-in duration-100 select-text">
                                    <p className="text-[11px] text-slate-500">
                                      Map JSON response properties from the API to user traits or workflow variables.
                                    </p>

                                    <div className="space-y-2">
                                      {(selectedNode.data?.responseMappings || [
                                        { key: 'data.id', trait: 'user_id' },
                                      ]).map((mapItem, mIdx) => (
                                        <div key={mIdx} className="flex items-center gap-1.5">
                                          <input
                                            type="text"
                                            value={mapItem.key}
                                            onChange={(e) => {
                                              const mappings = [...(selectedNode.data?.responseMappings || [{ key: 'data.id', trait: 'user_id' }])];
                                              mappings[mIdx] = { ...mappings[mIdx], key: e.target.value };
                                              handleUpdateNodeData(selectedNode.id, 'responseMappings', mappings);
                                            }}
                                            placeholder="Response key (e.g. data.id)"
                                            className="flex-1 h-8 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                          />
                                          <span className="text-slate-400 text-xs">→</span>
                                          <select
                                            value={mapItem.trait}
                                            onChange={(e) => {
                                              const mappings = [...(selectedNode.data?.responseMappings || [{ key: 'data.id', trait: 'user_id' }])];
                                              mappings[mIdx] = { ...mappings[mIdx], trait: e.target.value };
                                              handleUpdateNodeData(selectedNode.id, 'responseMappings', mappings);
                                            }}
                                            className="flex-1 h-8 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-slate-500 cursor-pointer"
                                          >
                                            <option value="">Select trait</option>
                                            {[...DEFAULT_USER_TRAITS, ...customUserTraits].map((t) => (
                                              <option key={t} value={t}>
                                                {t}
                                              </option>
                                            ))}
                                          </select>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const mappings = (selectedNode.data?.responseMappings || [{ key: 'data.id', trait: 'user_id' }]).filter((_, i) => i !== mIdx);
                                              handleUpdateNodeData(selectedNode.id, 'responseMappings', mappings);
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                            title="Delete mapping"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = selectedNode.data?.responseMappings || [{ key: 'data.id', trait: 'user_id' }];
                                        handleUpdateNodeData(selectedNode.id, 'responseMappings', [...current, { key: '', trait: '' }]);
                                      }}
                                      className="flex items-center gap-1.5 text-xs font-semibold text-[#0d3b30] hover:text-[#06241d] cursor-pointer"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5 text-[#0d3b30]" />
                                      <span>Add response mapping</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* 5. Error Handling Accordion */}
                              <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs transition-all">
                                <button
                                  type="button"
                                  onClick={() => toggleWebhookAccordion('error_handling')}
                                  className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
                                >
                                  <span className="font-semibold text-xs text-slate-900">Error Handling</span>
                                  {openWebhookAccordions.error_handling ? (
                                    <ChevronUp className="w-4 h-4 text-slate-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                {openWebhookAccordions.error_handling && (
                                  <div className="p-3.5 border-t border-slate-100 bg-[#fafbfc] space-y-3 animate-in fade-in duration-100 select-text">
                                    <div className="space-y-2">
                                      <label className="text-[11px] font-semibold text-slate-700 block">
                                        If webhook fails (4xx / 5xx or timeout):
                                      </label>
                                      <div className="space-y-1.5">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800">
                                          <input
                                            type="radio"
                                            name={`error_action_${selectedNode.id}`}
                                            checked={(selectedNode.data?.errorAction || 'continue') === 'continue'}
                                            onChange={() => handleUpdateNodeData(selectedNode.id, 'errorAction', 'continue')}
                                            className="accent-[#0d3b30]"
                                          />
                                          <span>Continue to next step in workflow</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800">
                                          <input
                                            type="radio"
                                            name={`error_action_${selectedNode.id}`}
                                            checked={selectedNode.data?.errorAction === 'stop'}
                                            onChange={() => handleUpdateNodeData(selectedNode.id, 'errorAction', 'stop')}
                                            className="accent-[#0d3b30]"
                                          />
                                          <span>Stop workflow execution</span>
                                        </label>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                      <div>
                                        <label className="text-[10px] font-medium text-slate-600 block mb-1">Retry Attempts</label>
                                        <select
                                          value={selectedNode.data?.retryCount || '1'}
                                          onChange={(e) => handleUpdateNodeData(selectedNode.id, 'retryCount', e.target.value)}
                                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none"
                                        >
                                          <option value="0">No retry</option>
                                          <option value="1">1 retry</option>
                                          <option value="2">2 retries</option>
                                          <option value="3">3 retries</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-medium text-slate-600 block mb-1">Timeout</label>
                                        <select
                                          value={selectedNode.data?.requestTimeout || '10'}
                                          onChange={(e) => handleUpdateNodeData(selectedNode.id, 'requestTimeout', e.target.value)}
                                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none"
                                        >
                                          <option value="5">5 seconds</option>
                                          <option value="10">10 seconds</option>
                                          <option value="30">30 seconds</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 6. Variables Accordion */}
                              <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs transition-all">
                                <button
                                  type="button"
                                  onClick={() => toggleWebhookAccordion('variables')}
                                  className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
                                >
                                  <span className="font-semibold text-xs text-slate-900">Variables</span>
                                  {openWebhookAccordions.variables ? (
                                    <ChevronUp className="w-4 h-4 text-slate-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                {openWebhookAccordions.variables && (
                                  <div className="p-3.5 border-t border-slate-100 bg-[#fafbfc] space-y-2.5 animate-in fade-in duration-100 select-text">
                                    <p className="text-[11px] text-slate-500">
                                      Click any variable to copy it to clipboard to use in your URL, headers, or body:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {[...DEFAULT_USER_TRAITS.slice(0, 8), 'last_message', 'trigger_input'].map((v) => (
                                        <button
                                          key={v}
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard?.writeText(`{{${v}}}`);
                                            showToast(`Copied {{${v}}} to clipboard`);
                                          }}
                                          className="px-2 py-1 bg-white border border-slate-200 hover:border-[#0d3b30] hover:text-[#0d3b30] text-slate-700 rounded text-[11px] font-mono transition-colors cursor-pointer shadow-2xs"
                                        >
                                          {`{{${v}}}`}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Save Step Button matching reference image */}
                              <div className="pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEditingNodeId(null);
                                    showToast('Webhook step saved successfully!');
                                  }}
                                  className="w-full py-2.5 px-4 rounded-md bg-[#9aa8ba] hover:bg-[#0d3b30] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs text-center tracking-wide"
                                >
                                  Save Step
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedNode.type === 'send_payment' && (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold text-slate-700 block">Payment Amount (INR)</label>
                              <input
                                type="number"
                                value={selectedNode.data?.paymentAmount || ''}
                                onChange={(e) => handleUpdateNodeData(selectedNode.id, 'paymentAmount', e.target.value)}
                                placeholder="499"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400"
                              />
                            </div>
                          )}

                          {/* Save Step Button for other non-message nodes */}
                          {selectedNode.type !== 'condition' && selectedNode.type !== 'trigger_webhook' && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEditingNodeId(null);
                                  showToast('Step saved successfully!');
                                }}
                                className="w-full py-2.5 px-4 rounded-md bg-[#9aa8ba] hover:bg-[#0d3b30] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs text-center tracking-wide"
                              >
                                Save Step
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                );
              })()}

            </div>

          </div>

        </div>

        {/* When to trigger the workflow Modal (Multi-step Exact Match to Screenshots) */}
        {isTriggerDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150 relative">
              
              {/* Modal Step 1: When to trigger the workflow */}
              {triggerModalStep === 'choose_trigger' && (
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        When to trigger the workflow
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select a trigger that starts your automation
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTriggerDrawerOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* WhatsApp Category */}
                  <div className="space-y-2.5 pt-1">
                    <h4 className="text-xs font-bold text-slate-800">WhatsApp</h4>

                    {/* Option 1: User sends a WhatsApp message */}
                    <div
                      onClick={() => setTriggerModalStep('configure_whatsapp')}
                      className="p-3.5 border border-slate-200 hover:border-slate-400 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-50/70 transition-all group"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-slate-800 font-medium group-hover:text-emerald-950">
                        User sends a WhatsApp message
                      </span>
                    </div>

                    {/* Option 2: User replies to a WhatsApp campaign */}
                    <div
                      onClick={() => {
                        setActiveWorkflow((prev) => ({
                          ...prev,
                          trigger: 'User replies to a WhatsApp campaign',
                        }));
                        setIsTriggerDrawerOpen(false);
                        showToast('Trigger set: User replies to a WhatsApp campaign');
                      }}
                      className="p-3.5 border border-slate-200 hover:border-slate-400 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-50/70 transition-all group"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-slate-800 font-medium group-hover:text-emerald-950">
                        User replies to a WhatsApp campaign
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Step 2: User sends a WhatsApp message configuration (Screenshots 3 & 4) */}
              {triggerModalStep === 'configure_whatsapp' && (
                <div className="space-y-4">
                  
                  {/* Step 2 Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      User sends a WhatsApp message
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsTriggerDrawerOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Match Type Section with AI Intent Badge */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-800">
                        Select the way to trigger automation
                      </label>
                      <span className="px-2 py-0.5 rounded-md bg-[#eaf8f1] border border-emerald-200/80 text-[10px] text-emerald-800 font-medium">
                        AI Intent Match is enabled for all autoreplies / workflows.
                      </span>
                    </div>

                    <div className="flex items-center gap-5 pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="triggerMatchType"
                          value="exact"
                          checked={triggerMatchType === 'exact'}
                          onChange={() => setTriggerMatchType('exact')}
                          className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700 accent-[#0d3b30]"
                        />
                        <span>Exact Match</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="triggerMatchType"
                          value="contains"
                          checked={triggerMatchType === 'contains'}
                          onChange={() => setTriggerMatchType('contains')}
                          className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700 accent-[#0d3b30]"
                        />
                        <span>Contains</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="triggerMatchType"
                          value="any"
                          checked={triggerMatchType === 'any'}
                          onChange={() => setTriggerMatchType('any')}
                          className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700 accent-[#0d3b30]"
                        />
                        <span>Any</span>
                      </label>
                    </div>
                  </div>

                  {/* Keyword Input Container Box (Hidden when 'Any' is selected) */}
                  {triggerMatchType !== 'any' && (
                    <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 space-y-3 animate-in fade-in">
                      <label className="text-xs font-semibold text-slate-800 block">
                        Enter the keywords that trigger this flow
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          value={triggerKeywordInput}
                          onChange={(e) => setTriggerKeywordInput(e.target.value.slice(0, 100))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && triggerKeywordInput.trim()) {
                              e.preventDefault();
                              if (!triggerKeywordsList.includes(triggerKeywordInput.trim())) {
                                setTriggerKeywordsList([...triggerKeywordsList, triggerKeywordInput.trim()]);
                              }
                              setTriggerKeywordInput('');
                            }
                          }}
                          placeholder="Enter Keywords you want to include"
                          className="w-full pl-3 pr-28 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-slate-600 outline-none text-slate-800"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] text-slate-400 select-none">
                          <span className="text-slate-500 font-medium">↵ Press Enter</span>
                          <span>{triggerKeywordInput.length}/100</span>
                          {triggerKeywordInput && (
                            <button
                              type="button"
                              onClick={() => setTriggerKeywordInput('')}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Chips Display */}
                      {triggerKeywordsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {triggerKeywordsList.map((kw, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#0d3b30] bg-[#f0f9f6] text-[#0d3b30] text-[11px] font-semibold"
                            >
                              <span>{kw}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setTriggerKeywordsList(
                                    triggerKeywordsList.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-[#0d3b30] hover:text-red-600 p-0.5 cursor-pointer"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Trigger Response Section (Collapsed or Expanded - Screenshot 4) */}
                  {!isSaveTriggerResponseOpen ? (
                    <div
                      onClick={() => setIsSaveTriggerResponseOpen(true)}
                      className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200/80 hover:bg-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-400 text-slate-600 flex items-center justify-center text-xs">
                        +
                      </span>
                      <span>Save trigger response</span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 animate-in fade-in">
                      
                      {/* Expanded Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Select where you want to save trigger response
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Select where you want to save this user response
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-700">
                            Variable {`{{1}}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsSaveTriggerResponseOpen(false)}
                            className="w-5 h-5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center text-xs cursor-pointer"
                            title="Remove response mapping"
                          >
                            ⊖
                          </button>
                        </div>
                      </div>

                      {/* Options: User Trait vs Workflow Variable */}
                      <div className="space-y-3 pt-1">
                        
                        {/* Option 1: User Trait */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="saveResponseType"
                              value="user_trait"
                              checked={saveResponseType === 'user_trait'}
                              onChange={() => setSaveResponseType('user_trait')}
                              className="w-3.5 h-3.5 accent-[#0d3b30]"
                            />
                            <span>User Trait</span>
                          </label>

                          {saveResponseType === 'user_trait' && (
                            <div className="pl-5">
                              <select
                                value={selectedUserTrait}
                                onChange={(e) => setSelectedUserTrait(e.target.value)}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:border-slate-500 outline-none"
                              >
                                <option value="">Select a trait</option>
                                <option value="First Name">First Name</option>
                                <option value="Last Name">Last Name</option>
                                <option value="Email">Email</option>
                                <option value="Phone Number">Phone Number</option>
                                <option value="City">City</option>
                                <option value="Customer Category">Customer Category</option>
                                <option value="Lead Source">Lead Source</option>
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Option 2: Workflow Variable */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="saveResponseType"
                              value="workflow_variable"
                              checked={saveResponseType === 'workflow_variable'}
                              onChange={() => setSaveResponseType('workflow_variable')}
                              className="w-3.5 h-3.5 accent-[#0d3b30]"
                            />
                            <span>Workflow Variable</span>
                          </label>

                          {saveResponseType === 'workflow_variable' && (
                            <div className="pl-5">
                              <input
                                type="text"
                                value={customWorkflowVariable}
                                onChange={(e) => setCustomWorkflowVariable(e.target.value)}
                                placeholder="e.g. user_query_text"
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:border-slate-500 outline-none"
                              />
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  )}

                  {/* Step 2 Bottom Actions: Go Back & Proceed */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setTriggerModalStep('choose_trigger')}
                      className="w-full py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Go Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const finalKeywords = triggerMatchType === 'any'
                          ? []
                          : triggerKeywordsList.length > 0
                          ? triggerKeywordsList
                          : triggerKeywordInput.trim()
                          ? [triggerKeywordInput.trim()]
                          : ['hi', 'start'];

                        setActiveWorkflow((prev) => ({
                          ...prev,
                          trigger: 'User sends a WhatsApp message',
                          trigger_config: {
                            match_type: triggerMatchType,
                            keywords: finalKeywords,
                            save_response: isSaveTriggerResponseOpen
                              ? { type: saveResponseType, trait: selectedUserTrait || customWorkflowVariable }
                              : null,
                          },
                        }));
                        setIsTriggerDrawerOpen(false);
                        showToast('Trigger configured: User sends a WhatsApp message');
                      }}
                      className="w-full py-2 px-4 rounded-lg bg-[#0d3b30] hover:bg-[#07241d] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs text-center"
                    >
                      Proceed
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SELECT A LIST MODAL (FOR MESSAGE + LIST) */}
        {/* ========================================== */}
        {listConfigNodeId && (() => {
          const targetNode = (activeWorkflow.nodes || []).find((n) => n.id === listConfigNodeId);
          if (!targetNode) return null;

          const prebuiltLists = [
            {
              name: 'Customer Support Menu',
              button: 'Get Support',
              sections: '2 Sections • 6 Items',
              desc: 'Track Order, Returns & Refund, Chat with Agent, FAQs',
            },
            {
              name: 'Product Catalog & Categories',
              button: 'Explore Catalog',
              sections: '3 Sections • 10 Items',
              desc: 'Featured Products, New Arrivals, Best Sellers, Offers',
            },
            {
              name: 'Appointment & Booking Services',
              button: 'Book Appointment',
              sections: '2 Sections • 8 Items',
              desc: 'Doctor Consultation, Diagnostic Test, Follow-up Visit',
            },
            {
              name: 'Store Locations & Timings',
              button: 'Find Store',
              sections: '1 Section • 4 Items',
              desc: 'Downtown Branch, Westside Outlet, Airport Kiosk',
            },
          ];

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#edf5ff] border border-[#bfdbfe] flex items-center justify-center text-[#1677ff]">
                      <ListFilter className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Select a WhatsApp List</h3>
                      <p className="text-[11px] text-slate-500">Configure interactive menu options for this message</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setListConfigNodeId(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">List Name</label>
                      <input
                        type="text"
                        value={targetNode.data?.listName || ''}
                        onChange={(e) => handleUpdateNodeData(targetNode.id, 'listName', e.target.value)}
                        placeholder="e.g. Service Options"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1677ff]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Menu Button Text</label>
                      <input
                        type="text"
                        value={targetNode.data?.listButtonText || ''}
                        onChange={(e) => handleUpdateNodeData(targetNode.id, 'listButtonText', e.target.value.slice(0, 20))}
                        placeholder="e.g. Select an Option"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1677ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-2">Saved Lists & Templates</span>
                    <div className="space-y-2">
                      {prebuiltLists.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            handleUpdateNodeData(targetNode.id, 'listName', item.name);
                            handleUpdateNodeData(targetNode.id, 'listButtonText', item.button);
                            showToast(`Selected "${item.name}"`);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            targetNode.data?.listName === item.name
                              ? 'border-[#1677ff] bg-[#edf5ff] ring-2 ring-[#1677ff]/20'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{item.name}</span>
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.sections}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{item.desc}</p>
                          </div>
                          <span className="text-xs font-semibold text-[#1677ff] shrink-0">
                            {targetNode.data?.listName === item.name ? 'Selected ✓' : 'Select →'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateNodeData(targetNode.id, 'listName', '');
                      handleUpdateNodeData(targetNode.id, 'listButtonText', 'Select an Option');
                      setListConfigNodeId(null);
                      showToast('List removed');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
                  >
                    Clear List
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setListConfigNodeId(null)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!targetNode.data?.listName) {
                          handleUpdateNodeData(targetNode.id, 'listName', 'Service Options List');
                        }
                        setListConfigNodeId(null);
                        showToast('List applied to message!');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    >
                      Apply List
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

      </div>
    );
  }

  // =========================================================================
  // VIEW 1: WORKFLOWS LIST TABLE (MATCHING DEFAULT PAGE)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 font-sans relative">
      <DashboardSidebar />

      <div className="flex-1 flex flex-row pl-14 sm:pl-16 transition-all duration-200">
        <AutomationSubNav />

        <div className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">
          
          {/* Top Plan Notice Bar matching screenshot */}
          {isTopNoticeVisible && (
            <div className="px-6 py-2.5 bg-[#005844] text-white text-xs flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs text-white/95 leading-relaxed">
                  <p className="font-medium">Post Free Trial, Workflows are only available on the Sales CRM, Growth and the Advanced plans.</p>
                  <p className="text-white/90">• Sales CRM &amp; Growth - Does not include Branching, Set a Condition node, Send a Webhook node &amp; some other advanced nodes.</p>
                  <p className="text-white/90">• Advanced plan - Includes all Workflow features.</p>
                </div>
              </div>
              <button
                onClick={() => setIsTopNoticeVisible(false)}
                className="text-white/80 hover:text-white p-0.5 cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-6 md:p-8 max-w-6xl w-full space-y-5">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d3b30] flex items-center justify-center text-white shadow-2xs">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="7" r="2.5" />
                    <path d="M7 9.5v5a2.5 2.5 0 0 0 5 0v-5a2.5 2.5 0 0 1 5 0v5" />
                    <circle cx="17" cy="17" r="2.5" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-slate-900 leading-tight">Workflows</h1>
                    <button
                      onClick={() => showToast('Opening Workflow Video Tutorial Walkthrough...')}
                      className="px-2.5 py-0.5 rounded-full bg-[#fdeeed] text-[#e04f44] border border-[#fbd3d0] font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-[#fcdcd9] transition-colors"
                    >
                      <Play className="w-2.5 h-2.5 fill-[#e04f44]" />
                      <span>Watch Tutorial</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Build multi-step chatbot flows</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                  title="Configure Settings / Test Simulator"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={handleOpenNewWorkflow}
                  className="px-3.5 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Workflow</span>
                </button>
              </div>
            </div>

            {/* AI Intent Matching Banner matching reference screenshot */}
            {isBannerVisible && (
              <div className="border border-emerald-200/90 rounded-lg p-4 bg-[#f2faf5] space-y-2.5 relative animate-in fade-in">
                <button
                  onClick={() => setIsBannerVisible(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-6">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-900">
                        AI Intent Matching for Your WhatsApp Automations
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        AI Intent Matching understands what your customers are asking and automatically triggers the correct auto-reply or workflow that you&apos;ve already set up. Your existing flows stay exactly the same - they just become smarter.{' '}
                        <Link to="/automation/ai-intent-matching" className="text-teal-700 hover:underline font-medium">
                          Learn how it works?
                        </Link>
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>₹0.2 per successful intent match will be deducted from Interakt wallet.</span>
                        <Link to="/automation/ai-intent-matching" className="text-teal-700 hover:underline">
                          Know how pricing works?
                        </Link>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/automation/ai-intent-matching"
                    className="px-4 py-2 rounded-md border border-[#0d3b30] text-[#0d3b30] hover:bg-emerald-50/60 font-semibold text-xs shrink-0 cursor-pointer shadow-2xs transition-colors whitespace-nowrap"
                  >
                    Enable AI Intent Match
                  </Link>
                </div>
              </div>
            )}

            {/* Channel Pill & Search */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#0d3b30] text-white shadow-2xs cursor-pointer"
              >
                Whatsapp
              </button>

              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Trigger"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#0d3b30] outline-hidden placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Workflows Table matching reference screenshot */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs min-h-[360px]">
              {loading ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30] mx-auto" />
                  <p className="text-xs text-slate-400">Loading workflows...</p>
                </div>
              ) : workflows.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs text-slate-500">No workflows found.</p>
                  <button
                    onClick={handleOpenNewWorkflow}
                    className="px-3 py-1 rounded bg-[#0d3b30] text-white text-xs font-bold cursor-pointer"
                  >
                    + New Workflow
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-800">
                      <th className="py-3.5 px-6 font-semibold">Trigger</th>
                      <th className="py-3.5 px-4 font-semibold">Action Type</th>
                      <th className="py-3.5 px-4 font-semibold">Workflow Name</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Conversation Sent</th>
                      <th className="py-3.5 px-4 font-semibold">Created/Updated</th>
                      <th className="py-3.5 pr-6 text-right w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {workflows.map((wf) => {
                      const isMenuOpen = activeMenuId === wf.id;
                      return (
                        <tr
                          key={wf.id}
                          onClick={() => handleOpenEdit(wf)}
                          className="hover:bg-slate-50/70 transition-colors relative cursor-pointer"
                        >
                          {/* Trigger */}
                          <td className="py-4 px-6 font-normal text-slate-400">
                            {wf.trigger && wf.trigger !== '--' ? wf.trigger : '--'}
                          </td>

                          {/* Action Type */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-slate-700 font-normal text-xs">
                              <svg className="w-4 h-4 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="7" cy="7" r="2.5" />
                                <path d="M7 9.5v5a2.5 2.5 0 0 0 5 0v-5a2.5 2.5 0 0 1 5 0v5" />
                                <circle cx="17" cy="17" r="2.5" />
                              </svg>
                              <span>Workflow</span>
                            </div>
                          </td>

                          {/* Workflow Name */}
                          <td className="py-4 px-4 max-w-sm">
                            <span className="inline-block px-3 py-1.5 rounded-md border border-slate-200/80 bg-[#f8fafc] font-mono text-xs text-slate-800">
                              {wf.name}
                            </span>
                          </td>

                          {/* Conversation Sent */}
                          <td className="py-4 px-4 text-center font-normal text-xs text-slate-700">
                            {wf.executions || 0}
                          </td>

                          {/* Created/Updated */}
                          <td className="py-4 px-4 whitespace-nowrap text-[11px] text-slate-500 leading-relaxed">
                            <div>Created on {wf.created_at ? new Date(wf.created_at).toLocaleDateString('en-GB') : '04/09/2026'}</div>
                            <div>Updated on {wf.updated_at ? new Date(wf.updated_at).toLocaleDateString('en-GB') : '04/09/2026'}</div>
                          </td>

                          {/* 3-Dot Menu */}
                          <td className="py-4 pr-6 text-right relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : wf.id);
                              }}
                              className="text-slate-500 hover:text-slate-800 p-1 rounded-sm cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-4 top-10 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20 text-xs text-left animate-in fade-in zoom-in-95"
                              >
                                <button
                                  onClick={() => handleOpenEdit(wf)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Flow</span>
                                </button>
                                <button
                                  onClick={() => handleDuplicate(wf)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget(wf);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHOOSE FROM THE WORKFLOW (TEMPLATE GALLERY) */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Choose from the Workflow
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subheader Banner */}
            <div className="px-6 pt-4 pb-2">
              <div className="p-3.5 rounded-lg bg-[#f0f9f6] border border-emerald-200/60 text-[11px] text-[#0d3b30] font-medium leading-relaxed">
                Looking for a faster and more efficient way to create stunning Workflows? Look no further than our templates!
              </div>
            </div>

            {/* Template List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-6 py-2">
              {WORKFLOW_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="py-3 px-2 hover:bg-slate-50/80 rounded-md transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    {tpl.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer with Create from Scratch Button */}
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end bg-white">
              <button
                type="button"
                onClick={handleOpenCreateFromScratchDialog}
                className="px-4 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#07241d] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create from Scratch</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE A NEW WORKFLOW NAME DIALOG (SCREENSHOTS 1 & 2) */}
      {/* ========================================================================= */}
      {isNameDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            <h3 className="text-sm font-bold text-slate-900">
              Create a new Workflow
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Workflow name
              </label>
              <input
                type="text"
                autoFocus
                value={newWorkflowNameInput}
                onChange={(e) => setNewWorkflowNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newWorkflowNameInput.trim()) {
                    handleConfirmCreateFromScratch();
                  }
                }}
                placeholder="Enter the name of the Workflow here"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:border-slate-500 outline-none shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNameDialogOpen(false)}
                className="w-full py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newWorkflowNameInput.trim()}
                onClick={handleConfirmCreateFromScratch}
                className={`w-full py-2 px-4 rounded-lg font-bold text-xs transition-colors ${
                  newWorkflowNameInput.trim()
                    ? 'bg-[#0d3b30] hover:bg-[#07241d] text-white cursor-pointer shadow-2xs'
                    : 'bg-[#b0b8c4] text-white cursor-not-allowed opacity-80'
                }`}
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Delete Workflow?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove &quot;{deleteTarget.name}&quot;? Active WhatsApp conversations mapped to this flow will fallback to default replies.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Delete
              </button>
            </div>
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
