import Database from "better-sqlite3";

const db = new Database(process.env.DATABASE_PATH) ;

// fastify.log.info({ dbPath: process.env.DATABASE_PATH }, "Database connected successfully");


db.prepare(`PRAGMA foreign_keys = ON;`).run();

export default db;