import type { Content } from '@/lib/content';
import type { PortfolioConfig } from '@/lib/portfolio';
import Job from '@/components/Resume/Job';

export default function Experience({ content, config }: { content: Content; config: PortfolioConfig }) {
  return <div className="experience-spine">{content.experience.map((entry, index) => (
    <Job key={`${entry.company}-${entry.startDate}`} data={entry} lead={index === 0} display={config.experience} />
  ))}</div>;
}
