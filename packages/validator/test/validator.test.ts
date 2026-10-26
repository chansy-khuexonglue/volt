import { describe, expect, it } from 'bun:test';
import { compile, t, validateOrThrow, ValidationError } from '../src/index';

describe('@voltts/validator', () => {
  it('validates strings with formats and lengths', () => {
    const schema = t.Object({
      email: t.String({ format: 'email' }),
      username: t.String({ minLength: 3, maxLength: 20 }),
      bio: t.Optional(t.String()),
    });

    const validator = compile(schema);

    const valid = validator({
      email: 'dev@volt.sh',
      username: 'alice',
    });
    expect(valid.success).toBe(true);

    const invalid = validator({
      email: 'not-an-email',
      username: 'al',
    });
    expect(invalid.success).toBe(false);
    expect(invalid.errors?.length).toBe(2);
  });

  it('validates numbers and integers', () => {
    const schema = t.Object({
      age: t.Integer({ min: 18, max: 120 }),
      score: t.Number({ min: 0 }),
    });

    const validator = compile(schema);

    expect(validator({ age: 25, score: 99.5 }).success).toBe(true);
    expect(validator({ age: 15, score: 10 }).success).toBe(false);
    expect(validator({ age: 25.5, score: 10 }).success).toBe(false); // age not integer
  });

  it('validates nested objects and rejects additionalProperties when configured', () => {
    const schema = t.Object(
      {
        profile: t.Object({
          nickname: t.String(),
        }),
      },
      { additionalProperties: false }
    );

    const validator = compile(schema);

    expect(validator({ profile: { nickname: 'volt' } }).success).toBe(true);
    expect(validator({ profile: { nickname: 'volt' }, hackerField: 123 }).success).toBe(false);
  });

  it('validates arrays and minItems', () => {
    const schema = t.Array(t.String(), { minItems: 2 });
    const validator = compile(schema);

    expect(validator(['apple', 'banana']).success).toBe(true);
    expect(validator(['apple']).success).toBe(false);
    expect(validator(['apple', 123]).success).toBe(false);
  });

  it('validates enums and literals', () => {
    const schema = t.Object({
      role: t.Enum(['admin', 'user', 'guest'] as const),
      version: t.Literal(1),
    });

    const validator = compile(schema);

    expect(validator({ role: 'admin', version: 1 }).success).toBe(true);
    expect(validator({ role: 'superadmin', version: 1 }).success).toBe(false);
    expect(validator({ role: 'admin', version: 2 }).success).toBe(false);
  });

  it('validates unions', () => {
    const schema = t.Union([t.String(), t.Number()]);
    const validator = compile(schema);

    expect(validator('hello').success).toBe(true);
    expect(validator(42).success).toBe(true);
    expect(validator(true).success).toBe(false);
  });

  it('throws ValidationError with validateOrThrow', () => {
    const schema = t.Object({ id: t.String({ format: 'uuid' }) });

    expect(() => {
      validateOrThrow(schema, { id: 'invalid-uuid' });
    }).toThrow(ValidationError);
  });
});
