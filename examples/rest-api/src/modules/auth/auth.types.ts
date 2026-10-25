export type UserRole = 'admin' | 'user';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface UserPayload {
  [key: string]: unknown;
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<UserAccount, 'passwordHash'>;
  token: string;
}
