import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { cache } from 'react';
import { parse } from 'yaml';
import schema from '../../portfolio.schema.json';
import { getContent } from './content';

export type SectionId = 'projects' | 'experience' | 'interests' | 'education';
export interface SectionConfig { id: SectionId; title: string; navLabel: string | null }
export interface ImageConfig { src: string; alt: string }
export interface ProjectPresentation {
  category?: string;
  illustration?: 'city' | 'calculator' | 'greenhouse';
  accent?: string;
  image?: ImageConfig;
  linkLabels?: Record<string, string>;
}
export interface PortfolioConfig {
  site: { url: string; resumeLabel: string };
  header: { showName: boolean };
  hero: {
    eyebrow: string; intro: string; description: string; portrait: ImageConfig;
    primaryAction: { label: string; section: SectionId };
  };
  theme: { accent: string; accentHover: string };
  sections: SectionConfig[];
  contacts: { showEmail: boolean; showPhone: boolean; showMiscellaneous: boolean; links: string[] };
  experience: { previewBullets: number; expandLabel: string };
  projects: Record<string, ProjectPresentation>;
}

export const getPortfolioConfig = cache((): PortfolioConfig => {
  const data: unknown = parse(readFileSync(path.resolve(process.cwd(), '../content/portfolio.yaml'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile<PortfolioConfig>(schema);
  if (!validate(data)) {
    throw new Error(`Invalid content/portfolio.yaml: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
  }
  const ids = data.sections.map((section) => section.id);
  if (new Set(ids).size !== ids.length) throw new Error('Portfolio section ids must be unique.');
  if (!ids.includes(data.hero.primaryAction.section)) throw new Error('Hero action must point to an enabled section.');
  const content = getContent();
  for (const name of Object.keys(data.projects)) {
    if (!content.projects.some((project) => project.name === name)) {
      throw new Error(`Portfolio project "${name}" does not exist in content/projects.yaml.`);
    }
  }
  for (const key of data.contacts.links) {
    if (!content.profile.links[key]) throw new Error(`Unknown profile link: ${key}`);
  }
  for (const image of [data.hero.portrait, ...Object.values(data.projects).flatMap((entry) => entry.image ? [entry.image] : [])]) {
    if (!existsSync(path.join(process.cwd(), 'public', image.src))) throw new Error(`Missing portfolio image: ${image.src}`);
  }
  return data;
});
