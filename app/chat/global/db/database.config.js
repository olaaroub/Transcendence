import { readFile } from 'fs/promises';
import sqlite from 'better-sqlite3';

export async function configChatDatabase()
{
    const database = new sqlite(process.env.DATABASE_PATH);

    const tablesQuery = await readFile('./db/tables.sql', 'utf-8');

    database.exec(tablesQuery);
    return database;
}
