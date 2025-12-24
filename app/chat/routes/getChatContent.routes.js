
import { getMessages } from '../controllers/getChatContent.controller.js';

export default async function getChatMessages(fastify) 
{
    fastify.get('/global-chat/messages', getMessages);
}