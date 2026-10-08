import Hero from '@/components/Template/Hero';
import PageWrapper from '@/components/Template/PageWrapper';
import Section from '@/components/sections/Section';
import { sections } from '@/components/sections';
import { getContent } from '@/lib/content';
import { getPortfolioConfig } from '@/lib/portfolio';

export const dynamic = 'force-static';

export default function HomePage() {
  const content = getContent();
  const config = getPortfolioConfig();
  const current = content.experience.find((entry) => !entry.endDate);
  return <PageWrapper mainClassName="page-main--hero">
    <Hero profile={content.profile} current={current} config={config} />
    <div className="portfolio-sections">
      {config.sections.map((section) => {
        const Component = sections[section.id];
        return <Section key={section.id} config={section}>
          <Component content={content} config={config} />
        </Section>;
      })}
    </div>
  </PageWrapper>;
}
