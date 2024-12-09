import { TypeAnalyzer } from "../index";
import { SchemaAdapter } from "./adapter.interface";

export class ZodSchemaAdapter implements SchemaAdapter {
  private readonly requiredDependencies = ["zod"];
  private analyzer: TypeAnalyzer;

  constructor() {
    this.analyzer = new TypeAnalyzer();
  }

  getName(): string {
    return "zod";
  }

  getRequiredDependencies(): string[] {
    return this.requiredDependencies;
  }

  validateDependencies(): boolean {
    try {
      require("zod");
      return true;
    } catch (error) {
      return false;
    }
  }

  generateSchemaFromData(data: any): string {
    if (!this.validateDependencies()) {
      throw new Error(
        "Zod is not installed. Please install it using: npm install zod"
      );
    }

    const typeInfo = this.analyzer.analyze(data);
    return this.generateSchema(typeInfo);
  }

  generateSchema(typeInfo: any): string {
    try {
      if (!this.validateDependencies()) {
        throw new Error(
          "Zod is not installed. Please install it using: npm install zod"
        );
      }

      if (typeInfo.type === "object") {
        const properties = Object.entries(typeInfo.properties || {})
          .map(([key, value]) => `${key}: ${this.generateSchema(value)}`)
          .join(",\n  ");
        return `z.object({\n  ${properties}\n})`;
      }

      if (typeInfo.type === "array") {
        if (typeInfo.elementTypes && typeInfo.elementTypes.length > 0) {
          if (typeInfo.elementTypes.length === 1) {
            return `z.array(${this.generateSchema(
              typeInfo.elementTypes[0].type
            )})`;
          }
          const unionTypes = typeInfo.elementTypes
            .map(({ type }: { type: any }) => this.generateSchema(type))
            .join(", ");
          return `z.array(z.union([${unionTypes}]))`;
        }
        return "z.array(z.any())";
      }

      switch (typeInfo.type) {
        case "string":
          return "z.string()";
        case "number":
          return "z.number()";
        case "boolean":
          return "z.boolean()";
        case "Date":
          return "z.date()";
        case "null":
          return "z.null()";
        case "undefined":
          return "z.undefined()";
        case "enum":
          const enumValues = typeInfo.values
            .map((v: string) => `'${v}'`)
            .join(", ");
          return `z.enum([${enumValues}])`;
        case "union":
          const unionSchemas = typeInfo.types
            .map((t: any) => this.generateSchema(t))
            .join(", ");
          return `z.union([${unionSchemas}])`;
        case "optional":
          return `${this.generateSchema(typeInfo.valueType)}.optional()`;
        case "nullable":
          return `${this.generateSchema(typeInfo.valueType)}.nullable()`;
        default:
          return "z.any()";
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate Zod schema: ${error.message}`);
      }
      throw new Error("Failed to generate Zod schema: Unknown error");
    }
  }
}
