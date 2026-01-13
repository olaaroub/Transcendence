import Database from 'better-sqlite3'

const DB_PATH = process.env.DATABASE_PATH;

const creatTable = async () => {

    if (!DB_PATH) {
        throw new Error("DB_PATH environment variable is not set");
    }

    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

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

    db.exec(`INSERT OR IGNORE INTO users(username, auth_provider, email, id) VALUES ('ohammou-', 'google', 'ohammou-@gmail.com', 1);
             INSERT OR IGNORE INTO users(username, auth_provider, email, id) VALUES ('mmondad', 'google',  'mmondad-@gmail.com', 2);
             INSERT OR IGNORE INTO users(username, auth_provider, email, id) VALUES ('olaaroub', 'google', 'olaaroub-@gmail.com', 3);
             INSERT OR IGNORE INTO users(username, auth_provider, email, id) VALUES ('hes-safi', 'google', 'hes-safi-@gmail.com', 4);
             INSERT OR IGNORE INTO users(username, auth_provider, email, id) VALUES ('oumondad', 'google', 'oumondad-@gmail.com', 5);`)

    return db;
}

export default creatTable;
