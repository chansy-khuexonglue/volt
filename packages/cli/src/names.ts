/** Name normalisation helpers used by scaffolding and generators. */

function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function kebabCase(input: string): string {
  return words(input).join('-');
}

export function camelCase(input: string): string {
  return words(input)
    .map((w, i) => (i === 0 ? w : w[0]!.toUpperCase() + w.slice(1)))
    .join('');
}

export function pascalCase(input: string): string {
  return words(input)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join('');
}

/** Naive English singularisation, good enough for resource names. */
export function singular(input: string): string {
  if (/ies$/i.test(input)) return input.slice(0, -3) + 'y';
  if (/(ss|us)$/i.test(input)) return input;
  if (/(x|ch|sh|ss)es$/i.test(input)) return input.slice(0, -2);
  if (/s$/i.test(input) && input.length > 1) return input.slice(0, -1);
  return input;
}

/**
 * Converts an arbitrary directory name into a valid npm package name.
 * Returns `undefined` when nothing usable remains.
 */
export function toPackageName(input: string): string | undefined {
  const scoped = input.match(/^@([^/]+)\/(.+)$/);
  if (scoped) {
    const scope = toPackageName(scoped[1]!);
    const name = toPackageName(scoped[2]!);
    return scope && name ? `@${scope}/${name}` : undefined;
  }
  const name = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, '-')
    .replace(/^[._-]+/, '')
    .replace(/-+$/, '');
  return name.length > 0 && name.length <= 214 ? name : undefined;
}
