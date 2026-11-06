import { useActiveHeading } from '@/hooks/use-active-heading';
import { useToggle } from '@/hooks/use-toggle';
import type { TocItem } from '@/utils/toc';

interface Props {
  items: TocItem[];
}

interface ListProps extends Props {
  activeId: string;
  onNavigate?: () => void;
}

const HEADING_LABEL_CLASS =
  'font-mono text-[0.65rem] tracking-widest text-fg-subtle uppercase';

const markerColor = (isActive: boolean, isSubheading: boolean) => {
  if (!isActive) return 'bg-line';

  return isSubheading ? 'bg-line-strong' : 'bg-fg';
};

const TocList = ({ items, activeId, onNavigate }: ListProps) => (
  <ul className='flex flex-col gap-0.5'>
    {items.map((item) => {
      const isSubheading = item.level === 3;
      const isActive = activeId === item.id;

      return (
        <li key={item.id} className={`relative ${isSubheading ? 'pl-3' : ''}`}>
          <span
            className={`absolute inset-y-0 left-0 w-px transition-colors duration-200 ${markerColor(isActive, isSubheading)}`}
          />
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            className={`block py-1 pl-3 font-mono text-[0.7rem] leading-snug transition-colors duration-150 ${
              isActive ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'
            }`}
          >
            {item.text}
          </a>
        </li>
      );
    })}
  </ul>
);

export const TableOfContents = ({ items }: Props) => {
  const activeId = useActiveHeading(items);
  const drawer = useToggle();

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <>
      <nav
        aria-label='Table of contents'
        className='hidden flex-col gap-3 xl:flex'
      >
        <p className={HEADING_LABEL_CLASS}>[ contents ]</p>
        <TocList items={items} activeId={activeId} />
      </nav>

      <div className='xl:hidden'>
        {drawer.isOpen && (
          <div
            className='fixed inset-0 z-40 bg-bg/70'
            onClick={drawer.close}
            aria-hidden='true'
          />
        )}

        <div
          id='toc-drawer'
          role='dialog'
          aria-label='Table of contents'
          className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-line bg-surface transition-transform duration-300 ease-in-out ${
            drawer.isOpen ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
        >
          <div className='flex items-center justify-between border-b border-line px-4 py-3'>
            <p className={HEADING_LABEL_CLASS}>[ contents ]</p>
            <button
              type='button'
              onClick={drawer.close}
              className='font-mono text-xs text-fg-subtle hover:text-fg'
              aria-label='Close table of contents'
            >
              ✕
            </button>
          </div>
          <div className='flex-1 overflow-y-auto px-4 py-3'>
            <TocList
              items={items}
              activeId={activeId}
              onNavigate={drawer.close}
            />
          </div>
        </div>

        <button
          type='button'
          onClick={drawer.toggle}
          aria-expanded={drawer.isOpen}
          aria-controls='toc-drawer'
          className='fixed right-4 bottom-4 z-50 flex items-center gap-2 border border-line bg-surface/95 px-4 py-2.5'
        >
          <svg
            className='size-3.5 shrink-0 text-fg-subtle'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <line x1='8' y1='6' x2='21' y2='6' />
            <line x1='8' y1='12' x2='21' y2='12' />
            <line x1='8' y1='18' x2='21' y2='18' />
            <line x1='3' y1='6' x2='3.01' y2='6' />
            <line x1='3' y1='12' x2='3.01' y2='12' />
            <line x1='3' y1='18' x2='3.01' y2='18' />
          </svg>
          <span className='max-w-[40vw] truncate font-mono text-xs text-fg-muted'>
            {activeItem?.text ?? 'contents'}
          </span>
        </button>
      </div>
    </>
  );
};
