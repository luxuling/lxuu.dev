import type { ComponentProps } from 'react';

export const CommentInput = (textarea: ComponentProps<'textarea'>) => (
  <textarea
    rows={1}
    maxLength={4000}
    {...textarea}
    className='block field-sizing-content w-full min-w-0 flex-1 resize-none bg-transparent text-fg caret-fg outline-none [caret-shape:block] placeholder:text-fg-subtle'
  />
);
