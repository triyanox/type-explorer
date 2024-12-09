# type-explorer

A powerful runtime type analysis and schema generation utility for TypeScript/JavaScript that provides deep structural analysis of values and automatic schema generation for popular validation libraries.

## Key Features

- **Deep Type Analysis**

  - Comprehensive inspection of complex data structures
  - Circular reference detection
  - Support for all JavaScript built-in types
  - Custom type handler registration
  - Configurable analysis depth

- **Schema Generation**

  - Multi-library support (Zod, Joi, Yup, OpenAPI)
  - Type-safe schema generation
  - Automatic type inference
  - Support for complex nested structures

- **Developer Experience**
  - TypeScript-first design
  - Extensive configuration options
  - Predefined analysis presets
  - Detailed type information

## Installation

```bash
# Using bun
bun add type-explorer

# Using npm
npm install type-explorer

# Using yarn
yarn add type-explorer

# Using pnpm
pnpm add type-explorer
```

## Quick Start

```typescript
import { TypeAnalyzer } from "type-explorer";

// Initialize analyzer
const analyzer = new TypeAnalyzer();

// Analyze data structure
const result = analyzer.analyze({
  user: {
    id: 1,
    name: "John Doe",
    roles: ["admin", "user"],
    lastLogin: new Date(),
  },
});

// Generate schema (e.g., using Zod)
import { ZodSchemaAdapter } from "type-explorer";
const zodAdapter = new ZodSchemaAdapter();
const schema = zodAdapter.generateSchemaFromData(data);
```

## Core Concepts

### Type Analysis

The `TypeAnalyzer` provides detailed information about your data structures:

```typescript
const analysis = analyzer.analyze({
  name: "John",
  age: 30,
  hobbies: ["reading", "coding"],
  metadata: {
    lastLogin: new Date(),
    preferences: { theme: "dark" },
  },
});
```

### Analysis Configuration

Customize the analysis depth and detail level:

```typescript
const analyzer = new TypeAnalyzer({
  maxDepth: 10, // Maximum recursion depth
  includeMethods: true, // Include function analysis
  includeGettersSetters: true, // Include accessor properties
  includePrototype: true, // Include prototype chain
  includePrivateProps: false, // Exclude private properties
});
```

### Preset Configurations

```typescript
import { CONFIG_PRESETS } from "type-explorer";

// Quick surface-level analysis
const minimalAnalyzer = new TypeAnalyzer(CONFIG_PRESETS.MINIMAL);

// Balanced depth and detail (default)
const standardAnalyzer = new TypeAnalyzer(CONFIG_PRESETS.STANDARD);

// Deep inspection including private properties
const detailedAnalyzer = new TypeAnalyzer(CONFIG_PRESETS.DETAILED);
```

## Schema Generation

### Zod Schemas

```typescript
import { ZodSchemaAdapter } from "type-explorer";
import { z } from "zod";

const zodAdapter = new ZodSchemaAdapter();
const schemaString = zodAdapter.generateSchemaFromData(data);
const schema = new Function("z", `return ${schemaString}`)(z);

console.log(schema.parse(data));
```

Supported types:

- Primitives (`string`, `number`, `boolean`, `null`, `undefined`)
- Complex types (`object`, `array`, `Date`, `enum`, `union`)
- Modifiers (`optional`, `nullable`)

### Joi Schemas

```typescript
import { JoiSchemaAdapter } from "type-explorer";
import * as Joi from "joi";

const joiAdapter = new JoiSchemaAdapter();
const schemaString = joiAdapter.generateSchemaFromData(data);
const schema = new Function("Joi", `return ${schemaString}`)(Joi);

console.log(schema.validate(data));
```

Supported types:

- Primitives (`string`, `number`, `boolean`, `null`, `undefined`)
- Complex types (`object`, `array`, `Date`)
- Validation features (`valid()`, `alternatives().try()`, `allow(null)`)

### Yup Schemas

```typescript
import { YupSchemaAdapter } from "type-explorer";
import * as yup from "yup";

const yupAdapter = new YupSchemaAdapter();
const schemaString = yupAdapter.generateSchemaFromData(data);
const schema = new Function("yup", `return ${schemaString}`)(yup);

console.log(schema.validateSync(data));
```

Supported types:

- Primitives (`string`, `number`, `boolean`, `null`, `undefined`)
- Complex types (`object`, `array`, `Date`)
- Validation features (`oneOf()`, `nullable()`, `optional()`)

### OpenAPI Schemas

```typescript
import { OpenAPISchemaAdapter } from "type-explorer";

const openAPIAdapter = new OpenAPISchemaAdapter();
const schemaString = openAPIAdapter.generateSchemaFromData(data);
const schema = JSON.parse(schemaString);
console.log(schema);
```

Supported features:

- OpenAPI 3.0 specification
- All standard JSON Schema types
- Nullable properties
- References (`$ref`)
- Property descriptions

## Advanced Usage

### Custom Type Handlers

Register custom type handlers for specialized classes:

```typescript
analyzer.registerCustomType("MyClass", (value, context) => ({
  type: "MyClass",
  customProperty: value.someProperty,
  path: [...context.path],
}));
```

### Error Handling

```typescript
try {
  const schema = adapter.generateSchemaFromData(data);
  const validationResult = schema.safeParse(testData);

  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error);
  }
} catch (error) {
  console.error("Schema generation error:", error);
}
```

### Type Analysis Results

The analyzer provides detailed type information:

```typescript
interface AnalysisResult {
  type: string; // Type identifier
  path: (string | number)[]; // Property path
  properties?: Record<string, AnalysisResult>; // For objects
  elementTypes?: Array<{
    // For arrays
    type: AnalysisResult;
    frequency: number;
    count: number;
    indices: number[];
  }>;
  // ... additional type-specific properties
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/triyanox/type-explorer)
- [Issue Tracker](https://github.com/triyanox/type-explorer/issues)
- [Documentation](https://github.com/triyanox/type-explorer#readme)
