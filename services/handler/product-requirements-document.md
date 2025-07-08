# Product Requirements Document (PRD): Handler Service

## Overview

The Handler Service is responsible for processing of book import and export jobs within the Reedsy 2025 platform. It acts as a worker that retrieves, processes, and tracks jobs in coordination with the Scheduler and Task Registry services. It is a stateless service that can be horizontally scaled.

## Objectives

- Efficiently poll the Scheduler for pending jobs.
- Retrieve and process jobs based on their type and direction.
- Update job status and metadata in the Task Registry.
- Provide real-time operational metrics via a status endpoint.
- Ensure reliability and observability for job processing.

## Functional Requirements

### 1. Job Polling and Retrieval

- The Handler must periodically poll the Scheduler service for pending jobs. Default 5 seconds. Using the endpoint `GET {{SchedulerUrl}}/queue`.
- If pending jobs are available, the Handler should call:
  - `POST {{SchedulerUrl}}/queue/dequeue` to get a job object to process.

### 2. Job Processing

- Upon receiving a job, the Handler must:
  - Ensure the job payload is valid using Zod schema defined in `shared/types.ts`.
  - Log the job ID, type, state ("startingProcessing") and direction. Job ID should be it's own metadata when sending to logger, called jobId.
  - Send a `PATCH` request to `{{TaskRegistryUrl}}/jobs/{{jobId}}` with the job payload, setting `state` to `"processing"`.
  - Process the job according to its type and direction.
  - Change the service status to `isIdle` to `false` when processing a job.
  - After completing the job processing, send a `PATCH` request to `{{TaskRegistryUrl}}/jobs/{{jobId}}` with the job payload, setting `state` to `"finished"`.
  - Log the job ID, type, state ("finishedProcessing") and direction.
  - Change the service status to `isIdle` to `true` when no job is being processed.

#### Job Types and Processing Times

| Job Type     | Processing Time (seconds) |
| ------------ | ------------------------- |
| ePub export  | 10                        |
| PDF export   | 25                        |
| import (any) | 60                        |

- The Handler should use a timeout or delay that matches the required processing time for each job type to simulate the job processing.

#### Job Types

- `JobDirection`: `"import"` or `"export"`
- `JobType`: `"epub"`, `"pdf"`, `"word"`, `"wattpad"`, `"evernote"`

#### Job Schema

Defined in `shared/types.ts`.

```typescript
export type JobDirection = "import" | "export";
export type JobType = "epub" | "pdf" | "word" | "wattpad" | "evernote";
export type JobState = "pending" | "processing" | "finished" | "failed";

export type Job = {
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
};
```

### 3. Status Endpoint

- The Handler must expose a status endpoint (e.g., `/status`) that returns a JSON payload with the following metrics:
  - `jobsProcessed`: Total number of jobs processed
  - `jobsSucceeded`: Number of successfully completed jobs
  - `jobsFailed`: Number of failed jobs
  - `currentJob`: ID of the job currently being processed (if any)
  - `lastJobDurationMs`: Duration in milliseconds of the last job processed
  - `lastJobError`: Error details for the last failed job (if any)
  - `isIdle`: Boolean flag indicating if the worker is currently idle
  - `lastJobSuccess`: Timestamp of the most recent job success

## Non-Functional Requirements

- The Handler must be implemented in TypeScript.
- All file names should use kebab-case.
- Logging should use winston that pipes to both the console and a central logging service via http.
- The service should be reliable and easy to maintain.

## Out of Scope

- Implementation of the Scheduler and Task Registry services themselves.
- Job processing logic beyond simulating the required processing time.
