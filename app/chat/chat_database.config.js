import { readFile } from 'fs/promises';
import sqlite3 from 'better-sqlite3';

export async function configChatDatabase()
{
    const database = new sqlite3('../../db/chat/chat.db');

    const tablesQuery = await readFile('tables.sql');

    database.exec(tablesQuery);
    return database;
}