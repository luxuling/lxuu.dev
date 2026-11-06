import { useState } from 'react';
import { CommentInput } from '@/components/comment-input';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { LoadingImage } from '@/components/loading-image';
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

  const isEditing = draft !== null;

  return (
    <li
      className={`flex flex-col gap-2 border-l pl-3 ${isEditing ? 'border-fg-muted' : 'border-line'}`}
    >
      <div className='flex flex-wrap items-center justify-between gap-x-4'>
        <div className='flex min-w-0 flex-wrap items-center gap-x-2'>
          {comment.author.avatar_url && (
            <LoadingImage
              src={comment.author.avatar_url}
              alt=''
              width={20}
              height={20}
              frameClassName='size-5 shrink-0'
              className='size-full object-cover'
            />
          )}
          <span className='font-semibold text-fg'>
            {comment.author.display_name}
          </span>
          <span className='text-micro whitespace-pre text-fg-subtle'>
            <time dateTime={comment.created_at}>
              {TIMESTAMP.format(new Date(comment.created_at))}
            </time>
            {comment.edited_at && '  (edited)'}
          </span>
        </div>

        {comment.mine && !isEditing && (
          <div className='text-micro text-fg-subtle'>
            <TerminalButton onClick={() => setDraft(comment.body)}>
              edit
            </TerminalButton>
            {' · '}
            <TerminalButton onClick={deleteDialog.open}>delete</TerminalButton>
          </div>
        )}

        {comment.mine && isEditing && (
          <div className='text-micro text-fg'>
            <TerminalButton onClick={() => setDraft(null)} disabled={isBusy}>
              cancel
            </TerminalButton>
            {' · '}
            <TerminalButton
              onClick={() => void save(draft)}
              disabled={isBusy || draft.trim().length === 0}
            >
              {isBusy ? <Spinner /> : 'save'}
            </TerminalButton>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className='border border-fg-muted px-3 py-2'>
          <CommentInput
            ref={focusAtEnd}
            aria-label='Edit comment'
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            disabled={isBusy}
          />
        </div>
      ) : (
        <p className='wrap-break-word whitespace-pre-wrap text-fg-muted'>
          {comment.body}
        </p>
      )}

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
