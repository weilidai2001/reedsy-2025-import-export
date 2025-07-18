import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "TaskRegistry Service API",
    version: "1.0.0",
    description: "API documentation for the TaskRegistry microservice.",
  },
  paths: {
    "/jobs": {
      post: {
        summary: "Create a new job",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Job" },
            },
          },
        },
        responses: {
          201: {
            description: "Job created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Job" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        summary: "List jobs (optionally by direction)",
        parameters: [
          {
            name: "direction",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["import", "export"] },
          },
        ],
        responses: {
          200: {
            description: "List of jobs",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Job" },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        summary: "Health check endpoint",
        responses: {
          200: { description: "Service is healthy" },
        },
      },
    },
    "/jobs/{id}": {
      get: {
        summary: "Get job by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Job details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Job" },
              },
            },
          },
          404: {
            description: "Job not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        summary: "Replace job by ID",
        description: "Replaces the job for the specified job ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Job" },
            },
          },
        },
        responses: {
          204: { description: "Job updated, no content" },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Job not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Job: {
        type: "object",
        properties: {
          requestId: { type: "string", format: "uuid" },
          bookId: { type: "string", format: "uuid" },
          direction: { type: "string", enum: ["import", "export"] },
          type: {
            type: "string",
            enum: ["epub", "pdf", "word", "wattpad", "evernote"],
          },
          state: {
            type: "string",
            enum: ["pending", "processing", "finished", "failed"],
          },
          url: { type: "string" },
          resultUrl: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "requestId",
          "bookId",
          "direction",
          "type",
          "state",
          "createdAt",
          "updatedAt",
        ],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
