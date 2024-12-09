export interface SchemaAdapter {
  /**
   * Generates a schema based on the provided type information
   * @param typeInfo The type information to generate a schema from
   * @returns A string representation of the generated schema
   */
  generateSchema(typeInfo: any): string;

  /**
   * Generates a schema by analyzing the provided data structure
   * @param data The data to analyze and generate a schema for
   * @returns A string representation of the generated schema
   */
  generateSchemaFromData(data: any): string;

  /**
   * Validates if the adapter's dependencies are installed
   * @returns true if dependencies are installed, false otherwise
   */
  validateDependencies(): boolean;

  /**
   * Gets the name of the adapter
   * @returns The adapter name (e.g., 'zod', 'yup', etc.)
   */
  getName(): string;

  /**
   * Gets the required dependencies for this adapter
   * @returns Array of required dependency names
   */
  getRequiredDependencies(): string[];
}
