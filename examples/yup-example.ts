import * as yup from "yup";
import { YupSchemaAdapter } from "../src/adapters/yup.adapter";

// Initialize the Yup adapter
const yupAdapter = new YupSchemaAdapter();

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

console.log("Generating Yup schemas from data structures...\n");

// Function to generate schema and test validation
function generateAndTestSchema(data: any, name: string) {
  console.log(`\n${name}:`);
  try {
    // Generate schema directly from data
    const schemaString = yupAdapter.generateSchemaFromData(data);
    console.log("Generated Schema:");
    console.log(schemaString);

    // Create the actual schema
    const schema = new Function("yup", `return ${schemaString}`)(yup);

    // Test the schema with valid data
    try {
      const validationResult = schema.validateSync(data);
      console.log("\n✓ Schema validation successful for original data");
    } catch (error) {
      console.log("\n✗ Schema validation failed for original data:", error);
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
  try {
    userSchema.validateSync(invalidUser);
  } catch (error: any) {
    console.log("\nExpected validation errors for invalid data:");
    console.log(error.errors);
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
  try {
    const validationResult = userSchema.validateSync(newValidUser);
    console.log("✓ New valid user passed schema validation");
  } catch (error) {
    console.log("✗ New user validation failed:", error);
  }
}
