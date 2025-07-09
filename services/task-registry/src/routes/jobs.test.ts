import request from "supertest";
import express from "express";
import { 
  insertJob,
  selectAllJobs,
  selectJobById,
  selectJobsByDirection,
  updateJob
} from "../database/job-repository";
import router from "./jobs";
import logger from "../logger";
import { Job } from "../types";

// Mock the database repository functions
jest.mock("../database/job-repository", () => ({
  insertJob: jest.fn(),
  selectAllJobs: jest.fn(),
  selectJobById: jest.fn(),
  selectJobsByDirection: jest.fn(),
  updateJob: jest.fn()
}));

// Mock the logger
jest.mock("../logger", () => ({
  info: jest.fn(),
  error: jest.fn()
}));

// Mock validate middleware
jest.mock("../middleware/validate", () => ({
  validate: () => (_req: any, _res: any, next: any) => next()
}));

const app = express();
app.use(express.json());
app.use(router);

describe("jobs routes", () => {
  const mockJob: Job = {
    requestId: "test-123",
    bookId: "book-456",
    direction: "import",
    type: "epub",
    state: "pending",
    url: "https://example.com/book.epub"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /jobs", () => {
    it("should create a job and return 201", async () => {
      (insertJob as jest.Mock).mockResolvedValue(undefined);
      
      const response = await request(app)
        .post("/jobs")
        .send(mockJob);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockJob);
      expect(insertJob).toHaveBeenCalledWith(mockJob);
      expect(logger.info).toHaveBeenCalled();
    });

    it("should return 500 when an error occurs", async () => {
      (insertJob as jest.Mock).mockRejectedValue(new Error("Database error"));
      
      const response = await request(app)
        .post("/jobs")
        .send(mockJob);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });

    it("should validate the request body", async () => {
      // Temporarily restore the real validate and mock to simulate validation error
      jest.resetModules();
      jest.doMock("../middleware/validate", () => ({
        validate: () => (_req: any, res: any, _next: any) => 
          res.status(400).json({ error: "Invalid request body" })
      }));

      // Re-import router with new mock
      const routerWithValidation = require("./jobs").default;
      const appWithValidation = express();
      appWithValidation.use(express.json());
      appWithValidation.use(routerWithValidation);

      const response = await request(appWithValidation)
        .post("/jobs")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid request body" });
      expect(insertJob).not.toHaveBeenCalled();

      // Reset to original mock
      jest.resetModules();
    });
  });

  describe("PUT /jobs/:id", () => {
    it("should update a job and return 204", async () => {
      (updateJob as jest.Mock).mockResolvedValue(undefined);
      
      const response = await request(app)
        .put(`/jobs/${mockJob.requestId}`)
        .send(mockJob);

      expect(response.status).toBe(204);
      expect(updateJob).toHaveBeenCalledWith(mockJob);
    });

    it("should return 500 when an error occurs", async () => {
      (updateJob as jest.Mock).mockRejectedValue(new Error("Database error"));
      
      const response = await request(app)
        .put(`/jobs/${mockJob.requestId}`)
        .send(mockJob);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("GET /jobs", () => {
    it("should return all jobs", async () => {
      const mockJobs = [mockJob, { ...mockJob, requestId: "test-456" }];
      (selectAllJobs as jest.Mock).mockResolvedValue(mockJobs);
      
      const response = await request(app)
        .get("/jobs");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockJobs);
      expect(selectAllJobs).toHaveBeenCalled();
    });

    it("should filter jobs by direction", async () => {
      const mockJobs = [mockJob];
      (selectJobsByDirection as jest.Mock).mockResolvedValue(mockJobs);
      
      const response = await request(app)
        .get("/jobs?direction=import");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockJobs);
      expect(selectJobsByDirection).toHaveBeenCalledWith("import");
    });

    it("should return 500 when an error occurs", async () => {
      (selectAllJobs as jest.Mock).mockRejectedValue(new Error("Database error"));
      
      const response = await request(app)
        .get("/jobs");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("GET /jobs/:id", () => {
    it("should return a job by id", async () => {
      (selectJobById as jest.Mock).mockResolvedValue(mockJob);
      
      const response = await request(app)
        .get(`/jobs/${mockJob.requestId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockJob);
      expect(selectJobById).toHaveBeenCalledWith(mockJob.requestId);
    });

    it("should return 404 when job is not found", async () => {
      (selectJobById as jest.Mock).mockResolvedValue(null);
      
      const response = await request(app)
        .get(`/jobs/non-existent`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Job not found" });
    });

    it("should return 500 when an error occurs", async () => {
      (selectJobById as jest.Mock).mockRejectedValue(new Error("Database error"));
      
      const response = await request(app)
        .get(`/jobs/${mockJob.requestId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
