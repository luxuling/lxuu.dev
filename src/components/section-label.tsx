import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  meta?: ReactNode;
}

export const SectionLabel = ({ children, meta }: Props) => (
  <div className='flex items-center gap-3'>
    <h2 className='shrink-0 text-label font-semibold text-fg-muted uppercase'>
      [ {children} ]
    </h2>
    <span className='h-px flex-1 bg-line' aria-hidden='true' />
    {meta !== undefined && (
      <span className='shrink-0 text-micro text-fg-subtle'>{meta}</span>
    )}
  </div>
);
