import { TypeAnalyzer } from "../index";
import { SchemaAdapter } from "./adapter.interface";

export class JoiSchemaAdapter implements SchemaAdapter {
  private readonly requiredDependencies = ["joi"];
  private analyzer: TypeAnalyzer;

  constructor() {
    this.analyzer = new TypeAnalyzer();
  }

  getName(): string {
    return "joi";
  }

  getRequiredDependencies(): string[] {
    return this.requiredDependencies;
  }

  validateDependencies(): boolean {
    try {
      require("joi");
      return true;
    } catch (error) {
      return false;
    }
  }

  generateSchemaFromData(data: any): string {
    if (!this.validateDependencies()) {
      throw new Error(
        "Joi is not installed. Please install it using: npm install joi"
      );
    }

    const typeInfo = this.analyzer.analyze(data);
    return this.generateSchema(typeInfo);
  }

  generateSchema(typeInfo: any): string {
    try {
      if (!this.validateDependencies()) {
        throw new Error(
          "Joi is not installed. Please install it using: npm install joi"
        );
      }

      if (typeInfo.type === "object") {
        const properties = Object.entries(typeInfo.properties || {})
          .map(([key, value]) => `${key}: ${this.generateSchema(value)}`)
          .join(",\n  ");
        return `Joi.object({\n  ${properties}\n})`;
      }

      if (typeInfo.type === "array") {
        if (typeInfo.elementTypes && typeInfo.elementTypes.length > 0) {
          if (typeInfo.elementTypes.length === 1) {
            return `Joi.array().items(${this.generateSchema(
              typeInfo.elementTypes[0].type
            )})`;
          }
          const unionTypes = typeInfo.elementTypes
            .map(({ type }: { type: any }) => this.generateSchema(type))
            .join(", ");
          return `Joi.array().items(${unionTypes})`;
        }
        return "Joi.array()";
      }

      switch (typeInfo.type) {
        case "string":
          return "Joi.string()";
        case "number":
          return "Joi.number()";
        case "boolean":
          return "Joi.boolean()";
        case "Date":
          return "Joi.date()";
        case "null":
          return "Joi.any().allow(null)";
        case "undefined":
          return "Joi.any().allow(null)";
        case "enum":
          const enumValues = typeInfo.values
            .map((v: string) => `'${v}'`)
            .join(", ");
          return `Joi.string().valid(${enumValues})`;
        case "union":
          const unionSchemas = typeInfo.types
            .map((t: any) => this.generateSchema(t))
            .join(", ");
          return `Joi.alternatives().try(${unionSchemas})`;
        case "optional":
          return `${this.generateSchema(typeInfo.valueType)}.optional()`;
        case "nullable":
          return `${this.generateSchema(typeInfo.valueType)}.allow(null)`;
        default:
          return "Joi.any()";
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate Joi schema: ${error.message}`);
      }
      throw new Error("Failed to generate Joi schema: Unknown error");
    }
  }
}
