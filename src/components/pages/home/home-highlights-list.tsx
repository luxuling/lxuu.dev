import { For, Show } from 'solid-js';
import ProjectCard, { type ProjectListItem } from '../projects/card';
import PostCard, { type PostListItem } from '../posts/card';

interface Props {
  projects: ProjectListItem[];
  posts: PostListItem[];
}

const SECTION_LABEL_CLASS =
  'px-1 font-mono text-xs uppercase tracking-widest text-subtle';

export default function HomeHighlightsList(props: Props) {
  const hasProjects = () => props.projects.length > 0;
  const hasPosts = () => props.posts.length > 0;

  return (
    <div class='flex flex-col gap-6'>
      <Show when={hasProjects()}>
        <span class={SECTION_LABEL_CLASS}>[ highlighted projects ]</span>
        <For each={props.projects}>
          {(project) => <ProjectCard project={project} />}
        </For>
      </Show>

      <Show when={hasPosts()}>
        <Show when={hasProjects()}>
          <div class='h-2' />
        </Show>
        <span class={SECTION_LABEL_CLASS}>[ highlighted posts ]</span>
        <For each={props.posts}>{(post) => <PostCard post={post} />}</For>
      </Show>
    </div>
  );
}
