import ContactIcon from '@/components/Contact/ContactIcon';
import { getContent } from '@/lib/content';
import { getPortfolioConfig } from '@/lib/portfolio';

function IconLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return <a className="footer-icon-link" href={href} aria-label={label} title={label}>
    <ContactIcon name={icon} />
  </a>;
}

const linkLabels: Record<string, string> = { github: 'GitHub', linkedin: 'LinkedIn' };

export default function Footer() {
  const { profile } = getContent();
  const config = getPortfolioConfig();
  return <footer className="portfolio-footer">
    <span className="footer-name">{profile.name}</span>
    <div className="footer-contact">
      {config.contacts.showEmail && <IconLink href={`mailto:${profile.email}`} icon="email" label={`Email ${profile.name}`} />}
      {config.contacts.showPhone && <IconLink href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`} icon="phone" label={`Call ${profile.name}`} />}
      {config.contacts.links.map((key) => <IconLink key={key} href={profile.links[key].url} icon={key} label={linkLabels[key] ?? key} />)}
      {config.contacts.showMiscellaneous && <span>{profile.miscellaneous.text}</span>}
      <IconLink href="/resume.pdf" icon="resume" label={config.site.resumeLabel} />
    </div>
  </footer>;
}
