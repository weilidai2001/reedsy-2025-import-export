// TypeScript interfaces for Receptionist API

export interface ExportJobRequest {
  bookId: string;
  type: 'epub' | 'pdf';
}

export interface ExportJobResponse {
  jobId: string;
}

export interface ImportJobRequest {
  bookId: string;
  type: 'word' | 'pdf' | 'wattpad' | 'evernote';
  url: string;
}

export interface ImportJobResponse {
  jobId: string;
}

export type JobState = 'pending' | 'processing' | 'finished' | 'failed';

export interface JobListResponse {
  pending: any[];
  processing: any[];
  finished: any[];
  failed: any[];
}
