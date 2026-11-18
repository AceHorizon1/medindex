import { createClient, Client } from '@libsql/client/web';

let _client: Client | null = null;

export function getTursoClient(): Client {
  if (!_client) {
    const url =
      process.env.TURSO_DATABASE_URL ||
      process.env.NEXT_PUBLIC_TURSO_DATABASE_URL;
    const authToken =
      process.env.TURSO_AUTH_TOKEN ||
      process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error(
        'TURSO_DATABASE_URL or NEXT_PUBLIC_TURSO_DATABASE_URL is not defined.'
      );
    }

    _client = createClient({
      url,
      authToken,
    });
  }
  return _client;
}

export const turso = {
  execute: (stmt: any) => getTursoClient().execute(stmt),
  batch: (stmts: any[], mode?: any) => getTursoClient().batch(stmts, mode),
  transaction: (mode?: any) => getTursoClient().transaction(mode),
};
