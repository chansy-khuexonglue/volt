export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://postgres:h1ifjnuaz1p1ca3t3c0b@172.105.118.233:2520/dev?sslmode=disable',
  cors: {
    origin: '*',
  },
  apiPrefix: '/api',
};
