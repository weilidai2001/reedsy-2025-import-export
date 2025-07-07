import express from 'express';
import { createJob, updateJob, getJobById, listJobs } from './models';
import { Job } from 'shared/types';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /jobs - Create a new job
router.post('/jobs', (req, res) => {
  const now = new Date().toISOString();
  const job: Job = {
    ...req.body,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    state: 'pending',
  };
  createJob(job, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(job);
  });
});

// PATCH /jobs/:id - Update job state or result
router.patch('/jobs/:id', (req, res) => {
  updateJob(req.params.id, req.body, err => {
    if (err) return res.status(500).json({ error: err.message });
    getJobById(req.params.id, (err, job) => {
      if (err || !job) return res.status(404).json({ error: 'Job not found' });
      res.json(job);
    });
  });
});

// GET /jobs?direction=import|export - Return grouped job states
router.get('/jobs', (req, res) => {
  listJobs(req.query.direction as string, (err, jobs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(jobs);
  });
});

// GET /jobs/:id - Fetch job detail
router.get('/jobs/:id', (req, res) => {
  getJobById(req.params.id, (err, job) => {
    if (err || !job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  });
});

// GET /health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
