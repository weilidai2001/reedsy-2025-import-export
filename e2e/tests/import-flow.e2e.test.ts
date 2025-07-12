import request from "supertest";
import path from "path";
import { loadRootEnv } from "../../services/shared/load-env";

// Utility function for waiting a specified number of milliseconds
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    // 2. Poll the API Gateway to check the job status
    let jobStatus = "";
    let processingAttempts = 0;
    const maxProcessingAttempts = 5; // Should be immediately processing

    while (
      jobStatus !== "processing" &&
      processingAttempts < maxProcessingAttempts
    ) {
      await delay(2000); // Wait 2s between checks

      console.log(
        `Polling for job status... Attempt ${processingAttempts + 1}`
      );
      const getJobResponse = await request(process.env.API_GATEWAY_URL!)
        .get(`/imports`)
        .expect(200);

      const statusOfAllImports = getJobResponse.body;
      if ("processing" in statusOfAllImports) {
        jobStatus = "processing";
        console.log("Job is processing as expected");
      }
      processingAttempts++;
    }

    let finishedAttempts = 0;
    const maxFinishedAttempts = 35; // Job takes 60s to finish so needs at least 30 attempts

    // 3. Assert the final state
    while (jobStatus !== "finished" && finishedAttempts < maxFinishedAttempts) {
      await delay(2000); // Wait 2s between checks

      console.log(`Polling for job status... Attempt ${finishedAttempts + 1}`);
      const getJobResponse = await request(process.env.API_GATEWAY_URL!)
        .get(`/imports`)
        .expect(200);

      const statusOfAllImports = getJobResponse.body;
      if ("finished" in statusOfAllImports) {
        jobStatus = "finished";
        console.log("Job is finished as expected");
      }
      processingAttempts++;
    }
  });
});
