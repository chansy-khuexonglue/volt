import {
  CircularDependencyError,
  Constructor,
  FactoryProvider,
  Provider,
  ServiceLifetime,
  ServiceNotFoundError,
  Token,
} from './types';

export class Container {
  private providers = new Map<Token, Provider>();
  private singletons = new Map<Token, any>();
  private scopedInstances = new Map<Token, any>();
  private resolutionStack = new Set<Token>();

  constructor(private parent?: Container) {}

  private tokenToString(token: Token): string {
    if (typeof token === 'function') return token.name || 'AnonymousClass';
    if (typeof token === 'symbol') return token.toString();
    return String(token);
  }

  register<T>(provider: Provider<T> | Constructor<T>): this {
    if (typeof provider === 'function') {
      this.providers.set(provider, {
        provide: provider,
        useClass: provider,
        lifetime: 'singleton',
      });
    } else {
      this.providers.set(provider.provide, provider);
    }
    return this;
  }

  registerValue<T>(token: Token<T>, value: T): this {
    this.providers.set(token, {
      provide: token,
      useValue: value,
    });
    this.singletons.set(token, value);
    return this;
  }

  registerFactory<T>(
    token: Token<T>,
    factory: (container: Container) => T,
    lifetime: ServiceLifetime = 'singleton',
    deps: Token[] = []
  ): this {
    this.providers.set(token, {
      provide: token,
      useFactory: factory,
      lifetime,
      deps,
    });
    return this;
  }

  has(token: Token): boolean {
    if (this.providers.has(token) || this.singletons.has(token)) return true;
    return this.parent ? this.parent.has(token) : false;
  }

  resolve<T>(token: Token<T>): T {
    const tokenStr = this.tokenToString(token);

    // 1. Detect circular dependency
    if (this.resolutionStack.has(token)) {
      const chain = Array.from(this.resolutionStack).map(t => this.tokenToString(t));
      chain.push(tokenStr);
      throw new CircularDependencyError(chain);
    }

    // 2. Check Singleton Cache
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    // 3. Check Scoped Cache (if in a child scope)
    if (this.scopedInstances.has(token)) {
      return this.scopedInstances.get(token);
    }

    // 4. Find provider in current or parent
    let provider = this.providers.get(token);
    if (!provider && this.parent) {
      return this.parent.resolve(token);
    }

    if (!provider) {
      if (typeof token === 'function') {
        // Auto-register class as transient
        provider = {
          provide: token,
          useClass: token as Constructor<T>,
          lifetime: 'transient',
        };
      } else {
        throw new ServiceNotFoundError(tokenStr);
      }
    }

    this.resolutionStack.add(token);

    try {
      let instance: T;

      if ('useValue' in provider) {
        instance = provider.useValue;
      } else if ('useFactory' in provider) {
        const factoryProv = provider as FactoryProvider<T>;
        instance = factoryProv.useFactory(this) as T;
      } else if ('useClass' in provider) {
        const deps = (provider.deps || []).map(dep => this.resolve(dep));
        instance = new provider.useClass(...deps);
      } else {
        throw new ServiceNotFoundError(tokenStr);
      }

      const lifetime = ('lifetime' in provider ? provider.lifetime : undefined) || 'singleton';

      if (lifetime === 'singleton') {
        this.singletons.set(token, instance);
      } else if (lifetime === 'request') {
        this.scopedInstances.set(token, instance);
      }

      return instance;
    } finally {
      this.resolutionStack.delete(token);
    }
  }

  /**
   * Pre-resolves all registered singleton dependencies to detect issues at startup.
   */
  init(): void {
    for (const [token, provider] of this.providers.entries()) {
      const lifetime = ('lifetime' in provider ? provider.lifetime : undefined) || 'singleton';
      if (lifetime === 'singleton') {
        this.resolve(token);
      }
    }
  }

  createScope(): Container {
    return new Container(this);
  }
}
