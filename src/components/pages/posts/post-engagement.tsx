import { For, Show, createMemo, createSignal, onMount } from 'solid-js';
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

export default function PostEngagement(props: PostEngagementProps) {
  const base = createMemo(() => normalizeEngagementApiBase(props.apiBase));

  const [stats, setStats] = createSignal<PostStats | null>(null);
  const [session, setSession] = createSignal<SessionResponse>({
    authenticated: false,
    user: null,
  });
  const [liked, setLiked] = createSignal(false);
  const [comments, setComments] = createSignal<CommentItem[]>([]);
  const [commentsCursor, setCommentsCursor] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [commentsLoading, setCommentsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [busyLike, setBusyLike] = createSignal(false);
  const [busyComment, setBusyComment] = createSignal(false);
  const [newBody, setNewBody] = createSignal('');
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editDraft, setEditDraft] = createSignal('');

  const authed = () =>
    session().authenticated === true && session().user !== null;

  async function refreshCore() {
    const b = base();
    const slug = props.postSlug;
    const s = await getStats(b, slug);
    setStats(s);
    const sess = await getSession(b);
    setSession(sess);
    if (sess.authenticated && sess.user) {
      try {
        const lm = await getLikeMe(b, slug);
        setLiked(lm.liked);
      } catch {
        setLiked(false);
      }
    } else {
      setLiked(false);
    }
  }

  async function loadComments(reset: boolean) {
    const b = base();
    const slug = props.postSlug;
    setCommentsLoading(true);
    try {
      const cursor = reset ? null : commentsCursor();
      const page = await getCommentsPage(b, slug, cursor);
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
    const b = base();
    if (!b) return;
    setError(null);
    setLoading(true);
    try {
      await refreshCore();
      await loadComments(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load engagement.');
    } finally {
      setLoading(false);
    }
  }

  onMount(() => {
    const b = base();
    if (!b) {
      setLoading(false);
      return;
    }
    void postView(b, props.postSlug);
    void refreshAll();
  });

  function oauthRedirectUri() {
    if (typeof window === 'undefined') return '';
    // Return a path (not full href): the callback only honors returnTo values
    // that start with '/' (open-redirect guard), so a full URL would drop you
    // on the home page instead of back on this post.
    return window.location.pathname + window.location.search;
  }

  async function onToggleLike() {
    const b = base();
    if (!b || !authed()) return;
    setBusyLike(true);
    setError(null);
    try {
      if (liked()) {
        await deleteLike(b, props.postSlug);
      } else {
        await putLike(b, props.postSlug);
      }
      await refreshCore();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Like failed.');
    } finally {
      setBusyLike(false);
    }
  }

  async function onSubmitNew(e: Event) {
    e.preventDefault();
    const b = base();
    const text = newBody().trim();
    if (!b || !authed() || text.length === 0) return;
    setBusyComment(true);
    setError(null);
    try {
      const created = await postComment(b, props.postSlug, text);
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
    const b = base();
    const text = editDraft().trim();
    if (!b || text.length === 0) return;
    setBusyComment(true);
    setError(null);
    try {
      const updated = await patchComment(b, id, text);
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
    const b = base();
    if (!b) return;
    setBusyComment(true);
    setError(null);
    try {
      await deleteComment(b, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      await refreshCore();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusyComment(false);
    }
  }

  async function onLogout() {
    const b = base();
    if (!b) return;
    setError(null);
    try {
      await postLogout(b);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed.');
    }
  }

  return (
    <section
      class='mt-10 rounded-md border border-edge bg-panel p-4 sm:p-6'
      aria-label='Post engagement'
    >
      <Show
        when={base()}
        fallback={
          <p class='text-xs text-subtle'>
            Engagement is disabled. Set{' '}
            <code class='rounded border border-edge bg-background px-1 py-0.5 text-[0.7rem]'>
              PUBLIC_ENGAGEMENT_API_URL
            </code>{' '}
            to your API base URL.
          </p>
        }
      >
        <Show
          when={!loading()}
          fallback={
            <p class='font-mono text-xs text-subtle'>loading engagement...'</p>
          }
        >
          <Show when={error()}>
            {(msg) => (
              <p
                class='mb-4 rounded-sm border border-edge bg-background px-3 py-2 font-mono text-xs text-muted-foreground'
                role='alert'
              >
                {msg()}
              </p>
            )}
          </Show>

          <div class='mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-edge pb-4 font-mono text-xs text-subtle'>
            <span title='Views'>
              views{' '}
              <span class='text-foreground'>
                {formatCount(stats()?.view_count ?? 0)}
              </span>
            </span>
            <span title='Likes'>
              likes{' '}
              <span class='text-foreground'>
                {formatCount(stats()?.like_count ?? 0)}
              </span>
            </span>
            <span title='Comments'>
              comments{' '}
              <span class='text-foreground'>
                {formatCount(stats()?.comment_count ?? 0)}
              </span>
            </span>
          </div>

          <div class='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div class='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                disabled={!authed() || busyLike()}
                onClick={() => void onToggleLike()}
                class='rounded-sm border px-3 py-2 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40'
                classList={{
                  'border-foreground text-foreground': liked(),
                  'border-edge text-subtle hover:border-muted hover:text-foreground':
                    !liked(),
                }}
                aria-pressed={liked()}
                aria-label={liked() ? 'Unlike post' : 'Like post'}
              >
                {liked() ? '♥ liked' : '♡ like'}
              </button>
              <Show when={!authed()}>
                <span class='text-xs text-subtle'>sign in to like</span>
              </Show>
            </div>

            <Show
              when={authed() ? session().user : false}
              fallback={
                <button
                  type='button'
                  class='rounded-sm border border-edge px-3 py-2 font-mono text-xs text-foreground transition-colors hover:border-muted'
                  onClick={() => {
                    const u = buildLoginUrl(base(), oauthRedirectUri());
                    window.location.href = u;
                  }}
                >
                  sign in with GitHub
                </button>
              }
            >
              {(u) => (
                <div class='flex flex-wrap items-center gap-3'>
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt=''
                      class='h-8 w-8 rounded-full border border-edge'
                      width={32}
                      height={32}
                    />
                  ) : null}
                  <span class='text-sm text-muted-foreground'>
                    {u.display_name}
                  </span>
                  <button
                    type='button'
                    onClick={() => void onLogout()}
                    class='rounded-sm border border-edge px-2 py-1 font-mono text-xs text-subtle hover:text-foreground'
                  >
                    log out
                  </button>
                </div>
              )}
            </Show>
          </div>

          <h2 class='mb-3 font-mono text-xs uppercase tracking-widest text-subtle'>
            [ comments ]
          </h2>

          <Show when={authed()}>
            <form onSubmit={onSubmitNew} class='mb-6 flex flex-col gap-2'>
              <label class='font-mono text-xs text-subtle' for='new-comment'>
                add a comment
              </label>
              <textarea
                id='new-comment'
                name='body'
                rows={3}
                value={newBody()}
                onInput={(e) => setNewBody(e.currentTarget.value)}
                placeholder='Plain text...'
                class='w-full resize-y rounded-md border border-edge bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-subtle focus:border-muted'
                maxLength={4000}
                disabled={busyComment()}
              />
              <div class='flex justify-end'>
                <button
                  type='submit'
                  disabled={busyComment() || newBody().trim().length === 0}
                  class='rounded-sm border border-edge px-3 py-2 font-mono text-xs text-foreground transition-colors hover:border-muted disabled:cursor-not-allowed disabled:opacity-40'
                >
                  post
                </button>
              </div>
            </form>
          </Show>

          <Show when={!authed()}>
            <p class='mb-6 text-xs text-subtle'>
              Sign in with GitHub to comment.
            </p>
          </Show>

          <ul class='flex flex-col gap-4'>
            <For each={comments()}>
              {(c) => (
                <li class='rounded-md border border-edge bg-background/40 px-3 py-3 sm:px-4'>
                  <div class='mb-2 flex flex-wrap items-center justify-between gap-2'>
                    <div class='flex items-center gap-2'>
                      {c.author.avatar_url ? (
                        <img
                          src={c.author.avatar_url}
                          alt=''
                          class='h-6 w-6 rounded-full border border-edge'
                          width={24}
                          height={24}
                        />
                      ) : null}
                      <span class='text-xs font-medium text-foreground'>
                        {c.author.display_name}
                      </span>
                      <span class='font-mono text-[0.65rem] text-subtle'>
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                      <Show when={c.edited_at}>
                        <span class='font-mono text-[0.65rem] text-subtle'>
                          (edited)
                        </span>
                      </Show>
                    </div>
                    <Show when={c.mine}>
                      <div class='flex gap-2'>
                        <Show
                          when={editingId() === c.id}
                          fallback={
                            <>
                              <button
                                type='button'
                                class='font-mono text-[0.65rem] text-subtle hover:text-foreground'
                                onClick={() => {
                                  setEditingId(c.id);
                                  setEditDraft(c.body);
                                }}
                              >
                                edit
                              </button>
                              <button
                                type='button'
                                class='font-mono text-[0.65rem] text-subtle hover:text-foreground'
                                onClick={() => void onDelete(c.id)}
                              >
                                delete
                              </button>
                            </>
                          }
                        >
                          <button
                            type='button'
                            class='font-mono text-[0.65rem] text-subtle hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
                            onClick={() => {
                              setEditingId(null);
                              setEditDraft('');
                            }}
                            disabled={busyComment()}
                          >
                            cancel
                          </button>
                          <button
                            type='button'
                            class='font-mono text-[0.65rem] text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40'
                            onClick={() => void onSaveEdit(c.id)}
                            disabled={
                              busyComment() || editDraft().trim().length === 0
                            }
                          >
                            {busyComment() ? 'saving...' : 'save'}
                          </button>
                        </Show>
                      </div>
                    </Show>
                  </div>
                  <Show
                    when={editingId() === c.id}
                    fallback={
                      <p class='whitespace-pre-wrap text-xs text-muted-foreground'>
                        {c.body}
                      </p>
                    }
                  >
                    <textarea
                      rows={3}
                      value={editDraft()}
                      onInput={(e) => setEditDraft(e.currentTarget.value)}
                      class='w-full resize-y rounded-md border border-edge bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted'
                      maxLength={4000}
                      disabled={busyComment()}
                    />
                  </Show>
                </li>
              )}
            </For>
          </ul>

          <Show when={comments().length === 0 && !commentsLoading()}>
            <p class='mt-2 text-xs text-subtle'>no comments yet.</p>
          </Show>

          <Show when={commentsCursor()}>
            <div class='mt-4 flex justify-center'>
              <button
                type='button'
                disabled={commentsLoading()}
                onClick={() => void loadComments(false)}
                class='rounded-sm border border-edge px-4 py-2 font-mono text-xs text-subtle hover:text-foreground disabled:opacity-50'
              >
                {commentsLoading() ? 'loading...' : 'load more'}
              </button>
            </div>
          </Show>
        </Show>
      </Show>
    </section>
  );
}
