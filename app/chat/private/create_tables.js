import db from "./db.js";

db.exec
(`  
    CREATE TABLE IF NOT EXISTS conversation
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS message
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId INTEGER NOT NULL,
      senderId INTEGER NOT NULL,
      content TEXT NOT NULL,
      seen INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversationId) REFERENCES conversation(id) ON DELETE CASCADE
    );
`);

// Migration: Add 'seen' column if it doesn't exist (for existing databases)
try {
    db.exec(`ALTER TABLE message ADD COLUMN seen INTEGER DEFAULT 0;`);
} catch (e) {
    // Column already exists, ignore error
}