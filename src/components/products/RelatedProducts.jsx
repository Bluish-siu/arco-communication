import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

export default function RelatedProducts({
  currentProductId,
  products = [
    {
      id: 'whatsapp-marketing',
      name: 'WhatsApp Marketing',
      description: 'Broadcasts, campaigns & audience segmentation',
      path: '/products/whatsapp-marketing',
    },
    {
      id: 'sales-crm',
      name: 'Sales CRM',
      description: 'Capture, qualify & convert WhatsApp leads',
      path: '/products/sales-crm',
    },
    {
      id: 'customer-support',
      name: 'Customer Support',
      description: 'Shared inbox & team collaboration',
      path: '/products/customer-support',
    },
    {
      id: 'ai-agents',
      name: 'AI Agents',
      description: '24/7 autonomous conversational AI',
      path: '/products/ai-agents',
    },
    {
      id: 'automation',
      name: 'Automation',
      description: 'Trigger-based multi-step workflows',
      path: '/products/automation',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Campaign, funnel & revenue insights',
      path: '/products/analytics',
    },
  ],
}) {
  const filtered = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 3);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <Container>
        <SectionTitle
          badge="EXPLORE MORE"
          title="Connect more products to scale your business"
          description="ARCO products work seamlessly together so you can manage the entire customer journey in one platform."
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {filtered.map((prod) => (
            <Link
              key={prod.id}
              to={prod.path}
              className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 hover:bg-white hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-250 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  {prod.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-red-600 group-hover:text-red-700">
                <span>Explore product</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
