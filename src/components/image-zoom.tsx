import type { MouseEvent } from 'react';
import { LoadingImage } from '@/components/loading-image';
import { useToggle } from '@/hooks/use-toggle';
import { buttonClass } from '@/utils/button-class';

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
        className='block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg'
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
          className='image-zoom-dialog fixed inset-0 m-0 flex h-dvh max-h-none w-dvw max-w-none flex-col gap-4 border-0 bg-transparent p-4 backdrop:bg-bg/85 md:px-8'
        >
          <form method='dialog' className='flex shrink-0 justify-end'>
            <button
              type='submit'
              autoFocus
              className={`${buttonClass('ghost')} bg-surface`}
            >
              [x] close
            </button>
          </form>
          <div
            className='flex min-h-0 flex-1 flex-col items-center justify-center gap-2'
            onClick={closeIfBackdrop}
          >
            <img
              src={src}
              alt={alt}
              className='max-h-full max-w-full cursor-zoom-out border border-line object-contain'
              onClick={closeFromImage}
            />
            <p className='text-micro text-fg-subtle'>
              {alt ? `${alt} · ` : ''}click outside or esc to close
            </p>
          </div>
        </dialog>
      )}
    </>
  );
};
