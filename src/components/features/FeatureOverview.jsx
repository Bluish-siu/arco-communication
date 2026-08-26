import { Link } from 'react-router-dom';
import {
  Megaphone,
  TrendingUp,
  Headphones,
  Bot,
  Workflow,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import { platformModules } from '../../data/features';

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
  Workflow,
  BarChart3,
  Instagram: InstagramIcon,
};

export default function FeatureOverview() {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100" id="platform-overview">
      <Container>
        {/* Section Header */}
        <SectionTitle
          badge="ONE PLATFORM"
          title="From the first message to the final sale"
          description="ARCO brings marketing, sales, support, automation, and analytics together so your team can manage the entire customer journey in one place."
          align="center"
        />

        {/* Central Hub & Connected Modules Grid */}
        <div className="mt-12 sm:mt-16 max-w-6xl mx-auto">
          {/* 6 Core Platform Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformModules.map((module) => {
              const Icon = iconMap[module.icon] || Sparkles;

              return (
                <div
                  key={module.id}
                  className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:bg-white hover:border-red-400/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-250 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-2xs border ${module.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                        {module.tagline}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/60">
                    <Link
                      to={module.link || `/products/${module.id}`}
                      className="inline-flex items-center text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                    >
                      <span>Explore capability</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
