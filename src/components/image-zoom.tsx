import type { MouseEvent } from 'react';
import { LoadingImage } from '@/components/loading-image';
import { useToggle } from '@/hooks/use-toggle';

interface Props {
  src: string;
  alt: string;
  frameClassName?: string;
  className?: string;
}

const showModal = (dialog: HTMLDialogElement | null) => dialog?.showModal();

const closeIfBackdrop = (event: MouseEvent<HTMLElement>) => {
  if (event.target !== event.currentTarget) return;

  const dialog = event.currentTarget.closest('dialog');
  if (!(dialog instanceof HTMLDialogElement)) return;

  dialog.close();
};

const closeFromImage = (event: MouseEvent<HTMLImageElement>) => {
  const dialog = event.currentTarget.closest('dialog');
  if (!(dialog instanceof HTMLDialogElement)) return;

  dialog.close();
};

export const ImageZoom = ({
  src,
  alt,
  frameClassName = '',
  className,
}: Props) => {
  const zoom = useToggle();
  const label = alt ? `Enlarge ${alt}` : 'Enlarge image';

  return (
    <>
      <button
        type='button'
        onClick={zoom.open}
        aria-label={label}
        className='block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
      >
        <LoadingImage
          src={src}
          alt={alt}
          frameClassName={frameClassName}
          className={className}
        />
      </button>

      {zoom.isOpen && (
        <dialog
          ref={showModal}
          onClose={zoom.close}
          onClick={closeIfBackdrop}
          aria-label={alt || 'Enlarged image'}
          className='image-zoom-dialog fixed inset-0 m-0 flex h-dvh max-h-none w-dvw max-w-none flex-col border-0 bg-transparent p-4 backdrop:bg-background/80 backdrop:backdrop-blur-sm'
        >
          <form method='dialog' className='mb-3 flex shrink-0 justify-end'>
            <button
              type='submit'
              autoFocus
              className='rounded-sm border border-edge bg-panel px-3 py-1 font-mono text-xs text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
            >
              close
            </button>
          </form>
          <div
            className='flex min-h-0 flex-1 items-center justify-center'
            onClick={closeIfBackdrop}
          >
            <img
              src={src}
              alt={alt}
              className='max-h-full max-w-full cursor-zoom-out object-contain'
              onClick={closeFromImage}
            />
          </div>
        </dialog>
      )}
    </>
  );
};
