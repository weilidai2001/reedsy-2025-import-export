import { Job, JobDirection, JobType } from '../../shared/types';

// In-memory queues by direction and type
export const queues: Record<JobDirection, Record<JobType, Job[]>> = {
  import: {
    epub: [],
    pdf: [],
    word: [],
    wattpad: [],
    evernote: []
  },
  export: {
    epub: [],
    pdf: [],
    word: [],
    wattpad: [],
    evernote: []
  }
};

export function enqueue(job: Job) {
  queues[job.direction][job.type].push(job);
}

export function dequeue(direction: JobDirection, type: JobType): Job | undefined {
  return queues[direction][type].shift();
}
