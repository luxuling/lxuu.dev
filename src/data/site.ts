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
    handle: '@lxuuu.ling',
    href: 'https://www.instagram.com/lxuuu.ling/',
  },
  {
    key: 'dc',
    label: 'discord',
    handle: 'dm on discord',
    href: 'https://discord.com/users/520879989537898496',
  },
];

export const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);
