interface Props {
  tags: string[];
}

export const TagList = ({ tags }: Props) => (
  <div className='flex flex-wrap gap-1.5'>
    {tags.map((tag) => (
      <span
        key={tag}
        className='border border-line px-2 py-0.5 font-mono text-xs text-fg-subtle'
      >
        {tag}
      </span>
    ))}
  </div>
);
