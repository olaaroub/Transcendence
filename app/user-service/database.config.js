// const sqlite3 = require('sqlite3').verbose();
// const open = require('sqlite').open;
// const Database = require('better-sqlite3');
import Database from 'better-sqlite3'

const DB_PATH = process.env.DB_PATH || '/data/users.db';
const creatTable = async () => {

    const db = new Database(DB_PATH);
    // db.pragma('journal_mode = WAL'); // bach mli nbghi nktb on 9ra fnafs lwe9t maytblokach liya

    db.exec(`CREATE TABLE IF NOT EXISTS userInfos (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        username TEXT UNIQUE NOT NULL,
        bio TEXT DEFAULT '--',
        profileImage TEXT DEFAULT '/public/Default_pfp.jpg',
        is_read BOOLEAN DEFAULT FALSE,

        TotalWins INTEGER,
        WinRate FLOAT,
        CurrentStreak INTEGER,
        Rating INTEGER,

        points INTEGER DEFAULT 0,
        gamesPlayed INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0
    );`);


    db.exec(`CREATE INDEX IF NOT EXISTS user_scor_indx
             ON userInfos(points DESC)
    ;`)

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

        FOREIGN KEY(userRequester) REFERENCES userInfos(user_id) ON DELETE CASCADE,
        FOREIGN KEY(userReceiver) REFERENCES userInfos(user_id) ON DELETE CASCADE,

        CHECK (userRequester <> userReceiver),
        UNIQUE (userRequester, userReceiver),
        UNIQUE (pair_rolastion)
    );`);
    return db;
}

// module.exports = creatTable;
export default creatTable;
