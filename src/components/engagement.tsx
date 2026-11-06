import { Fragment } from 'react';
import { CommentForm } from '@/components/comment-form';
import { CommentItem } from '@/components/comment-item';
import { EngagementSession } from '@/components/engagement-session';
import { LoginDialog } from '@/components/login-dialog';
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

interface EngagementProps {
  engagement: EngagementState;
}

interface BodyProps extends EngagementProps {
  path: string;
}

const SECTION_LABEL: Record<EngagementTarget, string> = {
  posts: 'Post engagement',
  projects: 'Project engagement',
};

const COMMAND_HINTS = '/login  /like  /unlike  /help';

const StatsLine = ({ engagement }: EngagementProps) => {
  if (!engagement.stats) return <span>{'<3 – · [..] – · (o) –'}</span>;

  const { like_count, comment_count, view_count } = engagement.stats;
  const liked = engagement.isLiked ? ' (liked)' : '';

  return (
    <span>{`<3 ${like_count}${liked} · [..] ${comment_count} · (o) ${view_count}`}</span>
  );
};

const CommandHelp = () => (
  <dl
    className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 self-start'
    role='status'
  >
    {Object.entries(PROMPT_COMMANDS).map(([name, description]) => (
      <Fragment key={name}>
        <dt className='text-fg'>{name}</dt>
        <dd className='text-fg-subtle'>{description}</dd>
      </Fragment>
    ))}
  </dl>
);

const CommentList = ({ engagement }: EngagementProps) => (
  <>
    <h3 className='sr-only'>Comments</h3>

    {engagement.comments.length > 0 ? (
      <ul className='flex flex-col gap-4'>
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
    ) : (
      !engagement.isLoadingComments && (
        <p className='text-fg-subtle'>no comments yet</p>
      )
    )}

    {engagement.hasMoreComments && (
      <div className='self-center text-micro text-fg-subtle'>
        {engagement.isLoadingComments ? (
          <span className='text-small text-fg-muted' role='status'>
            [ <Spinner /> ]
          </span>
        ) : (
          <TerminalButton onClick={() => void engagement.loadMoreComments()}>
            [ load more ]
          </TerminalButton>
        )}
      </div>
    )}
  </>
);

const EngagementBody = ({ path, engagement }: BodyProps) => {
  const isIdle = !engagement.isHelpShown && !engagement.error;

  return (
    <>
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

      {isIdle && !engagement.user && (
        <p className='text-micro whitespace-pre text-fg-subtle'>
          {COMMAND_HINTS}
        </p>
      )}

      {engagement.isHelpShown && <CommandHelp />}

      {engagement.error && (
        <p className='text-fg' role='alert'>
          [!] error: {engagement.error}
        </p>
      )}

      <hr className='border-line' />

      <CommentList engagement={engagement} />

      {engagement.isLoginOpen && (
        <LoginDialog
          onContinue={engagement.signIn}
          onClose={engagement.closeLogin}
        />
      )}
    </>
  );
};

export const Engagement = ({ target, slug }: Props) => {
  const engagement = useEngagement(target, slug);

  return (
    <section
      className='flex flex-col border border-line bg-surface/40 text-small'
      aria-label={SECTION_LABEL[target]}
    >
      <header className='flex items-center justify-between gap-4 border-b border-line px-4 py-3'>
        <h2 className='text-fg-muted'>── comments ──</h2>
        <p className='text-fg-subtle'>
          <StatsLine engagement={engagement} />
        </p>
      </header>

      <div className='flex flex-col gap-4 p-4'>
        {engagement.isLoading ? (
          <p className='text-fg-muted' role='status'>
            fetching <Spinner />
          </p>
        ) : (
          <EngagementBody
            path={`~/${target}/${slug}`}
            engagement={engagement}
          />
        )}
      </div>
    </section>
  );
};
