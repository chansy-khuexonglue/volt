import { describe, expect, it } from 'bun:test';
import { RouteConflictError, Router, TrieRouter } from '../src/index';

describe('@volt/router', () => {
  it('matches static routes with high speed O(1) table', () => {
    const router = new Router<() => string>();
    router.get('/health', () => 'ok');
    router.post('/login', () => 'logged in');

    const match1 = router.match('GET', '/health');
    expect(match1).not.toBeNull();
    expect(match1?.pattern).toBe('/health');
    expect(match1?.handler()).toBe('ok');

    const match2 = router.match('POST', '/login');
    expect(match2).not.toBeNull();
    expect(match2?.pattern).toBe('/login');

    const matchMiss = router.match('GET', '/not-found');
    expect(matchMiss).toBeNull();
  });

  it('matches dynamic parameters', () => {
    const router = new Router();
    router.get('/users/:id', () => 'user');
    router.get('/posts/:postId/comments/:commentId', () => 'comment');

    const m1 = router.match('GET', '/users/42');
    expect(m1).not.toBeNull();
    expect(m1?.params).toEqual({ id: '42' });

    const m2 = router.match('GET', '/posts/10/comments/99');
    expect(m2).not.toBeNull();
    expect(m2?.params).toEqual({ postId: '10', commentId: '99' });
  });

  it('matches wildcards', () => {
    const router = new Router();
    router.get('/static/*', () => 'wildcard');
    router.get('/files/*filepath', () => 'files');

    const m1 = router.match('GET', '/static/css/style.css');
    expect(m1).not.toBeNull();
    expect(m1?.params.wildcard).toBe('css/style.css');

    const m2 = router.match('GET', '/files/images/logo.png');
    expect(m2).not.toBeNull();
    expect(m2?.params.filepath).toBe('images/logo.png');
  });

  it('handles route groups and nested prefixes', () => {
    const router = new Router();

    router.group('/api/v1', (v1) => {
      v1.get('/users', () => 'users');
      v1.group('/admin', (admin) => {
        admin.post('/settings', () => 'settings');
      });
    });

    const m1 = router.match('GET', '/api/v1/users');
    expect(m1).not.toBeNull();
    expect(m1?.pattern).toBe('/api/v1/users');

    const m2 = router.match('POST', '/api/v1/admin/settings');
    expect(m2).not.toBeNull();
    expect(m2?.pattern).toBe('/api/v1/admin/settings');
  });

  it('detects route conflicts', () => {
    const trie = new TrieRouter();
    trie.add('GET', '/users/:userId', () => {});

    // Conflicting parameter name on the same segment
    expect(() => {
      trie.add('GET', '/users/:id', () => {});
    }).toThrow(RouteConflictError);
  });

  it('falls back HEAD requests to GET', () => {
    const router = new Router();
    router.get('/ping', () => 'pong');

    const headMatch = router.match('HEAD', '/ping');
    expect(headMatch).not.toBeNull();
    expect(headMatch?.method).toBe('GET');
  });

  it('discovers allowed methods for OPTIONS requests', () => {
    const router = new Router();
    router.get('/items', () => {});
    router.post('/items', () => {});
    router.delete('/items', () => {});

    const allowed = router.getAllowedMethods('/items');
    expect(allowed).toContain('GET');
    expect(allowed).toContain('POST');
    expect(allowed).toContain('DELETE');
    expect(allowed).toContain('HEAD');
    expect(allowed).toContain('OPTIONS');
  });
});
