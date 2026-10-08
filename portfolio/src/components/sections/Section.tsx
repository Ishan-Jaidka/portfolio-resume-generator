import type { SectionConfig } from '@/lib/portfolio';

export default function Section({ config, children }: {
  config: SectionConfig;
  children: React.ReactNode;
}) {
  return <section id={config.id} className={`portfolio-section portfolio-section--${config.id}`}
    aria-labelledby={`${config.id}-title`}>
    <header className="section-heading">
      <span className="section-kicker">{config.id}</span>
      <h2 id={`${config.id}-title`}>{config.title}</h2>
    </header>
    {children}
  </section>;
}
