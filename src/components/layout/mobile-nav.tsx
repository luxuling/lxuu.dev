import { useEffect, useState } from 'react';

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  navItems: NavItem[];
}

export default function MobileNav({ navItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button
        type='button'
        className='inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground md:hidden'
        aria-label='Toggle menu'
        aria-expanded={isOpen}
        aria-controls='mobile-menu-panel'
        onClick={toggleMenu}
      >
        <svg
          className='h-6 w-6 shrink-0'
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
          <a
            href='/'
            className='text-foreground no-underline hover:underline underline-offset-4'
            onClick={closeMenu}
          >
            Home
          </a>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className='text-foreground no-underline hover:underline underline-offset-4'
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
          <a
            href='mailto:antonisaputra049@gmail.com'
            className='text-foreground no-underline hover:underline underline-offset-4'
            onClick={closeMenu}
          >
            Hire Me
          </a>
        </div>
      </nav>
    </>
  );
}
