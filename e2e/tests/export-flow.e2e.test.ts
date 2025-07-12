import request from "supertest";
import { loadRootEnv } from "../../services/shared/load-env";
import { pollForJobStatus } from "./job-poll-util";

loadRootEnv();

describe("E2E: Export Flow", () => {
  beforeEach(async () => {
    await request(process.env.TASK_REGISTRY_URL!).delete("/jobs").expect(204);
  });

  it("should successfully create a PDF export job and see it being processed to completion in 25s", async () => {
    // 1. Submit a new export job to the API Gateway
    const jobPayload = {
      bookId: "some-book-id",
      type: "pdf",
    };

    const createJobResponse = await request(process.env.API_GATEWAY_URL!)
      .post("/exports")
      .send(jobPayload)
      .expect(201);

    const { jobId } = createJobResponse.body;
    expect(jobId).toBeDefined();
    console.log(`Job created with ID: ${jobId}`);

    await pollForJobStatus("processing", 15, 1000, 5, "exports"); // Job should be processing immediately

    await pollForJobStatus("finished", 30, 1000, 25, "exports"); // Job takes 25s to finish so needs at least 60 attempts
  }, 40000); // 40s timeout as the job takes 25s to finish

  it("should successfully create a epub export job and see it being processed to completion in 25s", async () => {
    // 1. Submit a new export job to the API Gateway
    const jobPayload = {
      bookId: "some-book-id",
      type: "epub",
    };

    const createJobResponse = await request(process.env.API_GATEWAY_URL!)
      .post("/exports")
      .send(jobPayload)
      .expect(201);

    const { jobId } = createJobResponse.body;
    expect(jobId).toBeDefined();
    console.log(`Job created with ID: ${jobId}`);

    await pollForJobStatus("processing", 15, 1000, 5, "exports"); // Job should be processing immediately

    await pollForJobStatus("finished", 15, 1000, 10, "exports"); // Job takes 25s to finish so needs at least 60 attempts
  }, 20000); // 20s timeout as the job takes 15s to finish
});
