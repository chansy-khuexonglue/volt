/**
 * Minimal, dependency-free argv parser for the Volt CLI.
 *
 * Supports:
 *   --flag              -> { flag: true }
 *   --no-flag           -> { flag: false }
 *   --key value         -> { key: 'value' }
 *   --key=value         -> { key: 'value' }
 *   -k value / -k       -> resolved through `aliases`
 */
export interface ParsedArgs {
  positionals: string[];
  flags: Record<string, string | boolean>;
}

export interface ParseOptions {
  /** Short alias -> long flag name, e.g. `{ p: 'port' }`. */
  aliases?: Record<string, string>;
  /** Flags that never consume the following token as a value. */
  booleans?: string[];
}

export function parseArgs(argv: string[], options: ParseOptions = {}): ParsedArgs {
  const aliases = options.aliases ?? {};
  const booleans = new Set(options.booleans ?? []);
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;

    if (token === '--') {
      positionals.push(...argv.slice(i + 1));
      break;
    }

    if (!token.startsWith('-') || token === '-') {
      positionals.push(token);
      continue;
    }

    let name = token.replace(/^--?/, '');
    let value: string | boolean | undefined;

    const eq = name.indexOf('=');
    if (eq !== -1) {
      value = name.slice(eq + 1);
      name = name.slice(0, eq);
    }

    if (!token.startsWith('--')) {
      name = aliases[name] ?? name;
    }

    if (value === undefined && name.startsWith('no-') && !booleans.has(name)) {
      flags[name.slice(3)] = false;
      continue;
    }

    if (value === undefined) {
      const next = argv[i + 1];
      if (!booleans.has(name) && next !== undefined && !next.startsWith('-')) {
        value = next;
        i++;
      } else {
        value = true;
      }
    }

    flags[name] = value;
  }

  return { positionals, flags };
}

export function flagString(flags: ParsedArgs['flags'], name: string): string | undefined {
  const v = flags[name];
  return typeof v === 'string' ? v : undefined;
}

export function flagBool(flags: ParsedArgs['flags'], name: string, fallback: boolean): boolean {
  const v = flags[name];
  if (v === undefined) return fallback;
  if (typeof v === 'boolean') return v;
  return !['false', '0', 'no', 'off'].includes(v.toLowerCase());
}
