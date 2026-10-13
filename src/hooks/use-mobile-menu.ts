import { useEffect } from 'react';
import { useToggle } from '@/hooks/use-toggle';

const DESKTOP_MIN_WIDTH = 768;

export const useMobileMenu = () => {
  const { isOpen, close, toggle } = useToggle();

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= DESKTOP_MIN_WIDTH) close();
    };

    window.addEventListener('resize', closeOnDesktop);

    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return { isOpen, close, toggle };
};
