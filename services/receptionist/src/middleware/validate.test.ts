import express, { Request, Response } from "express";
import request from "supertest";
import { validate } from "./validate";
import { JobSchema } from "../types";

// Mock logger to silence output and allow assertions
jest.mock("../logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const app = express();
app.use(express.json());

const schema = JobSchema;

app.post("/test", validate(schema), (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

describe("validate middleware", () => {
  const validJob = {
    requestId: "req-123",
    bookId: "book-456",
    direction: "import",
    type: "epub",
    state: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    url: "https://example.com/job",
    resultUrl: "https://example.com/result",
  };

  it("should allow valid requests", async () => {
    const res = await request(app)
      .post("/test")
      .send(validJob);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it("should reject invalid requests with 400 and details", async () => {
    const invalidJob = { ...validJob, direction: "invalid" };
    const res = await request(app)
      .post("/test")
      .send(invalidJob);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toBeInstanceOf(Array);
    expect(res.body.details[0]).toHaveProperty("field");
    expect(res.body.details[0]).toHaveProperty("message");
  });

  it("should handle malformed body (missing fields)", async () => {
    const { requestId, ...partialJob } = validJob;
    const res = await request(app)
      .post("/test")
      .send(partialJob);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details.some((d: any) => d.field === "requestId")).toBe(true);
  });

  it("should return 500 for unexpected errors", async () => {
    // Patch schema.parse to throw non-ZodError
    const originalParse = schema.parse;
    schema.parse = () => { throw new Error("unexpected"); };
    const res = await request(app)
      .post("/test")
      .send(validJob);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
    // Restore
    schema.parse = originalParse;
  });
});
