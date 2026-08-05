import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

export type Db = NeonDatabase<typeof schema>;

export function createDb(url: string): Db {
  // Use the WebSocket serverless driver (not neon-http): the HTTP driver is
  // stateless and throws "No transactions support" on db.transaction().
  return drizzle(url, { schema });
}
