import Database from "better-sqlite3";

const db = new Database(process.env.DATABASE_PATH) ;

db.prepare(`PRAGMA foreign_keys = ON;`).run();

export default db;