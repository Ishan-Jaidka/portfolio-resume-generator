import Image from 'next/image';
import type { Experience, Profile } from '@/lib/content';
import type { PortfolioConfig } from '@/lib/portfolio';

export default function Hero({ profile, current, config }: {
  profile: Profile;
  current?: Experience;
  config: PortfolioConfig;
}) {
  return (
    <section className="hero portfolio-hero" aria-labelledby="hero-name">
      <div className="hero-grid">
        <div className="hero-primary">
          <p className="hero-kicker">{config.hero.eyebrow}</p>
          <h1 id="hero-name" className="hero-title">
            <span className="hero-name">{profile.name}</span>
          </h1>
          <p className="hero-intro">{config.hero.intro}</p>
          <p className="hero-description">{config.hero.description}</p>
          <div className="hero-cta">
            <a href={`#${config.hero.primaryAction.section}`} className="button">
              {config.hero.primaryAction.label} <span aria-hidden="true">↗</span>
            </a>
            <a href="/resume.pdf" className="hero-resume-link">{config.site.resumeLabel}</a>
          </div>
          <p className="hero-current">
            {current && <span>{current.role} · {current.company}</span>}
            <span>{profile.address}</span>
          </p>
        </div>
        <figure className="hero-portrait">
          <Image src={config.hero.portrait.src} alt={config.hero.portrait.alt}
            width={1500} height={1500} sizes="(max-width: 735px) 70vw, 340px" priority />
        </figure>
      </div>
    </section>
  );
}
