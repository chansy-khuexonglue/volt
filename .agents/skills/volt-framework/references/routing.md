# Routing

Use exact method+path lookup for static routes, benchmark radix/trie alternatives for dynamic routes. Define static > parameter > wildcard precedence. Decode path parameters safely, reject malformed percent encodings, and handle trailing slashes consistently.

Support method-aware routes, duplicate detection, prefixes, groups, and route params. HEAD should suppress response bodies; OPTIONS and 405 responses should expose appropriate Allow methods. Clarify whether implicit HEAD/OPTIONS can be disabled.

Tests: static/dynamic collisions, encoded slash, unicode, empty segments, repeated params, wildcard capture, 404 vs 405, trailing slash, high route count, and method isolation.
