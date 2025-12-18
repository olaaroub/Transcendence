import { readFile } from 'fs/promises';
import sqlite from 'better-sqlite3';
import dotenv from 'dotenv'

export async function configChatDatabase()
{
    dotenv.config();
    const database = new sqlite(process.env.DATABASE_PATH);

    const tablesQuery = await readFile('tables.sql', 'utf-8');

    database.exec(tablesQuery);
    return database;
}