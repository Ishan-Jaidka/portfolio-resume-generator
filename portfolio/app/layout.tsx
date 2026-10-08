import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { getContent } from '@/lib/content';
import { getPortfolioConfig } from '@/lib/portfolio';
import Header from '@/components/Template/Header';
import { MAIN_CONTENT_ID } from '@/components/Template/PageWrapper';
import { inter, newsreader, jetbrainsMono } from './fonts';
import './globals.css';

export function generateMetadata(): Metadata {
  const { profile } = getContent();
  const config = getPortfolioConfig();
  return {
    title: profile.name,
    description: config.hero.intro,
    metadataBase: new URL(config.site.url),
    alternates: { canonical: '/' },
    authors: [{ name: profile.name }],
    openGraph: { title: profile.name, description: config.hero.intro, url: config.site.url, type: 'website' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = getContent();
  const config = getPortfolioConfig();
  const theme = {
    '--color-accent': config.theme.accent,
    '--color-accent-hover': config.theme.accentHover,
  } as CSSProperties;
  return <html lang="en" className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`} style={theme}>
    <body>
      <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">Skip to content</a>
      <div className="site-wrapper">
        <Header name={profile.name} portrait={config.hero.portrait}
          sections={config.sections} resumeLabel={config.site.resumeLabel}
          showName={config.header.showName} />
        {children}
      </div>
    </body>
  </html>;
}
