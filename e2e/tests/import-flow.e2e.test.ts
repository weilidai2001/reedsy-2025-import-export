import request from "supertest";
import { loadRootEnv } from "../../services/shared/load-env";
import { pollForJobStatus } from "./job-poll-util";

loadRootEnv();

describe("E2E: Import Flow", () => {
  it("should successfully create an import job and see it being processed", async () => {
    // 1. Submit a new import job to the API Gateway
    const jobPayload = {
      bookId: "some-book-id",
      type: "pdf",
      url: "http://example.com/book.pdf",
    };

    const createJobResponse = await request(process.env.API_GATEWAY_URL!)
      .post("/imports")
      .send(jobPayload)
      .expect(201);

    const { jobId } = createJobResponse.body;
    expect(jobId).toBeDefined();
    console.log(`Job created with ID: ${jobId}`);

    // Submit two more
    await request(process.env.API_GATEWAY_URL!)
      .post("/imports")
      .send(jobPayload)
      .expect(201);

    await request(process.env.API_GATEWAY_URL!)
      .post("/imports")
      .send(jobPayload)
      .expect(201);

    await pollForJobStatus("pending", 15, 1000, 5, "imports"); // Job should be pending immediately

    await pollForJobStatus("processing", 15, 1000, 5, "imports"); // Job should be processing immediately

    await pollForJobStatus("finished", 70, 1000, 60, "imports"); // Job takes 60s to finish so needs at least 60 attempts
  }, 120000); // 120s timeout as the job takes 60s to finish
});
