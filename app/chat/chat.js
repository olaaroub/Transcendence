import Fastify from "fastify";
import dotenv from 'dotenv'
import {configChatDatabase} from './chat_database.config.js'
import websocket from '@fastify/websocket'

async function startChatService() 
{
    dotenv.config()
    const fastify = new Fastify({logger: true});

    const db = await configChatDatabase();
    fastify.decorate('db', db);

    fastify.log.info('the database created');

    fastify.register((await import('@fastify/websocket')).default);

    const sockets = new Map();
    fastify.decorate('sockets', sockets);

    fastify.register((await import('./globalChat.js')).default, {
        prefix: '/api'
    });

    fastify.listen({
        port: process.env.PORT,
        hostname: process.env.HOST
    })
}

startChatService()