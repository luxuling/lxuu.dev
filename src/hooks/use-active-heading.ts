import { useEffect, useState } from 'react';
import type { TocItem } from '@/utils/toc';

const SCROLL_OFFSET = 96;

export const useActiveHeading = (items: TocItem[]) => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element) => element !== null);

    const updateActive = () => {
      const scrollY = window.scrollY + SCROLL_OFFSET;
      const passed = headings.filter((heading) => heading.offsetTop <= scrollY);
      const current = passed.at(-1) ?? headings.at(0);

      setActiveId(current?.id ?? '');
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });

    return () => window.removeEventListener('scroll', updateActive);
  }, [items]);

  return activeId;
};
