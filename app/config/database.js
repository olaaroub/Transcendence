const sqlite3 = require('sqlite3').verbose();
const open = require('sqlite').open;

const creatTable = async () =>
{
    const db = await open({
        filename: 'database.db',
        driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT UNIQUE
    );`);

    await db.exec(`CREATE TABLE IF NOT EXISTS infos (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        profileImage BLOB,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );`);
    return db;
}

module.exports = creatTable;
