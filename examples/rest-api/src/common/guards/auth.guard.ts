import { jwt, MiddlewareHandler } from 'voltts';
import { config } from '../../config/env';
import { UserPayload, UserRole } from '../../modules/auth/auth.types';

export const authenticate: MiddlewareHandler = jwt({
  secret: config.jwt.secret,
  issuer: 'volt-rest-api',
  audience: 'volt-clients',
});

export function requireRole(...allowedRoles: UserRole[]): MiddlewareHandler {
  return (c, next) => {
    const user = c.store.user as UserPayload | undefined;
    if (!user) {
      return c.json({ error: 'Unauthorized', message: 'Authentication required' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          error: 'Forbidden',
          message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`,
        },
        403
      );
    }

    return next();
  };
}
