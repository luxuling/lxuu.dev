import {
  ExplorerEmpty,
  ExplorerList,
  ExplorerShell,
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

  return (
    <ExplorerShell
      path='~/projects'
      title='projects'
      subtitle='things i built or am building'
    >
      <ListFilter
        filter={filter}
        placeholder='search projects...'
        label='Search projects'
      />

      {filter.filtered.length > 0 ? (
        <ExplorerList>
          {filter.filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ExplorerList>
      ) : (
        <ExplorerEmpty
          message='no projects match search/filter.'
          onClear={filter.clear}
        />
      )}
    </ExplorerShell>
  );
};
