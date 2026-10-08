import type { Content } from '@/lib/content';
import type { PortfolioConfig } from '@/lib/portfolio';
import ProjectCard from '@/components/Projects/ProjectCard';

export default function Projects({ content, config }: { content: Content; config: PortfolioConfig }) {
  return <div className="project-grid">{content.projects.map((project) => (
    <ProjectCard key={project.name} project={project} presentation={config.projects[project.name]} />
  ))}</div>;
}
