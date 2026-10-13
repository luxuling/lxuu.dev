import { Fragment } from 'react';
import { CommentForm } from '@/components/comment-form';
import { CommentItem } from '@/components/comment-item';
import { EngagementSession } from '@/components/engagement-session';
import { PromptBlock } from '@/components/prompt-block';
import { Spinner } from '@/components/spinner';
import { TerminalButton } from '@/components/terminal-button';
import {
  PROMPT_COMMANDS,
  useEngagement,
  type EngagementState,
} from '@/hooks/use-engagement';
import type { EngagementTarget } from '@/services/engagement-targets';

interface Props {
  target: EngagementTarget;
  slug: string;
}

interface BodyProps {
  path: string;
  engagement: EngagementState;
}

interface CountProps {
  label: string;
  count: number;
}

const SECTION_LABEL: Record<EngagementTarget, string> = {
  posts: 'Post engagement',
  projects: 'Project engagement',
};

const Count = ({ label, count }: CountProps) => (
  <span>
    {label} <span className='text-foreground'>{count.toLocaleString()}</span>
  </span>
);

const EngagementBody = ({ path, engagement }: BodyProps) => (
  <>
    <div className='flex flex-col gap-2'>
      <PromptBlock isActive>
        <div className='flex flex-wrap items-center gap-x-5 text-subtle'>
          <span>
            <Count label='likes' count={engagement.stats?.like_count ?? 0} />
            {engagement.isLiked && ' (liked)'}
          </span>
          <Count
            label='comments'
            count={engagement.stats?.comment_count ?? 0}
          />
          <Count label='views' count={engagement.stats?.view_count ?? 0} />
        </div>

        <EngagementSession path={path} user={engagement.user} />

        <CommentForm
          placeholder={
            engagement.user
              ? 'write a comment, or /help'
              : '/login to sign in, /help for more'
          }
          isBusy={engagement.isCommentBusy}
          onSubmit={engagement.submitPrompt}
        />
      </PromptBlock>

      {engagement.isHelpShown && (
        <dl className='grid grid-cols-[auto_1fr] gap-x-4' role='status'>
          {Object.entries(PROMPT_COMMANDS).map(([name, description]) => (
            <Fragment key={name}>
              <dt className='text-foreground'>{name}</dt>
              <dd className='text-subtle'>{description}</dd>
            </Fragment>
          ))}
        </dl>
      )}

      {engagement.error && (
        <p className='text-failure' role='alert'>
          error: {engagement.error}
        </p>
      )}
    </div>

    <div>
      <h2 className='sr-only'>Comments</h2>

      <ul className='flex flex-col gap-5'>
        {engagement.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isBusy={engagement.isCommentBusy}
            onEdit={engagement.editComment}
            onDelete={engagement.removeComment}
          />
        ))}
      </ul>

      {engagement.comments.length === 0 && !engagement.isLoadingComments && (
        <p className='text-subtle'>no comments yet</p>
      )}

      {engagement.hasMoreComments && (
        <div className='mt-5'>
          <TerminalButton
            disabled={engagement.isLoadingComments}
            onClick={() => void engagement.loadMoreComments()}
          >
            {engagement.isLoadingComments ? (
              <Spinner className='inline' />
            ) : (
              'load more'
            )}
          </TerminalButton>
        </div>
      )}
    </div>
  </>
);

export const Engagement = ({ target, slug }: Props) => {
  const engagement = useEngagement(target, slug);

  return (
    <section
      className='mt-10 flex flex-col gap-6 rounded-md border border-edge bg-panel p-4 font-mono text-xs/6 sm:p-6'
      aria-label={SECTION_LABEL[target]}
    >
      {engagement.isLoading ? (
        <p
          className='flex gap-2 text-muted-foreground'
          role='status'
          aria-label='Loading engagement'
        >
          fetching
          <Spinner className='text-foreground' />
        </p>
      ) : (
        <EngagementBody path={`~/${target}/${slug}`} engagement={engagement} />
      )}
    </section>
  );
};
