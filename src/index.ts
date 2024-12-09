/**
 * Configuration options for the TypeAnalyzer.
 * Controls the depth and detail level of the analysis.
 */
export interface AnalyzerConfig {
  maxDepth: number;
  includeMethods: boolean;
  includeGettersSetters: boolean;
  includePrototype: boolean;
  includePrivateProps: boolean;
  customTypes: Map<string, TypeHandler>;
}

/**
 * Internal context object used during analysis to track depth,
 * property paths, and handle circular references.
 */
export interface AnalyzerContext {
  depth: number;
  path: (string | number | symbol)[];
  visited: WeakSet<object>;
}

export type TypeHandler = (
  value: any,
  context: AnalyzerContext
) => AnalysisResult;

/**
 * Base interface for all analysis results.
 * Includes the type name and the path to the analyzed value.
 */
export interface BaseAnalysisResult {
  type: string;
  path: (string | number | symbol)[];
}

export interface ErrorAnalysisResult extends BaseAnalysisResult {
  type: "error";
  error: string;
}

export interface MaxDepthAnalysisResult extends BaseAnalysisResult {
  type: "max-depth-reached";
}

export interface CircularReferenceResult extends BaseAnalysisResult {
  type: "circular-reference";
}

export interface NullAnalysisResult extends BaseAnalysisResult {
  type: "null";
}

export interface UndefinedAnalysisResult extends BaseAnalysisResult {
  type: "undefined";
}

export interface PrimitiveAnalysisResult extends BaseAnalysisResult {
  type: "string" | "number" | "boolean" | "bigint";
  value: string | number | boolean | bigint;
}

export interface SymbolAnalysisResult extends BaseAnalysisResult {
  type: "symbol";
  description: string | undefined;
}

/**
 * Analysis result for function values. Includes function name, async/generator status,
 * and optionally parameter information.
 *
 * Example result:
 * ```ts
 * {
 *   type: "function",
 *   name: "calculateTotal",
 *   isAsync: true,
 *   parameters: {
 *     count: 2,
 *     names: ["price", "quantity"]
 *   }
 * }
 * ```
 */
export interface FunctionAnalysisResult extends BaseAnalysisResult {
  type: "function";
  name: string;
  isAsync: boolean;
  isGenerator: boolean;
  parameters?: {
    count: number;
    names: string[];
    error?: string;
  };
}

/**
 * Analysis result for array values. Provides detailed type information
 * about array elements, including frequency analysis and element locations.
 *
 * Example result:
 * ```ts
 * {
 *   type: "array",
 *   length: 3,
 *   elementTypes: [
 *     { type: { type: "number" }, frequency: 0.67, count: 2, indices: [0, 2] },
 *     { type: { type: "string" }, frequency: 0.33, count: 1, indices: [1] }
 *   ]
 * }
 * ```
 */
export interface ArrayAnalysisResult extends BaseAnalysisResult {
  type: "array";
  length: number;
  elementTypes: Array<{
    type: AnalysisResult;
    frequency: number;
    count: number;
    indices: number[];
  }>;
}

/**
 * Analysis result for object values. Provides information about the object's
 * structure, including properties, symbol properties, and prototype chain.
 *
 * Example result:
 * ```ts
 * {
 *   type: "object",
 *   constructor: "Person",
 *   properties: {
 *     name: { type: "string", value: "John" },
 *     age: { type: "number", value: 30 }
 *   },
 *   prototype: {
 *     constructor: "Person",
 *     methods: ["speak", "walk"]
 *   }
 * }
 * ```
 */
export interface ObjectAnalysisResult extends BaseAnalysisResult {
  type: "object";
  constructor: string;
  properties: Record<string, AnalysisResult>;
  symbolProperties?: Record<string, AnalysisResult>;
  prototype?: {
    constructor: string | undefined;
    methods?: string[];
  };
}

export interface DateAnalysisResult extends BaseAnalysisResult {
  type: "Date";
  value: string;
  timestamp: number;
}

export interface RegExpAnalysisResult extends BaseAnalysisResult {
  type: "RegExp";
  pattern: string;
  flags: string;
}

/**
 * Analysis result for Map objects. Includes size and optionally the analyzed
 * key-value pairs if within max depth.
 */
export interface MapAnalysisResult extends BaseAnalysisResult {
  type: "Map";
  size: number;
  entries?: Array<{
    key: AnalysisResult;
    value: AnalysisResult;
  }>;
}

/**
 * Analysis result for Set objects. Includes size and optionally the analyzed
 * values if within max depth.
 */
export interface SetAnalysisResult extends BaseAnalysisResult {
  type: "Set";
  size: number;
  values?: AnalysisResult[];
}

