import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

let db: any;
try {
  if (process.env.SQL_HOST) {
    const pool = createPool();
    db = drizzle(pool, { schema });
  } else {
    throw new Error("Missing SQL credentials");
  }
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  const noOp = { 
    findMany: async () => [], 
    findFirst: async () => null,
    findUnique: async () => null, 
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {}, 
    delete: async () => ({}) 
  };
  
  const mockChain: any = {
    values: () => mockChain,
    set: () => mockChain,
    where: () => mockChain,
    onConflictDoUpdate: () => mockChain,
    from: () => mockChain,
    innerJoin: () => mockChain,
    leftJoin: () => mockChain,
    returning: async () => [{ id: 'mock-id' }],
    then: (resolve: any) => resolve([{ id: 'mock-id' }])
  };

  db = new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'query') {
        return new Proxy({}, { get: () => noOp });
      }
      if (['insert', 'update', 'delete', 'select'].includes(prop as string)) {
        return () => mockChain;
      }
      return async () => [];
    }
  });
}
export { db };
