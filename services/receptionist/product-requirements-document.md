# Product Requirements Document (PRD): Receptionist Service

## Overview

The **Receptionist Service** is the public-facing REST API for the Receptionist System. It accepts requests for book imports and exports, validates them, creates job records in the TaskRegistry, and enqueues them into the Scheduler for execution. It is stateless, horizontally scalable, and designed for high availability.

## Objectives

- Accept HTTP requests from clients for import and export jobs
- Validate payloads using strict schema definitions
- Persist job metadata in TaskRegistry
- Enqueue jobs into the Scheduler
- Expose job listing endpoints for monitoring progress
- Serve Swagger UI documentation at `/docs`

## Top Level Modules

```
src/
├── index.ts                ← app entry point
├── server.ts               ← Express setup
├── job-controller.ts       ← route handler logic
├── job-validator.ts        ← zod schema validation
├── job-service.ts          ← orchestrates registry + queue operations
├── task-registry-client.ts ← HTTP client for TaskRegistry
└── scheduler-client.ts     ← HTTP client for Scheduler
```

## Functional Requirements

### 1. Submit Export Job

**Endpoint:** `POST /exports`

Accepts a job to export a book as EPUB or PDF.

#### Request Body

```json
{
  "bookId": "string-uuid",
  "type": "epub" | "pdf"
}
```

#### Response

```json
{
  "jobId": "string-uuid"
}
```

#### Behaviour

- Validate request using Zod schema
- POST to `{{TaskRegistryUrl}}/jobs` which will generate a UUID for the job as well as created timestamp and updated timestamp
- Validate the response from `{{TaskRegistryUrl}}/jobs` to ensure it is a valid job object
- POST to `{{SchedulerUrl}}/queue`
- Return job ID to client

---

### 2. Submit Import Job

**Endpoint:** `POST /imports`

Accepts a job to import a book from an external URL.

#### Request Body

```json
{
  "bookId": "string-uuid",
  "type": "word" | "pdf" | "wattpad" | "evernote",
  "url": "https://source.com/input.docx"
}
```

#### Response

```json
{
  "jobId": "string-uuid"
}
```

#### Behaviour

- Validate request using Zod schema
- POST to `{{TaskRegistryUrl}}/jobs` which will generate a UUID for the job as well as created timestamp and updated timestamp
- Validate the response from `{{TaskRegistryUrl}}/jobs` to ensure it is a valid job object
- POST to `{{SchedulerUrl}}/queue`
- Return job ID to client

---

### 3. Get Export Job List

**Endpoint:** `GET /exports`

#### Response

```json
{
  "pending": [...],
  "processing": [...],
  "finished": [...],
  "failed": [...]
}
```

#### Behaviour

- Proxy request to `{{TaskRegistryUrl}}/jobs?direction=export`

---

### 4. Get Import Job List

**Endpoint:** `GET /imports`

#### Response

```json
{
  "pending": [...],
  "processing": [...],
  "finished": [...],
  "failed": [...]
}
```

#### Behaviour

- Proxy request to `{{TaskRegistryUrl}}/jobs?direction=import`

---

## Validation and Types

Validation is done using Zod schemas in `job-validator.ts`.

```ts
export type JobDirection = "import" | "export";
export type JobType = "epub" | "pdf" | "word" | "wattpad" | "evernote";

export const exportJobSchema = z.object({
  bookId: z.string().uuid(),
  type: z.union([z.literal("epub"), z.literal("pdf")]),
});

export const importJobSchema = z.object({
  bookId: z.string().uuid(),
  type: z.union([
    z.literal("word"),
    z.literal("pdf"),
    z.literal("wattpad"),
    z.literal("evernote"),
  ]),
  url: z.string().url(),
});
```

# Health check

**Endpoint:** `GET /health`

#### Response

```json
{
  "status": "ok"
}
```

# Service status

**Endpoint:** `GET /status`

#### Response

```json
{
  "requestCountTotal": number,
  "requestCountByRoute": {
    "/exports": number,
    "/imports": number
  }
}
```

## Non-Functional Requirements

- Implemented in TypeScript
- All file names use kebab-case
- Swagger UI served at `/docs`
- Stateless and horizontally scalable
- Logs all incoming requests with correlation ID using `winston`

## Out of Scope

- Business logic for job processing (handled by Handler)
- Job queue implementation (handled by Scheduler)
- Persistent job storage (handled by TaskRegistry)
