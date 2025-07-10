import { queueService } from './in-memory-queue';
import { Job } from '../types';

describe('InMemoryQueueService', () => {
  // Helper to drain the queue
  const drainQueue = async () => {
    while ((await queueService.consume()) !== undefined) {
      // do nothing, just consume
    }
  };

  beforeEach(async () => {
    await drainQueue();
  });

  afterAll(async () => {
    await drainQueue();
  });

  it('should be empty initially', () => {
    expect(queueService.getQueueLength()).toBe(0);
  });

  it('should add a job to the queue', async () => {
    const job: Job = {
      requestId: '1',
      bookId: 'book1',
      direction: 'import',
      type: 'epub',
      state: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await queueService.sendToQueue(job);
    expect(queueService.getQueueLength()).toBe(1);
  });

  it('should consume a job from the queue', async () => {
    const job: Job = {
      requestId: '2',
      bookId: 'book2',
      direction: 'export',
      type: 'pdf',
      state: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await queueService.sendToQueue(job);
    const consumedJob = await queueService.consume();

    expect(consumedJob).toEqual(job);
    expect(queueService.getQueueLength()).toBe(0);
  });

  it('should return undefined when consuming from an empty queue', async () => {
    const consumedJob = await queueService.consume();
    expect(consumedJob).toBeUndefined();
    expect(queueService.getQueueLength()).toBe(0);
  });

  it('should maintain FIFO order', async () => {
    const job1: Job = { requestId: '3', bookId: 'book3', direction: 'import', type: 'epub', state: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const job2: Job = { requestId: '4', bookId: 'book4', direction: 'import', type: 'pdf', state: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    await queueService.sendToQueue(job1);
    await queueService.sendToQueue(job2);

    const consumedJob1 = await queueService.consume();
    const consumedJob2 = await queueService.consume();

    expect(consumedJob1).toEqual(job1);
    expect(consumedJob2).toEqual(job2);
    expect(queueService.getQueueLength()).toBe(0);
  });
});
