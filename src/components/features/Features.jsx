import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import FeatureCard from './FeatureCard';
import { featuresData } from '../../data/features';

export default function Features() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100" id="features">
      <Container>
        <SectionTitle
          badge="POWERFUL PLATFORM"
          title="Everything you need to turn conversations into customers"
          description="ARCO Communication brings marketing, sales, support, and automation together in one powerful platform."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuresData.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              link={feature.link}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
