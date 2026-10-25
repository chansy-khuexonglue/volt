export type SchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'union'
  | 'literal'
  | 'enum'
  | 'custom'
  | 'any';

export interface CompileOptions {
  coerce?: boolean;
}

export interface BaseSchema<T = unknown> {
  type: SchemaType;
  optional?: boolean;
  nullable?: boolean;
  default?: T;
  description?: string;
  _output?: T;
}

export interface StringSchemaOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  format?: 'email' | 'uuid' | 'url' | 'date-time';
  default?: string;
  description?: string;
}

export interface StringSchema extends BaseSchema<string>, StringSchemaOptions {
  type: 'string';
}

export interface NumberSchemaOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  default?: number;
  description?: string;
}

export interface NumberSchema extends BaseSchema<number>, NumberSchemaOptions {
  type: 'number';
}

export interface BooleanSchema extends BaseSchema<boolean> {
  type: 'boolean';
}

export interface ObjectSchemaOptions {
  additionalProperties?: boolean;
  description?: string;
}

export interface ObjectSchema<
  T extends Record<string, BaseSchema<any>> = Record<string, BaseSchema<any>>
> extends BaseSchema<{ [K in keyof T]: Static<T[K]> }>, ObjectSchemaOptions {
  type: 'object';
  properties: T;
  required: string[];
}

export interface ArraySchemaOptions {
  minItems?: number;
  maxItems?: number;
  description?: string;
}

export interface ArraySchema<T extends BaseSchema<any> = BaseSchema<any>>
  extends BaseSchema<Array<Static<T>>>, ArraySchemaOptions {
  type: 'array';
  items: T;
}

export interface UnionSchema<T extends readonly BaseSchema<any>[] = readonly BaseSchema<any>[]>
  extends BaseSchema<Static<T[number]>> {
  type: 'union';
  schemas: T;
}

export interface LiteralSchema<T = any> extends BaseSchema<T> {
  type: 'literal';
  value: T;
}

export interface EnumSchema<T extends readonly (string | number)[] = readonly (string | number)[]>
  extends BaseSchema<T[number]> {
  type: 'enum';
  values: T;
}

export interface CustomSchema<T = any> extends BaseSchema<T> {
  type: 'custom';
  validate: (value: unknown) => boolean | string;
}

export type Schema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | ObjectSchema<any>
  | ArraySchema<any>
  | UnionSchema<any>
  | LiteralSchema<any>
  | EnumSchema<any>
  | CustomSchema<any>
  | BaseSchema<any>;

// Static Type Inference
export type Static<T> = T extends { optional: true }
  ? StaticInner<T> | undefined
  : T extends { nullable: true }
    ? StaticInner<T> | null
    : StaticInner<T>;

type StaticInner<T> = T extends StringSchema
  ? string
  : T extends NumberSchema
    ? number
    : T extends BooleanSchema
      ? boolean
      : T extends LiteralSchema<infer L>
        ? L
        : T extends EnumSchema<infer E>
          ? E[number]
          : T extends ArraySchema<infer I>
            ? Array<Static<I>>
            : T extends ObjectSchema<infer P>
              ? {
                  [K in keyof P as P[K] extends { optional: true } ? never : K]: Static<P[K]>;
                } & {
                  [K in keyof P as P[K] extends { optional: true } ? K : never]?: Static<P[K]>;
                }
              : T extends UnionSchema<infer U>
                ? Static<U[number]>
                : T extends CustomSchema<infer C>
                  ? C
                  : T extends BaseSchema<infer O>
                    ? O
                    : unknown;

export interface ValidationErrorItem {
  path: string;
  message: string;
  expected?: string;
  received?: unknown;
}

export type ValidationResult<T> =
  | { success: true; data: T; errors?: never }
  | { success: false; errors: ValidationErrorItem[]; data?: never };

export class ValidationError extends Error {
  constructor(public errors: ValidationErrorItem[]) {
    super(`Validation failed: ${errors.map(e => `${e.path}: ${e.message}`).join(', ')}`);
    this.name = 'ValidationError';
  }
}
