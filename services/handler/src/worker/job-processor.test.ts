import { processJob } from './job-processor';
import { state } from './job-state';
import { Job } from '../types';

// Use fake timers to control setTimeout
jest.useFakeTimers();

describe('processJob', () => {
  const MOCK_REQUEST_ID = 'request-123';

  beforeEach(() => {
    // Reset state before each test
    state.currentJob = null;
  });

  it('should process a supported job type and return a resultUrl', async () => {
    const job: Job = {
      requestId: MOCK_REQUEST_ID,
      bookId: 'book-1',
      direction: 'import',
      type: 'epub',
      state: 'processing',
      url: 'https://example.com/book.epub',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const processPromise = processJob(job);

    // Check that the state is updated immediately
    expect(state.currentJob).toBe(MOCK_REQUEST_ID);

    // Fast-forward time to complete the simulated process
    jest.runAllTimers();

    const result = await processPromise;

    expect(result.requestId).toBe(MOCK_REQUEST_ID);
    expect(result.resultUrl).toBeDefined();
    expect(typeof result.resultUrl).toBe('string');
    expect(result.resultUrl).toContain('https://example.com/');
  });

  it('should throw an error for an unsupported job type', async () => {
    const job: Job = {
      requestId: 'request-456',
      bookId: 'book-2',
      direction: 'import',
      // @ts-expect-error Testing unsupported type
      type: 'unsupported-type',
      state: 'processing',
      url: 'https://example.com/document.txt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await expect(processJob(job)).rejects.toThrow(
      'Unsupported job type: unsupported-type'
    );
  });

  it('should correctly set the current job state during processing', async () => {
    const job: Job = {
      requestId: MOCK_REQUEST_ID,
      bookId: 'book-3',
      direction: 'import',
      type: 'pdf',
      state: 'processing',
      url: 'https://example.com/report.pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const processPromise = processJob(job);

    expect(state.currentJob).toBe(MOCK_REQUEST_ID);

    jest.runAllTimers();
    await processPromise;
  });
});
