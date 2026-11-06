import { TerminalButton } from '@/components/terminal-button';

interface Props {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

const showModal = (dialog: HTMLDialogElement | null) => dialog?.showModal();

export const ConfirmDialog = ({
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: Props) => (
  <dialog
    ref={showModal}
    onClose={onClose}
    className='m-auto w-80 max-w-[calc(100vw-2rem)] border border-line bg-surface p-5 font-mono text-xs/6 text-fg backdrop:bg-bg/70'
  >
    <p className='text-sm/6'>{message}</p>
    <form method='dialog' className='mt-4 flex justify-end gap-5'>
      <TerminalButton type='submit' autoFocus>
        cancel
      </TerminalButton>
      <TerminalButton isDanger onClick={onConfirm}>
        {confirmLabel}
      </TerminalButton>
    </form>
  </dialog>
);
