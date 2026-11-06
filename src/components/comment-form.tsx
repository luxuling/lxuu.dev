import { useState, type KeyboardEvent } from 'react';
import { CommentInput } from '@/components/comment-input';
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
      className='flex items-start gap-3 border border-line-strong px-4 py-3 transition-colors focus-within:border-fg-muted'
    >
      <span className='text-fg' aria-hidden='true'>
        &gt;
      </span>
      <CommentInput
        name='body'
        aria-label='Comment'
        placeholder={placeholder}
        value={body}
        onChange={(event) => setBody(event.currentTarget.value)}
        readOnly={isBusy}
      />
      <button
        type='submit'
        disabled={isBusy || body.trim().length === 0}
        className='shrink-0 cursor-pointer whitespace-pre text-fg disabled:cursor-default disabled:text-fg-subtle'
      >
        [ post ]
      </button>
    </form>
  );
};
