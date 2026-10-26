import { prisma, User } from '../../db';

export class AuthService {
  async register(name: string, email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = Bun.password.hashSync(password, { algorithm: 'bcrypt', cost: 10 });

    const userRecord = await prisma.user.create({
      data: {
        id,
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: 'customer',
      },
    });

    const { password_hash, ...user } = userRecord;
    const token = `vt_${Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64')}`;

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const userRecord = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    const match = Bun.password.verifySync(password, userRecord.password_hash);
    if (!match) {
      throw new Error('Invalid email or password');
    }

    const { password_hash, ...user } = userRecord;
    const token = `vt_${Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64')}`;

    return { user, token };
  }

  async getMe(token: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      if (!token.startsWith('vt_')) return null;
      const jsonStr = Buffer.from(token.replace('vt_', ''), 'base64').toString('utf8');
      const payload = JSON.parse(jsonStr);
      if (!payload?.id) return null;

      const userRecord = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!userRecord) return null;
      const { password_hash, ...user } = userRecord;
      return user;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
