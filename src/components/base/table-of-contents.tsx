import { useEffect, useState } from 'react';
import type { TocItem } from '@lib/posts/toc';

interface Props {
  items: TocItem[];
}

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className='flex flex-col gap-0.5'>
      {items.map((item) => {
        const isH3 = item.level === 3;
        const isActive = activeId === item.id;
        const markerColor = !isActive
          ? 'bg-edge'
          : isH3
            ? 'bg-muted'
            : 'bg-foreground';
        return (
          <li
            key={item.id}
            style={isH3 ? { paddingLeft: '0.75rem' } : undefined}
            className='relative'
          >
            <span
              className={`absolute inset-y-0 left-0 w-px rounded-full transition-colors duration-200 ${markerColor}`}
            />
            <a
              href={`#${item.id}`}
              onClick={() => onNavigate?.()}
              className={`block py-1 pl-3 font-mono text-[0.7rem] leading-snug transition-colors duration-150 ${
                isActive
                  ? 'text-foreground'
                  : 'text-subtle hover:text-muted-foreground'
              }`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function TableOfContents({ items }: Props) {
  const [activeId, setActiveId] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    const headingEls = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const updateActive = () => {
      const scrollY = window.scrollY + 96;
      let current = headingEls[0]?.id ?? '';
      for (const el of headingEls) {
        if (el.offsetTop <= scrollY) current = el.id;
      }
      setActiveId(current);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    return () => window.removeEventListener('scroll', updateActive);
  }, [items]);

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <>
      {/* ── Desktop: sticky sidebar (xl+) ── */}
      <nav
        aria-label='Table of contents'
        className='hidden xl:flex flex-col gap-3'
      >
        <p className='font-mono text-[0.65rem] uppercase tracking-widest text-subtle'>
          [ contents ]
        </p>
        <TocList items={items} activeId={activeId} />
      </nav>

      {/* ── Mobile: fixed bottom button + right-side drawer ── */}
      <div className='xl:hidden'>
        {/* Backdrop */}
        {open && (
          <div
            className='fixed inset-0 z-40 bg-background/70 backdrop-blur-sm'
            onClick={() => setOpen(false)}
            aria-hidden='true'
          />
        )}

        {/* Right-side drawer */}
        <div
          id='toc-drawer'
          role='dialog'
          aria-label='Table of contents'
          className='fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-edge bg-panel shadow-2xl transition-transform duration-300 ease-in-out'
          style={{
            transform: open ? 'translateX(0)' : 'translateX(110%)',
          }}
        >
          <div className='flex items-center justify-between border-b border-edge px-4 py-3'>
            <p className='font-mono text-[0.65rem] uppercase tracking-widest text-subtle'>
              [ contents ]
            </p>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='font-mono text-xs text-subtle hover:text-foreground'
              aria-label='Close table of contents'
            >
              ✕
            </button>
          </div>
          <div className='flex-1 overflow-y-auto px-4 py-3'>
            <TocList
              items={items}
              activeId={activeId}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>

        {/* Fixed bottom trigger button */}
        <button
          type='button'
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls='toc-drawer'
          className='fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-edge bg-panel/95 px-4 py-2.5 shadow-lg backdrop-blur-sm'
        >
          <svg
            className='size-3.5 shrink-0 text-subtle'
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
          <span className='max-w-[40vw] truncate font-mono text-xs text-muted-foreground'>
            {activeItem?.text ?? 'contents'}
          </span>
        </button>
      </div>
    </>
  );
}
