import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
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
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { navItems } from '../../data/navigation';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import Container from '../common/Container';
import Button from '../common/Button';
import MobileMenu from './MobileMenu';

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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);
  const scrollY = useScrollPosition();
  const navigate = useNavigate();
  const isScrolled = scrollY > 10;

  const handleMouseEnter = (name) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleDropdownItemClick = (path) => {
    setActiveDropdown(null);
    navigate(path);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 bg-white ${
        isScrolled
          ? 'border-b border-slate-200/80 shadow-xs'
          : 'border-b border-slate-100'
      }`}
    >
      <Container className="relative">
        <div className="flex items-center justify-between h-18">
          {/* Brand Name (Text Only) */}
          <Link to="/" className="flex items-center py-1 group">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
              ARCO <span className="font-semibold text-slate-800">Communication</span>
            </span>
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.hasDropdown) {
                const isOpen = activeDropdown === item.name;
                const isProduct = item.name === 'Product';
                const isSolutions = item.name === 'Solutions';
                const isResources = item.name === 'Resources';

                return (
                  <div
                    key={item.name}
                    className={isSolutions || isResources ? 'static' : 'relative'}
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isOpen ? null : item.name)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        isOpen
                          ? 'text-red-600 bg-red-50/70'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      aria-expanded={isOpen}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-red-600' : ''
                        }`}
                      />
                    </button>

                    {/* Solutions Mega Menu Dropdown */}
                    {isOpen && isSolutions && item.isMegaMenu && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[940px] max-w-[95vw] pt-2 z-50">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 ring-1 ring-slate-900/5 p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="grid grid-cols-10 gap-5 items-stretch">
                            
                            {/* Column 1: By Industry (~30%) */}
                            <div className="col-span-3 pr-4 border-r border-slate-100 flex flex-col justify-between">
                              <div>
                                <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 block mb-2.5 px-2">
                                  {item.megaSections.industry.title}
                                </span>
                                <div className="space-y-1">
                                  {item.megaSections.industry.items.map((subItem) => {
                                    const Icon = iconMap[subItem.icon] || Sparkles;
                                    return (
                                      <button
                                        key={subItem.name}
                                        type="button"
                                        onClick={() => handleDropdownItemClick(subItem.path)}
                                        className="w-full text-left flex items-start gap-2.5 p-2 rounded-xl hover:bg-red-50/50 transition-all duration-150 group cursor-pointer"
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                                          <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                                            {subItem.name}
                                          </div>
                                          <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
                                            {subItem.description}
                                          </p>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Column 2: By Use Case (~30%) */}
                            <div className="col-span-3 pr-4 border-r border-slate-100 flex flex-col justify-between">
                              <div>
                                <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 block mb-2.5 px-2">
                                  {item.megaSections.useCase.title}
                                </span>
                                <div className="space-y-1">
                                  {item.megaSections.useCase.items.map((subItem) => {
                                    const Icon = iconMap[subItem.icon] || Sparkles;
                                    return (
                                      <button
                                        key={subItem.name}
                                        type="button"
                                        onClick={() => handleDropdownItemClick(subItem.path)}
                                        className="w-full text-left flex items-start gap-2.5 p-2 rounded-xl hover:bg-red-50/50 transition-all duration-150 group cursor-pointer"
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                                          <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                                            {subItem.name}
                                          </div>
                                          <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
                                            {subItem.description}
                                          </p>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Column 3: Featured Promotional Card (~40%) */}
                            <div className="col-span-4 pl-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 block mb-2.5 px-1">
                                  {item.megaSections.featured.title}
                                </span>

                                <div className="rounded-2xl bg-gradient-to-br from-red-50/90 via-rose-50/60 to-red-100/40 border border-red-200/80 p-4.5 flex flex-col justify-between shadow-2xs">
                                  <div>
                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-red-700 border border-red-200 shadow-2xs mb-2.5">
                                      <Sparkles className="w-3 h-3 text-red-600" />
                                      <span>Live Platform Preview</span>
                                    </div>
                                    <h4 className="font-bold text-base text-slate-900 leading-snug">
                                      {item.megaSections.featured.cardTitle}
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                      {item.megaSections.featured.description}
                                    </p>
                                  </div>

                                  {/* Mini Preview Graphic */}
                                  <div className="my-3.5 bg-white rounded-xl p-3 border border-red-200/60 shadow-2xs text-[11px] space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                                      <span>WhatsApp Growth Hub</span>
                                      <span className="text-red-600 font-extrabold">4.2x ROI</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-red-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-red-600 rounded-full w-4/5" />
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                                      <span>Automated Lead Capture</span>
                                      <span className="text-emerald-600 font-bold">98.2% Delivered</span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDropdownItemClick(item.megaSections.featured.ctaPath)}
                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-600/25 transition-all duration-150 cursor-pointer"
                                  >
                                    <span>{item.megaSections.featured.ctaText}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resources Mega Menu Dropdown */}
                    {isOpen && isResources && item.isMegaMenu && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[880px] max-w-[95vw] pt-2 z-50">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 ring-1 ring-slate-900/5 p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="grid grid-cols-12 gap-6 items-stretch">
                            
                            {/* Left Column: Resource Links (~40%) */}
                            <div className="col-span-5 pr-4 border-r border-slate-100 flex flex-col justify-between">
                              <div>
                                <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 block mb-3 px-2">
                                  RESOURCE LINKS
                                </span>
                                <div className="space-y-1.5">
                                  {item.megaSections.links.map((subItem) => {
                                    const Icon = iconMap[subItem.icon] || Sparkles;
                                    return (
                                      <button
                                        key={subItem.name}
                                        type="button"
                                        onClick={() => handleDropdownItemClick(subItem.path)}
                                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-red-50/50 transition-all duration-150 group cursor-pointer"
                                      >
                                        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                                          <Icon className="w-4.5 h-4.5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                                            {subItem.name}
                                          </div>
                                          <p className="text-xs text-slate-500 line-clamp-1 leading-normal mt-0.5">
                                            {subItem.description}
                                          </p>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Featured Resource Card (~60%) */}
                            <div className="col-span-7 flex flex-col justify-between">
                              <div>
                                <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 block mb-3 px-1">
                                  FEATURED RESOURCE
                                </span>

                                <div className="rounded-2xl bg-gradient-to-br from-red-50/90 via-rose-50/60 to-red-100/40 border border-red-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
                                  <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-red-700 border border-red-200 shadow-2xs mb-3">
                                      <Sparkles className="w-3.5 h-3.5 text-red-600" />
                                      <span>{item.megaSections.featured.badge}</span>
                                    </div>

                                    <h4 className="font-bold text-lg text-slate-900 leading-snug">
                                      {item.megaSections.featured.heading}
                                    </h4>

                                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                                      {item.megaSections.featured.description}
                                    </p>
                                  </div>

                                  {/* ARCO Product / Dashboard Preview Graphic */}
                                  <div className="my-4 bg-white rounded-xl p-3.5 border border-red-200/70 shadow-xs text-xs space-y-2">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                                        <span>ARCO Knowledge & Analytics Hub</span>
                                      </div>
                                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                        v2.4 Live
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] text-slate-400 block">Conversations</span>
                                        <strong className="text-slate-900">24.8K</strong>
                                      </div>
                                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] text-slate-400 block">Delivery</span>
                                        <strong className="text-emerald-600">98.2%</strong>
                                      </div>
                                      <div className="bg-red-50/60 p-2 rounded-lg border border-red-100">
                                        <span className="text-[10px] text-red-700 block">ROI</span>
                                        <strong className="text-red-600">4.2x</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDropdownItemClick(item.megaSections.featured.ctaPath)}
                                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/25 transition-all duration-150 cursor-pointer"
                                  >
                                    <span>{item.megaSections.featured.ctaText}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}

                    {/* Standard Product Dropdown Panel */}
                    {isOpen && isProduct && (
                      <div className="absolute top-full left-0 pt-2 z-50 w-[680px]">
                        <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-slate-900/10 border border-slate-200/90 ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                            {item.dropdownItems.map((subItem) => {
                              const Icon = iconMap[subItem.icon] || Sparkles;
                              return (
                                <button
                                  key={subItem.name}
                                  type="button"
                                  onClick={() => handleDropdownItemClick(subItem.path)}
                                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-red-50/50 transition-all duration-150 group cursor-pointer"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                                    <Icon className="w-4.5 h-4.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                                      {subItem.name}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1 leading-normal mt-0.5">
                                      {subItem.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-red-600 font-semibold bg-red-50/70'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Login
            </Link>
            <Button
              variant="primary"
              size="md"
              to="/signup"
              className="rounded-full px-5 shadow-sm shadow-red-500/25"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
