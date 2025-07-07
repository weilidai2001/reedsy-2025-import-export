import request from 'supertest';
import nock from 'nock';
import app from './app';
import { config } from './config';

describe('Receptionist API Integration', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('POST /exports', () => {
    it('should create an export job and queue it (happy path)', async () => {
      // Mock TaskRegistry response
      const taskRegistryScope = nock(config.taskRegistryUrl)
        .post('/jobs', {
          bookId: 'book-123',
          type: 'epub',
          jobType: 'export',
        })
        .reply(200, { jobId: 'job-abc' });

      // Mock Scheduler response
      const schedulerScope = nock(config.schedulerUrl)
        .post('/queue', {
          jobId: 'job-abc',
          jobType: 'export',
        })
        .reply(200, {});

      const res = await request(app)
        .post('/exports')
        .send({ bookId: 'book-123', type: 'epub' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ jobId: 'job-abc' });
      expect(taskRegistryScope.isDone()).toBe(true);
      expect(schedulerScope.isDone()).toBe(true);
    });

    it('should return 400 for invalid input (unhappy path)', async () => {
      const res = await request(app)
        .post('/exports')
        .send({ bookId: '', type: 'invalid-type' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle TaskRegistry failure (unhappy path)', async () => {
      nock(config.taskRegistryUrl)
        .post('/jobs')
        .reply(500, { error: 'TaskRegistry error' });

      const res = await request(app)
        .post('/exports')
        .send({ bookId: 'book-123', type: 'epub' });

      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  // Add similar tests for /imports and other endpoints as needed
});
