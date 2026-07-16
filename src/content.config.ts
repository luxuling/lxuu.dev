import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '*.mdx', base: 'src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    status: z.enum(['draft', 'posted']).default('draft'),
    date: z.coerce.date(),
    highlight: z.boolean().optional().default(false),
    thumbnail: z.string().nullable().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: 'src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    status: z.enum(['active', 'wip', 'archived']),
    date: z.coerce.date(),
    highlight: z.boolean().optional().default(false),
    thumbnail: z.string().nullable().optional(),
    links: z
      .object({
        github: z.string().nullable().optional(),
        live: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  }),
});

export const collections = { posts, projects };
