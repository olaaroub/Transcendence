import Fastify from "fastify";
import { configChatDatabase } from './chat_database.config.js'
import websocket from '@fastify/websocket'

async function startChatService() {
    const fastify = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
            base: {
                service: 'global_chat-service',
                env: process.env.NODE_ENV || 'development'
            },

            redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password']
        }
    });

    const db = await configChatDatabase();
    fastify.decorate('db', db);

    fastify.log.info({ dbPath: process.env.DATABASE_PATH }, "Database connected successfully");

    fastify.register((await import('@fastify/websocket')).default);

    const sockets = new Map();
    fastify.decorate('sockets', sockets);

    fastify.register((await import('./globalChat.js')).default, {
        prefix: '/api'
    });
    fastify.log.debug( "Test msg");

    fastify.listen({
        port: process.env.PORT,
        host: process.env.HOST
    })
}

startChatService()