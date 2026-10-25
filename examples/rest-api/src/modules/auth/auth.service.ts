import { sign, verify } from 'volt';
import { config } from '../../config/env';
import { AuthResult, RegisterDto, UserAccount, UserPayload } from './auth.types';

export class AuthService {
  private users: UserAccount[] = [
    {
      id: 'usr_admin',
      email: 'admin@volt.sh',
      name: 'Admin User',
      passwordHash: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_demo',
      email: 'demo@volt.sh',
      name: 'Demo Customer',
      passwordHash: 'demo123',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  ];

  findByEmail(email: string): UserAccount | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: string): UserAccount | undefined {
    return this.users.find((u) => u.id === id);
  }

  async register(input: RegisterDto): Promise<AuthResult> {
    if (this.findByEmail(input.email)) {
      throw new Error('Email address already registered');
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.password,
      role: input.role || 'user',
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);

    const token = await this.generateToken(newUser);
    const { passwordHash, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = this.findByEmail(email);
    if (!user || user.passwordHash !== password) {
      throw new Error('Invalid email or password');
    }

    const token = await this.generateToken(user);
    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async verifyToken(token: string): Promise<UserPayload | null> {
    try {
      const decoded = await verify(token, config.jwt.secret, {
        issuer: 'volt-rest-api',
        audience: 'volt-clients',
      });
      return decoded as UserPayload;
    } catch {
      return null;
    }
  }

  private async generateToken(user: UserAccount): Promise<string> {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'volt-rest-api',
      audience: 'volt-clients',
    });
  }
}

export const authService = new AuthService();
