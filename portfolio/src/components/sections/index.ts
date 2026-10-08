import type { ComponentType } from 'react';
import type { Content } from '@/lib/content';
import type { PortfolioConfig, SectionId } from '@/lib/portfolio';
import Projects from './Projects';
import Experience from './Experience';
import Education from './Education';
import Interests from './Interests';

// Add a component here and its id to portfolio.schema.json to introduce a section.
export const sections: Record<SectionId, ComponentType<{ content: Content; config: PortfolioConfig }>> = {
  projects: Projects,
  experience: Experience,
  education: Education,
  interests: Interests,
};
