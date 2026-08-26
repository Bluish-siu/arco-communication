import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Mail,
  Megaphone,
  Users,
  ShoppingBag,
  MessageSquare,
  Bot,
  TrendingUp,
  ShoppingCart,
  Settings,
  LayoutGrid,
  ChevronUp,
  ChevronRight,
  Sparkles,
  FileText,
  Filter,
  BarChart3,
  BarChart2,
  Target,
  Inbox,
  UserCheck,
  Zap,
  Layers,
  PhoneCall,
  Contact,
  Kanban,
  CheckSquare,
  Sliders,
  Package,
  Receipt,
  Code2,
  QrCode,
  MessageCircle,
  FileCheck,
  ListFilter,
} from 'lucide-react';

// Custom Contextual Instagram Icon
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function DashboardSidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSubItem, setActiveSubItem] = useState('');
  
  // Track open submenus (multiple can stay open)
  const [expandedMenus, setExpandedMenus] = useState(() => ({
    market: false,
    support: location.pathname.includes('/automation/chat-assignment') || location.pathname.includes('/analytics/overview'),
    automation: location.pathname.includes('/automation') && !location.pathname.includes('/automation/chat-assignment'),
    salesCrm: location.pathname.includes('sales') || location.pathname.includes('task') || location.pathname.includes('contact'),
    commerce: location.pathname.includes('commerce') || location.pathname.includes('catalog'),
  }));

  const toggleSubmenu = (key, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const navSections = [
    {
      title: 'MAIN',
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          link: '/dashboard',
          active: location.pathname === '/dashboard' && !activeSubItem,
        },
      ],
    },
    {
      title: 'QUICK LINKS',
      items: [
        {
          id: 'inbox',
          label: 'Inbox',
          icon: Mail,
          link: '/inbox',
          active: location.pathname === '/inbox',
        },
        {
          id: 'campaigns',
          label: 'Campaigns',
          icon: Megaphone,
          link: '/campaigns',
          active: location.pathname === '/campaigns',
        },
        {
          id: 'contacts',
          label: 'Contacts',
          icon: Users,
          link: '/contacts',
          active: location.pathname === '/contacts',
        },
      ],
    },
    {
      title: 'TOOLS',
      items: [
        {
          id: 'market',
          label: 'Market',
          icon: ShoppingBag,
          link: '/products/whatsapp-marketing',
          hasSubmenu: true,
          submenuKey: 'market',
          subItems: [
            { id: 'templates', label: 'Templates', icon: FileText, link: '/templates/list?channel_type=whatsapp&segment=library' },
            { id: 'segments', label: 'Segments', icon: Filter, link: '/segments' },
            { id: 'campaigns-sub', label: 'Campaigns', icon: Megaphone, link: '/campaigns' },
            { id: 'campaign-reports', label: 'Custom Campaign Reports', icon: BarChart3, link: '/analytics/campaign-reports' },
            { id: 'meta-ads', label: 'Meta Ads', icon: Target, link: '/analytics/ad-performance' },
          ],
        },
        {
          id: 'support',
          label: 'Support',
          icon: MessageSquare,
          link: '/products/customer-support',
          hasSubmenu: true,
          submenuKey: 'support',
          subItems: [
            { id: 'inbox-sub', label: 'Inbox', icon: Inbox, link: '/inbox' },
            { id: 'chat-analytics', label: 'Chat Analytics', icon: BarChart2, link: '/analytics/overview' },
            { id: 'chat-assignment', label: 'Chat Assignment', icon: UserCheck, link: '/automation/chat-assignment' },
          ],
        },
        {
          id: 'automation',
          label: 'Automation',
          icon: Bot,
          link: '/automation/inbox-setting',
          hasSubmenu: true,
          submenuKey: 'automation',
          subItems: [
            { id: 'basic-automations', label: 'Basic Automations', icon: Zap, link: '/automation/inbox-setting' },
            { id: 'custom-auto-reply', label: 'Custom Auto Reply', icon: MessageSquare, link: '/automation/custom-reply' },
            { id: 'workflows', label: 'Workflows', icon: Layers, link: '/automation/workflows' },
            { id: 'ai-intent', label: 'AI Intent Matching', icon: Sparkles, link: '/automation/ai-intent-matching' },
            { id: 'wa-ai-agent', label: 'WhatsApp AI Agent', icon: Bot, link: '/automation/whatsapp-ai-agent' },
            { id: 'ig-quickflows', label: 'Instagram Quickflows', icon: InstagramIcon, link: '/automation/quick-flows' },
            { id: 'voice-ai', label: 'Voice AI – Inbound Calls', icon: PhoneCall, link: '/automation/my-call-genie', isNew: true },
            { id: 'whatsapp-forms', label: 'WhatsApp Forms', icon: FileCheck, link: '/automation/whatsapp-forms/view' },
            { id: 'interactive-list', label: 'Interactive Lists', icon: ListFilter, link: '/automation/interactive-list' },
          ],
        },
        {
          id: 'salesCrm',
          label: 'Sales CRM',
          icon: TrendingUp,
          link: '/products/sales-crm',
          hasSubmenu: true,
          submenuKey: 'salesCrm',
          subItems: [
            { id: 'crm-contacts', label: 'Contacts', icon: Contact, link: '/contacts' },
            { id: 'sales-pipeline', label: 'Sales Pipeline', icon: Kanban, link: '/sales-pipeline' },
            { id: 'sales-reports', label: 'Sales CRM Reports', icon: BarChart3, link: '/sales-crm-reports' },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare, link: '/tasks' },
          ],
        },
        {
          id: 'commerce',
          label: 'WhatsApp Commerce',
          icon: ShoppingCart,
          link: '/commerce-settings',
          hasSubmenu: true,
          submenuKey: 'commerce',
          subItems: [
            { id: 'commerce-settings', label: 'Commerce Settings', icon: Sliders, link: '/commerce-settings' },
            { id: 'catalog', label: 'Catalog', icon: ShoppingBag, link: '/commerce/catalog' },
            { id: 'checkout-bot', label: 'Checkout Bot', icon: Bot, link: '/checkout-bot' },
            { id: 'order-panel', label: 'Order Panel', icon: Package, link: '/commerce/order-panel' },
          ],
        },
        {
          id: 'integrations',
          label: 'Integrations',
          icon: Settings,
          link: '/integrations',
          active: location.pathname === '/integrations',
        },
        {
          id: 'widget',
          label: 'Widget',
          icon: LayoutGrid,
          link: '/widget',
          active: location.pathname.startsWith('/widget'),
        },
      ],
    },
  ];

  return (
    <>
      {/* 1. COMPACT FIXED / HOVER-EXPAND SIDEBAR */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-200 ease-in-out flex flex-col ${
          isExpanded
            ? 'w-[235px] bg-white shadow-2xl border-r border-slate-200'
            : 'w-14 bg-slate-900 shadow-lg border-r border-slate-800'
        }`}
        aria-label="Dashboard Sidebar Navigation"
      >
        {/* Top Header / Hamburger Bar */}
        <div
          className={`h-16 sm:h-18 flex items-center px-3.5 border-b transition-colors shrink-0 ${
            isExpanded
              ? 'justify-between bg-white border-slate-200'
              : 'justify-center bg-slate-900 border-slate-800'
          }`}
        >
          {isExpanded ? (
            <>
              {/* Expanded Brand Logo */}
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:bg-red-700 transition-colors">
                  A
                </div>
                <div className="leading-tight">
                  <div className="font-extrabold text-sm text-slate-900 tracking-tight">
                    ARCO <span className="font-semibold text-slate-700">Communication</span>
                  </div>
                </div>
              </Link>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Collapsed 3-Line Hamburger Trigger Button */
            <button
              type="button"
              className="w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer group"
              title="Expand navigation menu"
            >
              <span className="w-4 h-0.5 bg-current rounded-full transition-all group-hover:w-5" />
              <span className="w-4 h-0.5 bg-current rounded-full transition-all group-hover:w-4" />
              <span className="w-4 h-0.5 bg-current rounded-full transition-all group-hover:w-3" />
            </button>
          )}
        </div>

        {/* Navigation Items Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {/* Section Header */}
              {isExpanded && (
                <div className="px-3 text-[10px] font-extrabold tracking-wider uppercase text-slate-400 mb-1">
                  {section.title}
                </div>
              )}

              {/* Items */}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isSubmenuOpen = expandedMenus[item.submenuKey];

                return (
                  <div key={item.id} className="relative">
                    {/* Parent Menu Item */}
                    <div
                      onClick={(e) => {
                        if (item.hasSubmenu) {
                          toggleSubmenu(item.submenuKey, e);
                        }
                      }}
                      className={`flex items-center justify-between rounded-xl transition-all select-none ${
                        item.active
                          ? 'bg-red-50 text-red-600 font-bold border-l-2 border-red-600 shadow-2xs'
                          : 'text-slate-800 hover:bg-red-50/60 hover:text-red-600'
                      } ${
                        isExpanded
                          ? 'px-3 py-2 text-xs cursor-pointer'
                          : 'p-2.5 justify-center text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Link
                        to={item.link}
                        onClick={(e) => {
                          if (item.hasSubmenu) {
                            e.preventDefault();
                            toggleSubmenu(item.submenuKey, e);
                          } else {
                            setActiveSubItem('');
                          }
                        }}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                        title={!isExpanded ? item.label : undefined}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            item.active
                              ? 'text-red-600'
                              : isExpanded
                              ? 'text-slate-600'
                              : 'text-slate-300'
                          }`}
                        />
                        {isExpanded && (
                          <span className="truncate font-semibold text-xs text-slate-900 hover:text-red-600">
                            {item.label}
                          </span>
                        )}
                      </Link>

                      {/* Chevron Toggle Button (> when collapsed, ⌃ when expanded) */}
                      {isExpanded && item.hasSubmenu && (
                        <button
                          type="button"
                          onClick={(e) => toggleSubmenu(item.submenuKey, e)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          aria-label={isSubmenuOpen ? 'Collapse submenu' : 'Expand submenu'}
                        >
                          {isSubmenuOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Submenu Accordion (Indented with Icons & NEW Badges) */}
                    {isExpanded && item.hasSubmenu && isSubmenuOpen && (
                      <div className="ml-4 pl-2 border-l border-slate-200 space-y-0.5 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive =
                            activeSubItem === sub.id ||
                            sub.link === location.pathname ||
                            (sub.id === 'templates' && location.pathname.startsWith('/templates')) ||
                            (sub.id === 'commerce-settings' && location.pathname === '/commerce-settings') ||
                            (sub.id === 'catalog' && (location.pathname === '/commerce/catalog' || location.pathname === '/catalog')) ||
                            (sub.id === 'checkout-bot' && (location.pathname === '/checkout-bot' || location.pathname === '/work-flows/autocheckout')) ||
                            (sub.id === 'order-panel' && (location.pathname === '/commerce/order-panel' || location.pathname === '/order-panel')) ||
                            (sub.id === 'tasks' && (location.pathname === '/sales-crm-tasks' || location.pathname === '/tasks')) ||
                            (sub.id === 'segments' && location.pathname === '/segments') ||
                            (sub.id === 'campaigns-sub' && (location.pathname.startsWith('/campaigns') || location.pathname.startsWith('/notification'))) ||
                            (sub.id === 'sales-reports' && (location.pathname === '/sales-crm-reports' || location.pathname === '/sales-crm/reports'));

                          return (
                            <Link
                              key={sub.id}
                              to={sub.link}
                              onClick={() => setActiveSubItem(sub.id)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                                isSubActive
                                  ? 'bg-red-50 text-red-600 font-bold'
                                  : 'text-slate-600 hover:text-red-600 hover:bg-red-50/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {SubIcon && (
                                  <SubIcon
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isSubActive ? 'text-red-600' : 'text-slate-400 group-hover:text-red-600'
                                    }`}
                                  />
                                )}
                                <span className="truncate">{sub.label}</span>
                              </div>

                              {/* Small NEW Badge */}
                              {sub.isNew && (
                                <span className="text-[9px] font-extrabold tracking-wide uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200/80 shrink-0 ml-1.5 shadow-2xs">
                                  NEW
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom ARCO AI Card */}
        {isExpanded && (
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/70 text-xs shrink-0">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 text-[11px] truncate">ARCO AI v2.0</div>
                <div className="text-[10px] text-slate-400 truncate">Connected & Active</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 2. BACKDROP OVERLAY (For mobile/tablet screens) */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-[1px] z-40 lg:hidden animate-in fade-in"
        />
      )}
    </>
  );
}
