import { t } from 'voltts';

export const registerSchema = t.Object({
  name: t.String({ minLength: 2, maxLength: 50, description: 'User full name' }),
  email: t.String({ format: 'email', description: 'Unique user email address' }),
  password: t.String({ minLength: 6, maxLength: 100, description: 'Password (min 6 chars)' }),
  role: t.Optional(t.Enum(['admin', 'user'] as const)),
});

export const loginSchema = t.Object({
  email: t.String({ format: 'email', description: 'Registered email' }),
  password: t.String({ minLength: 1, description: 'User password' }),
});
