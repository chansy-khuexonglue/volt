import {
  ArraySchema,
  ArraySchemaOptions,
  BaseSchema,
  BooleanSchema,
  CustomSchema,
  EnumSchema,
  LiteralSchema,
  NumberSchema,
  NumberSchemaOptions,
  ObjectSchema,
  ObjectSchemaOptions,
  Schema,
  StringSchema,
  StringSchemaOptions,
  UnionSchema,
} from './types';

export const t = {
  String(options: StringSchemaOptions = {}): StringSchema {
    return {
      type: 'string',
      ...options,
    };
  },

  Number(options: NumberSchemaOptions = {}): NumberSchema {
    return {
      type: 'number',
      ...options,
    };
  },

  Integer(options: Omit<NumberSchemaOptions, 'integer'> = {}): NumberSchema {
    return {
      type: 'number',
      integer: true,
      ...options,
    };
  },

  Boolean(): BooleanSchema {
    return {
      type: 'boolean',
    };
  },

  Object<T extends Record<string, BaseSchema<any>>>(
    properties: T,
    options: ObjectSchemaOptions = {}
  ): ObjectSchema<T> {
    const required = Object.entries(properties)
      .filter(([_, schema]) => !schema.optional)
      .map(([key]) => key);

    return {
      type: 'object',
      properties,
      required,
      ...options,
    };
  },

  Array<T extends BaseSchema<any>>(items: T, options: ArraySchemaOptions = {}): ArraySchema<T> {
    return {
      type: 'array',
      items,
      ...options,
    };
  },

  Union<T extends readonly BaseSchema<any>[]>(schemas: T): UnionSchema<T> {
    return {
      type: 'union',
      schemas,
    };
  },

  Literal<T extends string | number | boolean>(value: T): LiteralSchema<T> {
    return {
      type: 'literal',
      value,
    };
  },

  Enum<T extends readonly (string | number)[]>(values: T): EnumSchema<T> {
    return {
      type: 'enum',
      values,
    };
  },

  Optional<T extends BaseSchema<any>>(schema: T): T & { optional: true } {
    return {
      ...schema,
      optional: true,
    };
  },

  Nullable<T extends BaseSchema<any>>(schema: T): T & { nullable: true } {
    return {
      ...schema,
      nullable: true,
    };
  },

  Custom<T = any>(
    validate: (value: unknown) => boolean | string,
    description?: string
  ): CustomSchema<T> {
    return {
      type: 'custom',
      validate,
      description,
    };
  },

  Any(): BaseSchema<any> {
    return {
      type: 'any',
    };
  },
};
