import { Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';

export default function ProductIntegrations({
  badge = 'INTEGRATIONS',
  title = 'Connect with your existing tech stack',
  description = 'Seamlessly sync data, trigger messages, and automate workflows with 5,000+ business applications.',
  tools = [
    { name: 'Shopify', category: 'E-commerce' },
    { name: 'Salesforce', category: 'CRM' },
    { name: 'HubSpot', category: 'Marketing' },
    { name: 'Zoho CRM', category: 'Sales' },
    { name: 'WooCommerce', category: 'E-commerce' },
    { name: 'Zapier', category: 'Automation' },
    { name: 'Make', category: 'Automation' },
    { name: 'Google Sheets', category: 'Data' },
  ],
}) {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <Container>
        <SectionTitle
          badge={badge}
          title={title}
          description={description}
          align="center"
        />

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-center hover:bg-white hover:border-red-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-slate-800 font-extrabold text-sm flex items-center justify-center mx-auto mb-2.5 border border-slate-200 shadow-2xs">
                  {tool.name.charAt(0)}
                </div>
                <div className="font-bold text-sm text-slate-900">{tool.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{tool.category}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/products/developer-platform"
              className="inline-flex items-center text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              <span>Explore all 5,000+ integrations & APIs</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
