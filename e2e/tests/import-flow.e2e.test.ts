import request from 'supertest';

const API_GATEWAY_URL = 'http://localhost:3003';

describe('E2E: Import Flow', () => {
  it('should successfully create an import job and see it being processed', async () => {
    // 1. Submit a new import job to the API Gateway
    const jobPayload = {
      bookId: 'some-book-id',
      type: 'pdf',
      url: 'http://example.com/book.pdf',
    };

    const createJobResponse = await request(API_GATEWAY_URL)
      .post('/imports')
      .send(jobPayload)
      .expect(201);

    const { id: jobId } = createJobResponse.body;
    expect(jobId).toBeDefined();
    console.log(`Job created with ID: ${jobId}`);

    // 2. Poll the API Gateway to check the job status
    let jobStatus = '';
    let attempts = 0;
    const maxAttempts = 15; // Increased attempts for potentially longer processing

    while (jobStatus !== 'completed' && jobStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between checks

      console.log(`Polling for job status... Attempt ${attempts + 1}`);
      const getJobResponse = await request(API_GATEWAY_URL)
        .get(`/jobs/${jobId}`)
        .expect(200);

      jobStatus = getJobResponse.body.status;
      console.log(`Current job status: ${jobStatus}`);
      attempts++;
    }

    // 3. Assert the final state
    expect(jobStatus).toBe('completed');
  });
});
