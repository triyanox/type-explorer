import { z } from "zod";
import { ZodSchemaAdapter } from "../src";

// Initialize the Zod adapter (TypeAnalyzer is now integrated)
const zodAdapter = new ZodSchemaAdapter();

// Example data structures
const sampleData = {
  user: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    roles: ["admin", "user"],
    settings: {
      theme: "dark",
      notifications: true,
      lastLogin: new Date(),
    },
    metadata: {
      loginCount: 42,
      createdAt: new Date(),
      preferences: {
        language: "en",
        timezone: "UTC",
      },
    },
  },
  posts: [
    {
      id: 1,
      title: "Hello World",
      content: "This is my first post",
      tags: ["intro", "blog"],
      published: true,
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "TypeScript is Awesome",
      content: "Let me tell you why...",
      tags: ["typescript", "programming"],
      published: false,
      createdAt: new Date(),
    },
  ],
};

console.log("Generating Zod schemas from data structures...\n");

// Function to generate schema and test validation
function generateAndTestSchema(data: any, name: string) {
  console.log(`\n${name}:`);
  try {
    // Generate schema directly from data
    const schemaString = zodAdapter.generateSchemaFromData(data);
    console.log("Generated Schema:");
    console.log(schemaString);

    // Create the actual schema
    const schema = new Function("z", `return ${schemaString}`)(z);

    // Test the schema with valid data
    const validationResult = schema.safeParse(data);
    if (validationResult.success) {
      console.log("\n✓ Schema validation successful for original data");
    } else {
      console.log(
        "\n✗ Schema validation failed for original data:",
        validationResult.error
      );
    }

    return schema;
  } catch (error) {
    console.error(`Error generating/testing schema: ${error}`);
    return null;
  }
}

// Test schema generation and validation for different data structures
console.log("Testing User Schema:");
const userSchema = generateAndTestSchema(sampleData.user, "User");

console.log("\nTesting Single Post Schema:");
const postSchema = generateAndTestSchema(sampleData.posts[0], "Post");

console.log("\nTesting Posts Array Schema:");
const postsSchema = generateAndTestSchema(sampleData.posts, "Posts Array");

console.log("\nTesting Complete Data Schema:");
const completeSchema = generateAndTestSchema(sampleData, "Complete Data");

// Test validation with invalid data
console.log("\nTesting Invalid Data:");
console.log("--------------------");

const invalidUser = {
  id: "1", // Should be number
  name: 123, // Should be string
  email: "invalid-email",
  isActive: "true", // Should be boolean
  roles: "admin", // Should be array
  settings: null, // Should be object
};

if (userSchema) {
  const validationResult = userSchema.safeParse(invalidUser);
  if (!validationResult.success) {
    console.log("\nExpected validation errors for invalid data:");
    console.log(validationResult.error.errors);
  }
}

// Example of schema reuse
console.log("\nExample of Schema Reuse:");
console.log("----------------------");

const newValidUser = {
  id: 2,
  name: "Jane Smith",
  email: "jane@example.com",
  isActive: true,
  roles: ["user"],
  settings: {
    theme: "light",
    notifications: false,
    lastLogin: new Date(),
  },
  metadata: {
    loginCount: 1,
    createdAt: new Date(),
    preferences: {
      language: "fr",
      timezone: "GMT",
    },
  },
};

if (userSchema) {
  const validationResult = userSchema.safeParse(newValidUser);
  if (validationResult.success) {
    console.log("✓ New valid user passed schema validation");
  } else {
    console.log("✗ New user validation failed:", validationResult.error);
  }
}
