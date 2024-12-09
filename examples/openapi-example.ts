import axios from "axios";
import express, { RequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { OpenAPISchemaAdapter } from "../src/adapters/openapi.adapter";

// Configure axios defaults
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  // Disable compression to avoid header check issues
  decompress: false,
  // Add timeout
  timeout: 5000,
});

// Sample response structure from JSONPlaceholder API
const sampleResponses = {
  posts: [
    {
      userId: 1,
      id: 1,
      title:
        "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      body: "quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto",
    },
  ],
  post: {
    userId: 1,
    id: 1,
    title:
      "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    body: "quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto",
  },
  comments: [
    {
      postId: 1,
      id: 1,
      name: "id labore ex et quam laborum",
      email: "Eliseo@gardner.biz",
      body: "laudantium enim quasi est quidem magnam voluptate ipsam eos tempora quo necessitatibus dolor quam autem quasi reiciendis et nam sapiente accusantium",
    },
  ],
  users: [
    {
      id: 1,
      name: "Leanne Graham",
      username: "Bret",
      email: "Sincere@april.biz",
      address: {
        street: "Kulas Light",
        suite: "Apt. 556",
        city: "Gwenborough",
        zipcode: "92998-3874",
        geo: {
          lat: "-37.3159",
          lng: "81.1496",
        },
      },
      phone: "1-770-736-8031 x56442",
      website: "hildegard.org",
      company: {
        name: "Romaguera-Crona",
        catchPhrase: "Multi-layered client-server neural-net",
        bs: "harness real-time e-markets",
      },
    },
  ],
};

// Initialize OpenAPI adapter
const openApiAdapter = new OpenAPISchemaAdapter({
  title: "JSONPlaceholder API",
  version: "1.0.0",
  description: "A free fake API for testing and prototyping",
  servers: [
    {
      url: "https://jsonplaceholder.typicode.com",
      description: "JSONPlaceholder API server",
    },
  ],
});

// Generate OpenAPI schema
const openApiSchema = JSON.parse(
  openApiAdapter.generateSchemaFromData(sampleResponses)
);

// Add paths to the schema
openApiSchema.paths = {
  "/posts": {
    get: {
      summary: "Get all posts",
      description: "Retrieve a list of all blog posts",
      responses: {
        200: {
          description: "List of posts",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/RootPosts0",
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Create a post",
      description: "Create a new blog post",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                body: { type: "string" },
                userId: { type: "integer" },
              },
              required: ["title", "body", "userId"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Created post",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RootPost",
              },
            },
          },
        },
      },
    },
  },
  "/posts/{id}": {
    get: {
      summary: "Get a post",
      description: "Retrieve a specific blog post by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Post ID",
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Post details",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RootPost",
              },
            },
          },
        },
      },
    },
  },
  "/posts/{id}/comments": {
    get: {
      summary: "Get post comments",
      description: "Retrieve all comments for a specific post",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Post ID",
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "List of comments",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/RootComments0",
                },
              },
            },
          },
        },
      },
    },
  },
  "/users": {
    get: {
      summary: "Get all users",
      description: "Retrieve a list of all users",
      responses: {
        200: {
          description: "List of users",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/RootUsers0",
                },
              },
            },
          },
        },
      },
    },
  },
};

// Create Express app for documentation
const app = express();
app.use(express.json());

// Serve OpenAPI documentation
app.use(
  "/api-docs",
  swaggerUi.serve as unknown as RequestHandler,
  swaggerUi.setup(openApiSchema) as unknown as RequestHandler
);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `API documentation available at http://localhost:${PORT}/api-docs`
  );
});

// Helper function to handle API calls
async function makeApiCall<T>(
  method: "get" | "post",
  url: string,
  data?: any
): Promise<T> {
  try {
    const response = await api.request<T>({
      method,
      url,
      data,
      validateStatus: (status) => status < 500, // Accept all status codes < 500
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        url: error.config?.url,
      });
      throw new Error(`API call failed: ${error.message}`);
    }
    throw error;
  }
}

// Test the JSONPlaceholder API
async function testApi() {
  try {
    console.log("\nTesting JSONPlaceholder API endpoints...");

    // Test GET /posts
    console.log("\nGET /posts:");
    const posts = await makeApiCall<any[]>("get", "/posts");
    console.log("Status: Success");
    console.log("First post:", posts[0]);

    // Test POST /posts
    console.log("\nPOST /posts:");
    const newPost = {
      title: "Test Post",
      body: "This is a test post",
      userId: 1,
    };
    const createdPost = await makeApiCall<any>("post", "/posts", newPost);
    console.log("Status: Success");
    console.log("Created post:", createdPost);

    // Test GET /posts/{id}
    console.log("\nGET /posts/1:");
    const post = await makeApiCall<any>("get", "/posts/1");
    console.log("Status: Success");
    console.log("Post details:", post);

    // Test GET /posts/{id}/comments
    console.log("\nGET /posts/1/comments:");
    const comments = await makeApiCall<any[]>("get", "/posts/1/comments");
    console.log("Status: Success");
    console.log("First comment:", comments[0]);

    // Test GET /users
    console.log("\nGET /users:");
    const users = await makeApiCall<any[]>("get", "/users");
    console.log("Status: Success");
    console.log("First user:", users[0]);
  } catch (error) {
    console.error(
      "\nError during API testing:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  }
}

// Run the API tests
console.log("Starting API tests...");
testApi()
  .then(() => {
    console.log("\nAPI tests completed successfully!");
  })
  .catch((error) => {
    console.error("\nAPI tests failed:", error);
    process.exit(1);
  });
