import { Link } from 'react-router-dom';
import {
  Megaphone,
  TrendingUp,
  Headphones,
  Bot,
  Inbox,
  BarChart3,
  Sparkles,
  ArrowRight,
  MessageSquareCode,
  Workflow,
  ShoppingBag,
  FileText,
  Layers,
  Code2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

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
  Inbox,
  BarChart3,
  Sparkles,
  MessageSquareCode,
  Workflow,
  ShoppingBag,
  FileText,
  Layers,
  Code2,
  Instagram: InstagramIcon,
};

/**
 * Reusable FeatureCard component with red accent and hover animation
 */
export default function FeatureCard({
  title,
  description,
  icon,
  link = '/features',
  className = '',
}) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] || Sparkles : icon;

  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-slate-900/5 hover:border-red-500/40 hover:-translate-y-1.5 transition-all duration-250 flex flex-col justify-between',
        className
      )}
    >
      <div>
        {/* Icon Container */}
        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer link: Learn more -> */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <Link
          to={link}
          className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
