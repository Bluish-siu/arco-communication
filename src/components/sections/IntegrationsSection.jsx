import { Link } from 'react-router-dom';
import { ArrowRight, Link2, Zap, RefreshCw } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import IntegrationsShowcase from './IntegrationsShowcase';

export default function IntegrationsSection() {
  const benefits = [
    {
      title: 'Connect Everything',
      description: 'Bring your customer data and conversations together.',
      icon: Link2,
    },
    {
      title: 'Automate Workflows',
      description: 'Trigger actions automatically across your favorite tools.',
      icon: Zap,
    },
    {
      title: 'Keep Data in Sync',
      description: 'Keep customer information updated across your business systems.',
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white border-b border-slate-100" id="integrations-section">
      <Container>
        {/* Section Header */}
        <SectionTitle
          badge="INTEGRATIONS"
          title="Connect ARCO with the tools your business already uses"
          description="Bring your conversations, customer data, marketing, and business workflows together with powerful integrations."
          align="center"
        />

        {/* Central Hub Showcase Visual */}
        <IntegrationsShowcase />

        {/* 3 Integration Benefits Below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 sm:mt-16 pt-8 border-t border-slate-100 max-w-5xl mx-auto">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-red-300/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{b.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/features"
            className="group inline-flex items-center text-sm sm:text-base font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <span>Explore Integrations</span>
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
