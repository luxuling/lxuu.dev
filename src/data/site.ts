export const EMAIL = 'antonisaputra049@gmail.com';

export const NAV_ITEMS = [
  { href: '/projects', label: 'projects' },
  { href: '/posts', label: 'posts' },
  { href: '/set-up', label: 'set-up' },
  { href: '/me', label: 'me' },
];

export const SOCIAL_LINKS = [
  {
    key: 'gh',
    label: 'github',
    handle: '@luxuling',
    href: 'https://github.com/luxuling',
  },
  {
    key: 'in',
    label: 'linkedin',
    handle: 'in/antoni-saputra',
    href: 'https://www.linkedin.com/in/antoni-saputra-3b1869241/',
  },
  {
    key: 'ig',
    label: 'instagram',
    handle: '@lxuu.dev',
    href: 'https://www.instagram.com/lxuu.dev/',
  },
  {
    key: 'th',
    label: 'threads',
    handle: 'yap on threads',
    href: 'https://www.threads.com/@lxuu.dev',
  },
];

export const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);
