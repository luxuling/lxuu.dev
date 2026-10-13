import { z } from 'astro/zod';
import { postEngagement, projectEngagement } from '@/db/schema';
import { NotFoundError } from '@/utils/http-error';

const engagementParamsSchema = z.object({
  target: z.enum(['posts', 'projects']),
  slug: z.string().min(1),
});

export type EngagementTarget = z.infer<typeof engagementParamsSchema>['target'];

export const engagementTargets = {
  posts: { tables: postEngagement, slugKey: 'post_slug' },
  projects: { tables: projectEngagement, slugKey: 'project_slug' },
} as const;

export const resolveEngagementTarget = (params: unknown) => {
  const parsed = engagementParamsSchema.safeParse(params);
  if (!parsed.success) throw new NotFoundError('Unknown route');

  return { ...engagementTargets[parsed.data.target], slug: parsed.data.slug };
};
