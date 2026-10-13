import type { ComponentProps } from 'react';

interface Props extends ComponentProps<'button'> {
  isDanger?: boolean;
}

export const TerminalButton = ({ isDanger = false, ...button }: Props) => (
  <button
    type='button'
    {...button}
    className={`whitespace-nowrap underline-offset-4 transition-colors enabled:hover:underline disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:text-foreground ${
      isDanger
        ? 'text-failure'
        : 'text-muted-foreground enabled:hover:text-foreground'
    }`}
  />
);
