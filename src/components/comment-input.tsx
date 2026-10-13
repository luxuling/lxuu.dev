import type { ComponentProps } from 'react';

export const CommentInput = (textarea: ComponentProps<'textarea'>) => (
  <textarea
    rows={3}
    maxLength={4000}
    {...textarea}
    className='block field-sizing-content w-full min-w-0 flex-1 resize-none bg-transparent text-sm/6 text-foreground caret-prompt outline-none [caret-shape:block] placeholder:text-subtle'
  />
);
