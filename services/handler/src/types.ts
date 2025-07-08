// Core interfaces for Handler Service

export type JobDirection = 'import' | 'export';
export type JobType = 'epub' | 'pdf' | 'word' | 'wattpad' | 'evernote';
export type JobState = 'pending' | 'processing' | 'finished' | 'failed';

export interface Job {
  id: string;
  bookId: string;
  direction: JobDirection;
  type: JobType;
  state: JobState;
  sourceUrl?: string;
  resultUrl?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
}

export interface JobResult {
  jobId: string;
  status: JobState;
  resultUrl?: string;
  error?: string;
}

// Status endpoint response interface
export interface ServiceStatus {
  jobsProcessed: number;
  jobsSucceeded: number;
  jobsFailed: number;
  currentJob: string | null;
  lastJobDurationMs: number | null;
  lastJobError: string | null;
  isIdle: boolean;
  lastJobSuccess: string | null;
}
