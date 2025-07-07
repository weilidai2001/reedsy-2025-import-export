import express from 'express';
import logger from './logger';

const app = express();
app.use(express.json());

import { Request, Response } from 'express';

app.get('/', (req: Request, res: Response) => {
  logger.info('Root endpoint accessed');
  res.send('Handler Service Running');
});

app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check endpoint accessed');
  res.status(200).json({ status: 'ok', service: 'handler' });
});

export default app;
