import {
  ExplorerEmpty,
  ExplorerShell,
  SectionLabel,
} from '@/components/explorer-shell';
import { ListFilter } from '@/components/list-filter';
import { ProjectCard } from '@/components/project-card';
import { useListFilter } from '@/hooks/use-list-filter';
import type { ProjectListItem } from '@/types/content';

interface Props {
  projects: ProjectListItem[];
}

export const ProjectsExplorer = ({ projects }: Props) => {
  const filter = useListFilter(projects);

  const highlighted = filter.filtered.filter((project) => project.highlight);
  const rest = filter.filtered.filter((project) => !project.highlight);

  return (
    <ExplorerShell title='projects' subtitle='things i built or am building'>
      <ListFilter
        filter={filter}
        placeholder='search projects...'
        label='Search projects'
      />

      {highlighted.length > 0 && <SectionLabel>[ highlighted ]</SectionLabel>}
      {highlighted.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}

      {rest.length > 0 && highlighted.length > 0 && (
        <SectionLabel>[ other ]</SectionLabel>
      )}
      {rest.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}

      {filter.filtered.length === 0 && (
        <ExplorerEmpty message='no projects match search/filter.' />
      )}
    </ExplorerShell>
  );
};
