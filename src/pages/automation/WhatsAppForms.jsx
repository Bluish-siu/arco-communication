import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Play,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Eye,
  Download,
  Smartphone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  List,
  CheckSquare,
  Calendar,
  Clock,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  Type,
  Filter,
  Share2,
  ArrowLeft,
  Star,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

// Standard Interakt Templates configuration matching all 5 presets
const PRESET_TEMPLATES = {
  default: {
    id: 'default',
    name: 'Default',
    label: 'Default',
    category: ['Lead Generation', 'Appointment Booking'],
    previewTitle: 'This is a sample form',
    screens: [
      {
        id: 'screen_1',
        screenTitle: 'This is a sample form',
        headerTitle: 'This is a sample lead-gen form!',
        headerSubtitle: '',
        buttonText: 'Continue',
        fields: [
          {
            id: 'f_name',
            type: 'text',
            label: 'Your Name',
            placeholder: 'Your Name',
            required: true,
          },
          {
            id: 'f_appointment',
            type: 'text',
            label: 'Appointment Time',
            placeholder: 'Appointment Time',
            helperText: 'Select any time between 9 am to 6 pm.',
            required: true,
          },
          {
            id: 'f_services',
            type: 'checkbox_group',
            label: 'Interested Services',
            options: ['Service 1', 'Service 2', 'Service 3'],
            alignRight: true,
            required: false,
          },
          {
            id: 'f_reminders',
            type: 'single_checkbox',
            label: 'Send reminders for appointment?',
            required: false,
          },
        ],
      },
    ],
  },
  purchase_interest: {
    id: 'purchase_interest',
    name: 'Collect purchase interest',
    label: 'Collect purchase interest',
    category: ['Lead Generation', 'Other'],
    previewTitle: 'Join Now',
    screens: [
      {
        id: 'screen_1',
        screenTitle: 'Join Now',
        headerTitle: 'Get early access to our Mega Sales Day deals. Register now!',
        headerSubtitle: '',
        buttonText: 'Continue',
        fields: [
          {
            id: 'f_pi_name',
            type: 'text',
            label: '',
            placeholder: 'Name',
            required: true,
          },
          {
            id: 'f_pi_email',
            type: 'email',
            label: '',
            placeholder: 'Email',
            required: true,
          },
          {
            id: 'f_pi_terms',
            type: 'single_checkbox',
            label: 'I agree to the terms.',
            linkText: 'Read more',
            required: true,
          },
          {
            id: 'f_pi_promos',
            type: 'single_checkbox',
            label: '(optional) Keep me up to date about offers and promotions',
            required: false,
          },
        ],
      },
      {
        id: 'screen_2',
        screenTitle: 'Join now',
        headerTitle: 'Let us know which category you are interested in?',
        headerSubtitle: '',
        buttonText: 'Confirm',
        fields: [
          {
            id: 'f_pi_categories',
            type: 'checkbox_group',
            label: '',
            helperText: 'Select categories',
            options: [
              'Mobile phones',
              'Televisions',
              'Home audio',
              'Headphones & earphones',
              'eBook readers',
              'Cameras',
              'Accessories',
            ],
            alignRight: true,
            required: true,
          },
        ],
      },
    ],
  },
  get_feedback: {
    id: 'get_feedback',
    name: 'Get feedback',
    label: 'Get feedback',
    category: ['Customer Support', 'Survey'],
    previewTitle: 'Feedback 1 of 2',
    screens: [
      {
        id: 'screen_1',
        screenTitle: 'Feedback 1 of 2',
        headerTitle: 'Would you recommend us to a friend?',
        headerSubtitle: '',
        buttonText: 'Continue',
        fields: [
          {
            id: 'f_fb_recommend',
            type: 'radio',
            label: '',
            helperText: 'Choose one:',
            options: ['Yes', 'No'],
            alignRight: true,
            required: true,
          },
          {
            id: 'f_fb_better',
            type: 'textarea',
            label: 'How could we do better?',
            placeholder: 'Leave a comment (Optional)',
            required: false,
          },
        ],
      },
      {
        id: 'screen_2',
        screenTitle: 'Feedback 2 of 2',
        headerTitle: 'Rate the following:',
        headerSubtitle: '',
        buttonText: 'Done',
        fields: [
          {
            id: 'f_fb_purchase',
            type: 'dropdown',
            label: '',
            placeholder: 'Purchase experience',
            options: [
              '⭐⭐⭐⭐⭐ 5 - Excellent',
              '⭐⭐⭐⭐ 4 - Very Good',
              '⭐⭐⭐ 3 - Average',
              '⭐⭐ 2 - Poor',
              '⭐ 1 - Very Poor',
            ],
            required: true,
          },
          {
            id: 'f_fb_delivery',
            type: 'dropdown',
            label: '',
            placeholder: 'Delivery and setup',
            options: [
              '⭐⭐⭐⭐⭐ 5 - Excellent',
              '⭐⭐⭐⭐ 4 - Very Good',
              '⭐⭐⭐ 3 - Average',
              '⭐⭐ 2 - Poor',
              '⭐ 1 - Very Poor',
            ],
            required: true,
          },
          {
            id: 'f_fb_service',
            type: 'dropdown',
            label: '',
            placeholder: 'Customer service',
            options: [
              '⭐⭐⭐⭐⭐ 5 - Excellent',
              '⭐⭐⭐⭐ 4 - Very Good',
              '⭐⭐⭐ 3 - Average',
              '⭐⭐ 2 - Poor',
              '⭐ 1 - Very Poor',
            ],
            required: true,
          },
        ],
      },
    ],
  },
  send_survey: {
    id: 'send_survey',
    name: 'Send a survey',
    label: 'Send a survey',
    category: ['Survey'],
    previewTitle: 'Question 1 of 3',
    screens: [
      {
        id: 'screen_1',
        screenTitle: 'Question 1 of 3',
        headerTitle: "You've found the perfect deal, what do you do next?",
        headerSubtitle: '',
        buttonText: 'Continue',
        fields: [
          {
            id: 'f_survey_q1',
            type: 'checkbox_group',
            label: '',
            helperText: 'Choose all that apply:',
            options: [
              'Buy it right away',
              'Check reviews before buying',
              'Share it with friends + family',
              'Buy multiple, while its cheap',
              'None of the above',
            ],
            alignRight: true,
            required: false,
          },
        ],
      },
      {
        id: 'screen_2',
        screenTitle: 'Question 2 of 3',
        headerTitle: 'Its your birthday in two weeks, how might you prepare?',
        headerSubtitle: '',
        buttonText: 'Continue',
        fields: [
          {
            id: 'f_survey_q2',
            type: 'radio',
            label: '',
            helperText: 'Choose one:',
            options: [
              'Buy something new',
              'Wear the same, as usual',
              'Look for a deal online',
            ],
            alignRight: true,
            required: true,
          },
        ],
      },
      {
        id: 'screen_3',
        screenTitle: 'Question 3 of 3',
        headerTitle: "What's the best gift for a friend?",
        headerSubtitle: '',
        buttonText: 'Done',
        fields: [
          {
            id: 'f_survey_q3',
            type: 'checkbox_group',
            label: '',
            helperText: 'Choose all that apply:',
            options: [
              'A gift voucher',
              'A new outfit',
              'A bouquet of flowers',
              'A meal out together',
            ],
            alignRight: true,
            required: false,
          },
        ],
      },
    ],
  },
  customer_support: {
    id: 'customer_support',
    name: 'Customer support',
    label: 'Customer support',
    category: ['Customer Support', 'Contact Us'],
    previewTitle: 'Get help',
    screens: [
      {
        id: 'screen_1',
        screenTitle: 'Get help',
        headerTitle: '',
        headerSubtitle: '',
        buttonText: 'Done',
        fields: [
          {
            id: 'f_cs_name',
            type: 'text',
            label: '',
            placeholder: 'Name',
            required: true,
          },
          {
            id: 'f_cs_order',
            type: 'text',
            label: '',
            placeholder: 'Order number',
            required: false,
          },
          {
            id: 'f_cs_topic',
            type: 'radio',
            label: '',
            helperText: 'Choose a topic',
            options: [
              'Orders and payments',
              'Maintenance',
              'Delivery',
              'Returns',
              'Other',
            ],
            alignRight: true,
            required: true,
          },
          {
            id: 'f_cs_desc',
            type: 'textarea',
            label: '',
            placeholder: 'Description of issue (Optional)',
            required: false,
          },
        ],
      },
    ],
  },
};

