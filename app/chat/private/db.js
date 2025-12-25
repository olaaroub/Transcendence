import Database from "better-sqlite3";

const db = new Database("../../../db/private_chat/private_chat.db");

db.prepare(`PRAGMA foreign_keys = ON;`).run();

export default db;