// const sqlite3 = require('sqlite3').verbose();
// const open = require('sqlite').open;
// const Database = require('better-sqlite3');
import Database from 'better-sqlite3'

const DB_PATH = process.env.DATABASE_PATH;
const creatTable = async () => {

    const db = new Database(DB_PATH);
    // db.pragma('journal_mode = WAL'); // bach mli nbghi nktb on 9ra fnafs lwe9t maytblokach liya

    db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        auth_provider TEXT NOT NULL DEFAULT 'local',
        email TEXT UNIQUE NOT NULL,

        CHECK (auth_provider IN ('local', 'google', 'github', 'intra'))
    );`);


    return db;
}

// module.exports = creatTable;
export default creatTable;
