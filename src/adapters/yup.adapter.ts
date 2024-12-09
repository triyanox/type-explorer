import { TypeAnalyzer } from "../index";
import { SchemaAdapter } from "./adapter.interface";

export class YupSchemaAdapter implements SchemaAdapter {
  private readonly requiredDependencies = ["yup"];
  private analyzer: TypeAnalyzer;

  constructor() {
    this.analyzer = new TypeAnalyzer();
  }

  getName(): string {
    return "yup";
  }

  getRequiredDependencies(): string[] {
    return this.requiredDependencies;
  }

  validateDependencies(): boolean {
    try {
      require("yup");
      return true;
    } catch (error) {
      return false;
    }
  }

  generateSchemaFromData(data: any): string {
    if (!this.validateDependencies()) {
      throw new Error(
        "Yup is not installed. Please install it using: npm install yup"
      );
    }

    const typeInfo = this.analyzer.analyze(data);
    return this.generateSchema(typeInfo);
  }

  generateSchema(typeInfo: any): string {
    try {
      if (!this.validateDependencies()) {
        throw new Error(
          "Yup is not installed. Please install it using: npm install yup"
        );
      }

      if (typeInfo.type === "object") {
        const properties = Object.entries(typeInfo.properties || {})
          .map(([key, value]) => `${key}: ${this.generateSchema(value)}`)
          .join(",\n  ");
        return `yup.object({\n  ${properties}\n})`;
      }

      if (typeInfo.type === "array") {
        if (typeInfo.elementTypes && typeInfo.elementTypes.length > 0) {
          if (typeInfo.elementTypes.length === 1) {
            return `yup.array().of(${this.generateSchema(
              typeInfo.elementTypes[0].type
            )})`;
          }
          return `yup.array()`;
        }
        return `yup.array()`;
      }

      switch (typeInfo.type) {
        case "string":
          return "yup.string()";
        case "number":
          return "yup.number()";
        case "boolean":
          return "yup.boolean()";
        case "Date":
          return "yup.date()";
        case "null":
          return "yup.mixed().nullable()";
        case "undefined":
          return "yup.mixed().nullable()";
        case "enum":
          const enumValues = typeInfo.values
            .map((v: string) => `'${v}'`)
            .join(", ");
          return `yup.string().oneOf([${enumValues}])`;
        case "union":
          return "yup.mixed()";
        case "optional":
          return `${this.generateSchema(typeInfo.valueType)}.optional()`;
        case "nullable":
          return `${this.generateSchema(typeInfo.valueType)}.nullable()`;
        default:
          return "yup.mixed()";
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate Yup schema: ${error.message}`);
      }
      throw new Error("Failed to generate Yup schema: Unknown error");
    }
  }
}
