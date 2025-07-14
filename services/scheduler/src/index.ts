import { loadRootEnv } from "@reedsy/shared";

// Load environment variables from root .env file
loadRootEnv();

import { startServer } from "./server";

startServer();
