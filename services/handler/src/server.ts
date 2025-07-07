import app from './app';
import logger from './logger';
import { config } from './config';

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Handler service listening on port ${PORT}`);
});
