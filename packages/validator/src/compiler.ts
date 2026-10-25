import {
  ArraySchema,
  CompileOptions,
  CustomSchema,
  EnumSchema,
  LiteralSchema,
  NumberSchema,
  ObjectSchema,
  Schema,
  Static,
  StringSchema,
  UnionSchema,
  ValidationError,
  ValidationErrorItem,
  ValidationResult,
} from './types';

export type ValidatorFn<T> = (value: unknown) => ValidationResult<T>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const URL_REGEX = /^https?:\/\/.+/i;

function tryCompileJIT<T extends Schema>(schema: T, options?: CompileOptions): ValidatorFn<Static<T>> | null {
  if (options?.coerce) return null;
  if (schema.type !== 'object') return null;

  const objSchema = schema as ObjectSchema;
  const properties = objSchema.properties;
  const required = new Set(objSchema.required);
  const additionalProps = objSchema.additionalProperties;

  const code: string[] = [];
  code.push('return function validate(v) {');
  code.push('  if (typeof v !== "object" || v === null || Array.isArray(v)) {');
  code.push('    return { success: false, errors: [{ path: "value", message: "Expected object, received " + (v === null ? "null" : Array.isArray(v) ? "array" : typeof v) }] };');
  code.push('  }');
  code.push('  const errors = [];');

  if (additionalProps === false) {
    const allowedKeys = JSON.stringify(Object.keys(properties));
    code.push(`  const allowed = new Set(${allowedKeys});`);
    code.push('  for (const k of Object.keys(v)) {');
    code.push('    if (!allowed.has(k)) {');
    code.push('      errors.push({ path: k, message: "Unexpected property \'" + k + "\'" });');
    code.push('    }');
    code.push('  }');
  }

  for (const [key, prop] of Object.entries(properties)) {
    const isRequired = required.has(key);
    const varName = `val_${key.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    code.push(`  const ${varName} = v[${JSON.stringify(key)}];`);

    code.push(`  if (${varName} === undefined) {`);
    if (isRequired && !prop.optional) {
      if (prop.default !== undefined) {
        code.push(`    v[${JSON.stringify(key)}] = ${JSON.stringify(prop.default)};`);
      } else {
        code.push(`    errors.push({ path: ${JSON.stringify(key)}, message: "Field '" + ${JSON.stringify(key)} + "' is required" });`);
      }
    }
    code.push('  } else {');

    if (prop.nullable) {
      code.push(`    if (${varName} !== null) {`);
    } else {
      code.push(`    if (${varName} === null) {`);
      code.push(`      errors.push({ path: ${JSON.stringify(key)}, message: "Value cannot be null" });`);
      code.push('    } else {');
    }

    if (prop.type === 'string') {
      const s = prop as StringSchema;
      code.push(`      if (typeof ${varName} !== "string") {`);
      code.push(`        errors.push({ path: ${JSON.stringify(key)}, message: "Expected string, received " + typeof ${varName} });`);
      code.push('      } else {');
      if (s.minLength !== undefined) {
        code.push(`        if (${varName}.length < ${s.minLength}) errors.push({ path: ${JSON.stringify(key)}, message: "String length must be >= ${s.minLength}, got " + ${varName}.length });`);
      }
      if (s.maxLength !== undefined) {
        code.push(`        if (${varName}.length > ${s.maxLength}) errors.push({ path: ${JSON.stringify(key)}, message: "String length must be <= ${s.maxLength}, got " + ${varName}.length });`);
      }
      if (s.format === 'email') {
        code.push(`        if (!EMAIL_REGEX.test(${varName})) errors.push({ path: ${JSON.stringify(key)}, message: "Invalid email address format" });`);
      } else if (s.format === 'uuid') {
        code.push(`        if (!UUID_REGEX.test(${varName})) errors.push({ path: ${JSON.stringify(key)}, message: "Invalid UUID format" });`);
      } else if (s.format === 'url') {
        code.push(`        if (!URL_REGEX.test(${varName})) errors.push({ path: ${JSON.stringify(key)}, message: "Invalid URL format" });`);
      }
      code.push('      }');
    } else if (prop.type === 'number') {
      const n = prop as NumberSchema;
      code.push(`      if (typeof ${varName} !== "number" || Number.isNaN(${varName})) {`);
      code.push(`        errors.push({ path: ${JSON.stringify(key)}, message: "Expected number, received " + typeof ${varName} });`);
      code.push('      } else {');
      if (n.min !== undefined) {
        code.push(`        if (${varName} < ${n.min}) errors.push({ path: ${JSON.stringify(key)}, message: "Number must be >= ${n.min}, got " + ${varName} });`);
      }
      if (n.max !== undefined) {
        code.push(`        if (${varName} > ${n.max}) errors.push({ path: ${JSON.stringify(key)}, message: "Number must be <= ${n.max}, got " + ${varName} });`);
      }
      if (n.integer) {
        code.push(`        if (!Number.isInteger(${varName})) errors.push({ path: ${JSON.stringify(key)}, message: "Expected integer, received float" });`);
      }
      code.push('      }');
    } else if (prop.type === 'boolean') {
      code.push(`      if (typeof ${varName} !== "boolean") {`);
      code.push(`        errors.push({ path: ${JSON.stringify(key)}, message: "Expected boolean, received " + typeof ${varName} });`);
      code.push('      }');
    } else if (prop.type === 'literal') {
      code.push(`      if (${varName} !== ${JSON.stringify((prop as LiteralSchema).value)}) {`);
      code.push(`        errors.push({ path: ${JSON.stringify(key)}, message: "Expected literal " + ${JSON.stringify((prop as LiteralSchema).value)} + ", received " + ${varName} });`);
      code.push('      }');
    } else if (prop.type === 'enum') {
      const enumValues = JSON.stringify((prop as EnumSchema).values);
      code.push(`      const enumSet_${varName} = new Set(${enumValues});`);
      code.push(`      if (!enumSet_${varName}.has(${varName})) {`);
      code.push(`        errors.push({ path: ${JSON.stringify(key)}, message: "Value must be one of: " + ${enumValues} });`);
      code.push('      }');
    } else {
      return null;
    }

    code.push('    }');
    code.push('  }');
  }

  code.push('  if (errors.length > 0) return { success: false, errors };');
  code.push('  return { success: true, data: v };');
  code.push('};');

  try {
    const fn = new Function('EMAIL_REGEX', 'UUID_REGEX', 'URL_REGEX', code.join('\n'));
    return fn(EMAIL_REGEX, UUID_REGEX, URL_REGEX) as ValidatorFn<Static<T>>;
  } catch {
    return null;
  }
}

export function compile<T extends Schema>(schema: T, options?: CompileOptions): ValidatorFn<Static<T>> {
  const jit = tryCompileJIT(schema, options);
  if (jit) return jit;

  const coerce = options?.coerce ?? false;
  return function validate(value: unknown): ValidationResult<Static<T>> {
    const errors: ValidationErrorItem[] = [];
    const [valid, coerced] = validateValue(schema, value, '', errors, coerce);

    if (!valid || errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: coerced as Static<T> };
  };
}

export function validateOrThrow<T extends Schema>(schema: T, value: unknown): Static<T> {
  const validator = compile(schema);
  const result = validator(value);
  if (!result.success) {
    throw new ValidationError(result.errors);
  }
  return result.data;
}

function validateValue(
  schema: Schema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[],
  coerce = false
): [boolean, any] {
  if (value === undefined) {
    if (schema.default !== undefined) {
      return [true, schema.default];
    }
    if (schema.optional) {
      return [true, undefined];
    }
    errors.push({ path: path || 'value', message: 'Required value is missing' });
    return [false, undefined];
  }

  if (value === null) {
    if (schema.nullable) {
      return [true, null];
    }
    errors.push({ path: path || 'value', message: 'Value cannot be null' });
    return [false, null];
  }

  switch (schema.type) {
    case 'string': {
      if (coerce && (typeof value === 'number' || typeof value === 'boolean')) {
        value = String(value);
      }
      const valid = validateString(schema as StringSchema, value, path, errors);
      return [valid, value];
    }

    case 'number': {
      if (coerce && typeof value === 'string' && value.trim() !== '') {
        const num = Number(value);
        if (!Number.isNaN(num)) {
          value = num;
        }
      }
      const valid = validateNumber(schema as NumberSchema, value, path, errors);
      return [valid, value];
    }

    case 'boolean': {
      if (coerce && typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1') value = true;
        else if (lower === 'false' || lower === '0') value = false;
      }
      if (typeof value !== 'boolean') {
        errors.push({ path: path || 'value', message: `Expected boolean, received ${typeof value}` });
        return [false, value];
      }
      return [true, value];
    }

    case 'object':
      return validateObject(schema as ObjectSchema, value, path, errors, coerce);

    case 'array':
      return validateArray(schema as ArraySchema, value, path, errors, coerce);

    case 'literal':
      return [validateLiteral(schema as LiteralSchema, value, path, errors), value];

    case 'enum':
      return [validateEnum(schema as EnumSchema, value, path, errors), value];

    case 'union':
      return [validateUnion(schema as UnionSchema, value, path, errors, coerce), value];

    case 'custom':
      return [validateCustom(schema as CustomSchema, value, path, errors), value];

    case 'any':
      return [true, value];

    default:
      return [true, value];
  }
}

function validateString(
  schema: StringSchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[]
): boolean {
  if (typeof value !== 'string') {
    errors.push({ path: path || 'value', message: `Expected string, received ${typeof value}` });
    return false;
  }

  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push({
      path: path || 'value',
      message: `String length must be >= ${schema.minLength}, got ${value.length}`,
    });
    return false;
  }

  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push({
      path: path || 'value',
      message: `String length must be <= ${schema.maxLength}, got ${value.length}`,
    });
    return false;
  }

  if (schema.pattern && !schema.pattern.test(value)) {
    errors.push({ path: path || 'value', message: `String does not match pattern ${schema.pattern}` });
    return false;
  }

  if (schema.format) {
    if (schema.format === 'email' && !EMAIL_REGEX.test(value)) {
      errors.push({ path: path || 'value', message: 'Invalid email address format' });
      return false;
    }
    if (schema.format === 'uuid' && !UUID_REGEX.test(value)) {
      errors.push({ path: path || 'value', message: 'Invalid UUID format' });
      return false;
    }
    if (schema.format === 'url' && !URL_REGEX.test(value)) {
      errors.push({ path: path || 'value', message: 'Invalid URL format' });
      return false;
    }
  }

  return true;
}

function validateNumber(
  schema: NumberSchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[]
): boolean {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    errors.push({ path: path || 'value', message: `Expected number, received ${typeof value}` });
    return false;
  }

  if (schema.integer && !Number.isInteger(value)) {
    errors.push({ path: path || 'value', message: 'Expected integer value' });
    return false;
  }

  if (schema.min !== undefined && value < schema.min) {
    errors.push({ path: path || 'value', message: `Number must be >= ${schema.min}, got ${value}` });
    return false;
  }

  if (schema.max !== undefined && value > schema.max) {
    errors.push({ path: path || 'value', message: `Number must be <= ${schema.max}, got ${value}` });
    return false;
  }

  return true;
}

function validateObject(
  schema: ObjectSchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[],
  coerce = false
): [boolean, any] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    errors.push({ path: path || 'value', message: `Expected object, received ${typeof value}` });
    return [false, value];
  }

  const obj = { ...(value as Record<string, unknown>) };
  let allValid = true;

  // Check defined properties (populates defaults and coerced values)
  for (const [propKey, propSchema] of Object.entries(schema.properties)) {
    const propPath = path ? `${path}.${propKey}` : propKey;
    const [valid, propCoerced] = validateValue(propSchema as Schema, obj[propKey], propPath, errors, coerce);
    if (!valid) {
      allValid = false;
    } else if (propCoerced !== undefined) {
      obj[propKey] = propCoerced;
    }
  }

  // Check required fields
  for (const reqKey of schema.required) {
    if (obj[reqKey] === undefined) {
      errors.push({
        path: path ? `${path}.${reqKey}` : reqKey,
        message: `Field '${reqKey}' is required`,
      });
      allValid = false;
    }
  }

  // Check additionalProperties if false
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(obj)) {
      if (!(key in schema.properties)) {
        errors.push({
          path: path ? `${path}.${key}` : key,
          message: `Unexpected property '${key}'`,
        });
        allValid = false;
      }
    }
  }

  return [allValid, obj];
}

function validateArray(
  schema: ArraySchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[],
  coerce = false
): [boolean, any] {
  if (coerce && typeof value === 'string') {
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value);
      } catch {}
    } else if (value.includes(',')) {
      value = value.split(',').map((s) => s.trim());
    } else if (value !== '') {
      value = [value];
    }
  }

  if (!Array.isArray(value)) {
    errors.push({ path: path || 'value', message: `Expected array, received ${typeof value}` });
    return [false, value];
  }

  if (schema.minItems !== undefined && value.length < schema.minItems) {
    errors.push({
      path: path || 'value',
      message: `Array items must be >= ${schema.minItems}, got ${value.length}`,
    });
    return [false, value];
  }

  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    errors.push({
      path: path || 'value',
      message: `Array items must be <= ${schema.maxItems}, got ${value.length}`,
    });
    return [false, value];
  }

  let allValid = true;
  const arr = [...value];
  for (let i = 0; i < arr.length; i++) {
    const itemPath = `${path}[${i}]`;
    const [valid, itemCoerced] = validateValue(schema.items as Schema, arr[i], itemPath, errors, coerce);
    if (!valid) allValid = false;
    else if (itemCoerced !== undefined) arr[i] = itemCoerced;
  }

  return [allValid, arr];
}

function validateLiteral(
  schema: LiteralSchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[]
): boolean {
  if (value !== schema.value) {
    errors.push({
      path: path || 'value',
      message: `Expected literal ${JSON.stringify(schema.value)}, received ${JSON.stringify(value)}`,
    });
    return false;
  }
  return true;
}

function validateEnum(
  schema: EnumSchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[]
): boolean {
  if (!schema.values.includes(value as any)) {
    errors.push({
      path: path || 'value',
      message: `Value must be one of: ${schema.values.join(', ')}`,
    });
    return false;
  }
  return true;
}

function validateUnion(
  schema: UnionSchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[],
  coerce = false
): boolean {
  for (const variant of schema.schemas) {
    const subErrors: ValidationErrorItem[] = [];
    const [valid] = validateValue(variant, value, path, subErrors, coerce);
    if (valid) {
      return true;
    }
  }
  errors.push({
    path: path || 'value',
    message: 'Value did not match any allowed union variant',
  });
  return false;
}

function validateCustom(
  schema: CustomSchema,
  value: unknown,
  path: string,
  errors: ValidationErrorItem[]
): boolean {
  const res = schema.validate(value);
  if (res === true) return true;
  const msg = typeof res === 'string' ? res : 'Custom validation failed';
  errors.push({ path: path || 'value', message: msg });
  return false;
}
