import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import type { TocItem } from '@lib/posts/toc';

interface Props {
  items: TocItem[];
}

function TocList(props: {
  items: TocItem[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <ul class='flex flex-col gap-0.5'>
      <For each={props.items}>
        {(item) => {
          const isH3 = item.level === 3;
          const isActive = () => props.activeId === item.id;
          return (
            <li
              style={isH3 ? { 'padding-left': '0.75rem' } : {}}
              class='relative'
            >
              <span
                class='absolute inset-y-0 left-0 w-px rounded-full transition-colors duration-200'
                classList={{
                  'bg-foreground': isActive() && !isH3,
                  'bg-muted': isActive() && isH3,
                  'bg-edge': !isActive(),
                }}
              />
              <a
                href={`#${item.id}`}
                onClick={() => props.onNavigate?.()}
                class='block py-1 pl-3 font-mono text-[0.7rem] leading-snug transition-colors duration-150'
                classList={{
                  'text-foreground': isActive(),
                  'text-subtle hover:text-muted-foreground': !isActive(),
                }}
              >
                {item.text}
              </a>
            </li>
          );
        }}
      </For>
    </ul>
  );
}

export default function TableOfContents(props: Props) {
  const [activeId, setActiveId] = createSignal('');
  const [open, setOpen] = createSignal(false);

  onMount(() => {
    if (props.items.length === 0) return;

    const headingEls = props.items
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
    onCleanup(() => window.removeEventListener('scroll', updateActive));
  });

  const activeItem = () => props.items.find((i) => i.id === activeId());

  return (
    <>
      {/* ── Desktop: sticky sidebar (xl+) ── */}
      <nav aria-label='Table of contents' class='hidden xl:flex flex-col gap-3'>
        <p class='font-mono text-[0.65rem] uppercase tracking-widest text-subtle'>
          [ contents ]
        </p>
        <TocList items={props.items} activeId={activeId()} />
      </nav>

      {/* ── Mobile: fixed bottom bar + bottom sheet ── */}
      <div class='xl:hidden'>
        {/* Backdrop */}
        <Show when={open()}>
          <div
            class='fixed inset-0 z-40 bg-background/70 backdrop-blur-sm'
            onClick={() => setOpen(false)}
            aria-hidden='true'
          />
        </Show>

        {/* Bottom sheet */}
        <div
          class='fixed bottom-14 left-0 right-0 z-50 transition-transform duration-300 ease-in-out'
          style={{
            transform: open() ? 'translateY(0)' : 'translateY(110%)',
          }}
        >
          <div class='mx-3 rounded-t-xl border border-edge bg-panel shadow-2xl'>
            <div class='flex items-center justify-between border-b border-edge px-4 py-3'>
              <p class='font-mono text-[0.65rem] uppercase tracking-widest text-subtle'>
                [ contents ]
              </p>
              <button
                type='button'
                onClick={() => setOpen(false)}
                class='font-mono text-xs text-subtle hover:text-foreground'
                aria-label='Close table of contents'
              >
                ✕
              </button>
            </div>
            <div class='max-h-[55vh] overflow-y-auto px-4 py-3'>
              <TocList
                items={props.items}
                activeId={activeId()}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* Fixed bottom trigger bar */}
        <button
          type='button'
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open()}
          aria-controls='toc-sheet'
          class='fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-edge bg-panel/95 px-4 py-3 backdrop-blur-sm'
        >
          <div class='flex min-w-0 items-center gap-2'>
            <span class='shrink-0 font-mono text-[0.6rem] uppercase tracking-widest text-subtle'>
              §
            </span>
            <span class='truncate font-mono text-xs text-muted-foreground'>
              {activeItem()?.text ?? 'contents'}
            </span>
          </div>
          <span
            class='shrink-0 font-mono text-[0.65rem] text-subtle transition-transform duration-200'
            style={{ transform: open() ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ↑
          </span>
        </button>
      </div>
    </>
  );
}
