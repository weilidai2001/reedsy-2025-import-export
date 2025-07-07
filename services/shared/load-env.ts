import path from "path";
import dotenv from "dotenv";

export function loadRootEnv() {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}
