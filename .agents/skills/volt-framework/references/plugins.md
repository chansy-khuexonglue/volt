# Plugins, modules and DI

Plugin contract: name, version compatibility, setup hook, optional cleanup hook, typed context extensions, and clear initialization order. Detect duplicate/conflicting registrations. Keep plugin side effects explicit.

Optional modules group routes and providers at startup. DI supports singleton/transient/request scope; default to singleton where appropriate and detect cycles. Avoid per-request singleton resolution. Integrations (CORS, auth, Redis, PostgreSQL, Prisma, OpenAPI, WebSocket, logging) live outside core and must document their security defaults.
