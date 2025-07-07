import express from 'express';
import router from './routes';
import { setupSwagger } from './swagger';

const app = express();
app.use(express.json());

setupSwagger(app);
app.use('/', router);

app.get('/', (req, res) => {
  res.send('Scheduler Service Running');
});

export default app;
