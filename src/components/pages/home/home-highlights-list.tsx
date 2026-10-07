import ProjectCard, { type ProjectListItem } from '../projects/card';
import PostCard, { type PostListItem } from '../posts/card';

interface Props {
  projects: ProjectListItem[];
  posts: PostListItem[];
}

const SECTION_LABEL_CLASS =
  'px-1 font-mono text-xs uppercase tracking-widest text-subtle';

export default function HomeHighlightsList({ projects, posts }: Props) {
  const hasProjects = projects.length > 0;
  const hasPosts = posts.length > 0;

  return (
    <div className='flex flex-col gap-6'>
      {hasProjects && (
        <>
          <span className={SECTION_LABEL_CLASS}>[ highlighted projects ]</span>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </>
      )}

      {hasPosts && (
        <>
          {hasProjects && <div className='h-2' />}
          <span className={SECTION_LABEL_CLASS}>[ highlighted posts ]</span>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </>
      )}
    </div>
  );
}
