import { useEffect, useState, type Dispatch } from 'react';
import {
  buildLoginUrl,
  createComment,
  deleteComment,
  getCommentsPage,
  getLiked,
  getSessionUser,
  getStats,
  logout,
  sendView,
  setLiked,
  updateComment,
  type EngagementComment,
  type EngagementStats,
  type EngagementUser,
} from '@/services/engagement-api';
import type { EngagementTarget } from '@/services/engagement-targets';
import { showToast } from '@/utils/toast';

type SetBusy = Dispatch<boolean>;

type PromptCommand = keyof typeof PROMPT_COMMANDS;

export const PROMPT_COMMANDS = {
  '/login': 'sign in with github',
  '/logout': 'sign out',
  '/like': 'like this page',
  '/unlike': 'remove your like',
  '/help': 'list commands',
} as const;

const COMMAND_PATTERN = /^\/\S+$/;
const LOGIN_REQUIRED = 'not logged in. type /login to sign in with github.';

const isPromptCommand = (input: string): input is PromptCommand =>
  Object.hasOwn(PROMPT_COMMANDS, input);

const signIn = () => {
  // NOTE: the callback only honors same-origin return paths, so send a path and not the full href
  const returnPath = window.location.pathname + window.location.search;

  window.location.href = buildLoginUrl(returnPath);
};

export type EngagementState = ReturnType<typeof useEngagement>;

export const useEngagement = (target: EngagementTarget, slug: string) => {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [user, setUser] = useState<EngagementUser | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<EngagementComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isHelpShown, setIsHelpShown] = useState(false);
  const [isCommentBusy, setIsCommentBusy] = useState(false);

  const run = async (
    setBusy: SetBusy,
    action: () => Promise<void>,
    successMessage?: string,
  ) => {
    setError(null);
    setBusy(true);

    try {
      await action();
      if (successMessage) showToast(successMessage);

      return true;
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setError(error.message);

      return false;
    } finally {
      setBusy(false);
    }
  };

  const refreshSummary = async () => {
    const [nextStats, nextUser] = await Promise.all([
      getStats(target, slug),
      getSessionUser(),
    ]);
    const nextIsLiked = nextUser ? await getLiked(target, slug) : false;

    setStats(nextStats);
    setUser(nextUser);
    setIsLiked(nextIsLiked);
  };

  const loadFirstComments = async () => {
    const page = await getCommentsPage(target, slug, null);

    setComments(page.items);
    setNextCursor(page.next_cursor);
  };

  const loadAll = async () => {
    await Promise.all([refreshSummary(), loadFirstComments()]);
  };

  useEffect(() => {
    sendView(target, slug);
    void run(setIsLoading, loadAll);
  }, [target, slug]);

  const saveLike = (liked: boolean) =>
    run(
      setIsCommentBusy,
      async () => {
        if (!user) throw new Error(LOGIN_REQUIRED);

        await setLiked(target, slug, liked);
        await refreshSummary();
      },
      liked ? 'liked' : 'like removed',
    );

  const loadMoreComments = () =>
    run(setIsLoadingComments, async () => {
      const page = await getCommentsPage(target, slug, nextCursor);

      setComments((previous) => [...previous, ...page.items]);
      setNextCursor(page.next_cursor);
    });

  const addComment = (body: string) =>
    run(
      setIsCommentBusy,
      async () => {
        if (!user) throw new Error(LOGIN_REQUIRED);

        const created = await createComment(target, slug, body);

        setComments((previous) => [created, ...previous]);
        await refreshSummary();
      },
      'comment posted',
    );

  const editComment = (id: string, body: string) =>
    run(
      setIsCommentBusy,
      async () => {
        const updated = await updateComment(id, body);

        setComments((previous) =>
          previous.map((comment) => (comment.id === id ? updated : comment)),
        );
      },
      'comment updated',
    );

  const removeComment = (id: string) =>
    run(
      setIsCommentBusy,
      async () => {
        await deleteComment(id);

        setComments((previous) =>
          previous.filter((comment) => comment.id !== id),
        );
        await refreshSummary();
      },
      'comment deleted',
    );

  const signOut = () =>
    run(
      setIsLoading,
      async () => {
        await logout();
        await loadAll();
      },
      'logged out',
    );

  const commandActions: Record<PromptCommand, () => void> = {
    '/login': signIn,
    '/logout': () => (user ? void signOut() : setError(LOGIN_REQUIRED)),
    '/like': () => void saveLike(true),
    '/unlike': () => void saveLike(false),
    '/help': () => setIsHelpShown(true),
  };

  const submitPrompt = (input: string) => {
    setError(null);
    setIsHelpShown(false);

    if (isPromptCommand(input)) return commandActions[input]();

    if (COMMAND_PATTERN.test(input)) {
      return setError(
        `unknown command: ${input}. type /help to list commands.`,
      );
    }

    void addComment(input);
  };

  return {
    stats,
    user,
    isLiked,
    comments,
    hasMoreComments: nextCursor !== null,
    error,
    isLoading,
    isLoadingComments,
    isHelpShown,
    isCommentBusy,
    loadMoreComments,
    submitPrompt,
    editComment,
    removeComment,
  };
};
