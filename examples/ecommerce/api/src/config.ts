import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Automatically load environment variables from .env file if not already set
if (!process.env.DATABASE_URL) {
  const candidatePaths = [
    resolve(import.meta.dir, '../.env'),
    resolve(process.cwd(), 'examples/ecommerce/api/.env'),
    resolve(process.cwd(), '.env'),
  ];

  for (const envPath of candidatePaths) {
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
        break;
      } catch {
        // Continue to next path
      }
    }
  }
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || '',
  cors: {
    origin: '*',
  },
  apiPrefix: '/api',
};

if (!config.databaseUrl) {
  console.warn('⚠️ Warning: DATABASE_URL is not set in environment or .env file');
}
