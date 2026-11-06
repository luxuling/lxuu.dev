import { ExplorerList } from '@/components/explorer-shell';
import { PostCard } from '@/components/post-card';
import { ProjectCard } from '@/components/project-card';
import { SectionLabel } from '@/components/section-label';
import type { PostListItem, ProjectListItem } from '@/types/content';

interface Props {
  projects: ProjectListItem[];
  posts: PostListItem[];
}

const countLabel = (count: number) => String(count).padStart(2, '0');

export const HomeHighlightsList = ({ projects, posts }: Props) => (
  <>
    {projects.length > 0 && (
      <section className='flex flex-col gap-4'>
        <SectionLabel meta={countLabel(projects.length)}>
          highlighted projects
        </SectionLabel>
        <ExplorerList>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ExplorerList>
      </section>
    )}

    {posts.length > 0 && (
      <section className='flex flex-col gap-4'>
        <SectionLabel meta={countLabel(posts.length)}>
          highlighted posts
        </SectionLabel>
        <ExplorerList>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ExplorerList>
      </section>
    )}
  </>
);
