# Scheduler Service Queue Implementation

## Overview

The scheduler service uses a simple in-memory FIFO queue implementation to manage jobs. This document describes the queue structure and its operations.

## Queue Structure

- **Single FIFO Queue**: All jobs are stored in a single array, regardless of their type or direction
- **In-Memory**: Jobs are stored in memory and not persisted to disk
- **Job Order**: Jobs are processed in the order they are received (First In, First Out)

## Queue Operations

- **enqueueJob(job)**: Adds a job to the end of the queue
- **dequeueJob()**: Removes and returns the job at the front of the queue
- **getAllJobs()**: Returns a copy of all jobs currently in the queue
- **getQueueLength()**: Returns the current number of jobs in the queue

## Job Structure

Each job contains:
- `id`: Unique identifier for the job
- `direction`: Either "import" or "export"
- `type`: One of "epub", "pdf", "word", "wattpad", "evernote"
- `bookId`: Unique identifier for the book
- `state`: Current state of the job (e.g., "pending")
- `createdAt`: ISO timestamp when the job was created
- `updatedAt`: ISO timestamp when the job was last updated

## API Endpoints

The queue can be accessed through the following API endpoints:
- `POST /queue`: Enqueue a new job
- `POST /queue/dequeue`: Dequeue the next job
- `GET /queue`: Get all jobs in the queue
- `GET /state`: Get scheduler state including queue length and metrics

## Notes

- The previous implementation used separate queues for each direction and type combination
- The current implementation simplifies this to a single queue for all jobs
- Jobs are not persisted and will be lost if the service restarts
