import path from "path";
import dotenv from "dotenv";

export function loadRootEnv() {
  console.log("***", path.resolve(__dirname, "../../.env"));
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}
