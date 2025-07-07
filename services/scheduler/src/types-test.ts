import { Job } from '../../shared/types';

// Dummy usage to verify import
const testJob: Job = {
  id: 'test',
  bookId: 'book1',
  direction: 'import',
  type: 'epub',
  state: 'pending',
  sourceUrl: '',
  resultUrl: '',
  createdAt: '',
  updatedAt: '',
  startedAt: undefined
};

console.log('Type import works:', !!testJob);
