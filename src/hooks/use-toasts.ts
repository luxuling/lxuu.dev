import { useEffect, useState } from 'react';
import { TOAST_EVENT } from '@/utils/toast';

interface Toast {
  id: string;
  message: string;
}

const TOAST_DURATION_MS = 3000;

export const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const add = (event: WindowEventMap[typeof TOAST_EVENT]) => {
      const toast = { id: crypto.randomUUID(), message: event.detail };

      setToasts((previous) => [...previous, toast]);
      setTimeout(
        () =>
          setToasts((previous) =>
            previous.filter((item) => item.id !== toast.id),
          ),
        TOAST_DURATION_MS,
      );
    };

    window.addEventListener(TOAST_EVENT, add);

    return () => window.removeEventListener(TOAST_EVENT, add);
  }, []);

  return toasts;
};
