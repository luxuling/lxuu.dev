import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const ExplorerShell = ({ title, subtitle, children }: Props) => (
  <section className='py-8 sm:py-12'>
    <div className='mx-auto flex w-full max-w-269.5 flex-col gap-8 px-4 md:px-20'>
      <div className='px-1'>
        <h1 className='text-xl font-semibold tracking-tight text-fg'>
          {title}
          <span className='text-fg-muted'>.</span>
        </h1>
        <p className='mt-1 text-sm text-fg-subtle'>{subtitle}</p>
      </div>

      {children}
    </div>
  </section>
);

interface EmptyProps {
  message: string;
}

export const ExplorerEmpty = ({ message }: EmptyProps) => (
  <div className='border border-line bg-surface p-4 text-sm text-fg-subtle sm:p-6'>
    {message}
  </div>
);

interface LabelProps {
  children: ReactNode;
}

export const SectionLabel = ({ children }: LabelProps) => (
  <span className='px-1 font-mono text-xs tracking-widest text-fg-subtle uppercase'>
    {children}
  </span>
);
