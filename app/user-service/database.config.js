import Database from 'better-sqlite3'

const DB_PATH = process.env.DATABASE_PATH;

const creatTable = async () => {

    if (!DB_PATH) {
        throw new Error("DB_PATH environment variable is not set for User Service");
    }
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // bach mli nbghi nktb on 9ra fnafs lwe9t maytblokach liya

    db.exec(`CREATE TABLE IF NOT EXISTS userInfo (
        id INTEGER UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        bio TEXT DEFAULT 'Hello there i am using WhatsApp!',
        avatar_url TEXT DEFAULT '/public/Default_pfp.jpg',
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
             ON userInfo(points DESC)
    ;`)


    db.exec(`CREATE VIEW IF NOT EXISTS leaderBordItem AS
            SELECT id, username, avatar_url, points, gamesPlayed, wins, losses
            FROM userInfo
    ;`);
    db.exec(`CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY,
        userRequester INTEGER,
        userReceiver INTEGER,

        blocker_id INTEGER,
        status TEXT NOT NULL DEFAULT 'PENDING',

        pair_relation TEXT GENERATED ALWAYS AS (
            CASE
                WHEN userRequester > userReceiver
                    THEN printf('%d_%d', userReceiver, userRequester)
                ELSE
                    printf('%d_%d', userRequester, userReceiver)
            END
        ) STORED,

        CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),

        FOREIGN KEY(userRequester) REFERENCES userInfo(id) ON DELETE CASCADE,
        FOREIGN KEY(userReceiver) REFERENCES userInfo(id) ON DELETE CASCADE,

        CHECK (userRequester <> userReceiver),
        UNIQUE (userRequester, userReceiver),
        UNIQUE (pair_relation)
    );`);
    return db;
}

export default creatTable;
