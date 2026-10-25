import { Context } from 'volt';
import { authService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.types';

export class AuthController {
  async register(c: Context<any, RegisterDto>) {
    try {
      const result = await authService.register(c.body);
      return c.json(result, 201);
    } catch (err: any) {
      return c.json({ error: 'Conflict', message: err.message }, 409);
    }
  }

  async login(c: Context<any, LoginDto>) {
    try {
      const result = await authService.login(c.body.email, c.body.password);
      return c.json(result, 200);
    } catch (err: any) {
      return c.json({ error: 'Unauthorized', message: err.message }, 401);
    }
  }

  async getProfile(c: Context) {
    return c.json(
      {
        authenticated: true,
        user: c.store.user,
      },
      200
    );
  }
}

export const authController = new AuthController();
