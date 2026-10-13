import { useMobileMenu } from '@/hooks/use-mobile-menu';

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  navItems: NavItem[];
}

const LINK_CLASS =
  'text-foreground no-underline underline-offset-4 hover:underline';

export const MobileNav = ({ navItems }: Props) => {
  const { isOpen, close, toggle } = useMobileMenu();

  return (
    <>
      <button
        type='button'
        className='inline-flex size-9 items-center justify-center text-muted-foreground hover:text-foreground md:hidden'
        aria-label='Toggle menu'
        aria-expanded={isOpen}
        aria-controls='mobile-menu-panel'
        onClick={toggle}
      >
        <svg
          className='size-6 shrink-0'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <use
            href={
              isOpen ? '/icons/close.svg#icon' : '/icons/hamburger.svg#icon'
            }
          />
        </svg>
      </button>

      <nav
        id='mobile-menu-panel'
        className={`absolute inset-x-0 top-full z-40 min-h-[calc(100dvh-5.5rem)] border-t border-edge bg-background px-6 py-8 md:hidden ${
          isOpen ? '' : 'hidden'
        }`}
        aria-hidden={!isOpen}
      >
        <div className='flex flex-col gap-6 text-sm text-foreground'>
          <a href='/' className={LINK_CLASS} onClick={close}>
            Home
          </a>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={LINK_CLASS}
              onClick={close}
            >
              {item.label}
            </a>
          ))}
          <a
            href='mailto:antonisaputra049@gmail.com'
            className={LINK_CLASS}
            onClick={close}
          >
            Hire Me
          </a>
        </div>
      </nav>
    </>
  );
};
