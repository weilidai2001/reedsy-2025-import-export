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
              schema: { $ref: "#/components/schemas/CreateJob" },
            },
          },
        },
        responses: {
          201: { description: "Job created" },
          400: { description: "Validation error" },
          500: { description: "Internal server error" },
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
          200: { description: "List of jobs" },
          500: { description: "Internal server error" },
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
          200: { description: "Job details" },
          404: { description: "Job not found" },
          500: { description: "Internal server error" },
        },
      },
      patch: {
        summary: "Update job state or result",
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
              schema: { $ref: "#/components/schemas/UpdateJob" },
            },
          },
        },
        responses: {
          200: { description: "Job updated" },
          400: { description: "Validation error" },
          404: { description: "Job not found" },
          500: { description: "Internal server error" },
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
          sourceUrl: { type: "string" },
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
      CreateJob: {
        type: "object",
        properties: {
          requestId: { type: "string", format: "uuid" },
          bookId: { type: "string", format: "uuid" },
          direction: { type: "string", enum: ["import", "export"] },
          type: {
            type: "string",
            enum: ["epub", "pdf", "word", "wattpad", "evernote"],
          },
          sourceUrl: { type: "string" },
        },
        required: ["requestId", "bookId", "direction", "type"],
      },
      UpdateJob: {
        type: "object",
        properties: {
          state: {
            type: "string",
            enum: ["pending", "processing", "finished", "failed"],
          },
          resultUrl: { type: "string" },
        },
        required: ["state"],
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
