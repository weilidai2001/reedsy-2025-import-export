import request from "supertest";

// Utility function for waiting a specified number of milliseconds
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to poll job status
export async function pollForJobStatus(
  desiredStatus: string,
  maxAttempts: number,
  pollIntervalMs: number = 1000,
  expectedAttempts: number,
  importOrExport: "imports" | "exports"
): Promise<void> {
  let attempts = 0;
  let jobStatus = "";
  while (jobStatus !== desiredStatus && attempts < maxAttempts) {
    await delay(pollIntervalMs);
    console.log(
      `Polling for job status '${desiredStatus}'... Attempt ${
        attempts + 1
      } (up to ${expectedAttempts} attempts expected)`
    );
    const getJobResponse = await request(process.env.API_GATEWAY_URL!)
      .get(`/${importOrExport}`)
      .expect(200);
    const statusOfAllImports = getJobResponse.body;
    if (desiredStatus in statusOfAllImports) {
      jobStatus = desiredStatus;
      console.log(`Job is '${desiredStatus}' as expected`);
    }
    attempts++;
  }
}
