import { marked } from 'marked';
import matter from 'gray-matter';

interface Options {
  repo: string;
  path: string;
  branch?: string;
  token?: string;
}

interface GitHubFileEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  sha: string;
}

function resolveImageSrc(
  src: string,
  repo: string,
  branch: string,
  filePath: string,
) {
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('/') ||
    src.startsWith('#') ||
    src.startsWith('data:')
  ) {
    return src;
  }

  const folderPath = filePath.includes('/')
    ? filePath.slice(0, filePath.lastIndexOf('/') + 1)
    : '';
  const base = `https://raw.githubusercontent.com/${repo}/${branch}/${folderPath}`;
  return new URL(src, base).toString();
}

function rewriteImageUrls(
  html: string,
  repo: string,
  branch: string,
  filePath: string,
) {
  return html.replace(
    /<img([^>]*?)src=(["'])([^"']+)\2([^>]*)>/g,
    (_full, before, quote, src, after) => {
      const resolvedSrc = resolveImageSrc(src, repo, branch, filePath);
      return `<img${before}src=${quote}${resolvedSrc}${quote}${after}>`;
    },
  );
}

async function fetchMdxFile(
  filePath: string,
  downloadUrl: string,
  headers: Record<string, string>,
  repo: string,
  branch: string,
): Promise<{ frontmatter: Record<string, unknown>; html: string } | null> {
  const res = await fetch(downloadUrl, { headers });
  if (!res.ok) return null;
  const text = await res.text();
  const { data: rawFrontmatter, content: body } = matter(text);
  const renderedHtml = await marked.parse(body);
  const html = rewriteImageUrls(renderedHtml, repo, branch, filePath);
  const frontmatter = { ...rawFrontmatter };
  if (typeof frontmatter.thumbnail === 'string') {
    frontmatter.thumbnail = resolveImageSrc(
      frontmatter.thumbnail,
      repo,
      branch,
      filePath,
    );
  }
  return { frontmatter, html };
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
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const starCache = new Map<string, Promise<number | undefined>>();

  const listUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

  async function fetchFileList(): Promise<GitHubFileEntry[]> {
    const res = await fetch(listUrl, { headers });
    if (!res.ok) return [];
    const files = (await res.json()) as GitHubFileEntry[];
    return files.filter((f) => f.type === 'file' && f.name.endsWith('.mdx'));
  }

  return {
    name: 'github-projects-live-loader',

    async loadCollection() {
      const files = await fetchFileList();
      const entries = await Promise.all(
        files.map(async (file) => {
          if (!file.download_url) return null;
          const parsed = await fetchMdxFile(
            file.path,
            file.download_url,
            headers,
            repo,
            branch,
          );
          if (!parsed) return null;
          const data = await enrichFrontmatterWithGithubStars(
            parsed.frontmatter,
            headers,
            starCache,
          );
          return {
            id: file.name.replace(/\.mdx$/, ''),
            data,
            rendered: { html: parsed.html },
          };
        }),
      );

      return {
        entries: entries.filter((e) => e !== null),
      };
    },

    async loadEntry({ filter }: { filter: { id: string } }) {
      const id = filter.id;
      const files = await fetchFileList();
      const file = files.find((f) => f.name === `${id}.mdx`);
      if (!file?.download_url) return undefined;

      const parsed = await fetchMdxFile(
        file.path,
        file.download_url,
        headers,
        repo,
        branch,
      );
      if (!parsed) return undefined;

      const data = await enrichFrontmatterWithGithubStars(
        parsed.frontmatter,
        headers,
        starCache,
      );

      return {
        id,
        data,
        rendered: { html: parsed.html },
      };
    },
  };
}
