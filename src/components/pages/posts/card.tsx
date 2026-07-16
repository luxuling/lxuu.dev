import { For } from 'solid-js';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export interface PostListItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(`${dateStr}-01`);
  if (isNaN(d.getTime())) return dateStr;
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PostCard(props: { post: PostListItem }) {
  const p = () => props.post;

  return (
    <a
      href={`/posts/${p().slug}`}
      class='group block rounded-md border border-edge bg-panel p-4 transition-colors hover:border-muted sm:p-6'
    >
      <div class='flex flex-col gap-3'>
        <div class='flex items-start justify-between gap-4'>
          <h2 class='text-sm font-semibold text-foreground underline-offset-4 group-hover:underline'>
            {p().title}
          </h2>
          <span class='shrink-0 font-mono text-xs text-subtle'>
            {formatDisplayDate(p().date)}
          </span>
        </div>

        <p class='text-sm leading-relaxed text-muted-foreground'>
          {p().description}
        </p>

        <div class='flex flex-wrap gap-1.5'>
          <For each={p().tags}>
            {(tag) => (
              <span class='rounded-sm border border-edge px-2 py-0.5 font-mono text-xs text-subtle'>
                {tag}
              </span>
            )}
          </For>
        </div>
      </div>
    </a>
  );
}
