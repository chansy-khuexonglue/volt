import { TrieRouter } from './trie';
import { HttpMethod, RouteMatch, RouterOptions } from './types';

export class Router<T = unknown> {
  private trie: TrieRouter<T>;
  private prefix: string;

  constructor(options: RouterOptions = {}, prefix = '') {
    this.trie = new TrieRouter<T>(options);
    this.prefix = prefix;
  }

  private joinPath(prefix: string, path: string): string {
    const p1 = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    const p2 = path.startsWith('/') ? path : '/' + path;
    const full = p1 + p2;
    return full === '' ? '/' : full;
  }

  add(method: HttpMethod | string, path: string, handler: T): this {
    const fullPath = this.joinPath(this.prefix, path);
    this.trie.add(method, fullPath, handler);
    return this;
  }

  get(path: string, handler: T): this {
    return this.add('GET', path, handler);
  }

  post(path: string, handler: T): this {
    return this.add('POST', path, handler);
  }

  put(path: string, handler: T): this {
    return this.add('PUT', path, handler);
  }

  delete(path: string, handler: T): this {
    return this.add('DELETE', path, handler);
  }

  patch(path: string, handler: T): this {
    return this.add('PATCH', path, handler);
  }

  head(path: string, handler: T): this {
    return this.add('HEAD', path, handler);
  }

  options(path: string, handler: T): this {
    return this.add('OPTIONS', path, handler);
  }

  all(path: string, handler: T): this {
    return this.add('ALL', path, handler);
  }

  group(prefix: string, fn: (group: Router<T>) => void): this {
    const subRouter = new Router<T>({}, this.joinPath(this.prefix, prefix));
    fn(subRouter);
    for (const r of subRouter.getRoutes()) {
      this.trie.add(r.method, r.path, r.handler);
    }
    return this;
  }

  match(method: HttpMethod | string, path: string): RouteMatch<T> | null {
    return this.trie.match(method, path);
  }

  getAllowedMethods(path: string): string[] {
    return this.trie.getAllowedMethods(path);
  }

  getRoutes(): Array<{ method: string; path: string; handler: T; pattern: string }> {
    return this.trie.getRoutes();
  }
}
