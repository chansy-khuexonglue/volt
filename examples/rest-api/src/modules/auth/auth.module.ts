import { RouteGroup } from 'voltts';
import { authenticate } from '../../common/guards/auth.guard';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

export class AuthModule {
  static register(group: RouteGroup): void {
    group.post(
      '/register',
      (c) => authController.register(c),
      {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        body: registerSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    group.post(
      '/login',
      (c) => authController.login(c),
      {
        summary: 'Login and receive JWT authentication token',
        tags: ['Authentication'],
        body: loginSchema,
        security: [{ bearerAuth: [] }],
      }
    );

    group.get(
      '/me',
      (c) => authController.getProfile(c),
      {
        summary: 'Get currently authenticated user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
      },
      [authenticate]
    );
  }
}
