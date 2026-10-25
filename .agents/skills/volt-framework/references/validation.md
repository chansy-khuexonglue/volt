# Validation

Schema validation is opt-in and may use an adapter (e.g. Standard Schema-compatible libraries) before a custom engine. Validate body, query, params, and headers. Limit body size before parsing; reject malformed JSON, prototype-pollution keys where relevant, excessive nesting, and invalid encodings. Return stable 400/422-style errors with no sensitive details.

Compile trusted schemas once at startup where feasible. Never execute code constructed from untrusted schema strings. Measure valid and invalid input costs, plus startup compilation overhead.
