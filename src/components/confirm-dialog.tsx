import type { ReactNode } from 'react';
import { buttonClass } from '@/utils/button-class';

interface DialogProps {
  title: string;
  className: string;
  onClose: () => void;
  children: ReactNode;
}

interface Props {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

const showModal = (dialog: HTMLDialogElement | null) => {
  if (!dialog) return;

  dialog.showModal();
  dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
};

export const TerminalDialog = ({
  title,
  className,
  onClose,
  children,
}: DialogProps) => (
  <dialog
    ref={showModal}
    onClose={onClose}
    className={`m-auto w-[calc(100vw-2rem)] border border-line-strong bg-surface/40 p-0 text-fg backdrop-blur-sm backdrop:bg-bg/70 backdrop:backdrop-blur-sm ${className}`}
  >
    <header className='flex items-center justify-between border-b border-line px-4 py-3 text-small'>
      <h2 className='text-fg-muted'>── {title} ──</h2>
      <form method='dialog'>
        <button
          type='submit'
          aria-label='Close'
          className='cursor-pointer text-fg hover:text-fg-muted'
        >
          [x]
        </button>
      </form>
    </header>
    {children}
  </dialog>
);

export const ConfirmDialog = ({
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: Props) => (
  <TerminalDialog title='confirm' className='max-w-80' onClose={onClose}>
    <div className='flex flex-col gap-4 p-4'>
      <p className='text-body'>{message}</p>
      <div className='flex justify-end gap-3'>
        <form method='dialog'>
          <button type='submit' className={buttonClass('ghost')} data-autofocus>
            cancel
          </button>
        </form>
        <button type='button' className={buttonClass()} onClick={onConfirm}>
          [!] {confirmLabel}
        </button>
      </div>
    </div>
  </TerminalDialog>
);