export interface PromiseAnalysisResult extends BaseAnalysisResult {
  type: "Promise";
  state: "pending";
}

export interface ErrorObjectAnalysisResult extends BaseAnalysisResult {
  type: "Error";
  name: string;
  message: string;
  stack?: string;
}

/**
 * Analysis result for TypedArray objects (Int8Array, Uint8Array, etc.).
 * Provides array buffer information and shared memory status.
 */
export interface TypedArrayAnalysisResult extends BaseAnalysisResult {
  type: string;
  length: number;
  byteLength: number;
  byteOffset: number;
  isShared: boolean;
}

export type AnalysisResult =
  | ErrorAnalysisResult
  | MaxDepthAnalysisResult
  | CircularReferenceResult
  | NullAnalysisResult
  | UndefinedAnalysisResult
  | PrimitiveAnalysisResult
  | SymbolAnalysisResult
  | FunctionAnalysisResult
  | ArrayAnalysisResult
  | ObjectAnalysisResult
  | DateAnalysisResult
  | RegExpAnalysisResult
  | MapAnalysisResult
  | SetAnalysisResult
  | PromiseAnalysisResult
  | ErrorObjectAnalysisResult
  | TypedArrayAnalysisResult;

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

/**
 * A powerful type analysis utility that deeply inspects JavaScript/TypeScript values
 * and produces detailed structural analysis of their types and properties.
 *
 * Example:
 * ```ts
 * const analyzer = new TypeAnalyzer();
 * const result = analyzer.analyze({
 *   name: "John",
 *   age: 30,
 *   hobbies: ["reading", "coding"]
 * });
 * ```
 */
export class TypeAnalyzer {
  private config: AnalyzerConfig;
  private typeHandlers: Map<string, TypeHandler>;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = {
      maxDepth: config.maxDepth || 10,
      includeMethods: config.includeMethods !== false,
      includeGettersSetters: config.includeGettersSetters !== false,
      includePrototype: config.includePrototype !== false,
      includePrivateProps: config.includePrivateProps === true,
      customTypes: new Map(),
      ...config,
    };

