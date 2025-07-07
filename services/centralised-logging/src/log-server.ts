import express from "express";

import path from "path";
import dotenv from "dotenv";
import { getPortFromUrl } from "../../shared/url-util";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
app.use(express.json());

app.post("/log", (req, res) => {
  console.log("Received log:", req.body);
  res.sendStatus(200);
});

const PORT = getPortFromUrl(process.env.LOGGING_SERVICE_URL);

app.listen(PORT, () => console.log(`Log server listening on port ${PORT}`));
