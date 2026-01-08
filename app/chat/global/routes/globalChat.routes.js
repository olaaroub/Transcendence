import { globalChatHandler } from "../controllers/chat.websocket.controller.js";
import { JwtHandler } from '../middlewares/verifyJwt.middleware.js'
import getChatMessages from './chat.messages.routes.js'

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
    fastify.get('/chat/global/:id', { websocket: true, schema: requestSchema }, globalChatHandler);
    fastify.get('/chat/global/all/users', async (request, reply) => { return fastify.db.prepare('SELECT * FROM usersCash').all() });
}