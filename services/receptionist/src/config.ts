import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  logbookUrl: process.env.LOGBOOK_URL || 'http://localhost:3003',
  schedulerUrl: process.env.SCHEDULER_URL || 'http://localhost:3002',
};
