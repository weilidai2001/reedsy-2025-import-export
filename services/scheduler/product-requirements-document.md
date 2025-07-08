# Product Requirements Document (PRD): Scheduler Service

## Overview

The Scheduler Service is the central in-memory queue manager responsible for managing and dispatching job execution tasks within the Receptionist System. It accepts enqueue requests from the Receptionist, stores jobs in a FIFO queue per job direction/type, and serves jobs to Handler services upon request.

The Scheduler is a **singleton** service and should never be scaled horizontally.

## Objectives

- Accept job enqueue requests from Receptionist.
- Maintain a FIFO queue for pending jobs.
- Allow Handlers to dequeue jobs in a fair and consistent order.
- Provide observability of internal queue state.
- Ensure stateless job handoff to Handlers.

## Top level modules

```
src/
├── index.ts               ← app entry point
├── server.ts              ← Express server and routing
├── queue-manager.ts       ← queue storage and operations
├── queue-controller.ts    ← route handler logic
└── scheduler-state.ts     ← in-memory metrics and flags
```

## Functional Requirements

### 1. Enqueue Job

#### Endpoint

`POST /queue`

Enqueues a new job.

**Request Body:**

```json
{
  "id": "string-uuid",
  "direction": "import" | "export",
  "type": "epub" | "pdf" | "word" | "wattpad" | "evernote"
}
```

**Response:**

- `204 No Content` if enqueued successfully
- `400 Bad Request` if payload is invalid

Also log to central logging service via http that the job has been enqueued with job id and event name "jobEnqueued"

### 2. Dequeue Job

#### Endpoint

`POST /queue/dequeue`

Dequeues the next available job in FIFO order.

**Response:**

```json
{
  "id": "string-uuid",
  "bookId": "string",
  "direction": "import" | "export",
  "type": "epub" | "pdf" | "word" | "wattpad" | "evernote",
  "state": "pending",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

- `204 No Content` if no jobs are available

Also log to central logging service via http that the job has been dequeued with job id and event name "jobDequeued"

### 3. View Queue

#### Endpoint

`GET /queue`

Returns current in-memory queue as json list.

**Response:**

```json
Job[]
```

Where `Job` is defined in `shared/types.ts`.

## Job Validation

Use Zod schemas shared from `shared/types.ts` for validation:

```ts
export type JobDirection = "import" | "export";
export type JobType = "epub" | "pdf" | "word" | "wattpad" | "evernote";

export type Job = {
  id: string;
  bookId: string;
  direction: JobDirection;
  type: JobType;
  state: "pending";
  createdAt: string;
  updatedAt: string;
};
```

Jobs are validated before entering the queue. Malformed or duplicate job IDs are rejected.

## In-Memory Queue Design

- Uses JavaScript `Map<string, Queue<Job>>` per job direction/type.
- FIFO queue implemented using array push/shift semantics.
- Queue is ephemeral and not persisted to disk.

## Metrics

Scheduler will maintain in-memory stats:

- `totalJobsEnqueued`
- `totalJobsDequeued`
- `lastDequeuedJobId`
- Per-type queue counts
- `uptime`

These metrics are served at `/status`.

## Non-Functional Requirements

- TypeScript with strict type checking
- Express.js framework
- All filenames in **kebab-case**
- All queue logic must be unit testable
- Singleton service — only one instance must run
- Swagger UI available at `/docs`

## Out of Scope

- Persistent storage of jobs (TaskRegistry handles this)
- Retry logic or job prioritization
- Authentication or authorization

## Example Job Flow

1. Receptionist sends `POST /queue` to enqueue a job
2. Scheduler stores job in in-memory queue
3. Handler polls `POST /queue/dequeue`
4. Scheduler pops job and returns it
5. Handler updates TaskRegistry via `/jobs/:id` PATCH

---

This Scheduler is the heartbeat of job distribution and must maintain fairness, reliability, and visibility at all times.
