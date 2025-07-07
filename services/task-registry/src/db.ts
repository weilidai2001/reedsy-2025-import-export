import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "../../task-registry.sqlite");
const db = new sqlite3.Database(dbPath);
db.run("PRAGMA journal_mode = WAL;");

export default db;
