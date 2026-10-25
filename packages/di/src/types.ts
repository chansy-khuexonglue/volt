export type ServiceLifetime = 'singleton' | 'transient' | 'request';

export type Constructor<T = any> = new (...args: any[]) => T;

export type Token<T = any> = string | symbol | Constructor<T>;

export interface ClassProvider<T = any> {
  provide: Token<T>;
  useClass: Constructor<T>;
  deps?: Token[];
  lifetime?: ServiceLifetime;
}

export interface ValueProvider<T = any> {
  provide: Token<T>;
  useValue: T;
}

export interface FactoryProvider<T = any> {
  provide: Token<T>;
  useFactory: (container: any) => T | Promise<T>;
  deps?: Token[];
  lifetime?: ServiceLifetime;
}

export type Provider<T = any> = ClassProvider<T> | ValueProvider<T> | FactoryProvider<T>;

export class CircularDependencyError extends Error {
  constructor(public chain: string[]) {
    super(`Circular dependency detected: ${chain.join(' -> ')}`);
    this.name = 'CircularDependencyError';
  }
}

export class ServiceNotFoundError extends Error {
  constructor(public token: string) {
    super(`Service not found for token: '${token}'`);
    this.name = 'ServiceNotFoundError';
  }
}
