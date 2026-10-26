import { Context, RouteGroup } from 'voltts';
import { authService } from './auth.service';

export class AuthModule {
  static register(router: RouteGroup): void {
    // Register
    router.post('/register', async (ctx: Context) => {
      try {
        const body: any = (ctx.body && typeof ctx.body === 'object' && Object.keys(ctx.body).length > 0)
          ? ctx.body
          : (await ctx.req.json().catch(() => ({}))) || {};
        const { name, email, password } = body;
        if (!name || !email || !password) {
          return ctx.json({ success: false, error: 'Name, email, and password are required' }, 400);
        }
        const result = await authService.register(name, email, password);
        return ctx.json({ success: true, ...result }, 201);
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 400);
      }
    });

    // Login
    router.post('/login', async (ctx: Context) => {
      try {
        const body: any = (ctx.body && typeof ctx.body === 'object' && Object.keys(ctx.body).length > 0)
          ? ctx.body
          : (await ctx.req.json().catch(() => ({}))) || {};
        const { email, password } = body;
        if (!email || !password) {
          return ctx.json({ success: false, error: 'Email and password are required' }, 400);
        }
        const result = await authService.login(email, password);
        return ctx.json({ success: true, ...result });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 401);
      }
    });

    // Get current user profile
    router.get('/me', async (ctx: Context) => {
      try {
        const authHeader = ctx.req.headers.get('authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '');
        if (!token) {
          return ctx.json({ success: false, error: 'Unauthorized' }, 401);
        }
        const user = await authService.getMe(token);
        if (!user) {
          return ctx.json({ success: false, error: 'Invalid or expired token' }, 401);
        }
        return ctx.json({ success: true, user });
      } catch (err: any) {
        return ctx.json({ success: false, error: err.message }, 500);
      }
    });
  }
}
