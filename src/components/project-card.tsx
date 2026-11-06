import { CardStats } from '@/components/card-stats';
import { ProjectLogo } from '@/components/project-logo';
import { TagLine } from '@/components/tag-list';
import type { ProjectListItem } from '@/types/content';
import { STATUS_LABEL } from '@/utils/project-status';

interface Props {
  project: ProjectListItem;
}

const CARD_CLASS =
  'group flex gap-4 border border-line bg-surface/40 p-4 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg md:p-6';

export const ProjectCard = ({ project }: Props) => (
  <a href={`/projects/${project.slug}`} className={CARD_CLASS}>
    <ProjectLogo
      title={project.title}
      logo={project.logo}
      className='hidden size-10 md:flex'
    />

    <div className='flex min-w-0 flex-1 flex-col gap-2 md:gap-3'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex min-w-0 items-center gap-3'>
          <ProjectLogo
            title={project.title}
            logo={project.logo}
            className='size-8 md:hidden'
          />
          <h3 className='truncate text-title font-semibold text-fg underline-offset-4 group-hover:underline'>
            {project.title}
          </h3>
        </div>
        <p className='flex shrink-0 gap-4 text-small'>
          <span className='hidden text-fg-subtle lowercase md:inline'>
            {project.dateLabel}
          </span>
          <span className='text-fg-muted'>{STATUS_LABEL[project.status]}</span>
        </p>
      </div>

      <p className='text-body text-fg-muted'>{project.description}</p>

      <div className='mt-1 flex flex-col gap-2 md:mt-0 md:flex-row md:items-center md:justify-between md:gap-6'>
        <TagLine tags={project.tags} />
        <div className='flex shrink-0 items-center justify-between gap-4 text-small md:justify-end'>
          <span className='text-fg-subtle'>
            <span className='lowercase md:hidden'>{project.dateLabel} · </span>
            <CardStats target='projects' slug={project.slug} />
          </span>
          <ProjectLinks project={project} />
        </div>
      </div>
    </div>
  </a>
);

const ProjectLinks = ({ project }: Props) => (
  <span className='flex gap-3.5 whitespace-pre text-fg'>
    {project.hasLiveLink && <span>(•) live</span>}
    {project.hasGithubLink && <span>&lt;/&gt; src</span>}
  </span>
);
