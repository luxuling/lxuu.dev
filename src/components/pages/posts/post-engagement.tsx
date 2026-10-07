import { useEffect, useState } from 'react';
import { Spinner } from '@components/icons/spinner';
import {
  type CommentItem,
  type PostStats,
  type SessionResponse,
  buildLoginUrl,
  deleteComment,
  deleteLike,
  getCommentsPage,
  getLikeMe,
  getSession,
  getStats,
  normalizeEngagementApiBase,
  patchComment,
  postComment,
  postLogout,
  postView,
  putLike,
} from '@lib/engagement/engagement-api';

export interface PostEngagementProps {
  postSlug: string;
  apiBase: string;
}

function formatCount(n: number) {
  return n.toLocaleString();
}

export default function PostEngagement({
  postSlug,
  apiBase,
}: PostEngagementProps) {
  const base = normalizeEngagementApiBase(apiBase);

  const [stats, setStats] = useState<PostStats | null>(null);
  const [session, setSession] = useState<SessionResponse>({
    authenticated: false,
    user: null,
  });
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsCursor, setCommentsCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyLike, setBusyLike] = useState(false);
  const [busyComment, setBusyComment] = useState(false);
  const [newBody, setNewBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const user = session.authenticated ? session.user : null;
  const authed = user !== null;

  async function refreshCore() {
    const [s, sess, lm] = await Promise.all([
      getStats(base, postSlug),
      getSession(base),
      getLikeMe(base, postSlug).catch(() => ({ liked: false })),
    ]);
    setStats(s);
    setSession(sess);
    setLiked(lm.liked);
  }

  async function loadComments(reset: boolean) {
    setCommentsLoading(true);
    try {
      const cursor = reset ? null : commentsCursor;
      const page = await getCommentsPage(base, postSlug, cursor);
      if (reset) {
        setComments(page.items);
      } else {
        setComments((prev) => [...prev, ...page.items]);
      }
      setCommentsCursor(page.next_cursor);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function refreshAll() {
    if (!base) return;
    setError(null);
    setLoading(true);
    try {
      await Promise.all([refreshCore(), loadComments(true)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load engagement.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!base) {
      setLoading(false);
      return;
    }
    void postView(base, postSlug);
    void refreshAll();
  }, [base, postSlug]);

  function oauthRedirectUri() {
    if (typeof window === 'undefined') return '';
    // Return a path (not full href): the callback only honors returnTo values
    // that start with '/' (open-redirect guard), so a full URL would drop you
    // on the home page instead of back on this post.
    return window.location.pathname + window.location.search;
  }

  async function onToggleLike() {
    if (!base || !authed) return;
    setBusyLike(true);
    setError(null);
    try {
      if (liked) {
        await deleteLike(base, postSlug);
      } else {
        await putLike(base, postSlug);
      }
      await refreshCore();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Like failed.');
    } finally {
      setBusyLike(false);
    }
  }

  async function onSubmitNew() {
    const text = newBody.trim();
    if (!base || !authed || text.length === 0) return;
    setBusyComment(true);
    setError(null);
    try {
      const created = await postComment(base, postSlug, text);
      setNewBody('');
      setComments((prev) => [created, ...prev]);
      await refreshCore();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comment failed.');
    } finally {
      setBusyComment(false);
    }
  }

  async function onSaveEdit(id: string) {
    const text = editDraft.trim();
    if (!base || text.length === 0) return;
    setBusyComment(true);
    setError(null);
    try {
      const updated = await patchComment(base, id, text);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...updated, mine: true } : c)),
      );
      setEditingId(null);
      setEditDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusyComment(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this comment?')) return;
    if (!base) return;
    setBusyComment(true);
    setError(null);
    try {
      await deleteComment(base, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      await refreshCore();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusyComment(false);
    }
  }

  async function onLogout() {
    if (!base) return;
    setError(null);
    try {
      await postLogout(base);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed.');
    }
  }

  function renderBody() {
    if (!base) {
      return (
        <p className='text-xs text-subtle'>
          Engagement is disabled. Set{' '}
          <code className='rounded border border-edge bg-background px-1 py-0.5 text-[0.7rem]'>
            PUBLIC_ENGAGEMENT_API_URL
          </code>{' '}
          to your API base URL.
        </p>
      );
    }

    if (loading) {
      return (
        <div className='py-2'>
          <div
            className='h-1 w-full overflow-hidden rounded-full bg-background'
            role='progressbar'
            aria-label='Loading engagement'
          >
            <div className='h-full w-1/3 animate-indeterminate rounded-full bg-foreground' />
          </div>
        </div>
      );
    }

    return (
      <>
        {error && (
          <p
            className='mb-4 rounded-sm border border-edge bg-background px-3 py-2 font-mono text-xs text-muted-foreground'
            role='alert'
          >
            {error}
          </p>
        )}

        <div className='mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-edge pb-4 font-mono text-xs text-subtle'>
          <span title='Views'>
            views{' '}
            <span className='text-foreground'>
              {formatCount(stats?.view_count ?? 0)}
            </span>
          </span>
          <span title='Likes'>
            likes{' '}
            <span className='text-foreground'>
              {formatCount(stats?.like_count ?? 0)}
            </span>
          </span>
          <span title='Comments'>
            comments{' '}
            <span className='text-foreground'>
              {formatCount(stats?.comment_count ?? 0)}
            </span>
          </span>
        </div>

        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              disabled={!authed || busyLike}
              onClick={() => void onToggleLike()}
              className={`rounded-sm border px-3 py-2 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                liked
                  ? 'border-foreground text-foreground'
                  : 'border-edge text-subtle hover:border-muted hover:text-foreground'
              }`}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike post' : 'Like post'}
            >
              {liked ? '♥ liked' : '♡ like'}
            </button>
            {!authed && (
              <span className='text-xs text-subtle'>sign in to like</span>
            )}
          </div>

          {user ? (
            <div className='flex flex-wrap items-center gap-3'>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=''
                  className='h-8 w-8 rounded-full border border-edge'
                  width={32}
                  height={32}
                />
              ) : null}
              <span className='text-sm text-muted-foreground'>
                {user.display_name}
              </span>
              <button
                type='button'
                onClick={() => void onLogout()}
                className='rounded-sm border border-edge px-2 py-1 font-mono text-xs text-subtle hover:text-foreground'
              >
                log out
              </button>
            </div>
          ) : (
            <button
              type='button'
              className='rounded-sm border border-edge px-3 py-2 font-mono text-xs text-foreground transition-colors hover:border-muted'
              onClick={() => {
                window.location.href = buildLoginUrl(base, oauthRedirectUri());
              }}
            >
              sign in with GitHub
            </button>
          )}
        </div>

        <h2 className='mb-3 font-mono text-xs uppercase tracking-widest text-subtle'>
          [ comments ]
        </h2>

        {authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmitNew();
            }}
            className='mb-6 flex flex-col gap-2'
          >
            <label
              className='font-mono text-xs text-subtle'
              htmlFor='new-comment'
            >
              add a comment
            </label>
            <textarea
              id='new-comment'
              name='body'
              rows={3}
              value={newBody}
              onChange={(e) => setNewBody(e.currentTarget.value)}
              placeholder='Plain text...'
              className='w-full resize-y rounded-md border border-edge bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-subtle focus:border-muted'
              maxLength={4000}
              disabled={busyComment}
            />
            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={busyComment || newBody.trim().length === 0}
                className='rounded-sm border border-edge px-3 py-2 font-mono text-xs text-foreground transition-colors hover:border-muted disabled:cursor-not-allowed disabled:opacity-40'
              >
                post
              </button>
            </div>
          </form>
        ) : (
          <p className='mb-6 text-xs text-subtle'>
            Sign in with GitHub to comment.
          </p>
        )}

        <ul className='flex flex-col gap-4'>
          {comments.map((c) => {
            const editing = editingId === c.id;
            return (
              <li
                key={c.id}
                className='rounded-md border border-edge bg-background/40 px-3 py-3 sm:px-4'
              >
                <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    {c.author.avatar_url ? (
                      <img
                        src={c.author.avatar_url}
                        alt=''
                        className='h-6 w-6 rounded-full border border-edge'
                        width={24}
                        height={24}
                      />
                    ) : null}
                    <span className='text-xs font-medium text-foreground'>
                      {c.author.display_name}
                    </span>
                    <span className='font-mono text-[0.65rem] text-subtle'>
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                    {c.edited_at && (
                      <span className='font-mono text-[0.65rem] text-subtle'>
                        (edited)
                      </span>
                    )}
                  </div>
                  {c.mine && (
                    <div className='flex gap-2'>
                      {editing ? (
                        <>
                          <button
                            type='button'
                            className='font-mono text-[0.65rem] text-subtle hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
                            onClick={() => {
                              setEditingId(null);
                              setEditDraft('');
                            }}
                            disabled={busyComment}
                          >
                            cancel
                          </button>
                          <button
                            type='button'
                            className='font-mono text-[0.65rem] text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40'
                            onClick={() => void onSaveEdit(c.id)}
                            disabled={
                              busyComment || editDraft.trim().length === 0
                            }
                          >
                            {busyComment ? (
                              <Spinner className='font-mono text-[0.65rem] text-foreground' />
                            ) : (
                              'save'
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type='button'
                            className='font-mono text-[0.65rem] text-subtle hover:text-foreground'
                            onClick={() => {
                              setEditingId(c.id);
                              setEditDraft(c.body);
                            }}
                          >
                            edit
                          </button>
                          <button
                            type='button'
                            className='font-mono text-[0.65rem] text-subtle hover:text-foreground'
                            onClick={() => void onDelete(c.id)}
                          >
                            delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {editing ? (
                  <textarea
                    rows={3}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.currentTarget.value)}
                    className='w-full resize-y rounded-md border border-edge bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted'
                    maxLength={4000}
                    disabled={busyComment}
                  />
                ) : (
                  <p className='whitespace-pre-wrap text-xs text-muted-foreground'>
                    {c.body}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {comments.length === 0 && !commentsLoading && (
          <p className='mt-2 text-xs text-subtle'>no comments yet.</p>
        )}

        {commentsCursor && (
          <div className='mt-4 flex justify-center'>
            <button
              type='button'
              disabled={commentsLoading}
              onClick={() => void loadComments(false)}
              className='rounded-sm border border-edge px-4 py-2 font-mono text-xs text-subtle hover:text-foreground disabled:opacity-50'
            >
              {commentsLoading ? <Spinner /> : 'load more'}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <section
      className='mt-10 rounded-md border border-edge bg-panel p-4 sm:p-6'
      aria-label='Post engagement'
    >
      {renderBody()}
    </section>
  );
}
