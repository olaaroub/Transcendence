import { globalChatHandler } from "../controllers/globalChat.controller.js";
import { JwtHandler } from '../middlewares/verifyJwt.middleware.js'
import getChatMessages from './getChatContent.routes.js'

export default async function main(fastify) {
    const requestSchema = {
        params: {
            type: 'object',
            properties: {
                id: { type: 'integer' }
            },
            required: ['id']
        }
    }
    fastify.addHook('preHandler', JwtHandler)
    fastify.register(getChatMessages);

    fastify.get('/global-chat/:id', { websocket: true, schema: requestSchema }, globalChatHandler);
    fastify.get('/all/users', async (request, reply) => { return fastify.db.prepare('SELECT * FROM usersCash').all() });
}