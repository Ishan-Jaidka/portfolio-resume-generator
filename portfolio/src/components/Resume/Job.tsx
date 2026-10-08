import { dateRange, type Experience } from '@/lib/content';
import type { PortfolioConfig } from '@/lib/portfolio';
import { Bullets } from '@/components/RichText';

export default function Job({ data, lead, display }: {
  data: Experience;
  lead: boolean;
  display: PortfolioConfig['experience'];
}) {
  const preview = data.bullets.slice(0, display.previewBullets);
  const remaining = data.bullets.slice(display.previewBullets);
  return <article className={`jobs-container jobs-container--${lead ? 'lead' : 'primary'}${!data.endDate ? ' jobs-container--current' : ''}`}>
    <span className="job-marker" aria-hidden="true" />
    <p className="daterange">{dateRange(data.startDate, data.endDate)}</p>
    <div className="job-body">
      <header>
        <h3><span className="job-company">{data.company}</span><span className="job-position">{data.role}</span></h3>
        <p className="job-location">{data.location}</p>
      </header>
      {preview.length > 0 && <Bullets items={preview} />}
      {remaining.length > 0 && <details className="job-details">
        <summary>{display.expandLabel}<span className="sr-only"> at {data.company}</span></summary>
        <Bullets items={remaining} />
      </details>}
    </div>
  </article>;
}
