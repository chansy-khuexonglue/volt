export const config = {
  port: Number(process.env.PORT) || 3000,
  isDev: process.env.NODE_ENV !== 'production',
  jwt: {
    secret: process.env.JWT_SECRET || 'volt-production-grade-super-secret-key-32-chars!',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  apiPrefix: '/api/v1',
};