    this.typeHandlers = new Map();
    this.initializeDefaultHandlers();
  }

  initializeDefaultHandlers() {
    this.registerTypeHandler("null", this.handleNull.bind(this));
    this.registerTypeHandler("undefined", this.handleUndefined.bind(this));
    this.registerTypeHandler("string", this.handlePrimitive.bind(this));
    this.registerTypeHandler("number", this.handlePrimitive.bind(this));
    this.registerTypeHandler("boolean", this.handlePrimitive.bind(this));
    this.registerTypeHandler("bigint", this.handlePrimitive.bind(this));
    this.registerTypeHandler("symbol", this.handleSymbol.bind(this));
    this.registerTypeHandler("function", this.handleFunction.bind(this));
    this.registerTypeHandler("array", this.handleArray.bind(this));
    this.registerTypeHandler("object", this.handleObject.bind(this));
    this.registerBuiltInHandlers();
  }

  registerBuiltInHandlers() {
    const builtInHandlers: Record<string, TypeHandler> = {
      Date: (value: Date, context: AnalyzerContext): DateAnalysisResult => ({
        type: "Date",
        value: value.toISOString(),
        timestamp: value.getTime(),
        path: [...context.path],
      }),
      RegExp: (
        value: RegExp,
        context: AnalyzerContext
      ): RegExpAnalysisResult => ({
        type: "RegExp",
        pattern: value.source,
        flags: value.flags,
        path: [...context.path],
      }),
      Map: (
        value: Map<unknown, unknown>,
        context: AnalyzerContext
      ): MapAnalysisResult => ({
        type: "Map",
        size: value.size,
        entries:
          this.config.maxDepth > context.depth
            ? Array.from(value.entries()).map(([k, v]) => ({
                key: this.analyze(k, { ...context, depth: context.depth + 1 }),
                value: this.analyze(v, {
                  ...context,
                  depth: context.depth + 1,
                }),
              }))
            : undefined,
        path: [...context.path],
      }),
      Set: (
        value: Set<unknown>,
        context: AnalyzerContext
      ): SetAnalysisResult => ({
        type: "Set",
        size: value.size,
        values:
          this.config.maxDepth > context.depth
            ? Array.from(value).map((v) =>
                this.analyze(v, { ...context, depth: context.depth + 1 })
              )
            : undefined,
        path: [...context.path],
      }),
      Promise: (
        _value: Promise<unknown>,
        context: AnalyzerContext
      ): PromiseAnalysisResult => ({
        type: "Promise",
        state: "pending",
        path: [...context.path],
      }),
      Error: (
        value: Error,
        context: AnalyzerContext
      ): ErrorObjectAnalysisResult => ({
        type: "Error",
        name: value.name,
        message: value.message,
        stack: value.stack,
        path: [...context.path],
      }),
    };

    const typedArrays = [
      Int8Array,
      Uint8Array,
      Uint8ClampedArray,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      BigInt64Array,
      BigUint64Array,
    ];

    for (const TypedArrayConstructor of typedArrays) {
      builtInHandlers[TypedArrayConstructor.name] = (
        value: TypedArray,
        context: AnalyzerContext
      ): TypedArrayAnalysisResult => ({
        type: TypedArrayConstructor.name,
        length: value.length,
        byteLength: value.byteLength,
        byteOffset: value.byteOffset,
        isShared: value.buffer?.constructor?.name === "SharedArrayBuffer",
        path: [...context.path],
      });
    }

    for (const [type, handler] of Object.entries(builtInHandlers)) {
      this.registerCustomType(type, handler);
    }
  }

  registerTypeHandler(type: string, handler: TypeHandler) {
    this.typeHandlers.set(type, handler);
  }

  /**
   * Registers a custom type handler for a specific class name.
   */
  registerCustomType(className: string, handler: TypeHandler) {
    this.config.customTypes.set(className, handler);
  }

  analyze(
    value: unknown,
    context: AnalyzerContext = { depth: 0, path: [], visited: new WeakSet() }
  ): AnalysisResult {
    try {
      if (context.depth > this.config.maxDepth) {
        return { type: "max-depth-reached", path: [...context.path] };
      }
      if (value === null) {
        return this.typeHandlers.get("null")!(value, context);
      }
      const baseType = typeof value;
      if (this.typeHandlers.has(baseType) && baseType !== "object") {
        return this.typeHandlers.get(baseType)!(value, context);
      }
      if (Array.isArray(value)) {
        return this.typeHandlers.get("array")!(value, context);
      }

      if (typeof value === "object" && context.visited.has(value)) {
        return {
          type: "circular-reference",
          path: [...context.path],
        };
      }

      if (value?.constructor?.name) {
        const customHandler = this.config.customTypes.get(
          value.constructor.name
        );
        if (customHandler) {
          return customHandler(value, context);
        }
      }

      return this.typeHandlers.get("object")!(value, context);
    } catch (error) {
      return {
        type: "error",
        error: error instanceof Error ? error.message : String(error),
        path: [...context.path],
      };
    }
  }

  handleNull(value: unknown, context: AnalyzerContext): NullAnalysisResult {
    return { type: "null", path: [...context.path] };
  }

  handleUndefined(
    value: unknown,
    context: AnalyzerContext
  ): UndefinedAnalysisResult {
    return { type: "undefined", path: [...context.path] };
  }

  handlePrimitive(
    value: string | number | boolean | bigint,
    context: AnalyzerContext
  ): PrimitiveAnalysisResult {
    return {
      type: typeof value as "string" | "number" | "boolean" | "bigint",
      value: value,
      path: [...context.path],
    };
  }

  handleSymbol(value: Symbol, context: AnalyzerContext): SymbolAnalysisResult {
    return {
      type: "symbol",
      description: value.description,
      path: [...context.path],
    };
  }

  handleFunction(
    value: Function,
    context: AnalyzerContext
  ): FunctionAnalysisResult {
    const funcInfo: FunctionAnalysisResult = {
      type: "function",
      name: value.name || "(anonymous)",
      isAsync: value.constructor.name === "AsyncFunction",
      isGenerator: value.constructor.name === "GeneratorFunction",
      path: [...context.path],
    };

    if (this.config.includeMethods) {
      funcInfo.parameters = this.analyzeFunctionParameters(value);
    }

    return funcInfo;
  }

  handleArray(value: unknown[], context: AnalyzerContext): ArrayAnalysisResult {
    context.visited.add(value);

    return {
      type: "array",
      length: value.length,
      elementTypes: this.analyzeArrayElements(value, context),
      path: [...context.path],
    };
  }

  handleObject(value: object, context: AnalyzerContext): ObjectAnalysisResult {
    context.visited.add(value);

    const result: ObjectAnalysisResult = {
      type: "object",
      constructor: value.constructor?.name || "Object",
      path: [...context.path],
      properties: {},
    };

    const properties: Record<string, AnalysisResult> = {};
    const prototype = Object.getPrototypeOf(value);

    const propertyNames = this.config.includePrivateProps
      ? Object.getOwnPropertyNames(value)
      : Object.keys(value);

    for (const prop of propertyNames) {
      if (!this.config.includePrivateProps && prop.startsWith("#")) {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(value, prop);

      if (
        this.config.includeGettersSetters &&
        (descriptor?.get || descriptor?.set)
      ) {
        properties[prop] = {
          type: "accessor",
          hasGetter: !!descriptor.get,
          hasSetter: !!descriptor.set,
          path: [...context.path, prop],
        } as AnalysisResult;
        continue;
      }

      try {
        const newContext = {
          ...context,
          depth: context.depth + 1,
          path: [...context.path, prop],
        };
        properties[prop] = this.analyze(
          (value as Record<string, unknown>)[prop],
          newContext
        );
      } catch (error) {
        properties[prop] = {
          type: "error",
          error: error instanceof Error ? error.message : String(error),
          path: [...context.path, prop],
        };
      }
    }

    result.properties = properties;

    const symbolProps: Record<string, AnalysisResult> = {};
    for (const sym of Object.getOwnPropertySymbols(value)) {
      try {
        const newContext = {
          ...context,
          depth: context.depth + 1,
          path: [...context.path, sym.description || "Symbol"],
        };
        symbolProps[sym.toString()] = this.analyze(
          (value as Record<symbol, unknown>)[sym],
          newContext
        );
      } catch (error) {
        symbolProps[sym.toString()] = {
          type: "error",
          error: error instanceof Error ? error.message : String(error),
          path: [...context.path, sym.description || "Symbol"],
        };
      }
    }

    if (Object.keys(symbolProps).length > 0) {
      result.symbolProperties = symbolProps;
    }

    if (
      this.config.includePrototype &&
      prototype &&
      prototype !== Object.prototype
    ) {
      result.prototype = {
        constructor: prototype.constructor?.name,
        methods: this.config.includeMethods
          ? Object.getOwnPropertyNames(prototype).filter(
              (name) => typeof prototype[name] === "function"
            )
          : undefined,
      };
    }

    return result;
  }

  analyzeFunctionParameters(func: Function): {
    count: number;
    names: string[];
    error?: string;
  } {
    try {
      const funcStr = func.toString();
      const argsMatch = funcStr.match(/\(([\s\S]*?)\)/);

      if (!argsMatch) return { count: 0, names: [] };

      const paramStr = argsMatch[1].trim();
      if (!paramStr) return { count: 0, names: [] };

      const paramNames = paramStr
        .split(",")
        .map((param: string) => param.trim())
        .filter(Boolean);

      return {
        count: paramNames.length,
        names: paramNames,
      };
    } catch (error) {
      return {
        count: 0,
        names: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  analyzeArrayElements(arr: unknown[], context: AnalyzerContext) {
    const typeMap = new Map<
      string,
      {
        type: AnalysisResult;
        count: number;
        indices: number[];
      }
    >();

    arr.forEach((element: unknown, index: number) => {
      const newContext = {
        ...context,
        depth: context.depth + 1,
        path: [...context.path, index],
      };

      const elementType = this.analyze(element, newContext);
      const typeKey = JSON.stringify(elementType);

      if (!typeMap.has(typeKey)) {
        typeMap.set(typeKey, {
          type: elementType,
          count: 1,
          indices: [index],
        });
      } else {
        const entry = typeMap.get(typeKey)!;
        entry.count++;
        entry.indices.push(index);
      }
    });

    return Array.from(typeMap.values())
      .map(({ type, count, indices }) => ({
        type,
        frequency: count / arr.length,
        count,
        indices,
      }))
      .sort((a, b) => b.count - a.count);
  }
}

/**
 * Predefined configuration presets for common analysis scenarios.
 * - MINIMAL: Quick surface-level analysis
 * - STANDARD: Balanced depth and detail
 * - DETAILED: Deep inspection including private properties
 */
export const CONFIG_PRESETS: Record<
  "MINIMAL" | "STANDARD" | "DETAILED",
  Partial<AnalyzerConfig>
> = {
  MINIMAL: {
    maxDepth: 3,
    includeMethods: false,
    includeGettersSetters: false,
    includePrototype: false,
    includePrivateProps: false,
  },
  STANDARD: {
    maxDepth: 10,
    includeMethods: true,
    includeGettersSetters: true,
    includePrototype: true,
    includePrivateProps: false,
  },
  DETAILED: {
    maxDepth: 20,
    includeMethods: true,
    includeGettersSetters: true,
    includePrototype: true,
    includePrivateProps: true,
  },
};

export default TypeAnalyzer;

export * from "./adapters/adapter.interface";
export * from "./adapters/joi.adapter";
export * from "./adapters/openapi.adapter";
export * from "./adapters/yup.adapter";
export * from "./adapters/zod.adapter";
