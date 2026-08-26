export const navItems = [
  {
    name: 'Product',
    path: '/features',
    hasDropdown: true,
    dropdownItems: [
      {
        name: 'WhatsApp Marketing',
        description: 'Broadcasts, campaigns & customer engagement',
        path: '/products/whatsapp-marketing',
        icon: 'Megaphone',
      },
      {
        name: 'Sales CRM',
        description: 'Capture, qualify & convert leads',
        path: '/products/sales-crm',
        icon: 'TrendingUp',
      },
      {
        name: 'Customer Support',
        description: 'Shared inbox & faster customer resolution',
        path: '/products/customer-support',
        icon: 'Headphones',
      },
      {
        name: 'Instagram Automation',
        description: 'Automate DMs, comments & engagement',
        path: '/products/instagram-automation',
        icon: 'Instagram',
      },
      {
        name: 'AI Agents',
        description: '24/7 AI-powered customer conversations',
        path: '/products/ai-agents',
        icon: 'Bot',
      },
      {
        name: 'WhatsApp Chatbots',
        description: 'No-code bots, forms & guided conversations',
        path: '/products/whatsapp-chatbots',
        icon: 'MessageSquareCode',
      },
      {
        name: 'WhatsApp Commerce',
        description: 'Catalogs, carts & conversational selling',
        path: '/products/whatsapp-commerce',
        icon: 'ShoppingCart',
      },
      {
        name: 'Automation',
        description: 'Triggers, workflows & follow-ups',
        path: '/products/automation',
        icon: 'Workflow',
      },
      {
        name: 'Analytics',
        description: 'Campaign, funnel & revenue insights',
        path: '/products/analytics',
        icon: 'BarChart3',
      },
      {
        name: 'Developer Platform',
        description: 'APIs, webhooks & integrations',
        path: '/products/developer-platform',
        icon: 'Code2',
      },
      {
        name: 'Voice AI',
        description: 'AI receptionist for inbound calls',
        path: '/products/voice-ai',
        icon: 'PhoneCall',
      },
    ],
  },
  {
    name: 'Solutions',
    path: '/solutions',
    hasDropdown: true,
    isMegaMenu: true,
    megaSections: {
      industry: {
        title: 'BY INDUSTRY',
        items: [
          {
            name: 'Ecommerce & D2C',
            description: 'Drive sales and recover abandoned carts',
            path: '/solutions#ecommerce',
            icon: 'ShoppingBag',
          },
          {
            name: 'Real Estate',
            description: 'Capture property leads and automate follow-ups',
            path: '/solutions#real-estate',
            icon: 'Building2',
          },
          {
            name: 'Education',
            description: 'Student enquiries, admissions and alerts',
            path: '/solutions#education',
            icon: 'GraduationCap',
          },
          {
            name: 'Healthcare',
            description: 'Appointments, reminders and patient engagement',
            path: '/solutions#healthcare',
            icon: 'HeartPulse',
          },
          {
            name: 'Travel & Hospitality',
            description: 'Bookings, enquiries and customer updates',
            path: '/solutions#travel',
            icon: 'Plane',
          },
          {
            name: 'Financial Services',
            description: 'Lead generation, verification and customer support',
            path: '/solutions#finance',
            icon: 'Landmark',
          },
        ],
      },
      useCase: {
        title: 'BY USE CASE',
        items: [
          {
            name: 'Lead Generation',
            description: 'Capture and qualify leads automatically',
            path: '/solutions#lead-generation',
            icon: 'UserPlus',
          },
          {
            name: 'Customer Engagement',
            description: 'Start meaningful conversations at scale',
            path: '/solutions#customer-engagement',
            icon: 'MessageCircle',
          },
          {
            name: 'Sales & Conversions',
            description: 'Turn conversations into qualified opportunities',
            path: '/solutions#sales',
            icon: 'TrendingUp',
          },
          {
            name: 'Customer Support',
            description: 'Resolve customer queries faster',
            path: '/solutions#support',
            icon: 'Headphones',
          },
          {
            name: 'Marketing Automation',
            description: 'Automate campaigns and follow-ups',
            path: '/solutions#marketing',
            icon: 'Megaphone',
          },
          {
            name: 'Conversational AI',
            description: 'Let AI handle conversations 24/7',
            path: '/solutions#ai',
            icon: 'Bot',
          },
        ],
      },
      featured: {
        title: 'FEATURED',
        cardTitle: 'See ARCO in action',
        description:
          'Discover how ARCO Communication helps businesses generate leads, automate conversations and increase conversions.',
        ctaText: 'Book a Demo →',
        ctaPath: '/contact',
      },
    },
  },
  {
    name: 'Resources',
    path: '/resources',
    hasDropdown: true,
    isMegaMenu: true,
    megaSections: {
      links: [
        {
          name: 'Blog',
          description: 'WhatsApp growth playbooks & industry insights',
          path: '/resources#blog',
          icon: 'BookOpen',
        },
        {
          name: 'Guides',
          description: 'Step-by-step API & automation tutorials',
          path: '/resources#guides',
          icon: 'FileText',
        },
        {
          name: 'Help Center',
          description: 'Documentation, FAQs & knowledge base',
          path: '/resources#help',
          icon: 'HelpCircle',
        },
        {
          name: 'Contact',
          description: 'Speak with our product specialists',
          path: '/contact',
          icon: 'PhoneCall',
        },
      ],
      featured: {
        badge: 'EXPLORE RESOURCES',
        heading: 'Learn, build and grow with ARCO',
        description:
          'Practical guides, expert insights and documentation to help you succeed with ARCO Communication.',
        ctaText: 'Visit Resource Center →',
        ctaPath: '/resources',
      },
    },
    dropdownItems: [
      {
        name: 'Blog',
        description: 'WhatsApp growth playbooks & industry insights',
        path: '/resources#blog',
        icon: 'BookOpen',
      },
      {
        name: 'Guides',
        description: 'Step-by-step API & automation tutorials',
        path: '/resources#guides',
        icon: 'FileText',
      },
      {
        name: 'Help Center',
        description: 'Documentation, FAQs & knowledge base',
        path: '/resources#help',
        icon: 'HelpCircle',
      },
      {
        name: 'Contact',
        description: 'Speak with our product specialists',
        path: '/contact',
        icon: 'PhoneCall',
      },
    ],
  },
  {
    name: 'Pricing',
    path: '/pricing',
    hasDropdown: false,
  },
];

