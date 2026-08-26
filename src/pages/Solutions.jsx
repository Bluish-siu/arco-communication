import Container from '../components/common/Container';
import SectionTitle from '../components/common/SectionTitle';
import MarketingSection from '../components/sections/MarketingSection';
import SalesSection from '../components/sections/SalesSection';
import AISection from '../components/sections/AISection';
import FinalCTA from '../components/cta/FinalCTA';

export default function SolutionsPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <SectionTitle
          badge="Tailored Solutions"
          title="Built for High-Growth Industries"
          description="Whether you run an omnichannel D2C store, a scaling SaaS startup, or an enterprise service company, ARCO Communication fits your workflow."
        />
      </Container>
      <div id="ecommerce">
        <div id="marketing">
          <MarketingSection />
        </div>
      </div>
      <div id="real-estate">
        <div id="sales">
          <div id="lead-generation">
            <SalesSection />
          </div>
        </div>
      </div>
      <div id="education">
        <div id="healthcare">
          <div id="travel">
            <div id="finance">
              <div id="customer-engagement">
                <div id="support">
                  <div id="ai">
                    <AISection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FinalCTA />
    </div>
  );
}
