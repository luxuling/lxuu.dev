import { useToasts } from '@/hooks/use-toasts';

export const Toaster = () => {
  const toasts = useToasts();

  return (
    <div
      className='pointer-events-none fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2'
      role='status'
    >
      {toasts.map((toast) => (
        <p
          key={toast.id}
          className='flex gap-3 border border-line-strong bg-surface/40 px-4 py-3 text-small backdrop-blur-sm transition-opacity duration-300 starting:opacity-0'
        >
          <span className='text-fg'>[ok]</span>
          <span className='text-fg-muted'>{toast.message}</span>
        </p>
      ))}
    </div>
  );
};
