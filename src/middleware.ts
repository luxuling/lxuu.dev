import { defineMiddleware } from 'astro:middleware';
import { createDb } from '@lib/db/client';
import { DATABASE_URL } from '@lib/env';

export const onRequest = defineMiddleware((context, next) => {
  if (!DATABASE_URL) {
    if (new URL(context.request.url).pathname.startsWith('/api/')) {
      return Response.json(
        {
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'Database is not configured for this deployment.',
          },
        },
        { status: 503 },
      );
    }

    return next();
  }

  context.locals.db = createDb(DATABASE_URL);
  return next();
});
