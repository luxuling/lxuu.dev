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
    className='m-auto w-80 max-w-[calc(100vw-2rem)] rounded-md border border-edge bg-panel p-5 font-mono text-xs/6 text-foreground backdrop:bg-background/70 backdrop:backdrop-blur-sm'
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