// Fallback for simple link iterations
export const navLinks = [
  { name: 'Product', path: '/features' },
  { name: 'Solutions', path: '/solutions' },
  { name: 'Resources', path: '/resources' },
  { name: 'Pricing', path: '/pricing' },
];

export const footerLinks = {
  product: [
    { name: 'WhatsApp Marketing', path: '/products/whatsapp-marketing' },
    { name: 'Sales CRM', path: '/products/sales-crm' },
    { name: 'Customer Support', path: '/products/customer-support' },
    { name: 'Instagram Automation', path: '/products/instagram-automation' },
    { name: 'AI Agents', path: '/products/ai-agents' },
    { name: 'WhatsApp Chatbots', path: '/products/whatsapp-chatbots' },
    { name: 'WhatsApp Commerce', path: '/products/whatsapp-commerce' },
    { name: 'Automation', path: '/products/automation' },
    { name: 'Analytics', path: '/products/analytics' },
    { name: 'Developer Platform', path: '/products/developer-platform' },
    { name: 'Voice AI', path: '/products/voice-ai' },
  ],
  solutions: [
    { name: 'Ecommerce & D2C', path: '/solutions#ecommerce' },
    { name: 'Real Estate', path: '/solutions#real-estate' },
    { name: 'Education', path: '/solutions#education' },
    { name: 'Healthcare', path: '/solutions#healthcare' },
    { name: 'Travel & Hospitality', path: '/solutions#travel' },
    { name: 'Financial Services', path: '/solutions#finance' },
  ],
  resources: [
    { name: 'Documentation', path: '/resources' },
    { name: 'API Reference', path: '/resources' },
    { name: 'Case Studies', path: '/resources' },
    { name: 'Blog & Articles', path: '/resources' },
    { name: 'Community Forum', path: '/resources' },
  ],
  company: [
    { name: 'About Us', path: '/contact' },
    { name: 'Careers', path: '/contact' },
    { name: 'Contact Sales', path: '/contact' },
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
  ],
};
