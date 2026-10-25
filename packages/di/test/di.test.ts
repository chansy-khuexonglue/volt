import { describe, expect, it } from 'bun:test';
import { CircularDependencyError, Container, ServiceNotFoundError } from '../src/index';

describe('@volt/di', () => {
  it('resolves singleton dependencies caching the same instance', () => {
    const container = new Container();

    class Database {
      public id = Math.random();
    }

    container.register({
      provide: Database,
      useClass: Database,
      lifetime: 'singleton',
    });

    const db1 = container.resolve(Database);
    const db2 = container.resolve(Database);

    expect(db1).toBe(db2);
    expect(db1.id).toBe(db2.id);
  });

  it('resolves transient dependencies providing new instances each time', () => {
    const container = new Container();

    class RequestId {
      public id = Math.random();
    }

    container.register({
      provide: RequestId,
      useClass: RequestId,
      lifetime: 'transient',
    });

    const id1 = container.resolve(RequestId);
    const id2 = container.resolve(RequestId);

    expect(id1).not.toBe(id2);
  });

  it('detects and prevents circular dependencies', () => {
    const container = new Container();

    class ServiceA {
      constructor(public b: any) {}
    }

    class ServiceB {
      constructor(public a: any) {}
    }

    container.register({
      provide: ServiceA,
      useClass: ServiceA,
      deps: [ServiceB],
    });

    container.register({
      provide: ServiceB,
      useClass: ServiceB,
      deps: [ServiceA],
    });

    expect(() => {
      container.resolve(ServiceA);
    }).toThrow(CircularDependencyError);
  });

  it('throws ServiceNotFoundError for unregistered tokens', () => {
    const container = new Container();
    expect(() => {
      container.resolve('NON_EXISTENT_TOKEN');
    }).toThrow(ServiceNotFoundError);
  });
});
