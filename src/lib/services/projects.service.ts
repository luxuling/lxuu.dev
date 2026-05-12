import { createGithubMdxLiveLoader } from './github-mdx-live-loader';

interface Options {
  repo: string;
  path: string;
  branch?: string;
  token?: string;
}

function parseGithubRepoFullName(href: string): string | null {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, '');
    if (host !== 'github.com') return null;
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;
    return `${segments[0]}/${segments[1]}`;
  } catch {
    return null;
  }
}

async function fetchStargazersCount(
  repoFullName: string,
  headers: Record<string, string>,
): Promise<number | undefined> {
  const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers,
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as { stargazers_count?: unknown };
  return typeof json.stargazers_count === 'number'
    ? json.stargazers_count
    : undefined;
}

async function enrichFrontmatterWithGithubStars(
  frontmatter: Record<string, unknown>,
  headers: Record<string, string>,
  starCache: Map<string, Promise<number | undefined>>,
): Promise<Record<string, unknown>> {
  const links = frontmatter.links;
  if (!links || typeof links !== 'object' || links === null) {
    return frontmatter;
  }
  const github = (links as { github?: unknown }).github;
  if (typeof github !== 'string') return frontmatter;

  const fullName = parseGithubRepoFullName(github);
  if (!fullName) return frontmatter;

  let pending = starCache.get(fullName);
  if (!pending) {
    pending = fetchStargazersCount(fullName, headers);
    starCache.set(fullName, pending);
  }
  const stars = await pending;
  if (stars === undefined) return frontmatter;

  return { ...frontmatter, githubStars: stars };
}

export function githubProjectsLiveLoader({
  repo,
  path,
  branch = 'main',
  token,
}: Options) {
  const starCache = new Map<string, Promise<number | undefined>>();

  return createGithubMdxLiveLoader({
    repo,
    path,
    branch,
    token,
    name: 'github-projects-live-loader',
    async enrichData(frontmatter, { headers }) {
      return enrichFrontmatterWithGithubStars(frontmatter, headers, starCache);
    },
  });
}
