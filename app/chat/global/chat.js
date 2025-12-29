import Fastify from "fastify";
import { configChatDatabase } from './db/database.config.js'
import fastifyJwt from '@fastify/jwt';
import vault from 'node-vault';
import fastifyMetrics from 'fastify-metrics';
import userProfile from './routes/user.profile.routes.js';

async function getSecrets(logger) {
    try {

        const vaultPath = process.env.VAULT_SECRET_PATH

        const options = {
            apiVersion: 'v1',
            endpoint: process.env.VAULT_ADDR,
            token: process.env.GLOBAL_CHAT_SERVICE_TOKEN
        };

        const vaultClient = vault(options);
        logger.info(`reading secrets from: ${vaultPath}`);
        const { data } = await vaultClient.read(vaultPath);
        return {
            jwtSecret: data.data.jwt_secret,
        };

    } catch (err) {
        logger.error({ msg: "CRITICAL: Error fetching secret from Vault", err: err });
        process.exit(1);
    }
}

async function startChatService() {
    const fastify = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
            base: {
                service: 'global-chat-service',
                env: process.env.NODE_ENV || 'development'
            },

            redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password']
        }
    });

    await fastify.register(fastifyMetrics, {
        endpoint: '/metrics',
        defaultMetrics: { enabled: true }
    });

    const chatMessageCounter = new fastify.metrics.client.Counter({
        name: 'chat_message_sent_total',
        help: 'Total number of messages sent',
        labelNames: ['chat_type']
    })

    fastify.decorate('customMetrics',{
        chatMessageCounter,
    });

    /// dir hadi flblasa fach kisift user msg:
    // fastify.customMetrics.chatMessagesCounter.inc({ chat_type: 'global' });

    try {
        fastify.log.info("global chat service is starting...");
        const { jwtSecret } = await getSecrets(fastify.log);
        fastify.log.info("Secrets fetched successfully");

        await fastify.register(fastifyJwt, {
            secret: jwtSecret
        });
        const db = await configChatDatabase();
        fastify.decorate('db', db);

        fastify.log.info({ dbPath: process.env.DATABASE_PATH }, "Database connected successfully");

        fastify.register((await import('@fastify/websocket')).default);

        const sockets = new Map();
        fastify.decorate('sockets', sockets);

        fastify.register((await import('./routes/globalChat.routes.js')).default, {
            prefix: '/api'
        });

        fastify.register(userProfile, { // thats for user-servise to change the user profile data
            prefix: '/api'
        });

        fastify.log.debug("Test msg");

        fastify.listen({
            port: process.env.PORT,
            host: process.env.HOST
        })
    }
    catch (err) {
        fastify.log.error({ msg: "Starting failed", err: err });
        process.exit(1)
    }
}

startChatService()