import { useState } from 'react';
import { TerminalDialog } from '@/components/confirm-dialog';
import { Spinner } from '@/components/spinner';
import { buttonClass } from '@/utils/button-class';

interface Props {
  onContinue: () => void;
  onClose: () => void;
}

export const LoginDialog = ({ onContinue, onClose }: Props) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const continueWithGithub = () => {
    setIsRedirecting(true);
    onContinue();
  };

  return (
    <TerminalDialog title='sign in' className='max-w-100' onClose={onClose}>
      <div className='flex flex-col gap-4 p-4'>
        <p className='text-small text-fg-subtle'>$ /login</p>
        <p className='text-title font-semibold'>sign in to like and comment.</p>
        <button
          type='button'
          className={`${buttonClass()} w-full`}
          onClick={continueWithGithub}
          disabled={isRedirecting}
          data-autofocus
        >
          {isRedirecting ? (
            <>
              redirecting to github <Spinner />
            </>
          ) : (
            '[gh] continue with github'
          )}
        </button>
        <p className='text-small text-fg-subtle'>
          github shares your name, avatar and email. nothing is posted as you.
        </p>
      </div>
      <footer className='flex justify-between border-t border-line px-4 py-3 text-micro text-fg-subtle'>
        <span>esc to cancel</span>
        <span>via github oauth</span>
      </footer>
    </TerminalDialog>
  );
};
