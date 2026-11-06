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
            className={`block pl-4 whitespace-pre transition-colors ${itemClassName} ${
              isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
            } ${item.level === 3 ? 'ml-[2ch]' : ''}`}
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
  const drawer = useToggle();

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
          className={`fixed inset-y-0 right-0 z-50 flex w-75 max-w-[85vw] flex-col gap-4 border-l border-line bg-surface p-4 transition-transform duration-300 ease-in-out ${
            drawer.isOpen ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
        >
          <div className='flex items-center justify-between'>
            <p className='text-label font-semibold text-fg-muted uppercase'>
              [ contents ]
            </p>
            <button
              type='button'
              onClick={drawer.close}
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
              onNavigate={drawer.close}
            />
          </div>
        </div>

        <button
          type='button'
          onClick={drawer.toggle}
          aria-expanded={drawer.isOpen}
          aria-controls='toc-drawer'
          className='fixed right-4 bottom-4 z-30 cursor-pointer bg-fg px-4 py-2 text-small text-bg'
        >
          [≣] contents
        </button>
      </div>
    </>
  );
};
