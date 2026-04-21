import { createEffect, createSignal, onCleanup, onMount, For } from 'solid-js';

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  navItems: NavItem[];
}

export default function MobileNav(props: Props) {
  const [isOpen, setIsOpen] = createSignal(false);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    };

    window.addEventListener('resize', handleResize);

    createEffect(() => {
      document.body.style.overflow = isOpen() ? 'hidden' : '';
    });

    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    });
  });

  return (
    <>
      <button
        type='button'
        class='inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground md:hidden'
        aria-label='Toggle menu'
        aria-expanded={isOpen() ? 'true' : 'false'}
        aria-controls='mobile-menu-panel'
        onClick={toggleMenu}
      >
        <span aria-hidden='true'>{isOpen() ? '✕' : '☰'}</span>
      </button>

      <nav
        id='mobile-menu-panel'
        class='absolute inset-x-0 top-full z-40 min-h-[calc(100dvh-5.5rem)] border-t border-edge bg-background px-6 py-8 md:hidden'
        classList={{ hidden: !isOpen() }}
        aria-hidden={isOpen() ? 'false' : 'true'}
      >
        <div class='flex flex-col gap-6 text-sm text-foreground'>
          <a
            href='/'
            class='text-foreground no-underline hover:underline underline-offset-4'
            onClick={closeMenu}
          >
            Home
          </a>
          <For each={props.navItems}>
            {(item) => (
              <a
                href={item.href}
                class='text-foreground no-underline hover:underline underline-offset-4'
                onClick={closeMenu}
              >
                {item.label}
              </a>
            )}
          </For>
          <a
            href='mailto:antonisaputra049@gmail.com'
            class='text-foreground no-underline hover:underline underline-offset-4'
            onClick={closeMenu}
          >
            Hire Me
          </a>
        </div>
      </nav>
    </>
  );
}
