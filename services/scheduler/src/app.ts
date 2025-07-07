import express from 'express';
import router from './routes';
import { setupSwagger } from './swagger';

const app = express();
app.use(express.json());

setupSwagger(app);
app.use('/', router);

import { Request, Response } from 'express';

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Scheduler Service Running');
});

export default app;
