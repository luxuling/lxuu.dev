import { defineMiddleware } from 'astro:middleware';
import { createDb } from '@lib/db/client';
import { DATABASE_URL } from '@lib/env';

export const onRequest = defineMiddleware((context, next) => {
  context.locals.db = createDb(DATABASE_URL);
  return next();
});
