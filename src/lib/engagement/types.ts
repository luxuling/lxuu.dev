export interface PostStats {
  post_slug: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface ProjectStats {
  project_slug: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface SessionUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

export interface LikeMeResponse {
  liked: boolean;
}

export interface CommentAuthor {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface CommentItem {
  id: string;
  post_slug: string;
  body: string;
  created_at: string;
  edited_at: string | null;
  author: CommentAuthor;
  mine: boolean;
}

export interface CommentsPage {
  items: CommentItem[];
  next_cursor: string | null;
}
