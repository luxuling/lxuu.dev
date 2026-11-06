import { useMobileMenu } from '@/hooks/use-mobile-menu';
import { EMAIL, NAV_ITEMS, SOCIAL_LINKS, isActivePath } from '@/data/site';
import { buttonClass } from '@/utils/button-class';

interface Props {
  currentPath: string;
}

const MENU_ITEMS = [{ href: '/', label: 'home' }, ...NAV_ITEMS];

export const MobileNav = ({ currentPath }: Props) => {
  const { isOpen, close, toggle } = useMobileMenu();

  return (
    <>
      <button
        type='button'
        className='cursor-pointer text-body font-semibold text-fg md:hidden'
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls='mobile-menu-panel'
        onClick={toggle}
      >
        {isOpen ? '[x]' : '[≡]'}
      </button>

      <nav
        id='mobile-menu-panel'
        className={`absolute inset-x-0 top-full z-40 h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto border-t border-line bg-black bg-linear-to-b from-white/4 to-transparent to-35% md:hidden ${
          isOpen ? 'flex' : 'hidden'
        }`}
        aria-hidden={!isOpen}
      >
        <ul className='flex flex-col px-4 py-8'>
          {MENU_ITEMS.map((item, index) => {
            const isActive = isActivePath(currentPath, item.href);

            return (
              <li key={item.href} className='border-b border-line'>
                <a
                  href={item.href}
                  onClick={close}
                  className='flex items-center justify-between py-4'
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className='flex items-center gap-4'>
                    <span className='text-small text-fg-subtle'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-h1 font-bold ${isActive ? 'text-fg' : 'text-fg-muted'}`}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span className='text-body text-fg-subtle'>-&gt;</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className='flex flex-col gap-4 px-4'>
          <a
            href={`mailto:${EMAIL}`}
            onClick={close}
            className={`${buttonClass()} w-full`}
          >
            [@] hire me
          </a>
          <div className='flex gap-4 text-small text-fg-muted'>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target='_blank'
                rel='noreferrer'
                aria-label={link.label}
                className='hover:text-fg'
              >
                [{link.key}]
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};
