# Type system

Infer route parameter keys from literal paths using template literal types. Infer request body/query/params from schema types, not assertions. Make response types available for typed clients. Prefer straightforward generics that do not make IDE typechecking unreasonably slow.

Add compile-time tests for inferred keys, optional fields, invalid payloads, route group prefixes, and plugin context augmentation. Test `@ts-expect-error` cases and avoid leaking `any`.
