import type { CSSProperties } from 'react';
import { RichText } from '@/components/RichText';
import type { Project } from '@/lib/content';
import type { ProjectPresentation } from '@/lib/portfolio';
import ProjectVisual from './ProjectVisual';

export default function ProjectCard({ project, presentation = {} }: {
  project: Project;
  presentation?: ProjectPresentation;
}) {
  // Keep links authored in both the description and the project links field.
  const links = [...(project.links ?? []), ...project.description.filter((run) => run.url)]
    .filter((link, index, items) => items.findIndex((item) => item.url === link.url) === index);
  return <article className="project-card" style={presentation.accent
    ? { '--project-accent': presentation.accent } as CSSProperties : undefined}>
    <ProjectVisual presentation={presentation} />
    <div className="project-card-copy">
      {presentation.category && <p className="project-category">{presentation.category}</p>}
      <h3>{project.name}</h3>
      <p className="project-description"><RichText runs={project.description} /></p>
      {links.length > 0 && <div className="project-actions">
        {links.map((link) => <a key={link.url} href={link.url}>
          {presentation.linkLabels?.[link.url!] ?? link.text} <span aria-hidden="true">↗</span>
        </a>)}
      </div>}
    </div>
  </article>;
}
