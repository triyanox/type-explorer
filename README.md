# type-explorer

A powerful runtime type analysis utility for JavaScript/TypeScript that provides detailed structural analysis of values and their types, with support for automatic schema generation.

## Features

### Core Type Analysis

- Deep inspection of objects, arrays, and complex data structures
- Circular reference detection
- Configurable analysis depth and detail level
- Support for built-in types (Date, RegExp, Map, Set, etc.)
- Custom type handler registration
- Function parameter analysis
- Prototype chain inspection
- Support for TypedArrays and Symbols
- Accessor (getter/setter) detection
- Predefined configuration presets

### Schema Generation

- Automatic schema generation from runtime data
- Multiple schema adapter support
- Built-in Zod adapter
- Extensible adapter interface for other validation libraries
- Type-safe schema generation
- Support for complex nested structures
- Array and union type inference
- Optional and nullable field support

## Installation

```bash
# bun
bun add type-explorer

# pnpm
pnpm add type-explorer

# npm
npm install type-explorer

# yarn
yarn add type-explorer
```

## Basic Usage

### Type Analysis

```typescript
import { TypeAnalyzer } from "type-explorer";

const analyzer = new TypeAnalyzer();
const result = analyzer.analyze({
  name: "John",
  age: 30,
  hobbies: ["reading", "coding"],
});
```

### Schema Generation

```typescript
import { ZodSchemaAdapter } from "type-explorer";
import { z } from "zod"; // Required for Zod schemas

// Initialize the adapter
const zodAdapter = new ZodSchemaAdapter();

// Generate schema from data
const data = {
  user: {
    id: 1,
    name: "John",
    email: "john@example.com",
  },
};

// Generate schema string
const schemaString = zodAdapter.generateSchemaFromData(data);

// Create the actual schema
const schema = new Function("z", `return ${schemaString}`)(z);

// Use the schema for validation
const validationResult = schema.safeParse(data);
```

## Configuration

### Type Analyzer Configuration

```typescript
const analyzer = new TypeAnalyzer({
  maxDepth: 10,
  includeMethods: true,
  includeGettersSetters: true,
  includePrototype: true,
  includePrivateProps: false,
});
```

### Preset Configurations

```typescript
import { CONFIG_PRESETS } from "type-explorer";

// Available presets:
const analyzer = new TypeAnalyzer(CONFIG_PRESETS.MINIMAL); // Quick surface-level analysis
const analyzer = new TypeAnalyzer(CONFIG_PRESETS.STANDARD); // Balanced depth and detail
const analyzer = new TypeAnalyzer(CONFIG_PRESETS.DETAILED); // Deep inspection including private properties
```

## Schema Adapters

### Built-in Zod Adapter

1. Install dependencies:

```bash
npm install zod
```

2. Basic usage:

```typescript
import { ZodSchemaAdapter } from "type-explorer";
import { z } from "zod";

const zodAdapter = new ZodSchemaAdapter();

// Generate schema directly from data
const schemaString = zodAdapter.generateSchemaFromData(myData);
const schema = new Function("z", `return ${schemaString}`)(z);
```

### Supported Types in Zod Adapter

The Zod adapter supports automatic schema generation for:

- Primitive Types
  - `string`
  - `number`
  - `boolean`
  - `null`
  - `undefined`
- Complex Types
  - `object` (nested objects)
  - `array` (including mixed type arrays)
  - `Date`
  - `enum`
  - `union`
  - `optional`
  - `nullable`

### Creating Custom Schema Adapters

You can create adapters for other validation libraries by implementing the `SchemaAdapter` interface:

```typescript
export interface SchemaAdapter {
  // Generate schema from type information
  generateSchema(typeInfo: any): string;

  // Generate schema directly from data
  generateSchemaFromData(data: any): string;

  // Validate if required dependencies are installed
  validateDependencies(): boolean;

  // Get adapter name
  getName(): string;

  // Get required dependencies
  getRequiredDependencies(): string[];
}
```

## Advanced Usage

### Custom Type Handlers

```typescript
analyzer.registerCustomType("MyClass", (value, context) => ({
  type: "MyClass",
  customProperty: value.someProperty,
  path: [...context.path],
}));
```

### Complex Data Analysis

```typescript
const complexData = {
  user: {
    id: 1,
    name: "John Doe",
    roles: ["admin", "user"],
    settings: {
      theme: "dark",
      notifications: true,
      lastLogin: new Date(),
    },
    metadata: {
      loginCount: 42,
      preferences: {
        language: "en",
        timezone: "UTC",
      },
    },
  },
};

// Analyze the structure
const analysis = analyzer.analyze(complexData);

// Generate a schema
const zodAdapter = new ZodSchemaAdapter();
const schema = zodAdapter.generateSchemaFromData(complexData);
```

### Error Handling

The library provides comprehensive error handling:

```typescript
try {
  const schema = zodAdapter.generateSchemaFromData(data);
  const validationResult = schema.safeParse(invalidData);

  if (!validationResult.success) {
    console.log("Validation errors:", validationResult.error);
  }
} catch (error) {
  console.error("Schema generation error:", error);
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions for:

- All interfaces and types
- Analysis results
- Configuration options
- Schema adapters
- Custom type handlers

## Examples

Check out the [examples](https://github.com/triyanox/type-explorer/tree/main/examples) directory in the repository for more detailed examples:

- Basic type analysis
- Schema generation
- Custom type handlers
- Complex data structures
- Error handling
- Integration with different validation libraries

## License

MIT

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/triyanox/type-explorer).
