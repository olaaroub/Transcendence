CREATE TABLE IF NOT EXISTS usersCash (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    msg TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY( sender_id ) REFERENCES usersCash(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