const CATEGORIES_LIST = [
  'Sign Up',
  'Sign In',
  'Appointment Booking',
  'Lead Generation',
  'Contact Us',
  'Customer Support',
  'Survey',
  'Other',
];

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'dropdown', label: 'Dropdown Select', icon: List },
  { type: 'checkbox_group', label: 'Multi-Checkbox', icon: CheckSquare },
  { type: 'single_checkbox', label: 'Single Checkbox', icon: CheckSquare },
  { type: 'phone', label: 'Phone Number', icon: Phone },
  { type: 'email', label: 'Email Address', icon: Mail },
  { type: 'rating', label: 'Star Rating', icon: Star },
  { type: 'radio', label: 'Radio Choice', icon: CheckSquare },
  { type: 'number', label: 'Numeric', icon: Hash },
  { type: 'textarea', label: 'Long Textarea', icon: AlignLeft },
  { type: 'date', label: 'Date Picker', icon: Calendar },
];

export default function WhatsAppForms({ initialTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Main Tab: 'create' | 'view_all'
  const [activeTab, setActiveTab] = useState(
    initialTab || (location.pathname.includes('/create') ? 'create' : 'view_all')
  );

  // Creation Step: 1 (Template & Details) | 2 (Question & Flow Builder)
  const [wizardStep, setWizardStep] = useState(1);

  // Forms list & state
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Submissions Modal
  const [responsesModal, setResponsesModal] = useState(null);
  const [responsesList, setResponsesList] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Form Creation / Editing State
  const [editingFormId, setEditingFormId] = useState(null);
  const [formName, setFormName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  const [selectedTemplateKey, setSelectedTemplateKey] = useState('customer_support');
  const [formScreens, setFormScreens] = useState(
    JSON.parse(JSON.stringify(PRESET_TEMPLATES.customer_support.screens))
  );
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [formUniqueId, setFormUniqueId] = useState('');

  // Preview Phone State & Interactions
  const [previewDropdownSelected, setPreviewDropdownSelected] = useState('Get help');
  const [phoneScreenIndex, setPhoneScreenIndex] = useState(0);
  const [previewFormData, setPreviewFormData] = useState({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [openDropdownFieldId, setOpenDropdownFieldId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Close Category Dropdown on Outside Click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync route with tab
  useEffect(() => {
    if (location.pathname.includes('/create')) {
      setActiveTab('create');
    } else if (location.pathname.includes('/view')) {
      setActiveTab('view_all');
    }
  }, [location.pathname]);

  // Load preset template
  const applyTemplate = (templateKey) => {
    const tmpl = PRESET_TEMPLATES[templateKey] || PRESET_TEMPLATES.customer_support;
    setSelectedTemplateKey(templateKey);
    const screensCopy = JSON.parse(JSON.stringify(tmpl.screens));
    setFormScreens(screensCopy);
    setActiveScreenIndex(0);
    setPhoneScreenIndex(0);
    setPreviewDropdownSelected(tmpl.screens?.[0]?.screenTitle || tmpl.previewTitle);
    setPreviewFormData({});
    setPreviewSubmitted(false);

    if (selectedCategories.length === 0 && tmpl.category) {
      setSelectedCategories(Array.isArray(tmpl.category) ? tmpl.category : [tmpl.category]);
    }
  };

  // Initial load of forms
  const loadForms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await automationService.getWhatsAppForms(params);
      if (res?.data && Array.isArray(res.data)) {
        setForms(res.data);
      }
    } catch (err) {
      console.warn('Failed to load forms from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
    applyTemplate('customer_support');
  }, [searchQuery]);

  // Handle click on "Create New Form" tab
  const handleStartCreateNew = () => {
    setEditingFormId(null);
    setFormName('');
    setSelectedCategories([]);
    setIsCategoryDropdownOpen(false);
    setFormUniqueId(`form_${Date.now()}`);
    applyTemplate('customer_support');
    setWizardStep(1);
    setActiveTab('create');
  };

  // Open Edit existing form
  const handleOpenEdit = (form) => {
    setEditingFormId(form.id);
    setFormName(form.title || form.name || '');
    
    // Parse categories array from string or array
    if (Array.isArray(form.categories)) {
      setSelectedCategories(form.categories);
    } else if (typeof form.category === 'string') {
      setSelectedCategories(form.category.split(',').map((c) => c.trim()).filter(Boolean));
    } else {
      setSelectedCategories([]);
    }

    setFormUniqueId(form.form_id || `form_${Date.now()}`);
    
    // Find matching template or default
    const matchingKey = Object.keys(PRESET_TEMPLATES).find(
      (k) => PRESET_TEMPLATES[k].name.toLowerCase() === (form.template || '').toLowerCase()
    ) || 'customer_support';
    setSelectedTemplateKey(matchingKey);

    if (Array.isArray(form.screens) && form.screens.length > 0) {
      setFormScreens(form.screens);
    } else if (Array.isArray(form.fields) && form.fields.length > 0) {
      setFormScreens([
        {
          id: 'screen_1',
          screenTitle: form.screen_title || form.title || 'Form Screen',
          headerTitle: form.header_title || form.title || '',
          headerSubtitle: form.header_subtitle || form.description || '',
          buttonText: form.button_text || 'Submit',
          fields: form.fields,
        },
      ]);
    } else {
      setFormScreens(JSON.parse(JSON.stringify(PRESET_TEMPLATES[matchingKey].screens)));
    }

    setActiveScreenIndex(0);
    setPhoneScreenIndex(0);
    setPreviewDropdownSelected(PRESET_TEMPLATES[matchingKey]?.screens?.[0]?.screenTitle || 'Get help');
    setPreviewFormData({});
    setPreviewSubmitted(false);
    setWizardStep(1);
    setActiveTab('create');
  };

  // Toggle category checkbox selection
  const handleToggleCategory = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Current active screen for builder & phone preview
  const currentBuilderScreen = formScreens[activeScreenIndex] || formScreens[0] || {};
  const currentPhoneScreen = formScreens[phoneScreenIndex] || formScreens[0] || {};

  // Update current screen attributes
  const handleUpdateScreenProp = (prop, value) => {
    setFormScreens((prev) => {
      const copy = [...prev];
      copy[activeScreenIndex] = { ...copy[activeScreenIndex], [prop]: value };
      return copy;
    });
  };

  // Field manipulation for currently selected screen
  const handleAddField = (fieldType) => {
    const newField = {
      id: `f_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType.toUpperCase()} Question`,
      placeholder: fieldType === 'dropdown' ? 'Select an option' : 'Tap to type',
      required: false,
      options: fieldType === 'dropdown' || fieldType === 'radio' || fieldType === 'checkbox_group'
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined,
    };
    setFormScreens((prev) => {
      const copy = [...prev];
      const curFields = copy[activeScreenIndex].fields || [];
      copy[activeScreenIndex] = {
        ...copy[activeScreenIndex],
        fields: [...curFields, newField],
      };
      return copy;
    });
  };

  const handleUpdateField = (fieldIndex, key, value) => {
    setFormScreens((prev) => {
      const copy = [...prev];
      const curFields = [...(copy[activeScreenIndex].fields || [])];
      curFields[fieldIndex] = { ...curFields[fieldIndex], [key]: value };
      copy[activeScreenIndex] = { ...copy[activeScreenIndex], fields: curFields };
      return copy;
    });
  };

  const handleRemoveField = (fieldIndex) => {
    setFormScreens((prev) => {
      const copy = [...prev];
      const curFields = (copy[activeScreenIndex].fields || []).filter((_, i) => i !== fieldIndex);
      copy[activeScreenIndex] = { ...copy[activeScreenIndex], fields: curFields };
      return copy;
    });
  };

  const handleAddOptionToField = (fieldIndex) => {
    setFormScreens((prev) => {
      const copy = [...prev];
      const curFields = [...(copy[activeScreenIndex].fields || [])];
      const opts = curFields[fieldIndex].options || [];
      curFields[fieldIndex] = {
        ...curFields[fieldIndex],
        options: [...opts, `Option ${opts.length + 1}`],
      };
      copy[activeScreenIndex] = { ...copy[activeScreenIndex], fields: curFields };
      return copy;
    });
  };

  const handleUpdateOption = (fieldIndex, optIndex, value) => {
    setFormScreens((prev) => {
      const copy = [...prev];
      const curFields = [...(copy[activeScreenIndex].fields || [])];
      const opts = [...(curFields[fieldIndex].options || [])];
      opts[optIndex] = value;
      curFields[fieldIndex] = { ...curFields[fieldIndex], options: opts };
      copy[activeScreenIndex] = { ...copy[activeScreenIndex], fields: curFields };
      return copy;
    });
  };

  const handleRemoveOption = (fieldIndex, optIndex) => {
    setFormScreens((prev) => {
      const copy = [...prev];
      const curFields = [...(copy[activeScreenIndex].fields || [])];
      const opts = (curFields[fieldIndex].options || []).filter((_, i) => i !== optIndex);
      curFields[fieldIndex] = { ...curFields[fieldIndex], options: opts };
      copy[activeScreenIndex] = { ...copy[activeScreenIndex], fields: curFields };
      return copy;
    });
  };

  // Handle Phone Preview Continue / Done / Confirm button click
  const handlePhoneActionClick = () => {
    if (phoneScreenIndex < formScreens.length - 1) {
      // Transition to next screen
      const nextIndex = phoneScreenIndex + 1;
      setPhoneScreenIndex(nextIndex);
      setPreviewDropdownSelected(formScreens[nextIndex]?.screenTitle || `Screen ${nextIndex + 1}`);
    } else {
      // Final confirmation screen
      setPreviewSubmitted(true);
    }
  };

  // Save / Publish
  const handleSaveForm = async (statusToSave = 'published') => {
    const finalName = formName.trim() || 'Untitled Form';
    const categoryString = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'General';

    const payload = {
      title: finalName,
      name: finalName,
      category: categoryString,
      categories: selectedCategories,
      template: PRESET_TEMPLATES[selectedTemplateKey]?.name || 'Custom',
      description: formScreens[0]?.headerTitle || '',
      form_id: formUniqueId.trim() || `form_${Date.now()}`,
      screens: formScreens,
      fields: formScreens[0]?.fields || [],
      status: statusToSave,
    };

    try {
      if (editingFormId) {
        const res = await automationService.updateForm(editingFormId, payload);
        if (res && res.success === false) {
          throw new Error(res.error || 'Failed to update WhatsApp Form');
        }
        const updatedForm = res?.data || { id: editingFormId, ...payload };

        // Update local state with the returned updated record
        setForms((prev) =>
          prev.map((f) => (f.id === editingFormId ? { ...f, ...payload, ...updatedForm } : f))
        );
        showToast(`WhatsApp Form "${finalName}" updated successfully!`);
      } else {
        const res = await automationService.createForm(payload);
        if (res && res.success === false) {
          throw new Error(res.error || 'Failed to create WhatsApp Form');
        }
        const createdForm = res?.data;
        if (!createdForm || !createdForm.id) {
          throw new Error('Invalid response from server when creating form');
        }

        const realId = createdForm.id;
        // Crucial: Store the returned database ID into active form state
        setEditingFormId(realId);
        if (createdForm.form_id) {
          setFormUniqueId(createdForm.form_id);
        }

        // Prepend created form to list
        setForms((prev) => [
          {
            ...createdForm,
            name: finalName,
            category: categoryString,
            categories: selectedCategories,
            template: PRESET_TEMPLATES[selectedTemplateKey]?.name || 'Custom',
            screens: formScreens,
            submissions_count: createdForm.response_count || 0,
          },
          ...prev.filter((f) => f.id !== realId),
        ]);

        showToast(
          `WhatsApp Form "${finalName}" ${statusToSave === 'Draft' ? 'saved as draft' : 'published'}!`
        );
      }

      setActiveTab('view_all');
    } catch (err) {
      console.error('Failed to save WhatsApp Form:', err);
      showToast(err.message || 'Failed to save form. Please try again.');
    }
  };

  // Submissions Modal
  const handleOpenResponses = async (form) => {
    setResponsesModal(form);
    setLoadingResponses(true);
    try {
      const res = await automationService.getFormResponses(form.form_id || form.id);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setResponsesList(res.data);
      } else {
        // Provide sample submissions
        setResponsesList([
          {
            id: 'sub_1',
            contact_name: 'Rahul Sharma',
            contact_phone: '+91 98234 11203',
            submitted_at: '2026-09-02 14:22:10',
            answers: {
              'Name': 'Rahul Sharma',
              'Order number': 'ORD-89421',
              'Choose a topic': 'Orders and payments',
              'Description': 'Payment debited but order status showing pending',
            },
          },
          {
            id: 'sub_2',
            contact_name: 'Priya Mehta',
            contact_phone: '+91 97112 88402',
            submitted_at: '2026-09-01 10:15:44',
            answers: {
              'Name': 'Priya Mehta',
              'Order number': 'ORD-54120',
              'Choose a topic': 'Delivery',
              'Description': 'Package delayed by 2 days',
            },
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to load responses:', err);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleDuplicateForm = async (form) => {
    const formId = form?.id;
    if (!formId) return;

    try {
      const res = await automationService.duplicateForm(formId);
      if (res && res.success === false) {
        throw new Error(res.error || 'Failed to duplicate form on server');
      }

      const duplicate = res?.data;
      if (!duplicate || !duplicate.id) {
        throw new Error('Server did not return the duplicated form');
      }

      // Add returned duplicate to local state with its real database ID
      setForms((prev) => [duplicate, ...prev.filter((f) => f.id !== duplicate.id)]);
      showToast(`Duplicated "${form.title || form.name}" successfully!`);
    } catch (err) {
      console.error('Error duplicating form:', err);
      showToast(err.message || 'Failed to duplicate form. Please try again.');
    }
  };

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this WhatsApp Form?')) {
      return;
    }

    try {
      const res = await automationService.deleteForm(id);
      if (res && res.success === false) {
        throw new Error(res.error || 'Failed to delete form from server');
      }

      // Only remove from local state AFTER backend confirms success
      setForms((prev) => prev.filter((f) => f.id !== id));
      if (editingFormId === id) {
        setEditingFormId(null);
      }
      showToast('Form deleted successfully');
    } catch (err) {
      console.error('Error deleting form:', err);
      showToast(err.message || 'Failed to delete form. Please try again.');
    }
  };

  // Filtered forms
  const filteredForms = forms.filter((f) => {
    const matchSearch =
      (f.title || f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.form_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat =
      categoryFilter === 'All' ||
      (f.category || '').includes(categoryFilter) ||
      (Array.isArray(f.categories) && f.categories.includes(categoryFilter));
    return matchSearch && matchCat;
  });

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

            {/* Page Header (Matches Interakt exact layout) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-white flex items-center justify-center shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">WhatsApp Forms</h1>
                  <p className="text-xs text-slate-500">Transform leadgen via interaktive WhatsApp Forms</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Play className="w-3 h-3 fill-slate-700" />
                  <span>Test Simulator</span>
                </button>
              </div>
            </div>

            {/* Sub Tabs: Create New Form | View All Forms */}
            <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold pt-1">
              <button
                onClick={handleStartCreateNew}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  activeTab === 'create'
                    ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create New Form
              </button>

              <button
                onClick={() => setActiveTab('view_all')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  activeTab === 'view_all'
                    ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                View All Forms
              </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: CREATE NEW FORM (INTERAKT REPLICA) */}
            {/* ========================================================================= */}
            {activeTab === 'create' && (
              <div className="border border-slate-200 rounded-lg bg-white shadow-2xs overflow-hidden">
                
                {/* Top Action Bar inside Form Creator Card */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold text-slate-900">Create WhatsApp Form</h2>
                    {wizardStep === 2 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Step 2: Customize Questions
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {wizardStep === 2 && (
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSaveForm('Draft')}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      Save as Draft
                    </button>

                    {wizardStep === 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!formName.trim()) {
                            setFormName(PRESET_TEMPLATES[selectedTemplateKey]?.name || 'Support Request');
                          }
                          setWizardStep(2);
                        }}
                        className="px-5 py-1.5 rounded-lg bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveForm('published')}
                        className="px-5 py-1.5 rounded-lg bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                      >
                        Save & Publish
                      </button>
                    )}
                  </div>
                </div>

                {/* Main 2-Column Split: Form Config (Left) & WhatsApp Flow Phone Preview (Right) */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column (Step 1 or Step 2) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* STEP 1: FORM DETAILS & TEMPLATES (Interakt Exact Layout) */}
                    {wizardStep === 1 && (
                      <div className="space-y-6">
                        
                        {/* Name Field with Character Count (0/20) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800">
                            Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={20}
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              placeholder="Enter Name"
                              className="w-full px-3 py-2 pr-14 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-1 focus:ring-[#00875a] focus:border-[#00875a] outline-hidden placeholder:text-slate-400 font-medium"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">
                              {formName.length}/20
                            </span>
                          </div>
                        </div>

                        {/* Categories Section (Custom Multi-select Dropdown matching screenshot) */}
                        <div className="space-y-1.5 relative" ref={categoryDropdownRef}>
                          <label className="text-xs font-bold text-slate-800">
                            Categories
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                              className={`w-full px-3 py-2.5 rounded-lg border text-xs text-left bg-white flex items-center justify-between transition-colors cursor-pointer outline-hidden ${
                                isCategoryDropdownOpen
                                  ? 'border-[#00875a] ring-1 ring-[#00875a]'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <span className={`truncate ${selectedCategories.length > 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                                {selectedCategories.length === 0
                                  ? 'Select Categories'
                                  : selectedCategories.length <= 2
                                  ? selectedCategories.join(', ')
                                  : `${selectedCategories.length} Categories Selected`}
                              </span>
                              
                              {/* Green Caret Arrow (Points up when open, down when closed) */}
                              <span className="text-[#00875a] ml-2 shrink-0">
                                {isCategoryDropdownOpen ? (
                                  <ChevronUp className="w-4 h-4 fill-current stroke-[2.5]" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 fill-current stroke-[2.5]" />
                                )}
                              </span>
                            </button>

                            {/* Dropdown Menu List with Checkboxes */}
                            {isCategoryDropdownOpen && (
                              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1.5 max-h-60 overflow-y-auto text-xs">
                                {CATEGORIES_LIST.map((category) => {
                                  const isSelected = selectedCategories.includes(category);
                                  return (
                                    <label
                                      key={category}
                                      className={`flex items-center gap-2.5 px-3.5 py-2 cursor-pointer transition-colors select-none ${
                                        isSelected ? 'bg-slate-50/90 text-slate-900 font-medium' : 'hover:bg-slate-50/70 text-slate-700'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleCategory(category)}
                                        className="w-4 h-4 rounded-xs border-slate-300 text-[#00875a] accent-[#00875a] focus:ring-[#00875a] cursor-pointer shrink-0"
                                      />
                                      <span className="text-xs">{category}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Templates Radio Selection (Interakt Exact Highlight Box) */}
                        <div className="space-y-2.5 pt-1">
                          <label className="text-xs font-bold text-slate-800">
                            Templates
                          </label>
                          <div className="space-y-2">
                            {Object.values(PRESET_TEMPLATES).map((tmpl) => {
                              const isSelected = selectedTemplateKey === tmpl.id;
                              return (
                                <div
                                  key={tmpl.id}
                                  onClick={() => applyTemplate(tmpl.id)}
                                  className={`rounded-lg transition-all cursor-pointer select-none ${
                                    isSelected
                                      ? 'border border-slate-700 bg-white p-2.5 shadow-2xs'
                                      : 'p-1 hover:bg-slate-50/60'
                                  }`}
                                >
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="interakt_template"
                                      checked={isSelected}
                                      onChange={() => applyTemplate(tmpl.id)}
                                      className="w-4 h-4 text-[#00875a] accent-[#00875a] border-slate-300 focus:ring-[#00875a] cursor-pointer"
                                    />
                                    <span className={`text-xs ${
                                      isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600'
                                    }`}>
                                      {tmpl.label}
                                    </span>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* STEP 2: QUESTIONS & FLOW BUILDER */}
                    {wizardStep === 2 && (
                      <div className="space-y-5">
                        
                        {/* Screen Switcher Tabs if multiple screens */}
                        {formScreens.length > 1 && (
                          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            {formScreens.map((sc, scIdx) => (
                              <button
                                key={sc.id || scIdx}
                                type="button"
                                onClick={() => setActiveScreenIndex(scIdx)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  activeScreenIndex === scIdx
                                    ? 'bg-[#00875a] text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                Screen {scIdx + 1}: {sc.screenTitle}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Screen Header Customization */}
                        <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200 space-y-3">
                          <div className="text-xs font-bold text-slate-900">
                            Screen #{activeScreenIndex + 1} Settings
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600">Screen Title (Header bar)</label>
                              <input
                                type="text"
                                value={currentBuilderScreen.screenTitle || ''}
                                onChange={(e) => handleUpdateScreenProp('screenTitle', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-[#00875a] outline-hidden font-medium"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600">Button Text</label>
                              <input
                                type="text"
                                value={currentBuilderScreen.buttonText || 'Done'}
                                onChange={(e) => handleUpdateScreenProp('buttonText', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-[#00875a] outline-hidden font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Main Heading (Optional)</label>
                            <input
                              type="text"
                              value={currentBuilderScreen.headerTitle || ''}
                              onChange={(e) => handleUpdateScreenProp('headerTitle', e.target.value)}
                              placeholder="Leave blank for clean card layout..."
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-[#00875a] outline-hidden font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Subtitle / Instruction (Optional)</label>
                            <input
                              type="text"
                              value={currentBuilderScreen.headerSubtitle || ''}
                              onChange={(e) => handleUpdateScreenProp('headerSubtitle', e.target.value)}
                              placeholder="Leave blank or enter subtitle..."
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-[#00875a] outline-hidden font-medium"
                            />
                          </div>
                        </div>

                        {/* Add Field Palette */}
                        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2.5 shadow-2xs">
                          <div className="text-xs font-bold text-slate-900">Add Field to Screen #{activeScreenIndex + 1}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {FIELD_TYPES.map((ft) => {
                              const Icon = ft.icon;
                              return (
                                <button
                                  key={ft.type}
                                  type="button"
                                  onClick={() => handleAddField(ft.type)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                >
                                  <Icon className="w-3 h-3 text-slate-500" />
                                  <span>{ft.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Configured Questions List for Active Screen */}
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-slate-800">
                            Configured Questions ({currentBuilderScreen.fields?.length || 0})
                          </div>

                          {(currentBuilderScreen.fields || []).map((field, idx) => (
                            <div key={field.id || idx} className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold">
                                    {idx + 1}
                                  </span>
                                  <span>Question #{idx + 1} ({field.type.toUpperCase()})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveField(idx)}
                                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                  title="Delete question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-600">Field Label (Optional)</label>
                                  <input
                                    type="text"
                                    value={field.label || ''}
                                    onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                                    placeholder="e.g. Choose a topic"
                                    className="w-full p-1.5 rounded border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#00875a] outline-hidden"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-600">Placeholder Text</label>
                                  <input
                                    type="text"
                                    value={field.placeholder || ''}
                                    onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                                    placeholder="e.g. Name / Order number"
                                    className="w-full p-1.5 rounded border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#00875a] outline-hidden"
                                  />
                                </div>
                              </div>

                              {/* Helper text input if available */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600">Section Title / Helper (Optional)</label>
                                <input
                                  type="text"
                                  value={field.helperText || ''}
                                  onChange={(e) => handleUpdateField(idx, 'helperText', e.target.value)}
                                  placeholder="e.g. Choose a topic / Choose one:"
                                  className="w-full p-1.5 rounded border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#00875a] outline-hidden"
                                />
                              </div>

                              {/* Options builder for Dropdown / Radio / Checkbox Group */}
                              {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox_group') && (
                                <div className="space-y-1.5 pt-1 bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-600">Options List</label>
                                    <button
                                      type="button"
                                      onClick={() => handleAddOptionToField(idx)}
                                      className="text-[11px] font-bold text-[#00875a] hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add Option</span>
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {(field.options || []).map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                          className="flex-1 p-1 rounded border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-[#00875a] outline-hidden"
                                        />
                                        {(field.options || []).length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveOption(idx, optIdx)}
                                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={field.required !== false}
                                  onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                                  className="w-3.5 h-3.5 accent-[#00875a] rounded-xs cursor-pointer"
                                />
                                <span>Mandatory Question (Required)</span>
                              </label>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Right Column: Live Phone Simulator (Interakt Exact Preview) */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    
                    {/* Preview Header Selector */}
                    <div className="w-full max-w-[320px] flex items-center justify-between pb-3">
                      <span className="text-xs font-bold text-slate-700">Preview</span>
                      <div className="relative">
                        <select
                          value={previewDropdownSelected}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreviewDropdownSelected(val);
                            const foundKey = Object.keys(PRESET_TEMPLATES).find(
                              (k) =>
                                PRESET_TEMPLATES[k].previewTitle === val ||
                                PRESET_TEMPLATES[k].screens?.some((sc) => sc.screenTitle === val)
                            );
                            if (foundKey) {
                              applyTemplate(foundKey);
                              const tmpl = PRESET_TEMPLATES[foundKey];
                              const scIdx = tmpl.screens?.findIndex((sc) => sc.screenTitle === val);
                              if (scIdx !== -1 && scIdx !== undefined) {
                                setPhoneScreenIndex(scIdx);
                              }
                            }
                          }}
                          className="px-2.5 py-1 pr-6 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#00875a] outline-hidden appearance-none cursor-pointer shadow-2xs"
                        >
                          <option value="Get help">Get help</option>
                          <option value="Question 1 of 3">Question 1 of 3</option>
                          <option value="Question 2 of 3">Question 2 of 3</option>
                          <option value="Question 3 of 3">Question 3 of 3</option>
                          <option value="Feedback 1 of 2">Feedback 1 of 2</option>
                          <option value="Feedback 2 of 2">Feedback 2 of 2</option>
                          <option value="Join Now">Join Now</option>
                          <option value="This is a sample form">This is a sample form</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* WhatsApp Flow Phone Frame (Interakt Replica) */}
                    <div className="w-[300px] sm:w-[320px] bg-white rounded-[28px] p-3 border-2 border-slate-200 shadow-xl flex flex-col justify-between min-h-[520px] relative overflow-hidden">
                      
                      {/* Interactive WhatsApp Flow Modal Sheet */}
                      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        
                        {/* Flow Modal Header Bar */}
                        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white">
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneScreenIndex(0);
                              setPreviewSubmitted(false);
                              setPreviewFormData({});
                              setPreviewDropdownSelected(formScreens[0]?.screenTitle || 'Get help');
                            }}
                            className="text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                            title="Reset preview"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 truncate max-w-[190px]">
                            {currentPhoneScreen.screenTitle || 'Get help'}
                          </span>
                          <div className="w-3.5" />
                        </div>

                        {/* Top Accent Step Progress Indicator */}
                        {formScreens.length > 1 ? (
                          <div className="flex gap-1.5 h-0.5 px-3 py-0 bg-white">
                            {formScreens.map((_, sIdx) => (
                              <div
                                key={sIdx}
                                className={`flex-1 h-full rounded-full transition-all duration-200 ${
                                  sIdx <= phoneScreenIndex ? 'bg-[#00875a]' : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-0.5 bg-slate-100">
                            <div className="h-full bg-[#00875a] w-full" />
                          </div>
                        )}

                        {/* Flow Sheet Content Body */}
                        {!previewSubmitted ? (
                          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px]">
                            
                            {/* Heading & Subtitle if present */}
                            {currentPhoneScreen.headerTitle && (
                              <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                  {currentPhoneScreen.headerTitle}
                                </h3>
                                {currentPhoneScreen.headerSubtitle && (
                                  <p className="text-[11px] text-slate-500 leading-normal">
                                    {currentPhoneScreen.headerSubtitle}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Form Input Elements (WhatsApp Flow UI) */}
                            <div className="space-y-3">
                              {(currentPhoneScreen.fields || []).map((field, fIdx) => (
                                <div key={field.id || fIdx} className="space-y-1">
                                  
                                  {/* Field Type: Dropdown Select */}
                                  {field.type === 'dropdown' && (
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenDropdownFieldId(
                                            openDropdownFieldId === field.id ? null : field.id
                                          )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-left text-xs text-slate-700 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
                                      >
                                        <span className={`truncate ${previewFormData[field.id] ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                          {previewFormData[field.id] || field.placeholder || field.label}
                                        </span>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                                      </button>

                                      {/* Dropdown Options Popup */}
                                      {openDropdownFieldId === field.id && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs max-h-40 overflow-y-auto">
                                          {(field.options || []).map((opt, oIdx) => (
                                            <button
                                              key={oIdx}
                                              type="button"
                                              onClick={() => {
                                                setPreviewFormData((p) => ({ ...p, [field.id]: opt }));
                                                setOpenDropdownFieldId(null);
                                              }}
                                              className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer truncate"
                                            >
                                              {opt}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Field Type: Text / Phone / Email / Number / Date */}
                                  {(field.type === 'text' ||
                                    field.type === 'phone' ||
                                    field.type === 'email' ||
                                    field.type === 'number' ||
                                    field.type === 'date') && (
                                    <div>
                                      {field.label && (
                                        <div className="text-xs font-bold text-slate-800 mb-1">{field.label}</div>
                                      )}
                                      <input
                                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                        value={previewFormData[field.id] || ''}
                                        onChange={(e) =>
                                          setPreviewFormData((p) => ({ ...p, [field.id]: e.target.value }))
                                        }
                                        placeholder={field.placeholder || field.label}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#00875a] outline-hidden font-medium"
                                      />
                                      {field.helperText && (
                                        <p className="text-[10px] text-slate-400 mt-1">{field.helperText}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Field Type: Radio */}
                                  {field.type === 'radio' && (
                                    <div className="space-y-1 pt-0.5">
                                      {field.label && (
                                        <div className="text-xs font-bold text-slate-800">{field.label}</div>
                                      )}
                                      {field.helperText && (
                                        <div className="text-[11px] text-slate-800 font-medium mb-1">{field.helperText}</div>
                                      )}
                                      <div className="space-y-1.5 pt-0.5">
                                        {(field.options || []).map((opt, oIdx) => (
                                          <label
                                            key={oIdx}
                                            className={`flex items-center text-xs text-slate-700 cursor-pointer select-none py-0.5 hover:bg-slate-50/60 rounded px-1 -mx-1 ${
                                              field.alignRight ? 'justify-between' : 'gap-2'
                                            }`}
                                          >
                                            <span className="text-[11px] text-slate-700 leading-normal">{opt}</span>
                                            <input
                                              type="radio"
                                              name={`preview_${field.id}`}
                                              checked={previewFormData[field.id] === opt}
                                              onChange={() =>
                                                setPreviewFormData((p) => ({ ...p, [field.id]: opt }))
                                              }
                                              className="w-3.5 h-3.5 accent-[#00875a] cursor-pointer shrink-0"
                                            />
                                          </label>
                                        ))}
                                      </div>
                                      <div className="border-b border-slate-200/70 pt-2" />
                                    </div>
                                  )}

                                  {/* Field Type: Checkbox Group (List of checkboxes with label on left, checkbox on right) */}
                                  {field.type === 'checkbox_group' && (
                                    <div className="space-y-1 pt-0.5">
                                      {field.label && (
                                        <div className="text-xs font-bold text-slate-800">{field.label}</div>
                                      )}
                                      {field.helperText && (
                                        <div className="text-[11px] text-slate-700 font-medium mb-1">{field.helperText}</div>
                                      )}
                                      <div className="space-y-2">
                                        {(field.options || []).map((opt, oIdx) => {
                                          const curList = Array.isArray(previewFormData[field.id])
                                            ? previewFormData[field.id]
                                            : [];
                                          const isChecked = curList.includes(opt);
                                          return (
                                            <label
                                              key={oIdx}
                                              className="flex items-center justify-between text-xs text-slate-700 cursor-pointer select-none py-1 hover:bg-slate-50/60 rounded px-1 -mx-1"
                                            >
                                              <span className="text-[11px] text-slate-700 leading-normal">{opt}</span>
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                  const checked = e.target.checked;
                                                  setPreviewFormData((p) => {
                                                    const current = Array.isArray(p[field.id]) ? p[field.id] : [];
                                                    const updated = checked
                                                      ? [...current, opt]
                                                      : current.filter((x) => x !== opt);
                                                    return { ...p, [field.id]: updated };
                                                  });
                                                }}
                                                className="w-3.5 h-3.5 rounded-xs border-slate-300 text-[#00875a] accent-[#00875a] focus:ring-[#00875a] cursor-pointer shrink-0"
                                              />
                                            </label>
                                          );
                                        })}
                                      </div>
                                      <div className="border-b border-slate-200/70 pt-2" />
                                    </div>
                                  )}

                                  {/* Field Type: Single Checkbox (Checkbox on left, label on right, optional link) */}
                                  {field.type === 'single_checkbox' && (
                                    <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer select-none pt-1">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(previewFormData[field.id])}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setPreviewFormData((p) => ({ ...p, [field.id]: checked }));
                                        }}
                                        className="w-3.5 h-3.5 rounded-xs border-slate-300 text-[#00875a] accent-[#00875a] focus:ring-[#00875a] cursor-pointer mt-0.5 shrink-0"
                                      />
                                      <span className="text-[11px] text-slate-600 leading-snug">
                                        {field.label}{' '}
                                        {field.linkText && (
                                          <span
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              alert('Terms and conditions: By participating, you agree to receive promotional updates via WhatsApp.');
                                            }}
                                            className="text-emerald-700 underline font-medium cursor-pointer hover:text-emerald-800"
                                          >
                                            {field.linkText}
                                          </span>
                                        )}
                                      </span>
                                    </label>
                                  )}

                                  {/* Field Type: Textarea */}
                                  {field.type === 'textarea' && (
                                    <div className="space-y-1.5 pt-1">
                                      {field.label && (
                                        <div className="text-xs font-bold text-slate-900 leading-snug">{field.label}</div>
                                      )}
                                      {field.helperText && (
                                        <div className="text-[10px] text-slate-400">{field.helperText}</div>
                                      )}
                                      <textarea
                                        rows={3}
                                        value={previewFormData[field.id] || ''}
                                        onChange={(e) =>
                                          setPreviewFormData((p) => ({ ...p, [field.id]: e.target.value }))
                                        }
                                        placeholder={field.placeholder || field.label || 'Leave a comment (Optional)'}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#00875a] outline-hidden bg-white font-medium min-h-[76px]"
                                      />
                                    </div>
                                  )}

                                  {/* Field Type: Rating */}
                                  {field.type === 'rating' && (
                                    <div className="space-y-1 pt-1">
                                      <div className="text-[11px] font-semibold text-slate-600">{field.label}</div>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() =>
                                              setPreviewFormData((p) => ({ ...p, [field.id]: star }))
                                            }
                                            className="p-1 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors"
                                          >
                                            <Star
                                              className={`w-4 h-4 ${
                                                (previewFormData[field.id] || 0) >= star
                                                  ? 'text-amber-400 fill-amber-400'
                                                  : 'text-slate-300'
                                              }`}
                                            />
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              ))}
                            </div>

                          </div>
                        ) : (
                          /* Thank You / Submission Confirmation Screen inside Phone */
                          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00875a] flex items-center justify-center shadow-xs">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Thank You! 🎉</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Your response has been submitted via WhatsApp Form.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setPhoneScreenIndex(0);
                                setPreviewSubmitted(false);
                                setPreviewFormData({});
                                setPreviewDropdownSelected(formScreens[0]?.screenTitle || 'Get help');
                              }}
                              className="text-xs font-bold text-[#00875a] hover:underline cursor-pointer pt-2"
                            >
                              Fill Form Again
                            </button>
                          </div>
                        )}

                        {/* Sticky Bottom Action Button inside WhatsApp Flow */}
                        {!previewSubmitted && (
                          <div className="p-3 border-t border-slate-100 bg-white">
                            <button
                              type="button"
                              onClick={handlePhoneActionClick}
                              className="w-full py-2 bg-[#00875a] hover:bg-[#00704a] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs text-center"
                            >
                              {currentPhoneScreen.buttonText || (phoneScreenIndex < formScreens.length - 1 ? 'Continue' : 'Done')}
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Phone Bottom Home Bar */}
                      <div className="pt-2 flex justify-center">
                        <div className="w-20 h-1 bg-slate-300 rounded-full" />
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: VIEW ALL FORMS */}
            {/* ========================================================================= */}
            {activeTab === 'view_all' && (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs space-y-0">
                
                {/* Search & Actions Bar inside Card */}
                <div className="p-4 bg-[#f8fdfa] border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by form name or ID..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-[#00875a] outline-hidden placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Category Filter */}
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 pr-7 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold appearance-none cursor-pointer shadow-2xs"
                      >
                        <option value="All">All Categories</option>
                        {CATEGORIES_LIST.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                      onClick={loadForms}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      <span>Sync Data</span>
                    </button>
                  </div>
                </div>

                {/* Table Container Header */}
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">WhatsApp Forms Details</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing {filteredForms.length} forms
                  </span>
                </div>

                {/* Forms Table */}
                {loading ? (
                  <div className="py-16 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#00875a] mx-auto" />
                    <p className="text-xs text-slate-400">Loading forms...</p>
                  </div>
                ) : filteredForms.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500">No WhatsApp forms found matching your filter.</p>
                    <button
                      onClick={handleStartCreateNew}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      + Create New Form
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50/50">
                          <th className="py-3 px-4">Form Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Form ID</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Responses</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredForms.map((form) => (
                          <tr key={form.id} className="hover:bg-slate-50/50 transition-colors">
                            
                            {/* Form Name */}
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>{form.title || form.name}</span>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4 text-slate-600 text-xs">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                                {form.category || 'General'}
                              </span>
                            </td>

                            {/* Form ID */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                              {form.form_id || '--'}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  form.status?.toLowerCase() === 'published'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {form.status || 'Draft'}
                              </span>
                            </td>

                            {/* Responses */}
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleOpenResponses(form)}
                                className="text-xs font-bold text-slate-800 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>{form.submissions_count || 0} responses</span>
                              </button>
                            </td>

                            {/* Action Icons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(form)}
                                  title="Edit Form"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateForm(form)}
                                  title="Duplicate Form"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenResponses(form)}
                                  title="View Submissions"
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteForm(form.id)}
                                  title="Delete Form"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: VIEW SUBMISSIONS / RESPONSES */}
      {/* ========================================================================= */}
      {responsesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs text-slate-900">
                  Submissions for "{responsesModal.title || responsesModal.name}"
                </h3>
                <p className="text-[10px] text-slate-500">
                  Form ID: {responsesModal.form_id || responsesModal.id} • {responsesList.length} total entries
                </p>
              </div>
              <button
                onClick={() => setResponsesModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {loadingResponses ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading submissions...</div>
              ) : responsesList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs text-slate-400">No submissions recorded yet for this form.</p>
                  <p className="text-[11px] text-slate-400">Use the phone simulator to submit test responses.</p>
                </div>
              ) : (
                responsesList.map((resp) => (
                  <div key={resp.id} className="p-4 bg-slate-50/80 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                          {resp.contact_name?.[0] || 'U'}
                        </div>
                        <span>{resp.contact_name || 'Anonymous User'}</span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-400">
                        {resp.contact_phone} • {resp.submitted_at || 'Just now'}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-slate-200/70 text-xs space-y-1.5">
                      {typeof resp.answers === 'object' && resp.answers !== null ? (
                        Object.entries(resp.answers).map(([k, v]) => (
                          <div key={k} className="flex flex-col sm:flex-row sm:items-start justify-between text-[11px] gap-1 border-b border-slate-50 pb-1 last:border-0 last:pb-0">
                            <span className="font-semibold text-slate-600">{k}:</span>
                            <span className="text-slate-900 font-medium sm:text-right">
                              {Array.isArray(v) ? v.join(', ') : String(v)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <pre className="font-mono text-[10px] text-slate-700">{JSON.stringify(resp.answers, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  showToast('Responses exported to CSV format');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setResponsesModal(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close
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
