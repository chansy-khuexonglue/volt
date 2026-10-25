import { Volt, VoltPlugin } from '@volt/core';

export interface PostgresOptions {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  maxConnections?: number;
  client?: PostgresClient;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface PostgresClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  transaction<T = any>(callback: (client: PostgresClient) => Promise<T>): Promise<T>;
  end?(): Promise<void> | void;
}

export class MockPostgresClient implements PostgresClient {
  private tables = new Map<string, any[]>();

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const trimmed = sql.trim();

    // Basic mock handling for common queries in tests
    if (trimmed.toUpperCase().startsWith('SELECT 1')) {
      return { rows: [{ '?column?': 1 }] as unknown as T[], rowCount: 1 };
    }

    return { rows: [] as T[], rowCount: 0 };
  }

  async transaction<T = any>(callback: (client: PostgresClient) => Promise<T>): Promise<T> {
    return callback(this);
  }

  async end(): Promise<void> {
    this.tables.clear();
  }
}

export function postgresPlugin(options: PostgresOptions = {}): VoltPlugin {
  let client: PostgresClient;

  if (options.client) {
    client = options.client;
  } else {
    // Default mock client when external driver is not injected
    client = new MockPostgresClient();
  }

  return {
    name: '@volt/plugin-postgres',
    version: '0.1.0',
    setup(app: Volt) {
      app.decorate('db', client);
      app.decorate('postgres', client);
    },
    async cleanup() {
      if (client.end) {
        await client.end();
      }
    },
  };
}

export default postgresPlugin;
