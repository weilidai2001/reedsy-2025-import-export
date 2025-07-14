import request from "supertest";
import express from "express";
// Mock validate middleware to always call next()
jest.mock("../middleware/validate", () => ({
  validate: () => (_req: any, _res: any, next: any) => next(),
}));
import router from "./job-routes";

jest.mock("../clients/task-registry-client", () => ({
  getJobsByDirection: jest.fn(),
  registerNewJob: jest.fn(),
}));
jest.mock("../clients/scheduler-client", () => ({
  addJobToScheduler: jest.fn(),
}));
jest.mock("../transform/jobs-transformer", () => ({
  initialiseJob: jest.fn(),
  groupJobsByState: jest.fn(),
}));
jest.mock("../logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

import { getJobsByDirection, registerNewJob } from "../clients/task-registry-client";
import { addJobToScheduler } from "../clients/scheduler-client";
import { initialiseJob, groupJobsByState } from "../transform/jobs-transformer";
import logger from "../logger";

const app = express();
app.use(express.json());
app.use("/", router);

describe("job-routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /exports", () => {
  it("should return 400 if validation fails", async () => {
    // Temporarily restore the real validate, then mock to simulate validation error
    jest.resetModules();
    const realValidate = jest.requireActual("../middleware/validate");
    jest.doMock("../middleware/validate", () => ({
      validate: () => (_req: any, res: any, _next: any) => res.status(400).json({ error: "validation error" }),
    }));
    // Re-import router with new mock
    const routerWithValidationError = require("./job-routes").default;
    const appWithValidationError = express();
    appWithValidationError.use(express.json());
    appWithValidationError.use("/", routerWithValidationError);
    const res = await request(appWithValidationError)
      .post("/exports")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "validation error" });
    expect(initialiseJob).not.toHaveBeenCalled();
    expect(registerNewJob).not.toHaveBeenCalled();
    expect(addJobToScheduler).not.toHaveBeenCalled();
    jest.resetModules(); // Restore mocks
  });
    it("should create an export job and return jobId", async () => {
      (initialiseJob as jest.Mock).mockReturnValue({ requestId: "123", foo: "bar" });
      (registerNewJob as jest.Mock).mockResolvedValue(undefined);
      (addJobToScheduler as jest.Mock).mockResolvedValue(undefined);
      const exportJob = { some: "data" };
      const res = await request(app)
        .post("/exports")
        .send(exportJob);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ jobId: "123" });
      expect(initialiseJob).toHaveBeenCalledWith(exportJob, "export");
      expect(registerNewJob).toHaveBeenCalled();
      expect(addJobToScheduler).toHaveBeenCalled();
    });

    it("should handle errors and return 500", async () => {
      (initialiseJob as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
      const res = await request(app)
        .post("/exports")
        .send({});
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("POST /imports", () => {
  it("should return 400 if validation fails", async () => {
    jest.resetModules();
    const realValidate = jest.requireActual("../middleware/validate");
    jest.doMock("../middleware/validate", () => ({
      validate: () => (_req: any, res: any, _next: any) => res.status(400).json({ error: "validation error" }),
    }));
    const routerWithValidationError = require("./job-routes").default;
    const appWithValidationError = express();
    appWithValidationError.use(express.json());
    appWithValidationError.use("/", routerWithValidationError);
    const res = await request(appWithValidationError)
      .post("/imports")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "validation error" });
    expect(initialiseJob).not.toHaveBeenCalled();
    expect(registerNewJob).not.toHaveBeenCalled();
    expect(addJobToScheduler).not.toHaveBeenCalled();
    jest.resetModules();
  });
    it("should create an import job and return jobId", async () => {
      (initialiseJob as jest.Mock).mockReturnValue({ requestId: "456", foo: "baz" });
      (registerNewJob as jest.Mock).mockResolvedValue(undefined);
      (addJobToScheduler as jest.Mock).mockResolvedValue(undefined);
      const importJob = { some: "data" };
      const res = await request(app)
        .post("/imports")
        .send(importJob);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ jobId: "456" });
      expect(initialiseJob).toHaveBeenCalledWith(importJob, "import");
      expect(registerNewJob).toHaveBeenCalled();
      expect(addJobToScheduler).toHaveBeenCalled();
    });

    it("should handle errors and return 500", async () => {
      (initialiseJob as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
      const res = await request(app)
        .post("/imports")
        .send({});
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("GET /exports", () => {
    it("should return grouped export jobs", async () => {
      (getJobsByDirection as jest.Mock).mockResolvedValue(["job1", "job2"]);
      (groupJobsByState as jest.Mock).mockReturnValue({ grouped: true });
      const res = await request(app).get("/exports");
      expect(res.status).toBe(200);
      expect(getJobsByDirection).toHaveBeenCalledWith("export");
      expect(groupJobsByState).toHaveBeenCalledWith(["job1", "job2"]);
      expect(res.body).toEqual({ grouped: true });
    });

    it("should handle errors and return 500", async () => {
      (getJobsByDirection as jest.Mock).mockRejectedValue(new Error("fail"));
      const res = await request(app).get("/exports");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("GET /imports", () => {
    it("should return grouped import jobs", async () => {
      (getJobsByDirection as jest.Mock).mockResolvedValue(["jobA", "jobB"]);
      (groupJobsByState as jest.Mock).mockReturnValue({ grouped: "import" });
      const res = await request(app).get("/imports");
      expect(res.status).toBe(200);
      expect(getJobsByDirection).toHaveBeenCalledWith("import");
      expect(groupJobsByState).toHaveBeenCalledWith(["jobA", "jobB"]);
      expect(res.body).toEqual({ grouped: "import" });
    });

    it("should handle errors and return 500", async () => {
      (getJobsByDirection as jest.Mock).mockRejectedValue(new Error("fail"));
      const res = await request(app).get("/imports");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "internal server error" });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
