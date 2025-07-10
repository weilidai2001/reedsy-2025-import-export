import request from 'supertest';
import express from 'express';
import { queueRouter } from './queue-routes';
import { queueService } from '../queue-service/in-memory-queue';
import { updateMetrics } from '../queue-service/queue-state';
import { Job } from '../types';

jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock the queue service and metrics updater
jest.mock('../queue-service/in-memory-queue', () => ({
  queueService: {
    sendToQueue: jest.fn(),
    consume: jest.fn(),
  },
}));

jest.mock('../queue-service/queue-state', () => ({
  updateMetrics: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/', queueRouter);

describe('Queue Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('should enqueue a job and return 201', async () => {
      const job: Job = {
        requestId: 'test-request-id',
        bookId: 'test-book-id',
        direction: 'import',
        type: 'epub',
        state: 'pending',
        url: 'http://example.com/book.epub',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (queueService.sendToQueue as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/')
        .send(job);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(job);
      expect(queueService.sendToQueue).toHaveBeenCalledWith(job);
      expect(updateMetrics).toHaveBeenCalledWith('enqueue', job.requestId);
    });
  });

  describe('POST /dequeue', () => {
    it('should dequeue a job and return 200', async () => {
      const job: Job = {
        requestId: 'test-request-id',
        bookId: 'test-book-id',
        direction: 'import',
        type: 'epub',
        state: 'pending',
        url: 'http://example.com/book.epub',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (queueService.consume as jest.Mock).mockResolvedValue(job);

      const res = await request(app).post('/dequeue');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(job);
      expect(queueService.consume).toHaveBeenCalled();
      expect(updateMetrics).toHaveBeenCalledWith('dequeue', job.requestId);
    });

    it('should return 204 when no job is available', async () => {
      (queueService.consume as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).post('/dequeue');

      expect(res.status).toBe(204);
      expect(queueService.consume).toHaveBeenCalled();
      expect(updateMetrics).not.toHaveBeenCalled();
    });
  });
});
