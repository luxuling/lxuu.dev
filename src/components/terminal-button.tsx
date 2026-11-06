import type { ComponentProps } from 'react';

export const TerminalButton = (button: ComponentProps<'button'>) => (
  <button
    type='button'
    {...button}
    className='cursor-pointer whitespace-nowrap underline-offset-4 transition-colors enabled:hover:text-fg enabled:hover:underline disabled:cursor-not-allowed disabled:opacity-40'
  />
);
