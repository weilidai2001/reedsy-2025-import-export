## 3. Node.js REST API

Implement a Node.js REST API that handles Export and Import requests.

### Queueing jobs

The API should expose endpoints:

- [ ] to create a new Export job
- [ ] to create a new Import job
- [ ] that reject invalid payloads with a clear error

#### Export request body:

```typescript
{
  bookId: string;
  type: "epub" | "pdf";
}
```

#### Import request body:

```typescript
{
  bookId: string;
  type: "word" | "pdf" | "wattpad" | "evernote";
  url: string;
}
```

### Querying jobs

The API should also expose endpoints:

- [ ] to list Export jobs, grouped by their current `state` (see below)
- [ ] to list Import jobs, grouped by their current `state` (see below)

### Processing jobs

Jobs should:

- [ ] start with `state: 'pending'`
- [ ] have a `created_at` field
- [ ] maintain an `updated_at` field

For this exercise, please just wait for a set amount of time and then update the job's state to `finished` after the appropriate amount of time:

| Job type     | Processing time (s) |
| ------------ | ------------------- |
| ePub export  | 10                  |
| PDF export   | 25                  |
| import (any) | 60                  |

### Solution

Your solution **should**:

- [ ] be written to a Production-level standard
- [ ] meet the specifications outlined above
- [ ] use TypeScript or modern ES features
- [ ] have reasonable test coverage
- [ ] be scalable — this is a small app, but write it as if it will grow into a full, Production-grade server
- [ ] have the foundation for swapping out our dummy job processors for a real job processor
- [ ] focus more on demonstrating a Senior Developer skill set, rather than DevOps
- [ ] highlight any assumptions you've made; uncertainties you have; or things you would have improved with more time

Your solution **may**:

- [ ] use whatever Node.js libraries you are most comfortable with using
- [ ] use any datastore you want, including in-memory, but it should be clear how this would be swapped for a real datastore in Production
- [ ] ignore the exact details of deployment: things like containerization are a nice plus, but not necessary
