// const sqlite3 = require('sqlite3').verbose();
// const open = require('sqlite').open;
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || '/data/database.db';
const creatTable = async () =>
{

    const db = new Database(DB_PATH);
    // db.pragma('journal_mode = WAL'); // bach mli nbghi nktb on 9ra fnafs lwe9t maytblokach liya

    db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        auth_provider TEXT NOT NULL DEFAULT 'local',
        profileImage TEXT DEFAULT '/public/Default_pfp.jpg',
        email TEXT UNIQUE NOT NULL,

        CHECK (auth_provider IN ('local', 'google', 'github', 'intra'))
    );`);

    db.exec(`CREATE TABLE IF NOT EXISTS infos (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        bio TEXT DEFAULT '--',
        is_read BOOLEAN DEFAULT FALSE,

        TotalWins INTEGER,
        WinRate FLOAT,
        CurrentStreak INTEGER,
        Rating INTEGER,

        points INTEGER DEFAULT 0,
        gamesPlayed INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    db.exec(`CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY,
        userRequester INTEGER,
        userReceiver INTEGER,

        blocker_id INTEGER,
        status TEXT NOT NULL DEFAULT 'PENDING',

        pair_rolastion TEXT GENERATED ALWAYS AS (
            CASE
                WHEN userRequester > userReceiver
                    THEN printf('%d_%d', userReceiver, userRequester)
                ELSE
                    printf('%d_%d', userRequester, userReceiver)
            END
        ) STORED,


        CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),

        FOREIGN KEY(userRequester) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(userReceiver) REFERENCES users(id) ON DELETE CASCADE,

        CHECK (userRequester <> userReceiver),
        UNIQUE (userRequester, userReceiver),
        UNIQUE (pair_rolastion)
    );`);

    db.exec(`CREATE TRIGGER IF NOT EXISTS after_user_insert
                   AFTER INSERT ON users
                   BEGIN
                        INSERT INTO infos(user_id) VALUES (NEW.id);
                   END;`);
    return db;
}

module.exports = creatTable;
