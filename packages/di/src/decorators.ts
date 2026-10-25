import { Constructor, Token } from './types';

const INJECT_METADATA_KEY = Symbol('volt:inject:deps');

export function Injectable(): ClassDecorator {
  return (target: any) => {
    // Marker decorator for dependency injection
    return target;
  };
}

export function Inject(token: Token): ParameterDecorator {
  return (target: any, _propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const reflectAny = Reflect as any;
    const existing: Map<number, Token> = reflectAny.getMetadata?.(INJECT_METADATA_KEY, target) || new Map();
    existing.set(parameterIndex, token);
    if (reflectAny.defineMetadata) {
      reflectAny.defineMetadata(INJECT_METADATA_KEY, existing, target);
    } else {
      target[INJECT_METADATA_KEY] = existing;
    }
  };
}

export function getInjectedDependencies(target: Constructor): Token[] {
  const reflectAny = Reflect as any;
  const map: Map<number, Token> | undefined =
    reflectAny.getMetadata?.(INJECT_METADATA_KEY, target) || (target as any)[INJECT_METADATA_KEY];
  if (!map) return [];
  const deps: Token[] = [];
  for (let i = 0; i < map.size; i++) {
    deps.push(map.get(i)!);
  }
  return deps;
}
