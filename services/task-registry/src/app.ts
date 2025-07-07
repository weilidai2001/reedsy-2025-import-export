import express from "express";
import cors from "cors";
import router from "./routes";
import { initializeJobsTable } from "./models";
import { setupSwagger } from "./swagger";

const app = express();
app.use(cors());
app.use(express.json());

initializeJobsTable();
setupSwagger(app);

app.use("/", router);

app.get("/", (req, res) => {
  res.send("TaskRegistry Service Running");
});

export default app;
