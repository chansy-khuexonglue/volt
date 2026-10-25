# Security requirements

Enforce request body and header limits, timeouts, and safe error responses. Never expose stack traces or secrets in production. Parse cookies and forwarded IPs with explicit trust-proxy policy. Provide secure CORS configuration, CSRF defenses for cookie-authenticated state-changing requests, and authorization hooks.

JWT must validate signatures, algorithm allowlists, expiration, issuer and audience as configured. Rate limiting must document distributed-store requirements. File uploads require size/type controls and safe storage paths. Avoid open redirects and response header injection. Include regression tests for malformed requests and authorization bypasses.
