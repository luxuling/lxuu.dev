import { CardStats } from '@/components/card-stats';
import { TagList } from '@/components/tag-list';
import type { ProjectListItem } from '@/types/content';
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/project-status';

interface Props {
  project: ProjectListItem;
}

export const ProjectCard = ({ project }: Props) => (
  <a
    href={`/projects/${project.slug}`}
    className='group block rounded-md border border-edge bg-panel p-4 transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:p-6'
  >
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
        <h2 className='text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
          {project.title}
        </h2>
        <div className='flex shrink-0 flex-wrap items-center gap-2 font-mono text-xs sm:gap-3'>
          <span className='text-subtle'>{project.dateLabel}</span>
          <span className={`font-mono text-xs ${STATUS_COLOR[project.status]}`}>
            {STATUS_LABEL[project.status]}
          </span>
          <CardStats target='projects' slug={project.slug} />
        </div>
      </div>

      <p className='text-sm/relaxed text-muted-foreground'>
        {project.description}
      </p>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <TagList tags={project.tags} />

        {(project.hasLiveLink || project.hasGithubLink) && (
          <div className='flex items-center gap-3 font-mono text-xs text-foreground'>
            {project.hasLiveLink && <span>live</span>}
            {project.hasGithubLink && (
              <span className='inline-flex items-center gap-1'>src</span>
            )}
          </div>
        )}
      </div>
    </div>
  </a>
);
