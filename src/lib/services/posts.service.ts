import { createGithubMdxLiveLoader } from './github-mdx-live-loader';

interface Options {
  repo: string;
  path: string;
  branch?: string;
  token?: string;
}

export function githubPostsLiveLoader({
  repo,
  path,
  branch = 'main',
  token,
}: Options) {
  return createGithubMdxLiveLoader({
    repo,
    path,
    branch,
    token,
    name: 'github-posts-live-loader',
  });
}
