import app from "./app";
import logger from "./logger";
import { config } from "./config";

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
});
