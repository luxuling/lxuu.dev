import type { ReactNode } from 'react';
import { PageHeader } from '@/components/page-header';
import { PAGE_CLASS } from '@/utils/layout-class';

interface Props {
  path: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const ExplorerShell = ({ path, title, subtitle, children }: Props) => (
  <div className={PAGE_CLASS}>
    <PageHeader path={path} title={title} subtitle={subtitle} />
    {children}
  </div>
);

interface ListProps {
  children: ReactNode;
}

export const ExplorerList = ({ children }: ListProps) => (
  <div className='flex flex-col gap-4'>{children}</div>
);

interface EmptyProps {
  message: string;
  onClear: () => void;
}

export const ExplorerEmpty = ({ message, onClear }: EmptyProps) => (
  <div className='flex flex-col items-center gap-2 border border-line px-6 py-16 text-center'>
    <p className='text-h1 font-bold text-fg-muted'>(._.)</p>
    <p className='text-body text-fg-muted'>{message}</p>
    <button
      type='button'
      onClick={onClear}
      className='cursor-pointer text-small text-fg hover:underline'
    >
      [x] clear filters
    </button>
  </div>
);
