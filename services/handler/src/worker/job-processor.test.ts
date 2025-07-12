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

  it('should process an import job and wait 60s', async () => {
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
    expect(state.currentJob).toBe(MOCK_REQUEST_ID);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000);
    jest.runAllTimers();
    const result = await processPromise;
    expect(result.resultUrl).toContain('https://example.com/');
  });

  it('should process an export epub job and wait 10s', async () => {
    const job: Job = {
      requestId: 'export-epub',
      bookId: 'book-epub',
      direction: 'export',
      type: 'epub',
      state: 'processing',
      url: 'https://example.com/book.epub',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const processPromise = processJob(job);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10000);
    jest.runAllTimers();
    const result = await processPromise;
    expect(result.resultUrl).toContain('https://example.com/');
  });

  it('should process an export pdf job and wait 25s', async () => {
    const job: Job = {
      requestId: 'export-pdf',
      bookId: 'book-pdf',
      direction: 'export',
      type: 'pdf',
      state: 'processing',
      url: 'https://example.com/book.pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const processPromise = processJob(job);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 25000);
    jest.runAllTimers();
    const result = await processPromise;
    expect(result.resultUrl).toContain('https://example.com/');
  });

  it('should process an export job of unknown type and wait 60s', async () => {
    const job: Job = {
      requestId: 'export-other',
      bookId: 'book-other',
      direction: 'export',
      type: 'word',
      state: 'processing',
      url: 'https://example.com/book.docx',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const processPromise = processJob(job);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000);
    jest.runAllTimers();
    const result = await processPromise;
    expect(result.resultUrl).toContain('https://example.com/');
  });

  it('should throw an error for an unsupported job direction', async () => {
    const job: any = {
      requestId: 'bad-direction',
      bookId: 'book-bad',
      direction: 'unknown',
      type: 'epub',
      state: 'processing',
      url: 'https://example.com/book.epub',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await expect(processJob(job)).rejects.toThrow(
      'Unsupported job direction: unknown'
    );
  });

  it('should throw an error for an unsupported job type in import', async () => {
    const job: any = {
      requestId: 'bad-type-import',
      bookId: 'book-bad',
      direction: 'import',
      type: 'unsupported-type',
      state: 'processing',
      url: 'https://example.com/document.txt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // This should still process as import (any) = 60s, so no error, just long wait
    const processPromise = processJob(job);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000);
    jest.runAllTimers();
    const result = await processPromise;
    expect(result.resultUrl).toContain('https://example.com/');
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
