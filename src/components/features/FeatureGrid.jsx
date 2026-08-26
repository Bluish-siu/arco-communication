import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import FeatureCard from './FeatureCard';
import { featuresData } from '../../data/features';

export default function FeatureGrid() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100" id="feature-matrix">
      <Container>
        <SectionTitle
          badge="COMPLETE SUITE"
          title="Explore every feature in the ARCO ecosystem"
          description="Everything modern teams need to acquire, engage, convert, and support customers at scale."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 mt-12">
          {featuresData.map((item) => (
            <FeatureCard
              key={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              link={item.link}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
