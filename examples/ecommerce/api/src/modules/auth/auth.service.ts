import { sql, User } from '../../db';

export class AuthService {
  async register(name: string, email: string, password: string):Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
    if (existing && existing.length > 0) {
      throw new Error('An account with this email already exists');
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = Bun.password.hashSync(password, { algorithm: 'bcrypt', cost: 10 });

    const rows = await sql`
      INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
      VALUES (${id}, ${name}, ${email.toLowerCase()}, ${passwordHash}, 'customer', NOW(), NOW())
      RETURNING id, name, email, role, created_at
    `;

    const user = rows[0] as Omit<User, 'password_hash'>;
    const token = `vt_${Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64')}`;

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const rows = await sql`
      SELECT id, name, email, password_hash, role, created_at
      FROM users
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const row = rows[0] as User;
    const match = Bun.password.verifySync(password, row.password_hash);
    if (!match) {
      throw new Error('Invalid email or password');
    }

    const { password_hash, ...user } = row;
    const token = `vt_${Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64')}`;

    return { user, token };
  }

  async getMe(token: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      if (!token.startsWith('vt_')) return null;
      const jsonStr = Buffer.from(token.replace('vt_', ''), 'base64').toString('utf8');
      const payload = JSON.parse(jsonStr);
      const rows = await sql`
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = ${payload.id}
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return rows[0] as Omit<User, 'password_hash'>;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
