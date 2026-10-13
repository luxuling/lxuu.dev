import { SectionLabel } from '@/components/explorer-shell';
import { PostCard } from '@/components/post-card';
import { ProjectCard } from '@/components/project-card';
import type { PostListItem, ProjectListItem } from '@/types/content';

interface Props {
  projects: ProjectListItem[];
  posts: PostListItem[];
}

export const HomeHighlightsList = ({ projects, posts }: Props) => {
  const hasProjects = projects.length > 0;
  const hasPosts = posts.length > 0;

  return (
    <div className='flex flex-col gap-6'>
      {hasProjects && <SectionLabel>[ highlighted projects ]</SectionLabel>}
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}

      {hasProjects && hasPosts && <div className='h-2' />}

      {hasPosts && <SectionLabel>[ highlighted posts ]</SectionLabel>}
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
};
