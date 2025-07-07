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

  describe('POST /imports', () => {
    it('should create an import job and queue it (happy path)', async () => {
      const taskRegistryScope = nock(config.taskRegistryUrl)
        .post('/jobs', {
          bookId: 'book-456',
          type: 'word',
          url: 'https://example.com/file.docx',
          jobType: 'import',
        })
        .reply(200, { jobId: 'job-def' });

      const schedulerScope = nock(config.schedulerUrl)
        .post('/queue', {
          jobId: 'job-def',
          jobType: 'import',
        })
        .reply(200, {});

      const res = await request(app)
        .post('/imports')
        .send({ bookId: 'book-456', type: 'word', url: 'https://example.com/file.docx' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ jobId: 'job-def' });
      expect(taskRegistryScope.isDone()).toBe(true);
      expect(schedulerScope.isDone()).toBe(true);
    });

    it('should return 400 for invalid input (unhappy path)', async () => {
      const res = await request(app)
        .post('/imports')
        .send({ bookId: '', type: 'invalid-type', url: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle TaskRegistry failure (unhappy path)', async () => {
      nock(config.taskRegistryUrl)
        .post('/jobs')
        .reply(500, { error: 'TaskRegistry error' });

      const res = await request(app)
        .post('/imports')
        .send({ bookId: 'book-456', type: 'word', url: 'https://example.com/file.docx' });

      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /exports', () => {
    it('should return export jobs (happy path)', async () => {
      const jobs = { pending: [], processing: [], finished: [], failed: [] };
      const taskRegistryScope = nock(config.taskRegistryUrl)
        .get('/jobs')
        .query({ type: 'export' })
        .reply(200, jobs);

      const res = await request(app).get('/exports');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(jobs);
      expect(taskRegistryScope.isDone()).toBe(true);
    });

    it('should handle TaskRegistry failure (unhappy path)', async () => {
      nock(config.taskRegistryUrl)
        .get('/jobs')
        .query({ type: 'export' })
        .reply(500, { error: 'TaskRegistry error' });

      const res = await request(app).get('/exports');
      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /imports', () => {
    it('should return import jobs (happy path)', async () => {
      const jobs = { pending: [], processing: [], finished: [], failed: [] };
      const taskRegistryScope = nock(config.taskRegistryUrl)
        .get('/jobs')
        .query({ type: 'import' })
        .reply(200, jobs);

      const res = await request(app).get('/imports');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(jobs);
      expect(taskRegistryScope.isDone()).toBe(true);
    });

    it('should handle TaskRegistry failure (unhappy path)', async () => {
      nock(config.taskRegistryUrl)
        .get('/jobs')
        .query({ type: 'import' })
        .reply(500, { error: 'TaskRegistry error' });

      const res = await request(app).get('/imports');
      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});
