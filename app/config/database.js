const sqlite3 = require('sqlite3').verbose();
const open = require('sqlite').open;

const DB_PATH = process.env.DB_PATH || '/data/database.db';
const creatTable = async () =>
{
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    );`);

    await db.exec(`CREATE TABLE IF NOT EXISTS infos (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        profileImage TEXT DEFAULT '/public/Default_pfp.jpg',
        TotalWins INTEGER,
        bio TEXT DEFAULT '--',
        WinRate FLOAT,
        CurrentStreak INTEGER,
        Rating INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    await db.exec(`CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY,
        userRequester INTEGER,
        userReceiver INTEGER,

        status TEXT NOT NULL DEFAULT 'PENDING',

        pair_rolastion TEXT GENERATED ALWAYS AS (
            CASE
                WHEN userRequester > userReceiver
                    THEN printf('%d_%d', userReceiver, userRequester)
                ELSE
                    printf('%d_%d', userRequester, userReceiver)
            END
        ) STORED UNIQUE,


        CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),

        FOREIGN KEY(userRequester) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(userReceiver) REFERENCES users(id) ON DELETE CASCADE,

        CHECK (userRequester <> userReceiver),
        UNIQUE (userRequester, userReceiver)
    );`);
    return db;
}

module.exports = creatTable;
