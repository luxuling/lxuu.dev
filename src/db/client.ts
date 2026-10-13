import { drizzle } from 'drizzle-orm/neon-serverless';

// NOTE: neon-http is stateless and throws "No transactions support" on db.transaction()
export const createDb = (url: string) => drizzle(url);

export type Db = ReturnType<typeof createDb>;

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0];

export type DbExecutor = Db | Transaction;
