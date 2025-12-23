import Database from 'better-sqlite3'

const DB_PATH = process.env.DATABASE_PATH;

const creatTable = async () => {

    if (!DB_PATH) {
        throw new Error("DB_PATH environment variable is not set");
    }

    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // bach mli nbghi nktb on 9ra fnafs lwe9t maytblokach liya

    db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        auth_provider TEXT NOT NULL DEFAULT 'local',
        email TEXT UNIQUE NOT NULL,

        towFaSecret TEXT,
        towFaEnabled BOOLEAN DEFAULT FALSE,

        CHECK (auth_provider IN ('local', 'google', 'github', 'intra'))
    );`);

    return db;
}

export default creatTable;
