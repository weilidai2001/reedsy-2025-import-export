# reedsy-2025-import-export

## Services

- api-gateway
- handler
- receptionist
- scheduler
- task-registry

## Setup

```bash
npm install
npm run build
npm run dev
```

## Manual testing

```bash
curl -X 'POST' 'http://localhost:3001/api/receptionist/exports' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{"bookId": "123", "type": "epub"}'
```
