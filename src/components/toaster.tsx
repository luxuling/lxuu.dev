import { useToasts } from '@/hooks/use-toasts';

export const Toaster = () => {
  const toasts = useToasts();

  return (
    <div
      className='pointer-events-none fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col gap-2 font-mono text-xs/6'
      role='status'
    >
      {toasts.map((toast) => (
        <p
          key={toast.id}
          className='rounded-md border border-edge bg-panel px-4 py-2 text-foreground shadow-lg transition-opacity duration-300 starting:opacity-0'
        >
          <span className='text-prompt'>ok:</span> {toast.message}
        </p>
      ))}
    </div>
  );
};
