# Product Requirements Document (PRD): TaskRegistry Service

## Overview

The **TaskRegistry Service** acts as the persistent store for all job records in the Receptionist System. It wraps an on-disk SQLite database and provides HTTP endpoints to create, update, and query job states. It is a singleton service and should only run a single instance.

## Objectives

- Provide persistent storage for all job metadata and state transitions
- Allow Receptionist and Handler services to create and update jobs
- Allow querying and filtering of jobs by direction and state
- Automatically manage `id`, `createdAt` and `updatedAt` timestamps

## Top-level Modules

```
src/
├── index.ts              ← app entry point
├── server.ts             ← Express app + routing
├── db.ts                 ← SQLite DB initialization and query helpers
├── job-controller.ts     ← HTTP route handlers
└── job-service.ts        ← business logic for creating/updating jobs
```

## Functional Requirements

### 1. Create Job

**Endpoint:** `POST /jobs`

**Request Body:**

```json
{
  "requestId": "string-uuid",
  "bookId": "string-uuid",
  "direction": "import" | "export",
  "type": "epub" | "pdf" | "word" | "wattpad" | "evernote",
  "sourceUrl": "string (optional, required for import)"
}
```

**Server Behavior:**

- Generate a new `UUID` for `id`
- Set `createdAt` and `updatedAt` to current ISO timestamp
- Set `state` to `"pending"`
- Save to SQLite
- Return job record

**Response:**

```json
{
  "id": "generated-uuid",
  "bookId": "string",
  "direction": "import" | "export",
  "type": "epub" | "pdf" | "word" | "wattpad" | "evernote",
  "state": "pending",
  "sourceUrl": "string",
  "resultUrl": null,
  "createdAt": "2025-07-08T13:00:00.000Z",
  "updatedAt": "2025-07-08T13:00:00.000Z",
}
```

### 2. Update Job

**Endpoint:** `PATCH /jobs/:id`

**Request Body:**

```json
{
  "state": "processing" | "finished" | "failed",
  "resultUrl": "string (optional)"
}
```

**Server Behavior:**

- Validate and update state and/or resultUrl
- Set `updatedAt` to current ISO timestamp

**Response:** `204 No Content`

### 3. Fetch Jobs by Direction

**Endpoint:** `GET /jobs?direction=import|export`

**Query Param:** `direction=import|export`

**Response:**

```json
{
  "pending": [...],
  "processing": [...],
  "finished": [...],
  "failed": [...]
}
```

### 4. Fetch Job by ID

**Endpoint:** `GET /jobs/:id`

**Response:**

```json
{
  "id": "string",
  "bookId": "string",
  "direction": "import" | "export",
  "type": "epub" | "pdf" | "word" | "wattpad" | "evernote",
  "state": "pending" | "processing" | "finished" | "failed",
  "sourceUrl": "string",
  "resultUrl": "string | null",
  "createdAt": "ISO string",
  "updatedAt": "ISO string",
}
```

## Job Schema (Zod)

```ts
import { z } from "zod";

export const JobDirectionEnum = z.enum(["import", "export"]);
export const JobTypeEnum = z.enum([
  "epub",
  "pdf",
  "word",
  "wattpad",
  "evernote",
]);
export const JobStateEnum = z.enum([
  "pending",
  "processing",
  "finished",
  "failed",
]);

export const JobSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  direction: JobDirectionEnum,
  type: JobTypeEnum,
  state: JobStateEnum,
  sourceUrl: z.string().optional(),
  resultUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

## Non-Functional Requirements

- Must be implemented in TypeScript
- All filenames must use **kebab-case**
- Only a single instance of TaskRegistry must run (singleton)
- Database must be SQLite in **WAL mode**
- Input validation must use Zod
- Must expose Swagger UI at `/docs`
- Must log all job lifecycle events (created, updated) with `jobId` as structured metadata
- Must support concurrent access and job updates safely
