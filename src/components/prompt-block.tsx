import type { ReactNode } from 'react';

interface Props {
  isActive?: boolean;
  children: ReactNode;
}

export const PromptBlock = ({ isActive = false, children }: Props) => (
  <div className='group relative pl-4'>
    <span
      className={`absolute top-[0.5lh] bottom-[0.5lh] left-0 w-2 rounded-l-sm border-y border-l ${
        isActive
          ? 'border-prompt/50 group-focus-within:border-prompt'
          : 'border-subtle/50'
      }`}
      aria-hidden='true'
    />
    {children}
  </div>
);
