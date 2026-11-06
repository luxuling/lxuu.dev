import { tagLabel } from '@/utils/tags';

interface Props {
  tags: string[];
}

export const TagList = ({ tags }: Props) => (
  <ul className='flex flex-wrap gap-2'>
    {tags.map((tag) => (
      <li
        key={tag}
        className='border border-line px-3 py-1 text-small text-fg-muted'
      >
        {tagLabel(tag)}
      </li>
    ))}
  </ul>
);

export const TagLine = ({ tags }: Props) => (
  <p className='flex flex-wrap gap-x-3.5 text-small text-fg-subtle'>
    {tags.map((tag) => (
      <span key={tag}>{tagLabel(tag)}</span>
    ))}
  </p>
);
