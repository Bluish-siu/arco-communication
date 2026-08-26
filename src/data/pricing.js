export const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    badge: null,
    popular: false,
    forText: 'Small teams getting started',
    price: {
      monthly: '₹999',
      yearly: '₹799',
    },
    period: '/ month',
    billingNote: 'billed annually',
    features: [
      '1 WhatsApp number',
      '2 team members',
      '1,000 conversations/month',
      'Basic automation',
      'Shared inbox',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start Free',
    ctaLink: '/contact',
    ctaVariant: 'outline',
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: 'POPULAR',
    popular: true,
    forText: 'Growing businesses',
    price: {
      monthly: '₹2,499',
      yearly: '₹1,999',
    },
    period: '/ month',
    billingNote: 'billed annually',
    features: [
      '3 WhatsApp numbers',
      '10 team members',
      '5,000 conversations/month',
      'Campaign automation',
      'AI lead qualification',
      'Advanced analytics',
      'CRM integrations',
      'Priority support',
    ],
    cta: 'Start Growing',
    ctaLink: '/contact',
    ctaVariant: 'primary',
  },
  {
    id: 'scale',
    name: 'Scale',
    badge: null,
    popular: false,
    forText: 'Businesses scaling conversations',
    price: {
      monthly: '₹5,999',
      yearly: '₹4,799',
    },
    period: '/ month',
    billingNote: 'billed annually',
    features: [
      '10 WhatsApp numbers',
      '25 team members',
      '20,000 conversations/month',
      'Advanced AI automation',
      'Team collaboration',
      'Custom workflows',
      'All integrations',
      'Dedicated support',
    ],
    cta: 'Choose Scale',
    ctaLink: '/contact',
    ctaVariant: 'outline',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: null,
    popular: false,
    forText: 'Large organizations with custom needs',
    price: {
      monthly: "Let's Talk",
      yearly: "Let's Talk",
    },
    period: '',
    billingNote: 'custom invoicing',
    features: [
      'Unlimited team members',
      'Custom conversation limits',
      'Enterprise AI automation',
      'Advanced permissions',
      'Custom integrations',
      'Dedicated account manager',
      'SLA & priority support',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    ctaVariant: 'outline',
  },
];

export const comparisonFeatures = [
  {
    category: 'Core Capacity',
    features: [
      {
        name: 'WhatsApp Numbers',
        starter: '1',
        growth: '3',
        scale: '10',
        enterprise: 'Unlimited',
      },
      {
        name: 'Team Members',
        starter: '2',
        growth: '10',
        scale: '25',
        enterprise: 'Unlimited',
      },
      {
        name: 'Monthly Conversations',
        starter: '1,000',
        growth: '5,000',
        scale: '20,000',
        enterprise: 'Custom Volume',
      },
    ],
  },
  {
    category: 'Platform Capabilities',
    features: [
      {
        name: 'Shared Inbox',
        starter: true,
        growth: true,
        scale: true,
        enterprise: true,
      },
      {
        name: 'Campaign Automation',
        starter: 'Basic',
        growth: 'Advanced',
        scale: 'Full Automation',
        enterprise: 'Enterprise Custom',
      },
      {
        name: 'AI Automation',
        starter: false,
        growth: 'Lead Qualification',
        scale: 'Advanced AI Agents',
        enterprise: 'Custom AI Models',
      },
      {
        name: 'Analytics',
        starter: 'Basic',
        growth: 'Advanced',
        scale: 'Real-time Deep',
        enterprise: 'Custom BI Exports',
      },
      {
        name: 'CRM Integrations',
        starter: false,
        growth: true,
        scale: true,
        enterprise: true,
      },
      {
        name: 'Custom Workflows',
        starter: false,
        growth: false,
        scale: true,
        enterprise: true,
      },
      {
        name: 'Dedicated Support',
        starter: 'Email Support',
        growth: 'Priority Support',
        scale: 'Dedicated Specialist',
        enterprise: 'Account Manager & SLA',
      },
    ],
  },
];

export const pricingFAQs = [
  {
    id: 1,
    question: 'Can I change plans later?',
    answer:
      'Yes, you can upgrade, downgrade, or switch between monthly and annual billing at any time directly from your account settings. Prorated adjustments will be calculated automatically.',
  },
  {
    id: 2,
    question: 'Is there a free trial?',
    answer:
      'Yes, all paid plans come with a 14-day free trial with full feature access. No credit card is required to get started.',
  },
  {
    id: 3,
    question: 'What happens if I exceed my conversation limit?',
    answer:
      'If you approach your monthly limit, we will notify you in advance. You can easily purchase top-up message packs or upgrade to a higher tier with no interruption in service.',
  },
  {
    id: 4,
    question: 'Can I connect multiple WhatsApp numbers?',
    answer:
      'Yes! The Growth tier supports up to 3 numbers, the Scale tier supports 10 numbers, and Enterprise supports custom unlimited numbers under one centralized dashboard.',
  },
  {
    id: 5,
    question: 'Do you offer custom enterprise plans?',
    answer:
      'Yes. For large teams, high-volume senders, and organizations requiring dedicated SLAs, custom integrations, or on-premise data compliance, our enterprise team can tailor a plan specifically for your needs.',
  },
  {
    id: 6,
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. There are no lock-in contracts for monthly plans. You can cancel your subscription at any time with one click, and you will retain access until the end of your billing cycle.',
  },
];
