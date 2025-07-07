// Core interfaces for Handler Service

export type JobDirection = 'import' | 'export';
export type JobType = 'epub' | 'pdf' | 'docx' | 'html';
export type JobStatus = 'pending' | 'processing' | 'finished' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  direction: JobDirection;
  type: JobType;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  payload: Record<string, unknown>;
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  resultUrl?: string;
  error?: string;
}
