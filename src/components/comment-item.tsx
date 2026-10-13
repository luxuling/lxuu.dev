import { useState } from 'react';
import { CommentInput } from '@/components/comment-input';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { LoadingImage } from '@/components/loading-image';
import { PromptBlock } from '@/components/prompt-block';
import { Spinner } from '@/components/spinner';
import { TerminalButton } from '@/components/terminal-button';
import type { EngagementState } from '@/hooks/use-engagement';
import { useToggle } from '@/hooks/use-toggle';
import type { EngagementComment } from '@/services/engagement-api';

interface Props {
  comment: EngagementComment;
  isBusy: boolean;
  onEdit: EngagementState['editComment'];
  onDelete: EngagementState['removeComment'];
}

// NOTE: sv-SE is the locale that prints YYYY-MM-DD HH:mm
const TIMESTAMP = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const focusAtEnd = (textarea: HTMLTextAreaElement | null) => {
  if (!textarea) return;

  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
};

export const CommentItem = ({ comment, isBusy, onEdit, onDelete }: Props) => {
  const [draft, setDraft] = useState<string | null>(null);
  const deleteDialog = useToggle();

  const save = async (body: string) => {
    const isSaved = await onEdit(comment.id, body.trim());
    if (isSaved) setDraft(null);
  };

  const confirmDelete = () => {
    deleteDialog.close();
    void onDelete(comment.id);
  };

  return (
    <li>
      <PromptBlock isActive={draft !== null}>
        <div className='flex flex-wrap items-center justify-between gap-x-4'>
          <div className='flex min-w-0 flex-wrap items-center gap-x-2'>
            {comment.author.avatar_url && (
              <LoadingImage
                src={comment.author.avatar_url}
                alt=''
                width={20}
                height={20}
                frameClassName='size-5 shrink-0 rounded-sm'
                className='size-full object-cover'
              />
            )}
            <span className='text-foreground'>
              {comment.author.display_name}
            </span>
            <time dateTime={comment.created_at} className='text-subtle'>
              {TIMESTAMP.format(new Date(comment.created_at))}
            </time>
            {comment.edited_at && <span className='text-subtle'>(edited)</span>}
          </div>

          {comment.mine && draft === null && (
            <div className='flex gap-4'>
              <TerminalButton onClick={() => setDraft(comment.body)}>
                edit
              </TerminalButton>
              <TerminalButton onClick={deleteDialog.open}>
                delete
              </TerminalButton>
            </div>
          )}

          {comment.mine && draft !== null && (
            <div className='flex gap-4'>
              <TerminalButton onClick={() => setDraft(null)} disabled={isBusy}>
                cancel
              </TerminalButton>
              <TerminalButton
                onClick={() => void save(draft)}
                disabled={isBusy || draft.trim().length === 0}
              >
                {isBusy ? <Spinner className='inline' /> : 'save'}
              </TerminalButton>
            </div>
          )}
        </div>

        {draft === null ? (
          <p className='text-sm/6 wrap-break-word whitespace-pre-wrap text-muted-foreground'>
            {comment.body}
          </p>
        ) : (
          <CommentInput
            ref={focusAtEnd}
            aria-label='Edit comment'
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            disabled={isBusy}
          />
        )}
      </PromptBlock>

      {deleteDialog.isOpen && (
        <ConfirmDialog
          message='delete this comment?'
          confirmLabel='delete'
          onConfirm={confirmDelete}
          onClose={deleteDialog.close}
        />
      )}
    </li>
  );
};
