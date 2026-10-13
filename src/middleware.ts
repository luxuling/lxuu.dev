import { DATABASE_URL, SESSION_SECRET } from 'astro:env/server';
import { defineMiddleware } from 'astro:middleware';
import { createDb } from '@/db/client';
import { ServiceUnavailableError, toErrorResponse } from '@/utils/http-error';

const provideApiLocals = (locals: App.Locals) => {
  if (!DATABASE_URL) {
    throw new ServiceUnavailableError(
      'DATABASE_UNAVAILABLE',
      'Database is not configured for this deployment.',
    );
  }
  if (!SESSION_SECRET) {
    throw new ServiceUnavailableError(
      'SESSION_UNAVAILABLE',
      'Session secret is not configured for this deployment.',
    );
  }

  locals.db = createDb(DATABASE_URL);
  locals.sessionSecret = SESSION_SECRET;
};

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith('/api/')) return next();

  try {
    provideApiLocals(context.locals);

    return await next();
  } catch (error) {
    return toErrorResponse(error);
  }
});
