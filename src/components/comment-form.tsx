import { useState, type KeyboardEvent } from 'react';
import { CommentInput } from '@/components/comment-input';
import { TerminalButton } from '@/components/terminal-button';
import type { EngagementState } from '@/hooks/use-engagement';

interface Props {
  placeholder: string;
  isBusy: boolean;
  onSubmit: EngagementState['submitPrompt'];
}

const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
  const isNewline = event.shiftKey || event.nativeEvent.isComposing;
  if (event.key !== 'Enter' || isNewline) return;

  event.preventDefault();
  event.currentTarget.requestSubmit();
};

export const CommentForm = ({ placeholder, isBusy, onSubmit }: Props) => {
  const [body, setBody] = useState('');

  const submit = () => {
    const input = body.trim();
    if (!input) return;

    setBody('');
    onSubmit(input);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      onKeyDown={submitOnEnter}
      className='flex items-end gap-4'
    >
      <CommentInput
        name='body'
        aria-label='Comment'
        placeholder={placeholder}
        value={body}
        onChange={(event) => setBody(event.currentTarget.value)}
        readOnly={isBusy}
      />
      <TerminalButton
        type='submit'
        disabled={isBusy || body.trim().length === 0}
      >
        post
      </TerminalButton>
    </form>
  );
};
