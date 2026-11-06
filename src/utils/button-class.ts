const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2 text-body font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg disabled:cursor-default disabled:opacity-60';

const VARIANT = {
  primary: 'bg-fg text-bg hover:bg-fg-muted',
  ghost: 'border border-line-strong text-fg hover:bg-surface-2',
};

export type ButtonVariant = keyof typeof VARIANT;

export const buttonClass = (variant: ButtonVariant = 'primary') =>
  `${BASE} ${VARIANT[variant]}`;
