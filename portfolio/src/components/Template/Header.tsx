'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ImageConfig, SectionConfig } from '@/lib/portfolio';

interface HeaderProps {
  name: string;
  portrait: ImageConfig;
  sections: SectionConfig[];
  resumeLabel: string;
  showName: boolean;
}

function NavigationLinks({ sections, resumeLabel, onNavigate }: {
  sections: SectionConfig[];
  resumeLabel: string;
  onNavigate?: () => void;
}) {
  return <>
    {sections.filter((section) => section.navLabel).map((section) => (
      <a key={section.id} href={`#${section.id}`} onClick={onNavigate}>{section.navLabel}</a>
    ))}
    <a href="/resume.pdf" onClick={onNavigate}>{resumeLabel} <span aria-hidden="true">↗</span></a>
  </>;
}

export default function Header({ name, portrait, sections, resumeLabel, showName }: HeaderProps) {
  const menu = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 8);
      if (window.matchMedia('(min-width: 736px)').matches) menu.current?.hidePopover();
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <>
    <header className="portfolio-toolbar" data-scrolled={scrolled}>
      <div className="portfolio-header">
        <a className="portfolio-identity" href="/" aria-label={`${name} — home`}>
          <Image className="header-avatar" src={portrait.src} alt="" width={40} height={40} sizes="40px" />
          {showName && <span className="portfolio-name">{name}</span>}
        </a>
        <nav className="desktop-navigation" aria-label="Main navigation">
          <NavigationLinks sections={sections} resumeLabel={resumeLabel} />
        </nav>
        <div className="mobile-navigation">
          <button type="button" className="mobile-menu-toggle" popoverTarget="mobile-navigation-menu"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen} aria-controls="mobile-navigation-menu">
            <span className={`hamburger-icon${menuOpen ? ' hamburger-icon--open' : ''}`} aria-hidden="true">
              <span /><span /><span />
            </span>
          </button>
          <div ref={menu} id="mobile-navigation-menu" className="mobile-menu" popover="auto" role="dialog" aria-label="Navigation"
            onToggle={(event) => setMenuOpen(event.currentTarget.matches(':popover-open'))}>
            <button type="button" className="mobile-menu-close" aria-label="Close navigation menu"
              onClick={() => menu.current?.hidePopover()}>
              <span className="hamburger-icon hamburger-icon--open" aria-hidden="true"><span /><span /><span /></span>
            </button>
            <nav aria-label="Mobile navigation">
              <NavigationLinks sections={sections} resumeLabel={resumeLabel}
                onNavigate={() => menu.current?.hidePopover()} />
            </nav>
          </div>
        </div>
      </div>
    </header>
  </>;
}
