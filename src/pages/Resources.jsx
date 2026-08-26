import { BookOpen, FileText, Video, HelpCircle, ArrowRight } from 'lucide-react';
import Container from '../components/common/Container';
import SectionTitle from '../components/common/SectionTitle';
import Button from '../components/common/Button';
import FinalCTA from '../components/cta/FinalCTA';

const resourceCategories = [
  {
    title: 'Product Documentation',
    description: 'Detailed API guides, webhooks, setup instructions, and reference manuals.',
    icon: BookOpen,
    badge: 'Docs',
  },
  {
    title: 'Customer Case Studies',
    description: 'Learn how top brands increased conversion rates and reduced response times.',
    icon: FileText,
    badge: 'Stories',
  },
  {
    title: 'Video Tutorials & Webinars',
    description: 'Step-by-step masterclasses on WhatsApp automation and campaign strategies.',
    icon: Video,
    badge: 'Video',
  },
  {
    title: 'Help Center & FAQs',
    description: 'Answers to common questions about billing, green tick verification, and limits.',
    icon: HelpCircle,
    badge: 'Support',
  },
];

export default function ResourcesPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <SectionTitle
          badge="Learning Hub"
          title="Guides, Tutorials & Knowledge Base"
          description="Everything you need to master WhatsApp Business API and scale your customer engagement."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {resourceCategories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-emerald-600">
                  <span>Browse Articles</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
      <FinalCTA />
    </div>
  );
}
