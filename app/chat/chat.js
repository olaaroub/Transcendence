import Fastify from "fastify";
import dotenv from 'dotenv'
import chatDatabaseConfig from './chat_database.config'

async function startChatService() 
{
    dotenv.config()
    const fastify = new Fastify({logger: true});

    const db = await chatDatabaseConfig();
    fastify.listen({
        port: process.env.PORT,
        hostname: process.env.HOST
    })
}

startChatService()