import { handleJob } from './job-manager';
import { state } from './job-state';
import logger from '../logger';
import { updateRegistry } from '../clients/task-registry-client';
import { processJob } from './job-processor';
import { Job } from '../types';

// Mock dependencies
jest.mock('./job-state', () => ({
  state: {
    setIdle: jest.fn(),
    recordSuccess: jest.fn(),
    recordFailure: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../clients/task-registry-client', () => ({
  updateRegistry: jest.fn(),
}));

jest.mock('./job-processor', () => ({
  processJob: jest.fn(),
}));

const mockedState = state as jest.Mocked<typeof state>;
const mockedLogger = logger as jest.Mocked<typeof logger>;
const mockedUpdateRegistry = updateRegistry as jest.Mocked<typeof updateRegistry>;
const mockedProcessJob = processJob as jest.Mock;

describe('handleJob', () => {
  const baseJob: Job = {
    requestId: 'test-request-id',
    bookId: 'test-book-id',
    direction: 'import',
    type: 'epub',
    state: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process a job successfully', async () => {
    const processedJob = { ...baseJob, state: 'processing', resultUrl: 'http://example.com/result' };
    mockedProcessJob.mockResolvedValue(processedJob);

    await handleJob(baseJob);

    expect(mockedState.setIdle).toHaveBeenCalledWith(false);
    expect(mockedLogger.info).toHaveBeenCalledWith('Starting job', { requestId: baseJob.requestId });
    expect(mockedUpdateRegistry).toHaveBeenCalledWith({ ...baseJob, state: 'processing' });
    expect(mockedProcessJob).toHaveBeenCalledWith(baseJob);
    expect(mockedUpdateRegistry).toHaveBeenCalledWith({ ...processedJob, state: 'finished' });
    expect(mockedState.recordSuccess).toHaveBeenCalledWith(processedJob.requestId, expect.any(Number));
    expect(mockedLogger.info).toHaveBeenCalledWith('Finished job', { requestId: processedJob.requestId });
    expect(mockedState.setIdle).toHaveBeenCalledWith(true);
    expect(mockedLogger.error).not.toHaveBeenCalled();
    expect(mockedState.recordFailure).not.toHaveBeenCalled();
  });

  it('should handle a job that fails during processing', async () => {
    const error = new Error('Processing failed');
    mockedProcessJob.mockRejectedValue(error);

    await handleJob(baseJob);

    expect(mockedState.setIdle).toHaveBeenCalledWith(false);
    expect(mockedLogger.info).toHaveBeenCalledWith('Starting job', { requestId: baseJob.requestId });
    expect(mockedUpdateRegistry).toHaveBeenCalledWith({ ...baseJob, state: 'processing' });
    expect(mockedProcessJob).toHaveBeenCalledWith(baseJob);

    expect(mockedUpdateRegistry).toHaveBeenCalledWith({ ...baseJob, state: 'failed' });
    expect(mockedState.recordFailure).toHaveBeenCalledWith(baseJob.requestId, expect.any(Number), error);
    expect(mockedLogger.error).toHaveBeenCalledWith('Failed job', {
      requestId: baseJob.requestId,
      error: error.message,
    });
    expect(mockedState.setIdle).toHaveBeenCalledWith(true);
    expect(mockedLogger.info).toHaveBeenCalledTimes(1); // Only the starting log
    expect(mockedState.recordSuccess).not.toHaveBeenCalled();
  });
});
