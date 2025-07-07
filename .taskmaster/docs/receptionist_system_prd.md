# Receptionist System — Product Requirements Document (PRD)

## Overview

This system handles the import and export of digital books in batch format. It is composed of four core services:

- **Receptionist** — Public-facing REST API gateway
- **Scheduler** — In-memory queue manager
- **Handler** — Workers that process jobs
- **TaskRegistry** — Persistent job store (wrapped around SQLite)

The system is horizontally scalable, decoupled, and each service communicates via HTTP.

---

## Architecture

### Diagram (Mermaid Syntax)

```mermaid
flowchart TD
  subgraph Shared Volume
    SQLITE[(task-registry.sqlite<br/>WAL file)]
  end

  subgraph Cluster
    RECEPTIONIST1(Receptionist-1)
    RECEPTIONIST2(Receptionist-2)
    SCHEDULER(Scheduler)
    HANDLER1(Handler-A)
    HANDLER2(Handler-B)
    TASKREGISTRY(TaskRegistry Service)
  end

  TASKREGISTRY -. R/W .-> SQLITE
  RECEPTIONIST1 -- HTTP --> TASKREGISTRY
  RECEPTIONIST2 -- HTTP --> TASKREGISTRY
  HANDLER1      -- HTTP --> TASKREGISTRY
  HANDLER2      -- HTTP --> TASKREGISTRY

  RECEPTIONIST1 -- HTTP --> SCHEDULER
  RECEPTIONIST2 -- HTTP --> SCHEDULER
  SCHEDULER     -- dispatch --> HANDLER1
  SCHEDULER     -- dispatch --> HANDLER2
```

---

## Services

### 1. Receptionist

- Framework: Express
- Role: Accepts and validates requests, creates job records in TaskRegistry, sends jobs to Scheduler
- Exposes Swagger UI at `/docs`

#### Endpoints

##### POST `/exports`

Submit a new export job

```json
{
  "bookId": "string-uuid",
  "type": "epub" | "pdf"
}
```

Response:

```json
{
  "jobId": "string-uuid"
}
```

##### POST `/imports`

Submit a new import job

```json
{
  "bookId": "string-uuid",
  "type": "word" | "pdf" | "wattpad" | "evernote",
  "url": "https://source.com/input.docx"
}
```

Response:

```json
{
  "jobId": "string-uuid"
}
```

##### GET `/exports` and `/imports`

Grouped job listings by state:

```json
{
  "pending": [...],
  "processing": [...],
  "finished": [...],
  "failed": [...]
}
```

---

### 2. Scheduler

- Framework: Express
- Role: In-memory FIFO queue per job type. BullMQ-like interface. Dispatches to Handlers.

#### Endpoint

##### POST `/queue`

Enqueue a job

```json
{
  "id": "string-uuid",
  "direction": "import" | "export",
  "type": "epub" | "pdf" | "word" | "wattpad" | "evernote"
}
```

Response: `204 No Content`

---

### 3. Handler

- Framework: Node.js
- Role: Long-poll or subscribe to Scheduler, process job with simulated delay, update TaskRegistry
- Not exposed via HTTP

#### Processing times

| Job type       | Delay (s) |
| -------------- | --------- |
| `epub`         | 10        |
| `pdf` (export) | 25        |
| `import`       | 60        |

---

### 4. TaskRegistry

- Framework: Express
- DB: SQLite (WAL mode)
- Role: Owns the job table, handles create/update/query

#### Endpoints

##### POST `/jobs`

Create a new job

```json
{
  "id": "string",
  "bookId": "string",
  "direction": "import" | "export",
  "type": "epub" | "pdf" | "word" | "wattpad" | "evernote",
  "sourceUrl": "string (only for import)"
}
```

##### PATCH `/jobs/:id`

Update job state or result

```json
{
  "state": "processing" | "finished" | "failed",
  "resultUrl": "string"
}
```

##### GET `/jobs?direction=import|export`

Return grouped job states

```json
{
  "pending": [...],
  "processing": [...],
  "finished": [...],
  "failed": [...]
}
```

##### (Optional) GET `/jobs/:id`

Fetch job detail

---

## Types (Shared Across Services)

```ts
type JobDirection = "import" | "export";
type JobType = "epub" | "pdf" | "word" | "wattpad" | "evernote";
type JobState = "pending" | "processing" | "finished" | "failed";

type Job = {
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

---

## Notes

- All APIs are HTTP/JSON
- All filenames must use **kebab-case**
- All services are Express-based
- Swagger UI is served at `/docs` on each service for testing and documentation
- SQLite is wrapped and isolated inside the TaskRegistry service
- Queue implementation is in-memory with BullMQ-style interface, no Redis or 3rd-party queues
- the source code is in the `src` directory
- each service is in a separate directory under src with their independent package.json
- the services are built and run using `npm run build` and `npm run start`
- the services are horizontally scalable, i.e. stateless, except scheduler and task-registry
- the scheduler is a singleton, i.e. it should only run one instance at a time
- the task-registry is a singleton, i.e. it should only run one instance at a time
