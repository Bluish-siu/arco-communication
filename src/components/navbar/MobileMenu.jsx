import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  X,
  ChevronDown,
  ArrowRight,
  Megaphone,
  TrendingUp,
  Headphones,
  Bot,
  MessageSquareCode,
  ShoppingCart,
  Workflow,
  BarChart3,
  Code2,
  ShoppingBag,
  Building2,
  GraduationCap,
  HeartPulse,
  Plane,
  Landmark,
  UserPlus,
  MessageCircle,
  BookOpen,
  FileText,
  HelpCircle,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { navItems } from '../../data/navigation';
import Button from '../common/Button';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const iconMap = {
  Megaphone,
  TrendingUp,
  Headphones,
  Bot,
  MessageSquareCode,
  ShoppingCart,
  Workflow,
  BarChart3,
  Code2,
  Instagram: InstagramIcon,
  ShoppingBag,
  Building2,
  GraduationCap,
  HeartPulse,
  Plane,
  Landmark,
  UserPlus,
  MessageCircle,
  BookOpen,
  FileText,
  HelpCircle,
  PhoneCall,
  Sparkles,
};

export default function MobileMenu({ isOpen, onClose }) {
  const [expandedSections, setExpandedSections] = useState({
    Product: false,
    Solutions: false,
    Resources: false,
  });

  if (!isOpen) return null;

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <Link to="/" onClick={onClose} className="flex items-center">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                ARCO <span className="font-semibold text-slate-800">Communication</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items Accordion */}
          <nav className="mt-4 flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.hasDropdown) {
                const isExpanded = expandedSections[item.name];
                const isSolutions = item.name === 'Solutions';
                const isResources = item.name === 'Resources';

                return (
                  <div key={item.name} className="border-b border-slate-100/80 pb-1">
                    <button
                      type="button"
                      onClick={() => toggleSection(item.name)}
                      className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-red-600' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="pl-2 pr-1 py-1 space-y-3 mb-2">
                        {/* Solutions Mega Menu on Mobile */}
                        {isSolutions && item.megaSections && (
                          <>
                            {/* By Industry */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                                {item.megaSections.industry.title}
                              </span>
                              <div className="space-y-1">
                                {item.megaSections.industry.items.map((subItem) => {
                                  const Icon = iconMap[subItem.icon] || Sparkles;
                                  return (
                                    <NavLink
                                      key={subItem.name}
                                      to={subItem.path}
                                      onClick={onClose}
                                      className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 transition-colors group"
                                    >
                                      <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                        <Icon className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-red-600">
                                          {subItem.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 line-clamp-1">
                                          {subItem.description}
                                        </div>
                                      </div>
                                    </NavLink>
                                  );
                                })}
                              </div>
                            </div>

                            {/* By Use Case */}
                            <div className="pt-1 border-t border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                                {item.megaSections.useCase.title}
                              </span>
                              <div className="space-y-1">
                                {item.megaSections.useCase.items.map((subItem) => {
                                  const Icon = iconMap[subItem.icon] || Sparkles;
                                  return (
                                    <NavLink
                                      key={subItem.name}
                                      to={subItem.path}
                                      onClick={onClose}
                                      className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 transition-colors group"
                                    >
                                      <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                        <Icon className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-red-600">
                                          {subItem.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 line-clamp-1">
                                          {subItem.description}
                                        </div>
                                      </div>
                                    </NavLink>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Featured Demo Button */}
                            <div className="pt-2">
                              <NavLink
                                to={item.megaSections.featured.ctaPath}
                                onClick={onClose}
                                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-600 hover:text-white transition-colors"
                              >
                                <span>Book a Demo</span>
                                <ArrowRight className="w-3 h-3" />
                              </NavLink>
                            </div>
                          </>
                        )}

                        {/* Resources on Mobile */}
                        {isResources && (
                          <div className="space-y-1">
                            {(item.megaSections?.links || item.dropdownItems).map((subItem) => {
                              const Icon = iconMap[subItem.icon] || Sparkles;
                              return (
                                <NavLink
                                  key={subItem.name}
                                  to={subItem.path}
                                  onClick={onClose}
                                  className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 transition-colors group"
                                >
                                  <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 group-hover:text-red-600">
                                      {subItem.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 line-clamp-1">
                                      {subItem.description}
                                    </div>
                                  </div>
                                </NavLink>
                              );
                            })}
                            {item.megaSections?.featured && (
                              <div className="pt-2">
                                <NavLink
                                  to={item.megaSections.featured.ctaPath}
                                  onClick={onClose}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-600 hover:text-white transition-colors"
                                >
                                  <span>Visit Resource Center</span>
                                  <ArrowRight className="w-3 h-3" />
                                </NavLink>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Product and other Standard Dropdowns on Mobile */}
                        {!isSolutions && !isResources && item.dropdownItems && (
                          <div className="space-y-1">
                            {item.dropdownItems.map((subItem) => {
                              const Icon = iconMap[subItem.icon] || Sparkles;
                              return (
                                <NavLink
                                  key={subItem.name}
                                  to={subItem.path}
                                  onClick={onClose}
                                  className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/60 transition-colors group"
                                >
                                  <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 group-hover:text-red-600">
                                      {subItem.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 line-clamp-1">
                                      {subItem.description}
                                    </div>
                                  </div>
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `py-2.5 px-2 rounded-lg text-sm font-semibold transition-colors border-b border-slate-100/80 ${
                      isActive
                        ? 'text-red-600 bg-red-50/60'
                        : 'text-slate-800 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3 mt-6">
          <Link
            to="/login"
            onClick={onClose}
            className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Login
          </Link>
          <Button
            variant="primary"
            to="/signup"
            onClick={onClose}
            icon={ArrowRight}
            className="w-full justify-center rounded-full shadow-sm shadow-red-500/20"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
