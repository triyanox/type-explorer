import { TypeAnalyzer } from "../index";
import { SchemaAdapter } from "./adapter.interface";

export interface OpenAPIConfig {
  title: string;
  version: string;
  description?: string;
  servers?: { url: string; description?: string }[];
}

export class OpenAPISchemaAdapter implements SchemaAdapter {
  private readonly requiredDependencies: string[] = [];
  private analyzer: TypeAnalyzer;
  private config: OpenAPIConfig;

  constructor(config: OpenAPIConfig) {
    this.analyzer = new TypeAnalyzer();
    this.config = config;
  }

  getName(): string {
    return "openapi";
  }

  getRequiredDependencies(): string[] {
    return this.requiredDependencies;
  }

  validateDependencies(): boolean {
    return true;
  }

  generateSchemaFromData(data: any): string {
    const typeInfo = this.analyzer.analyze(data);
    return this.generateSchema(typeInfo);
  }

  generateSchema(typeInfo: any): string {
    try {
      const schema = {
        openapi: "3.0.0",
        info: {
          title: this.config.title,
          version: this.config.version,
          description: this.config.description,
        },
        servers: this.config.servers || [{ url: "http://localhost:3000" }],
        paths: {},
        components: {
          schemas: this.generateComponentSchemas(typeInfo),
        },
      };

      return JSON.stringify(schema, null, 2);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate OpenAPI schema: ${error.message}`);
      }
      throw new Error("Failed to generate OpenAPI schema: Unknown error");
    }
  }

  private generateComponentSchemas(typeInfo: any, name: string = "Root"): any {
    const schemas: Record<string, any> = {};

    if (typeInfo.type === "object") {
      schemas[name] = {
        type: "object",
        properties: {},
        required: [],
      };

      Object.entries(typeInfo.properties || {}).forEach(
        ([propName, propValue]: [string, any]) => {
          const { schema: propSchema, subSchemas } =
            this.generatePropertySchema(
              propValue,
              `${name}${propName.charAt(0).toUpperCase()}${propName.slice(1)}`
            );

          schemas[name].properties[propName] = propSchema;
          Object.assign(schemas, subSchemas);

          if (!this.isOptionalType(propValue)) {
            schemas[name].required.push(propName);
          }
        }
      );

      if (schemas[name].required.length === 0) {
        delete schemas[name].required;
      }
    } else if (typeInfo.type === "array") {
      const { schema: itemSchema, subSchemas } = this.generatePropertySchema(
        typeInfo.elementTypes[0].type,
        `${name}Item`
      );
      schemas[name] = {
        type: "array",
        items: itemSchema,
      };
      Object.assign(schemas, subSchemas);
    }

    return schemas;
  }

  private generatePropertySchema(
    typeInfo: any,
    name: string
  ): { schema: any; subSchemas: Record<string, any> } {
    const subSchemas: Record<string, any> = {};

    switch (typeInfo.type) {
      case "string":
        return { schema: { type: "string" }, subSchemas };
      case "number":
        return { schema: { type: "number" }, subSchemas };
      case "boolean":
        return { schema: { type: "boolean" }, subSchemas };
      case "Date":
        return {
          schema: { type: "string", format: "date-time" },
          subSchemas,
        };
      case "array":
        const { schema: itemSchema, subSchemas: itemSubSchemas } =
          this.generatePropertySchema(
            typeInfo.elementTypes[0].type,
            `${name}Item`
          );
        Object.assign(subSchemas, itemSubSchemas);
        return {
          schema: { type: "array", items: itemSchema },
          subSchemas,
        };
      case "object":
        const generatedSchemas = this.generateComponentSchemas(typeInfo, name);
        Object.assign(subSchemas, generatedSchemas);
        return {
          schema: { $ref: `#/components/schemas/${name}` },
          subSchemas,
        };
      case "enum":
        return {
          schema: { type: "string", enum: typeInfo.values },
          subSchemas,
        };
      case "union":
        const unionSchemas = typeInfo.types.map((t: any, index: number) => {
          const { schema, subSchemas: unionSubSchemas } =
            this.generatePropertySchema(t, `${name}Option${index + 1}`);
          Object.assign(subSchemas, unionSubSchemas);
          return schema;
        });
        return { schema: { oneOf: unionSchemas }, subSchemas };
      case "optional":
        const { schema: optionalSchema, subSchemas: optionalSubSchemas } =
          this.generatePropertySchema(typeInfo.valueType, name);
        Object.assign(subSchemas, optionalSubSchemas);
        return {
          schema: { ...optionalSchema, nullable: true },
          subSchemas,
        };
      case "nullable":
        const { schema: nullableSchema, subSchemas: nullableSubSchemas } =
          this.generatePropertySchema(typeInfo.valueType, name);
        Object.assign(subSchemas, nullableSubSchemas);
        return {
          schema: { ...nullableSchema, nullable: true },
          subSchemas,
        };
      default:
        return { schema: {}, subSchemas };
    }
  }

  private isOptionalType(typeInfo: any): boolean {
    return typeInfo.type === "optional" || typeInfo.type === "nullable";
  }
}
