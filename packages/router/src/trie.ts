import { HttpMethod, RouteConflictError, RouteMatch } from './types';

export class TrieNode<T> {
  segment: string;
  isParam = false;
  paramName: string | null = null;
  isWildcard = false;
  wildcardName = 'wildcard';
  staticChildren = new Map<string, TrieNode<T>>();
  paramChild: TrieNode<T> | null = null;
  wildcardChild: TrieNode<T> | null = null;
  handlers = new Map<string, { handler: T; pattern: string }>();

  constructor(segment = '') {
    this.segment = segment;
  }
}

export class TrieRouter<T = unknown> {
  private root = new TrieNode<T>();
  private staticRoutes = new Map<string, { handler: T; pattern: string; method: string }>();
  private allRoutes: Array<{ method: string; path: string; handler: T; pattern: string }> = [];

  constructor(private options: { strictTrailingSlash?: boolean; caseSensitive?: boolean } = {}) {}

  private normalizePath(path: string): string {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    if (!this.options.strictTrailingSlash && path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    if (!this.options.caseSensitive) {
      // Keep case as is for segments, but match case-insensitively if needed
    }
    return path;
  }

  add(method: HttpMethod | string, path: string, handler: T): void {
    const normalized = this.normalizePath(path);
    const m = method.toUpperCase();
    const pattern = normalized;

    this.allRoutes.push({ method: m, path: normalized, handler, pattern });

    // Check if route is pure static (no : or *)
    const isDynamic = normalized.includes(':') || normalized.includes('*');
    if (!isDynamic) {
      const staticKey = `${m}:${normalized}`;
      const existing = this.staticRoutes.get(staticKey);
      if (existing) {
        throw new RouteConflictError(existing.pattern, normalized, m);
      }
      this.staticRoutes.set(staticKey, { handler, pattern, method: m });
    }

    // Always insert into Trie for uniform tree lookup and dynamic matching
    const segments = normalized.split('/').filter(Boolean);
    let current = this.root;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!;

      if (seg.startsWith('*')) {
        const wildcardName = seg.length > 1 ? seg.slice(1) : 'wildcard';
        if (!current.wildcardChild) {
          const node = new TrieNode<T>(seg);
          node.isWildcard = true;
          node.wildcardName = wildcardName;
          current.wildcardChild = node;
        } else if (current.wildcardChild.wildcardName !== wildcardName) {
          // Warning or conflict if name differs
        }
        current = current.wildcardChild;
        break; // Wildcard absorbs remaining segments
      } else if (seg.startsWith(':')) {
        const paramName = seg.slice(1);
        if (!current.paramChild) {
          const node = new TrieNode<T>(seg);
          node.isParam = true;
          node.paramName = paramName;
          current.paramChild = node;
        } else if (current.paramChild.paramName !== paramName) {
          throw new RouteConflictError(
            `:${current.paramChild.paramName}`,
            `:${paramName}`,
            m
          );
        }
        current = current.paramChild;
      } else {
        let child = current.staticChildren.get(seg);
        if (!child) {
          child = new TrieNode<T>(seg);
          current.staticChildren.set(seg, child);
        }
        current = child;
      }
    }

    const existingHandler = current.handlers.get(m);
    if (existingHandler && !isDynamic) {
      // Handled above in static check
    } else if (existingHandler && isDynamic) {
      throw new RouteConflictError(existingHandler.pattern, normalized, m);
    }
    current.handlers.set(m, { handler, pattern });
  }

  match(method: HttpMethod | string, path: string): RouteMatch<T> | null {
    const normalized = this.normalizePath(path);
    const m = method.toUpperCase();

    // 1. Fast Path: direct O(1) static route table lookup
    const staticKey = `${m}:${normalized}`;
    const staticMatch = this.staticRoutes.get(staticKey);
    if (staticMatch) {
      return {
        handler: staticMatch.handler,
        params: {},
        pattern: staticMatch.pattern,
        method: m,
      };
    }

    // Check HEAD fallback to GET for static routes
    if (m === 'HEAD') {
      const getStatic = this.staticRoutes.get(`GET:${normalized}`);
      if (getStatic) {
        return {
          handler: getStatic.handler,
          params: {},
          pattern: getStatic.pattern,
          method: 'GET',
        };
      }
    }

    // 2. Dynamic Trie Search
    const segments = normalized.split('/').filter(Boolean);
    const params: Record<string, string> = {};

    const matchNode = (
      node: TrieNode<T>,
      index: number
    ): { node: TrieNode<T>; pattern: string } | null => {
      if (index === segments.length) {
        if (node.handlers.has(m) || node.handlers.has('ALL')) {
          const h = node.handlers.get(m) ?? node.handlers.get('ALL');
          return { node, pattern: h!.pattern };
        }
        if (m === 'HEAD' && node.handlers.has('GET')) {
          const h = node.handlers.get('GET');
          return { node, pattern: h!.pattern };
        }
        return null;
      }

      const seg = segments[index]!;

      // 2a. Try static match first
      const staticChild = node.staticChildren.get(seg);
      if (staticChild) {
        const res = matchNode(staticChild, index + 1);
        if (res) return res;
      }

      // 2b. Try parameterized child
      if (node.paramChild) {
        params[node.paramChild.paramName!] = seg;
        const res = matchNode(node.paramChild, index + 1);
        if (res) return res;
        delete params[node.paramChild.paramName!];
      }

      // 2c. Try wildcard child
      if (node.wildcardChild) {
        const rest = segments.slice(index).join('/');
        params[node.wildcardChild.wildcardName] = rest;
        if (node.wildcardChild.handlers.has(m) || node.wildcardChild.handlers.has('ALL')) {
          const h = node.wildcardChild.handlers.get(m) ?? node.wildcardChild.handlers.get('ALL');
          return { node: node.wildcardChild, pattern: h!.pattern };
        }
        if (m === 'HEAD' && node.wildcardChild.handlers.has('GET')) {
          const h = node.wildcardChild.handlers.get('GET');
          return { node: node.wildcardChild, pattern: h!.pattern };
        }
        delete params[node.wildcardChild.wildcardName];
      }

      return null;
    };

    const result = matchNode(this.root, 0);
    if (result) {
      const h = result.node.handlers.get(m) ?? result.node.handlers.get('ALL') ?? (m === 'HEAD' ? result.node.handlers.get('GET') : undefined);
      if (h) {
        return {
          handler: h.handler,
          params: { ...params },
          pattern: h.pattern,
          method: m,
        };
      }
    }

    // 3. Fallback for OPTIONS (discover allowed methods)
    if (m === 'OPTIONS') {
      const allowed = this.getAllowedMethods(normalized);
      if (allowed.length > 0) {
        return {
          handler: null as unknown as T,
          params,
          pattern: normalized,
          method: 'OPTIONS',
        };
      }
    }

    return null;
  }

  getAllowedMethods(path: string): string[] {
    const normalized = this.normalizePath(path);
    const methods = new Set<string>();

    for (const r of this.allRoutes) {
      if (r.path === normalized) {
        methods.add(r.method);
      }
    }

    if (methods.size > 0 && methods.has('GET')) {
      methods.add('HEAD');
    }
    if (methods.size > 0) {
      methods.add('OPTIONS');
    }

    return Array.from(methods);
  }

  getRoutes(): Array<{ method: string; path: string; handler: T; pattern: string }> {
    return [...this.allRoutes];
  }
}
