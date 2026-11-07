import { useActiveHeading } from '@/hooks/use-active-heading';
import { useToggle } from '@/hooks/use-toggle';
import type { TocItem } from '@/utils/toc';

interface Props {
  items: TocItem[];
}

interface ListProps extends Props {
  activeId: string;
  itemClassName: string;
  onNavigate?: () => void;
}

const TocList = ({ items, activeId, itemClassName, onNavigate }: ListProps) => (
  <ul className='border-l border-line'>
    {items.map((item) => {
      const isActive = activeId === item.id;

      return (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            aria-current={isActive ? 'location' : undefined}
            style={{ marginLeft: `${item.indent * 2}ch` }}
            className={`block pl-4 whitespace-pre transition-colors ${itemClassName} ${
              isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {isActive ? '> ' : '  '}
            <span className='whitespace-normal lowercase'>{item.text}</span>
          </a>
        </li>
      );
    })}
  </ul>
);

export const TableOfContents = ({ items }: Props) => {
  const activeId = useActiveHeading(items);
  const modal = useToggle();

  return (
    <>
      <nav
        aria-label='Table of contents'
        className='hidden flex-col gap-3 lg:flex'
      >
        <p className='text-micro text-fg-subtle'>[≣] contents</p>
        <TocList
          items={items}
          activeId={activeId}
          itemClassName='py-1 text-small'
        />
      </nav>

      <div className='lg:hidden'>
        {modal.isOpen && (
          <div
            className='fixed inset-0 z-40 bg-bg/70'
            onClick={modal.close}
            aria-hidden='true'
          />
        )}

        <div
          id='toc-modal'
          role='dialog'
          aria-label='Table of contents'
          className={`fixed top-1/2 left-1/2 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm -translate-1/2 flex-col gap-4 border border-line bg-surface p-4 transition duration-200 ease-out ${
            modal.isOpen
              ? 'scale-100 opacity-100'
              : 'pointer-events-none invisible scale-95 opacity-0'
          }`}
        >
          <div className='flex items-center justify-between'>
            <p className='text-label font-semibold text-fg-muted uppercase'>
              [ contents ]
            </p>
            <button
              type='button'
              onClick={modal.close}
              className='cursor-pointer text-body font-semibold text-fg'
              aria-label='Close table of contents'
            >
              [x]
            </button>
          </div>
          <div className='flex-1 overflow-y-auto'>
            <TocList
              items={items}
              activeId={activeId}
              itemClassName='py-2 text-body'
              onNavigate={modal.close}
            />
          </div>
        </div>

        <button
          type='button'
          onClick={modal.toggle}
          aria-expanded={modal.isOpen}
          aria-controls='toc-modal'
          className='fixed right-4 bottom-4 z-30 cursor-pointer bg-fg px-4 py-2 text-small text-bg'
        >
          [≣] contents
        </button>
      </div>
    </>
  );
};
