import { defineLiveCollection } from 'astro:content';
import { z } from 'astro/zod';
import { githubProjectsLiveLoader } from './lib/services/projects.service';
import { getGitHubEnv } from '@config/config';

const env = getGitHubEnv();

const projects = defineLiveCollection({
  loader: githubProjectsLiveLoader({
    repo: 'luxuling/personal-journal',
    path: 'projects',
    branch: 'main',
    token: env.ok ? env.token : '',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    status: z.enum(['active', 'wip', 'archived']),
    year: z.number(),
    month: z.number().int().min(1).max(12),
    thumbnail: z.string().optional(),
    links: z
      .object({
        github: z.url().optional(),
        live: z.url().optional(),
      })
      .optional(),
    githubStars: z.number().int().min(0).optional(),
    featured: z.boolean().optional().default(false),
    order: z.number().optional().default(999),
  }),
});

export const collections = { projects };
